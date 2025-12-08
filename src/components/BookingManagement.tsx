import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, CheckCircle, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  cancellation_reason: string | null;
  created_at: string;
}

interface BookingManagementProps {
  franchiseOwnerId: string;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
  completed: 'bg-blue-100 text-blue-800 border-blue-300'
};

const STATUS_ICONS = {
  pending: AlertCircle,
  confirmed: CheckCircle,
  cancelled: XCircle,
  completed: CheckCircle
};

export function BookingManagement({ franchiseOwnerId }: BookingManagementProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadBookings();
  }, [franchiseOwnerId, filter, statusFilter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('bookings')
        .select('*');

      if (franchiseOwnerId !== 'super_admin_all') {
        query = query.eq('franchise_owner_id', franchiseOwnerId);
      }

      const today = new Date().toISOString().split('T')[0];

      if (filter === 'upcoming') {
        query = query.gte('booking_date', today);
      } else if (filter === 'past') {
        query = query.lt('booking_date', today);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      query = query.order('booking_date', { ascending: filter === 'upcoming' })
        .order('start_time', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      console.error('Error loading bookings:', error);
      alert('Failed to load bookings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string, cancellationReason?: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (cancellationReason) {
        updateData.cancellation_reason = cancellationReason;
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (error) throw error;
      await loadBookings();
    } catch (error: any) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking: ' + error.message);
    }
  };

  const handleConfirm = (bookingId: string) => {
    if (confirm('Confirm this booking?')) {
      handleStatusUpdate(bookingId, 'confirmed');
    }
  };

  const handleComplete = (bookingId: string) => {
    if (confirm('Mark this booking as completed?')) {
      handleStatusUpdate(bookingId, 'completed');
    }
  };

  const handleCancel = (bookingId: string) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (reason) {
      handleStatusUpdate(bookingId, 'cancelled', reason);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const groupBookingsByDate = (bookings: Booking[]) => {
    const grouped: Record<string, Booking[]> = {};
    bookings.forEach(booking => {
      if (!grouped[booking.booking_date]) {
        grouped[booking.booking_date] = [];
      }
      grouped[booking.booking_date].push(booking);
    });
    return grouped;
  };

  const groupedBookings = groupBookingsByDate(bookings);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A2A5E]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#3DB3E3] p-3 rounded-full">
          <Calendar className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0A2A5E]">Booking Management</h2>
          <p className="text-gray-600">View and manage your appointments</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-[#0A2A5E] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Bookings
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === 'upcoming'
                ? 'bg-[#0A2A5E] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === 'past'
                ? 'bg-[#0A2A5E] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Past
          </button>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedBookings).map(([date, dateBookings]) => (
            <div key={date} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-[#E6E9EF] px-4 py-3">
                <h3 className="font-bold text-[#0A2A5E]">{formatDate(date)}</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {dateBookings.map((booking) => {
                  const StatusIcon = STATUS_ICONS[booking.status];
                  return (
                    <div key={booking.id} className="p-4 hover:bg-gray-50 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-[#3DB3E3]/10 p-2 rounded-lg">
                            <Clock className="text-[#3DB3E3]" size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-[#0A2A5E]">
                              {booking.start_time} - {booking.end_time}
                            </p>
                            <p className="text-sm text-gray-600">{booking.duration_minutes} minutes</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 ${STATUS_COLORS[booking.status]}`}>
                          <StatusIcon size={16} />
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <User size={16} />
                          <span>{booking.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail size={16} />
                          <a href={`mailto:${booking.customer_email}`} className="hover:text-[#3DB3E3]">
                            {booking.customer_email}
                          </a>
                        </div>
                        {booking.customer_phone && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone size={16} />
                            <a href={`tel:${booking.customer_phone}`} className="hover:text-[#3DB3E3]">
                              {booking.customer_phone}
                            </a>
                          </div>
                        )}
                      </div>

                      {booking.notes && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <div className="flex items-start gap-2">
                            <MessageSquare size={16} className="text-blue-600 mt-1" />
                            <div>
                              <p className="text-sm font-medium text-blue-900 mb-1">Customer Notes:</p>
                              <p className="text-sm text-blue-800">{booking.notes}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {booking.cancellation_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                          <p className="text-sm font-medium text-red-900 mb-1">Cancellation Reason:</p>
                          <p className="text-sm text-red-800">{booking.cancellation_reason}</p>
                        </div>
                      )}

                      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                        <div className="flex gap-2 pt-3 border-t">
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => handleConfirm(booking.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-sm"
                            >
                              <CheckCircle size={16} />
                              Confirm
                            </button>
                          )}
                          {(booking.status === 'confirmed' || booking.status === 'pending') && (
                            <>
                              <button
                                onClick={() => handleComplete(booking.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm"
                              >
                                <CheckCircle size={16} />
                                Mark Complete
                              </button>
                              <button
                                onClick={() => handleCancel(booking.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm"
                              >
                                <XCircle size={16} />
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
