import { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { isPublicHoliday } from '../utils/holidays';

interface TimeSlot {
  id?: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  booking_id?: string;
  customer_name?: string;
  is_recurring?: boolean;
  day_of_week?: number;
  specific_date?: string;
}

interface EnhancedCalendarProps {
  franchiseOwnerId: string;
  mode: 'manage' | 'book';
  onBookingSelect?: (slot: TimeSlot) => void;
}

type ViewMode = 'month' | 'week' | 'year';

export function EnhancedCalendar({ franchiseOwnerId, mode, onBookingSelect }: EnhancedCalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    loadData();
  }, [franchiseOwnerId, currentDate, viewMode]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadAvailableSlots(),
        loadBookings()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    const { data, error } = await supabase
      .from('franchise_availability')
      .select('*')
      .eq('franchise_owner_id', franchiseOwnerId)
      .eq('is_active', true);

    if (error) {
      console.error('Error loading availability:', error);
      return;
    }

    setAvailableSlots(data || []);
  };

  const loadBookings = async () => {
    const startDate = getViewStartDate();
    const endDate = getViewEndDate();

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('franchise_owner_id', franchiseOwnerId)
      .gte('booking_date', startDate.toISOString().split('T')[0])
      .lte('booking_date', endDate.toISOString().split('T')[0]);

    if (error) {
      console.error('Error loading bookings:', error);
      return;
    }

    setBookings(data || []);
  };

  const getViewStartDate = (): Date => {
    const date = new Date(currentDate);
    switch (viewMode) {
      case 'month':
        date.setDate(1);
        return date;
      case 'week':
        const day = date.getDay();
        date.setDate(date.getDate() - day);
        return date;
      case 'year':
        date.setMonth(0, 1);
        return date;
    }
  };

  const getViewEndDate = (): Date => {
    const date = new Date(currentDate);
    switch (viewMode) {
      case 'month':
        date.setMonth(date.getMonth() + 1, 0);
        return date;
      case 'week':
        const day = date.getDay();
        date.setDate(date.getDate() + (6 - day));
        return date;
      case 'year':
        date.setMonth(11, 31);
        return date;
    }
  };

  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];
    const slots: TimeSlot[] = [];

    const recurringSlots = availableSlots.filter(
      slot => slot.is_recurring && slot.day_of_week === dayOfWeek
    );

    const specificSlots = availableSlots.filter(
      slot => !slot.is_recurring && slot.specific_date === dateStr
    );

    const allSlots = [...recurringSlots, ...specificSlots];

    allSlots.forEach(slot => {
      const startTime = slot.start_time;
      const endTime = slot.end_time;

      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);

      while (start < end) {
        const slotStart = start.toTimeString().slice(0, 5);
        start.setMinutes(start.getMinutes() + 60);
        const slotEnd = start.toTimeString().slice(0, 5);

        const booking = bookings.find(
          b => b.booking_date === dateStr &&
               b.start_time === slotStart &&
               b.status !== 'cancelled'
        );

        slots.push({
          date: dateStr,
          start_time: slotStart,
          end_time: slotEnd,
          is_booked: !!booking,
          booking_id: booking?.id,
          customer_name: booking?.customer_name
        });
      }
    });

    return slots;
  };

  const isWorkingDay = (date: Date): boolean => {
    const day = date.getDay();
    return day !== 0 && day !== 6 && !isPublicHoliday(date);
  };

  const getNext72WorkingHours = (): Date[] => {
    const dates: Date[] = [];
    const current = new Date();
    let hoursCollected = 0;

    while (hoursCollected < 72) {
      if (isWorkingDay(current)) {
        dates.push(new Date(current));
        hoursCollected += 8;
      }
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const navigatePrevious = () => {
    const date = new Date(currentDate);
    switch (viewMode) {
      case 'month':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'week':
        date.setDate(date.getDate() - 7);
        break;
      case 'year':
        date.setFullYear(date.getFullYear() - 1);
        break;
    }
    setCurrentDate(date);
  };

  const navigateNext = () => {
    const date = new Date(currentDate);
    switch (viewMode) {
      case 'month':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'week':
        date.setDate(date.getDate() + 7);
        break;
      case 'year':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    setCurrentDate(date);
  };

  const getViewTitle = (): string => {
    switch (viewMode) {
      case 'month':
        return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'week':
        const weekStart = getViewStartDate();
        const weekEnd = getViewEndDate();
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'year':
        return currentDate.getFullYear().toString();
    }
  };

  const renderMonthView = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const slots = generateTimeSlots(date);
      const dayBookings = bookings.filter(b => b.booking_date === dateStr);
      const isToday = new Date().toDateString() === date.toDateString();
      const isPast = date < new Date() && !isToday;

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-200 p-2 ${isToday ? 'bg-blue-50' : ''} ${isPast ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-50 cursor-pointer transition-colors`}
          onClick={() => {
            if (mode === 'manage') {
              setSelectedDate(date);
              setShowAddSlotModal(true);
            }
          }}
        >
          <div className="text-sm font-semibold mb-1">{day}</div>
          {isPublicHoliday(date) && (
            <div className="text-xs text-red-600 mb-1">Holiday</div>
          )}
          {slots.length > 0 && (
            <div className="space-y-1">
              {slots.slice(0, 2).map((slot, idx) => (
                <div
                  key={idx}
                  className={`text-xs px-1 py-0.5 rounded ${
                    slot.is_booked
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                  onClick={(e) => {
                    if (mode === 'book' && !slot.is_booked && onBookingSelect) {
                      e.stopPropagation();
                      onBookingSelect(slot);
                    }
                  }}
                >
                  {slot.start_time}
                </div>
              ))}
              {slots.length > 2 && (
                <div className="text-xs text-gray-500">+{slots.length - 2} more</div>
              )}
            </div>
          )}
          {dayBookings.length > 0 && (
            <div className="text-xs text-gray-600 mt-1">
              {dayBookings.length} booking{dayBookings.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        <div className="grid grid-cols-7 gap-0 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center font-semibold text-sm py-2 bg-gray-100">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0">
          {days}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = getViewStartDate();
    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const slots = generateTimeSlots(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div key={i} className={`border border-gray-200 p-3 ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
          <div className="font-semibold text-center mb-3">
            {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {slots.map((slot, idx) => (
              <div
                key={idx}
                className={`text-sm px-2 py-1 rounded cursor-pointer ${
                  slot.is_booked
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
                onClick={() => {
                  if (mode === 'book' && !slot.is_booked && onBookingSelect) {
                    onBookingSelect(slot);
                  }
                }}
              >
                {slot.start_time} - {slot.end_time}
                {slot.is_booked && slot.customer_name && (
                  <div className="text-xs mt-1">{slot.customer_name}</div>
                )}
              </div>
            ))}
            {slots.length === 0 && (
              <div className="text-sm text-gray-400 text-center py-4">No slots</div>
            )}
          </div>
        </div>
      );
    }

    return <div className="grid grid-cols-7 gap-2">{days}</div>;
  };

  const renderYearView = () => {
    const months = [];
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(currentDate.getFullYear(), month, 1);
      const monthBookings = bookings.filter(b => {
        const bookingMonth = new Date(b.booking_date).getMonth();
        return bookingMonth === month;
      });

      months.push(
        <div key={month} className="border border-gray-200 p-3 bg-white rounded">
          <div className="font-semibold text-center mb-2">
            {monthDate.toLocaleDateString('en-US', { month: 'long' })}
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{monthBookings.length}</div>
            <div className="text-xs text-gray-600">booking{monthBookings.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
      );
    }

    return <div className="grid grid-cols-4 gap-4">{months}</div>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Calendar className="text-blue-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'manage' ? 'Manage Availability' : 'Book Appointment'}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 rounded ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Month
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode('year')}
            className={`px-3 py-1 rounded ${viewMode === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Year
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={navigatePrevious}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft size={20} />
        </button>

        <h3 className="text-xl font-semibold">{getViewTitle()}</h3>

        <button
          onClick={navigateNext}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="mb-6">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'year' && renderYearView()}
      </div>

      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-100 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 rounded"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
}
