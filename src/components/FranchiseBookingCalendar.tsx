import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, X, Clock, User, Mail, Phone, Bell, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { isPublicHoliday } from '../utils/holidays';
import { CustomerProfileModal } from './CustomerProfileModal';

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
}

interface FranchiseBookingCalendarProps {
  franchiseOwnerId: string;
  franchiseOwnerEmail: string;
  franchiseOwnerName: string;
}

interface NewBooking {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_time: string;
  end_time: string;
  notes: string;
}

export function FranchiseBookingCalendar({
  franchiseOwnerId,
  franchiseOwnerEmail,
  franchiseOwnerName
}: FranchiseBookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newBooking, setNewBooking] = useState<NewBooking>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    start_time: '09:00',
    end_time: '10:00',
    notes: ''
  });

  useEffect(() => {
    loadBookings();
  }, [franchiseOwnerId, currentDate]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('franchise_owner_id', franchiseOwnerId)
        .gte('booking_date', startDate.toISOString().split('T')[0])
        .lte('booking_date', endDate.toISOString().split('T')[0])
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Supabase error loading bookings:', error);
        throw new Error('Failed to load bookings. Please refresh the page.');
      }
      setBookings(data || []);
    } catch (error: any) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendBookingReminderEmail = async (booking: any, bookingDate: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-booking-reminder', {
        body: {
          franchiseOwnerEmail,
          franchiseOwnerName,
          customerName: booking.customer_name,
          customerEmail: booking.customer_email,
          customerPhone: booking.customer_phone,
          bookingDate,
          startTime: booking.start_time,
          endTime: booking.end_time,
          notes: booking.notes
        }
      });

      if (error) throw error;
      console.log('Reminder email sent successfully');
    } catch (error: any) {
      console.error('Failed to send reminder email:', error);
    }
  };

  const handleAddBooking = async () => {
    if (!selectedDate) return;

    if (!newBooking.customer_name || !newBooking.customer_email) {
      alert('Please fill in customer name and email');
      return;
    }

    if (newBooking.start_time >= newBooking.end_time) {
      alert('End time must be after start time');
      return;
    }

    setSaving(true);
    try {
      const bookingDate = selectedDate.toISOString().split('T')[0];

      const startMinutes = parseInt(newBooking.start_time.split(':')[0]) * 60 + parseInt(newBooking.start_time.split(':')[1]);
      const endMinutes = parseInt(newBooking.end_time.split(':')[0]) * 60 + parseInt(newBooking.end_time.split(':')[1]);
      const duration = endMinutes - startMinutes;

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          franchise_owner_id: franchiseOwnerId,
          customer_name: newBooking.customer_name,
          customer_email: newBooking.customer_email,
          customer_phone: newBooking.customer_phone || null,
          booking_date: bookingDate,
          start_time: newBooking.start_time,
          end_time: newBooking.end_time,
          duration_minutes: duration,
          status: 'confirmed',
          notes: newBooking.notes || null
        })
        .select()
        .single();

      if (error) throw error;

      await sendBookingReminderEmail(newBooking, bookingDate);

      setShowAddModal(false);
      setSelectedDate(null);
      setNewBooking({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        start_time: '09:00',
        end_time: '10:00',
        notes: ''
      });

      await loadBookings();
      alert('Booking added successfully! Reminder email sent to both you and the customer.');
    } catch (error: any) {
      console.error('Error adding booking:', error);
      alert('Failed to add booking: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const getBookingsForDate = (date: Date): Booking[] => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(b => b.booking_date === dateStr);
  };

  const navigatePrevious = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const navigateNext = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const renderCalendar = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-32 border border-gray-200 bg-gray-50"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateBookings = getBookingsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();
      const isPast = date < new Date() && !isToday;
      const holiday = isPublicHoliday(date);

      days.push(
        <div
          key={day}
          className={`h-32 border border-gray-200 p-2 cursor-pointer transition-all group ${
            isToday ? 'bg-blue-50 border-blue-400 border-2' : isPast ? 'bg-gray-50' : 'bg-white hover:bg-blue-50'
          }`}
          onClick={() => {
            if (!isPast || isToday) {
              setSelectedDate(date);
              setShowAddModal(true);
            }
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-semibold ${isToday ? 'text-blue-600' : isPast ? 'text-gray-400' : 'text-gray-800'}`}>
              {day}
            </span>
            {!isPast && !holiday && (
              <Plus size={14} className="text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>

          {holiday && (
            <div className="text-xs text-red-600 font-medium mb-1">
              {holiday.name}
            </div>
          )}

          <div className="space-y-1 overflow-y-auto max-h-20">
            {dateBookings.slice(0, 3).map((booking, idx) => (
              <div
                key={idx}
                className={`text-xs px-2 py-1 rounded cursor-pointer transition-all hover:shadow-md ${
                  booking.status === 'confirmed'
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : booking.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBooking(booking);
                }}
                title="Click to view customer profile"
              >
                <div className="font-medium">{booking.start_time}</div>
                <div className="truncate">{booking.customer_name}</div>
              </div>
            ))}
            {dateBookings.length > 3 && (
              <div className="text-xs text-gray-500 text-center">
                +{dateBookings.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="grid grid-cols-7 gap-0 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center font-bold text-sm py-3 bg-gradient-to-r from-[#0A2A5E] to-[#3DB3E3] text-white">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0 border border-gray-300">
          {days}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-[#3DB3E3] p-3 rounded-full">
            <Calendar className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0A2A5E]">Booking Calendar</h2>
            <p className="text-gray-600">Click on any date to add a booking</p>
          </div>
        </div>

        <button
          onClick={goToToday}
          className="px-4 py-2 bg-[#3DB3E3] text-white rounded-lg hover:bg-[#0A2A5E] transition-all"
        >
          Today
        </button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={navigatePrevious}
          className="p-2 rounded-full hover:bg-gray-100 transition-all"
        >
          <ChevronLeft size={24} />
        </button>

        <h3 className="text-2xl font-bold text-gray-800">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>

        <button
          onClick={navigateNext}
          className="p-2 rounded-full hover:bg-gray-100 transition-all"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {renderCalendar()}

      <div className="mt-6 flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span>Confirmed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-50 border-2 border-blue-400 rounded"></div>
          <span>Today</span>
        </div>
      </div>

      {showAddModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#0A2A5E] to-[#3DB3E3] p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="text-white" size={24} />
                <div>
                  <h3 className="text-xl font-bold text-white">Add New Booking</h3>
                  <p className="text-white/90 text-sm">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedDate(null);
                }}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                <Bell className="text-blue-600 mt-1" size={20} />
                <div className="text-sm text-blue-900">
                  <strong>Email Reminder:</strong> Both you and the customer will receive an email confirmation with booking details.
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={newBooking.customer_name}
                  onChange={(e) => setNewBooking({ ...newBooking, customer_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Customer Email *
                </label>
                <input
                  type="email"
                  value={newBooking.customer_email}
                  onChange={(e) => setNewBooking({ ...newBooking, customer_email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                  placeholder="customer@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Customer Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={newBooking.customer_phone}
                  onChange={(e) => setNewBooking({ ...newBooking, customer_phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                  placeholder="+27 12 345 6789"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock size={16} className="inline mr-2" />
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={newBooking.start_time}
                    onChange={(e) => setNewBooking({ ...newBooking, start_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock size={16} className="inline mr-2" />
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={newBooking.end_time}
                    onChange={(e) => setNewBooking({ ...newBooking, end_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                  placeholder="Add any additional notes about this booking..."
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleAddBooking}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-all font-semibold"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Create Booking & Send Reminders</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedDate(null);
                  }}
                  disabled={saving}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedBooking && (
        <CustomerProfileModal
          customerEmail={selectedBooking.customer_email}
          customerName={selectedBooking.customer_name}
          bookingDate={selectedBooking.booking_date}
          franchiseOwnerId={franchiseOwnerId}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
