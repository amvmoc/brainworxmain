import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Save, X, Copy, Check, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { EnhancedCalendar } from './EnhancedCalendar';
import { AvailabilityManager72Hours } from './AvailabilityManager72Hours';

interface AvailabilitySlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  specific_date?: string;
  is_active: boolean;
}

interface CalendarManagementProps {
  franchiseOwnerId: string;
  franchiseOwnerCode?: string;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function CalendarManagement({ franchiseOwnerId, franchiseOwnerCode }: CalendarManagementProps) {
  const [activeTab, setActiveTab] = useState<'calendar' | 'recurring' | '72hours'>('calendar');
  const [copiedBookingLink, setCopiedBookingLink] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlot, setNewSlot] = useState<AvailabilitySlot>({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    is_recurring: true,
    is_active: true
  });

  const isSuperAdmin = franchiseOwnerId === 'super_admin_all';

  useEffect(() => {
    if (!isSuperAdmin) {
      loadAvailability();
    } else {
      setLoading(false);
    }
  }, [franchiseOwnerId, isSuperAdmin]);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('franchise_availability')
        .select('*')
        .eq('franchise_owner_id', franchiseOwnerId)
        .eq('is_recurring', true)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setAvailabilitySlots(data || []);
    } catch (error: any) {
      console.error('Error loading availability:', error);
      alert('Failed to load availability: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!newSlot.start_time || !newSlot.end_time) {
      alert('Please fill in all required fields');
      return;
    }

    if (newSlot.start_time >= newSlot.end_time) {
      alert('End time must be after start time');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('franchise_availability')
        .insert({
          franchise_owner_id: franchiseOwnerId,
          day_of_week: newSlot.day_of_week,
          start_time: newSlot.start_time,
          end_time: newSlot.end_time,
          is_recurring: true,
          is_active: true
        });

      if (error) throw error;

      setShowAddForm(false);
      setNewSlot({
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        is_recurring: true,
        is_active: true
      });
      await loadAvailability();
    } catch (error: any) {
      console.error('Error adding availability:', error);
      alert('Failed to add availability: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this availability slot?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('franchise_availability')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadAvailability();
    } catch (error: any) {
      console.error('Error deleting availability:', error);
      alert('Failed to delete availability: ' + error.message);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('franchise_availability')
        .update({ is_active: !currentActive })
        .eq('id', id);

      if (error) throw error;
      await loadAvailability();
    } catch (error: any) {
      console.error('Error updating availability:', error);
      alert('Failed to update availability: ' + error.message);
    }
  };

  const groupedSlots = availabilitySlots.reduce((acc, slot) => {
    if (!acc[slot.day_of_week]) {
      acc[slot.day_of_week] = [];
    }
    acc[slot.day_of_week].push(slot);
    return acc;
  }, {} as Record<number, AvailabilitySlot[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A2A5E]"></div>
      </div>
    );
  }

  if (isSuperAdmin) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#3DB3E3] p-3 rounded-full">
            <Calendar className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0A2A5E]">Availability Management</h2>
            <p className="text-gray-600">Manage calendar availability</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <Calendar className="mx-auto mb-4 text-blue-600" size={48} />
          <h3 className="text-lg font-bold text-[#0A2A5E] mb-2">
            Availability Management Not Available for Super Admins
          </h3>
          <p className="text-gray-600">
            Calendar availability management is only available for franchise owners who take bookings.
            As a super admin, you can view all bookings in the "View Bookings" tab.
          </p>
        </div>
      </div>
    );
  }

  const bookingLink = franchiseOwnerCode ? `${window.location.origin}?book=${franchiseOwnerCode}` : null;

  const copyBookingLink = () => {
    if (bookingLink) {
      navigator.clipboard.writeText(bookingLink);
      setCopiedBookingLink(true);
      setTimeout(() => setCopiedBookingLink(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#3DB3E3] p-3 rounded-full">
            <Calendar className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0A2A5E]">Calendar & Availability Management</h2>
            <p className="text-gray-600">Manage your availability and view bookings</p>
          </div>
        </div>
        {activeTab === 'recurring' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-[#0A2A5E] text-white px-4 py-2 rounded-lg hover:bg-[#3DB3E3] transition-all"
          >
            <Plus size={20} />
            Add Time Slot
          </button>
        )}
      </div>

      {bookingLink && (
        <div className="bg-gradient-to-r from-[#0A2A5E] to-[#3DB3E3] rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3 mb-3">
            <LinkIcon className="text-white mt-1" size={24} />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">Your Booking Link</h3>
              <p className="text-white/90 text-sm mb-3">Share this link with customers so they can book appointments with you</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bookingLink}
                  readOnly
                  className="flex-1 px-4 py-2 rounded-lg font-mono text-sm"
                />
                <button
                  onClick={copyBookingLink}
                  className="flex items-center gap-2 bg-white text-[#0A2A5E] px-4 py-2 rounded-lg hover:bg-gray-100 transition-all font-medium"
                >
                  {copiedBookingLink ? (
                    <>
                      <Check size={20} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={20} />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'calendar'
              ? 'border-[#3DB3E3] text-[#3DB3E3]'
              : 'border-transparent text-gray-600 hover:text-[#3DB3E3]'
          }`}
        >
          Calendar View
        </button>
        <button
          onClick={() => setActiveTab('72hours')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === '72hours'
              ? 'border-[#3DB3E3] text-[#3DB3E3]'
              : 'border-transparent text-gray-600 hover:text-[#3DB3E3]'
          }`}
        >
          72-Hour Availability
        </button>
        <button
          onClick={() => setActiveTab('recurring')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'recurring'
              ? 'border-[#3DB3E3] text-[#3DB3E3]'
              : 'border-transparent text-gray-600 hover:text-[#3DB3E3]'
          }`}
        >
          Recurring Availability
        </button>
      </div>

      {activeTab === 'calendar' && (
        <EnhancedCalendar franchiseOwnerId={franchiseOwnerId} mode="manage" />
      )}

      {activeTab === '72hours' && (
        <AvailabilityManager72Hours franchiseOwnerId={franchiseOwnerId} />
      )}

      {activeTab === 'recurring' && showAddForm && (
        <div className="bg-[#E6E9EF] rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#0A2A5E]">Add Availability Slot</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day of Week
              </label>
              <select
                value={newSlot.day_of_week}
                onChange={(e) => setNewSlot({ ...newSlot, day_of_week: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
              >
                {DAYS_OF_WEEK.map((day, index) => (
                  <option key={index} value={index}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={newSlot.start_time}
                onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={newSlot.end_time}
                onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleAddSlot}
              disabled={saving}
              className="flex items-center gap-2 bg-[#0A2A5E] text-white px-6 py-2 rounded-lg hover:bg-[#3DB3E3] disabled:opacity-50 transition-all"
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Slot'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {activeTab === 'recurring' && (
        <>
          <div className="space-y-4">
            {DAYS_OF_WEEK.map((dayName, dayIndex) => {
          const daySlots = groupedSlots[dayIndex] || [];
          return (
            <div key={dayIndex} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[#0A2A5E]">{dayName}</h3>
                {daySlots.length === 0 && (
                  <span className="text-sm text-gray-500">No availability set</span>
                )}
              </div>
              {daySlots.length > 0 && (
                <div className="space-y-2">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        slot.is_active ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Clock size={18} className={slot.is_active ? 'text-green-600' : 'text-gray-400'} />
                        <span className={`font-medium ${slot.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                          {slot.start_time} - {slot.end_time}
                        </span>
                        {!slot.is_active && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Inactive</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(slot.id!, slot.is_active)}
                          className={`px-3 py-1 rounded text-sm ${
                            slot.is_active
                              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {slot.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot.id!)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Set your recurring weekly availability here. Customers will be able to book appointments during these times. You can activate/deactivate slots as needed.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
