import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { isPublicHoliday, isWeekend, getHolidayLabel } from '../utils/holidays';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface BookingFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string;
}

interface CustomerBookingCalendarProps {
  franchiseOwnerId: string;
  franchiseOwnerName: string;
  onBookingComplete?: () => void;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CustomerBookingCalendar({ franchiseOwnerId, franchiseOwnerName, onBookingComplete }: CustomerBookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    notes: ''
  });

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate, franchiseOwnerId]);

  const loadAvailableSlots = async (date: Date) => {
    setLoading(true);
    try {
      const dayOfWeek = date.getDay();
      const dateStr = date.toISOString().split('T')[0];

      const { data: availability, error: availError } = await supabase
        .from('franchise_availability')
        .select('*')
        .eq('franchise_owner_id', franchiseOwnerId)
        .eq('is_active', true)
        .eq('is_recurring', true)
        .eq('day_of_week', dayOfWeek);

      if (availError) throw availError;

      const { data: bookings, error: bookError } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('franchise_owner_id', franchiseOwnerId)
        .eq('booking_date', dateStr)
        .in('status', ['pending', 'confirmed']);

      if (bookError) throw bookError;

      const slots: TimeSlot[] = [];

      if (availability && availability.length > 0) {
        for (const avail of availability) {
          const startHour = parseInt(avail.start_time.split(':')[0]);
          const endHour = parseInt(avail.end_time.split(':')[0]);

          for (let hour = startHour; hour < endHour; hour++) {
            const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
            const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

            const isBooked = bookings?.some(booking => {
              const bookingStart = booking.start_time;
              const bookingEnd = booking.end_time;
              return timeSlot >= bookingStart && timeSlot < bookingEnd;
            });

            slots.push({
              time: timeSlot,
              available: !isBooked
            });
          }
        }
      }

      slots.sort((a, b) => a.time.localeCompare(b.time));
      setAvailableSlots(slots);
    } catch (error: any) {
      console.error('Error loading slots:', error);
      alert('Failed to load available slots: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateSelect = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      alert('Cannot book appointments in the past');
      return;
    }
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTimeSlot || !formData.customer_name || !formData.customer_email) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const startTime = selectedTimeSlot;
      const [hours] = startTime.split(':');
      const endTime = `${(parseInt(hours) + 1).toString().padStart(2, '0')}:00`;

      const hasConflict = await supabase.rpc('check_booking_conflict', {
        p_franchise_owner_id: franchiseOwnerId,
        p_booking_date: dateStr,
        p_start_time: startTime,
        p_end_time: endTime
      });

      if (hasConflict.data) {
        alert('This time slot is no longer available. Please select another time.');
        await loadAvailableSlots(selectedDate);
        return;
      }

      const { error } = await supabase
        .from('bookings')
        .insert({
          franchise_owner_id: franchiseOwnerId,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone || null,
          booking_date: dateStr,
          start_time: startTime,
          end_time: endTime,
          duration_minutes: 60,
          status: 'pending',
          notes: formData.notes || null
        });

      if (error) throw error;

      const { data: franchiseOwnerData } = await supabase
        .from('franchise_owners')
        .select('email, name')
        .eq('id', franchiseOwnerId)
        .single();

      if (franchiseOwnerData) {
        try {
          await supabase.functions.invoke('send-booking-reminder', {
            body: {
              franchiseOwnerEmail: franchiseOwnerData.email,
              franchiseOwnerName: franchiseOwnerData.name,
              customerName: formData.customer_name,
              customerEmail: formData.customer_email,
              customerPhone: formData.customer_phone,
              bookingDate: dateStr,
              startTime: startTime,
              endTime: endTime,
              notes: formData.notes
            }
          });
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
        }
      }

      setBookingComplete(true);
      if (onBookingComplete) {
        onBookingComplete();
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (bookingComplete) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Check className="text-green-600" size={32} />
        </div>
        <h3 className="text-2xl font-bold text-[#0A2A5E] mb-2">Booking Confirmed!</h3>
        <p className="text-gray-600 mb-6">
          Your appointment with {franchiseOwnerName} has been scheduled for:
        </p>
        <div className="bg-[#E6E9EF] rounded-lg p-4 mb-6">
          <p className="font-bold text-[#0A2A5E] mb-2">
            {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-lg text-gray-700">{selectedTimeSlot}</p>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          A confirmation email has been sent to <strong>{formData.customer_email}</strong>
        </p>
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#3DB3E3] p-3 rounded-full">
          <Calendar className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0A2A5E]">Book an Appointment</h2>
          <p className="text-gray-600">with {franchiseOwnerName}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <h3 className="text-lg font-bold text-[#0A2A5E]">{monthName}</h3>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="text-center text-sm font-bold text-gray-600 p-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const isSelected = selectedDate?.toDateString() === day.toDateString();
              const isToday = new Date().toDateString() === day.toDateString();
              const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
              const isHoliday = isPublicHoliday(day);
              const isWeekendDay = isWeekend(day);
              const holidayLabel = getHolidayLabel(day);

              return (
                <div key={index} className="relative group">
                  <button
                    onClick={() => !isPast && handleDateSelect(day)}
                    disabled={isPast}
                    title={holidayLabel || (isWeekendDay ? 'Weekend' : '')}
                    className={`w-full aspect-square p-2 rounded-lg transition-all relative ${
                      isSelected
                        ? 'bg-[#0A2A5E] text-white font-bold'
                        : isToday
                        ? 'bg-[#3DB3E3] text-white font-bold'
                        : isPast
                        ? 'text-gray-300 cursor-not-allowed'
                        : isHoliday || isWeekendDay
                        ? 'bg-red-50 text-red-600 font-bold hover:bg-red-100 border-2 border-red-300'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="relative z-10">{day.getDate()}</span>
                  </button>
                  {holidayLabel && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                      <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                        {holidayLabel}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                          <div className="border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#3DB3E3] rounded"></div>
                <span className="text-gray-600">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-50 border-2 border-red-300 rounded"></div>
                <span className="text-gray-600">Weekend / Holiday</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#0A2A5E] rounded"></div>
                <span className="text-gray-600">Selected</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          {!selectedDate ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Select a date to view available time slots</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A2A5E]"></div>
            </div>
          ) : (
            <div>
              <h3 className="font-bold text-[#0A2A5E] mb-4">
                Available Times - {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </h3>

              {availableSlots.length === 0 ? (
                <p className="text-gray-500">No available time slots for this date</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 mb-6 max-h-96 overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && setSelectedTimeSlot(slot.time)}
                      disabled={!slot.available}
                      className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                        selectedTimeSlot === slot.time
                          ? 'border-[#0A2A5E] bg-[#0A2A5E] text-white'
                          : slot.available
                          ? 'border-gray-300 hover:border-[#3DB3E3] hover:bg-[#3DB3E3]/10'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Clock size={16} />
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}

              {selectedTimeSlot && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-bold text-[#0A2A5E]">Your Information</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User size={16} className="inline mr-1" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail size={16} className="inline mr-1" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} className="inline mr-1" />
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                      placeholder="+27 12 345 6789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                      rows={3}
                      placeholder="Any additional information..."
                    />
                  </div>
                  <button
                    onClick={handleBooking}
                    disabled={submitting || !formData.customer_name || !formData.customer_email}
                    className="w-full bg-[#0A2A5E] text-white py-3 rounded-lg hover:bg-[#3DB3E3] disabled:opacity-50 transition-all font-bold"
                  >
                    {submitting ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
