import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Save, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { isPublicHoliday } from '../utils/holidays';

interface TimeSlot {
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface AvailabilityManager72HoursProps {
  franchiseOwnerId: string;
}

export function AvailabilityManager72Hours({ franchiseOwnerId }: AvailabilityManager72HoursProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [workingDays, setWorkingDays] = useState<Date[]>([]);

  useEffect(() => {
    generateNext72WorkingHours();
    loadExistingAvailability();
  }, [franchiseOwnerId]);

  const generateNext72WorkingHours = () => {
    const days: Date[] = [];
    const current = new Date();
    current.setHours(0, 0, 0, 0);
    let hoursCollected = 0;

    while (hoursCollected < 72) {
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHol = isPublicHoliday(current);

      if (!isWeekend && !isHol) {
        days.push(new Date(current));
        hoursCollected += 8;
      }

      current.setDate(current.getDate() + 1);
    }

    setWorkingDays(days);
  };

  const loadExistingAvailability = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 14);

      const { data, error } = await supabase
        .from('franchise_availability')
        .select('*')
        .eq('franchise_owner_id', franchiseOwnerId)
        .eq('is_recurring', false)
        .gte('specific_date', new Date().toISOString().split('T')[0])
        .lte('specific_date', endDate.toISOString().split('T')[0])
        .eq('is_active', true);

      if (error) throw error;

      const slots: TimeSlot[] = (data || []).map(slot => ({
        date: slot.specific_date!,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_available: true
      }));

      setAvailableSlots(slots);
    } catch (error: any) {
      console.error('Error loading availability:', error);
      alert('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = (date: Date, startTime: string, endTime: string) => {
    const dateStr = date.toISOString().split('T')[0];
    const newSlot: TimeSlot = {
      date: dateStr,
      start_time: startTime,
      end_time: endTime,
      is_available: true
    };

    const exists = availableSlots.some(
      slot => slot.date === dateStr && slot.start_time === startTime
    );

    if (!exists) {
      setAvailableSlots([...availableSlots, newSlot].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.start_time.localeCompare(b.start_time);
      }));
    }
  };

  const removeTimeSlot = (date: string, startTime: string) => {
    setAvailableSlots(availableSlots.filter(
      slot => !(slot.date === date && slot.start_time === startTime)
    ));
  };

  const addQuickSlots = (date: Date, preset: 'morning' | 'afternoon' | 'full') => {
    const slots = {
      morning: [
        { start: '09:00', end: '10:00' },
        { start: '10:00', end: '11:00' },
        { start: '11:00', end: '12:00' }
      ],
      afternoon: [
        { start: '13:00', end: '14:00' },
        { start: '14:00', end: '15:00' },
        { start: '15:00', end: '16:00' },
        { start: '16:00', end: '17:00' }
      ],
      full: [
        { start: '09:00', end: '10:00' },
        { start: '10:00', end: '11:00' },
        { start: '11:00', end: '12:00' },
        { start: '13:00', end: '14:00' },
        { start: '14:00', end: '15:00' },
        { start: '15:00', end: '16:00' },
        { start: '16:00', end: '17:00' }
      ]
    };

    slots[preset].forEach(slot => {
      addTimeSlot(date, slot.start, slot.end);
    });
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 14);

      await supabase
        .from('franchise_availability')
        .delete()
        .eq('franchise_owner_id', franchiseOwnerId)
        .eq('is_recurring', false)
        .gte('specific_date', new Date().toISOString().split('T')[0])
        .lte('specific_date', endDate.toISOString().split('T')[0]);

      const slotsToInsert = availableSlots.map(slot => ({
        franchise_owner_id: franchiseOwnerId,
        specific_date: slot.date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_recurring: false,
        is_active: true,
        day_of_week: null
      }));

      if (slotsToInsert.length > 0) {
        const { error } = await supabase
          .from('franchise_availability')
          .insert(slotsToInsert);

        if (error) throw error;
      }

      alert('Availability saved successfully!');
    } catch (error: any) {
      console.error('Error saving availability:', error);
      alert('Failed to save availability: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const getSlotsForDate = (date: Date): TimeSlot[] => {
    const dateStr = date.toISOString().split('T')[0];
    return availableSlots.filter(slot => slot.date === dateStr);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading availability...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Clock className="text-blue-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">Set Available Times (Next 72 Working Hours)</h2>
        </div>
        <button
          onClick={saveAvailability}
          disabled={saving}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center space-x-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>Save Availability</span>
            </>
          )}
        </button>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
        <AlertCircle className="text-blue-600 mt-1" size={20} />
        <div>
          <p className="text-sm text-blue-900">
            Set your available time slots for the next 72 working hours (excluding weekends and public holidays).
            Each slot is 1 hour long. Clients will be able to book these available slots.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {workingDays.map((date, idx) => {
          const slots = getSlotsForDate(date);
          const dateStr = date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          });

          return (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="text-gray-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">{dateStr}</h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => addQuickSlots(date, 'morning')}
                    className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                  >
                    + Morning (9-12)
                  </button>
                  <button
                    onClick={() => addQuickSlots(date, 'afternoon')}
                    className="text-xs px-3 py-1 bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
                  >
                    + Afternoon (1-5)
                  </button>
                  <button
                    onClick={() => addQuickSlots(date, 'full')}
                    className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    + Full Day
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {slots.length === 0 && (
                  <div className="col-span-full text-center py-4 text-gray-400">
                    No slots available - click "+" buttons above to add slots
                  </div>
                )}
                {slots.map((slot, slotIdx) => (
                  <div
                    key={slotIdx}
                    className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded px-3 py-2"
                  >
                    <span className="text-sm font-medium text-blue-900">
                      {slot.start_time} - {slot.end_time}
                    </span>
                    <button
                      onClick={() => removeTimeSlot(slot.date, slot.start_time)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center space-x-2">
                <button
                  onClick={() => {
                    const time = prompt('Enter start time (HH:MM format, e.g., 14:30):');
                    if (time && /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
                      const [hours, minutes] = time.split(':');
                      const startTime = `${hours}:${minutes}`;
                      const endHour = (parseInt(hours) + 1).toString().padStart(2, '0');
                      const endTime = `${endHour}:${minutes}`;
                      addTimeSlot(date, startTime, endTime);
                    } else if (time) {
                      alert('Invalid time format. Please use HH:MM (e.g., 14:30)');
                    }
                  }}
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-1"
                >
                  <Plus size={14} />
                  <span>Custom Time</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={saveAvailability}
          disabled={saving}
          className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center space-x-2 text-lg font-semibold"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save size={20} />
              <span>Save All Availability</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
