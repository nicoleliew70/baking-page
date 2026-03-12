'use client';

import React, { useState, useEffect } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isBefore,
  isSameDay,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2, CalendarHeart } from 'lucide-react';
import { cn } from '@/lib/utils';


export default function CalendarSection() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [slotCounts, setSlotCounts] = useState<Record<string, Record<string, number>>>({});
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    getNotified: true,
  });

  const slotsData = {
    Saturday: [
      { id: 'A', group: 'Kids', time: '3pm - 6pm' },
      { id: 'B', group: 'Teens', time: '7pm - 10pm' },
    ],
    Sunday: [
      { id: 'C', group: 'Adults', time: '10am - 1pm' },
      { id: 'D', group: 'Adults', time: '2pm - 5pm' },
      { id: 'E', group: 'Adults', time: '7pm - 10pm' },
    ]
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  useEffect(() => {
    async function fetchAvailability() {
      setIsLoadingAvailability(true);
      try {
        const response = await fetch(`/api/calendar?date=${currentDate.toISOString()}`);
        if (response.ok) {
          const data = await response.json();
          setSlotCounts(data.slotCounts || {});
        }
      } catch (error) {
        console.error('Failed to fetch availability', error);
      } finally {
        setIsLoadingAvailability(false);
      }
    }
    fetchAvailability();
  }, [currentDate]);

  const dateRange = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: selectedDate.toISOString(),
          slot: selectedSlot,
        }),
      });
      
      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaySlots = (date: Date | null) => {
    if (!date) return [];
    const day = date.getDay();
    if (day === 6) return slotsData.Saturday;
    if (day === 0) return slotsData.Sunday;
    return [];
  };

  return (
    <section className="section-padding bg-white relative" id="calendar">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start">
        
        {/* Calendar Column */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-8 p-8 md:p-12 bg-cream rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-light">
              Select a <span className="font-bold">Date</span>
            </h2>
            <div className="flex space-x-2">
              <button 
                onClick={prevMonth}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="text-center font-medium text-lg mb-6 tracking-wide uppercase text-gray-500">
            {format(currentDate, 'MMMM yyyy')}
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-sm mb-4">
            {weekDays.map(day => (
              <div key={day} className="font-semibold text-gray-400 uppercase tracking-widest text-[11px]">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-2 relative">
            {isLoadingAvailability && (
               <div className="absolute inset-0 bg-cream/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
               </div>
            )}
            {dateRange.map((day, i) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const today = new Date();
              today.setHours(0,0,0,0);
              const past = isBefore(day, today);
              
              const dayStr = format(day, 'yyyy-MM-dd');
              const daySlots = getDaySlots(day);
              const isWeekend = daySlots.length > 0;
              
              // A day is 'fully booked' only if all its slots have 4 or more bookings
              const daySlotCounts = slotCounts[dayStr] || {};
              const isFullyBooked = isWeekend && daySlots.every(slot => (daySlotCounts[slot.id] || 0) >= 4);

              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const disabled = !isCurrentMonth || past || isFullyBooked || !isWeekend || isLoadingAvailability;

              return (
                <button
                  key={i}
                  disabled={disabled}
                  onClick={() => {
                    setSelectedDate(day);
                    setSelectedSlot(null);
                  }}
                  className={cn(
                    "aspect-square flex items-center justify-center rounded-xl text-sm transition-all relative overflow-hidden",
                    !isCurrentMonth && "opacity-30",
                    past && "opacity-30 cursor-not-allowed",
                    (!isWeekend || isFullyBooked) && !past && "bg-gray-50 text-gray-400 cursor-not-allowed opacity-50",
                    isFullyBooked && "line-through text-red-400",
                    !disabled && !isSelected && "hover:bg-primary/10 hover:text-primary",
                    isSelected && "bg-primary text-white font-bold shadow-md shadow-primary/30"
                  )}
                >
                  <span>{format(day, 'd')}</span>
                  {!disabled && !isSelected && isWeekend && (
                    <span className="absolute bottom-1.5 w-1 h-1 bg-green-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-4 pt-6 mt-6 border-t border-gray-200 text-xs text-gray-500 font-medium">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>Available (Sat/Sun)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
              <span>Full or Unavailable</span>
            </div>
          </div>
        </motion.div>

        {/* Booking Form Column */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col justify-center h-full"
        >
          <AnimatePresence mode="wait">
            {!selectedDate ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300"
              >
                <CalendarHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Select a Saturday or Sunday <br/>to view workshop slots.</p>
              </motion.div>
            ) : submitted ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
              >
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-900 mb-2">Request Sent!</h3>
                <p className="text-green-700 mb-6">
                  Your request for the {getDaySlots(selectedDate).find(s => s.id === selectedSlot)?.group} workshop on {format(selectedDate, 'PPP')} has been sent.
                </p>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
                  <p className="text-sm text-gray-600 mb-3 text-left">
                    <strong>Next Step:</strong> Please send Nicole a quick WhatsApp message to confirm your slot and receive payment information!
                  </p>
                  <a 
                    href={`https://wa.me/601133848412?text=${encodeURIComponent(`Hi Nicole! I just sent a booking request for Slot ${selectedSlot} (${getDaySlots(selectedDate).find(s => s.id === selectedSlot)?.group} @ ${getDaySlots(selectedDate).find(s => s.id === selectedSlot)?.time}) on ${format(selectedDate, 'MMM do')}. My name is ${formData.name}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-center items-center space-x-2 bg-green-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors w-full"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.126.549 4.168 1.593 5.969L.004 24l6.177-1.62A11.966 11.966 0 0012.031 24c6.646 0 12.031-5.385 12.031-12.031C24.062 5.385 18.677 0 12.031 0zm0 22A9.976 9.976 0 014.288 18.42l-.271-.43-3.468.91 1-3.376-.473-.755A9.978 9.978 0 012.031 12C2.031 6.477 6.477 2 12.031 2s10 4.477 10 10-4.477 10-10 10zm5.669-7.143c-.312-.156-1.844-.912-2.125-1.016-.282-.104-.485-.156-.69.156-.206.312-.801 1.016-.983 1.224-.183.208-.364.234-.676.078-.312-.156-1.313-.485-2.502-1.545-.928-.826-1.554-1.846-1.737-2.158-.183-.312-.02-.482.136-.638.141-.14.312-.364.469-.546.156-.182.208-.312.312-.52.104-.208.052-.39-.026-.546-.078-.156-.69-1.664-.946-2.28-.248-.598-.501-.516-.69-.525-.182-.01-.39-.01-.598-.01a1.14 1.14 0 00-.832.39c-.282.312-1.092 1.066-1.092 2.6s1.118 3.016 1.274 3.224c.156.208 2.197 3.354 5.318 4.706.744.323 1.326.516 1.777.66.747.239 1.427.205 1.962.124.594-.09 1.844-.754 2.104-1.482.261-.728.261-1.352.183-1.482-.078-.13-.282-.208-.594-.364z"/></svg>
                    <span>Message on WhatsApp</span>
                  </a>
                </div>

                <button 
                  onClick={() => {
                    setSubmitted(false);
                    setSelectedDate(null);
                    setSelectedSlot(null);
                  }}
                  className="mt-2 text-green-600 font-semibold hover:text-green-800 transition-colors"
                >
                  Book another session
                </button>
              </motion.div>
            ) : !selectedSlot ? (
              <motion.div 
                key="slots"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <button 
                    onClick={() => setSelectedDate(null)}
                    className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4 hover:text-primary flex items-center"
                  >
                    <ChevronLeft className="w-3 h-3 mr-1" /> Back to calendar
                  </button>
                  <h3 className="text-3xl font-light mb-2">
                    Available <span className="font-bold text-primary">Slots</span>
                  </h3>
                  <p className="text-gray-500">
                    Workshop options for {format(selectedDate, 'EEEE, MMMM do')}
                  </p>
                </div>

                <div className="space-y-3">
                  {getDaySlots(selectedDate).map((slot) => {
                    const currentCount = slotCounts[format(selectedDate!, 'yyyy-MM-dd')]?.[slot.id] || 0;
                    const isFull = currentCount >= 4;

                    return (
                      <button
                        key={slot.id}
                        disabled={isFull}
                        onClick={() => setSelectedSlot(slot.id)}
                        className={cn(
                          "w-full text-left p-6 rounded-2xl border transition-all group relative overflow-hidden",
                          isFull 
                            ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60" 
                            : "bg-cream border-gray-100 hover:bg-white hover:border-primary hover:shadow-md"
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={cn(
                              "inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-2",
                              isFull ? "bg-gray-200 text-gray-500" : "bg-primary/10 text-primary"
                            )}>
                              Slot {slot.id} • {slot.group}
                            </span>
                            <h4 className={cn(
                              "text-xl font-bold transition-colors",
                              isFull ? "text-gray-400" : "text-gray-900 group-hover:text-primary"
                            )}>
                              {slot.time}
                            </h4>
                            <p className={cn(
                              "text-xs mt-1 font-medium",
                              currentCount >= 3 ? "text-red-500" : "text-gray-500"
                            )}>
                              {isFull ? "Workshop Full" : `${4 - currentCount} seats remaining`}
                            </p>
                          </div>
                          {!isFull && (
                            <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                              <ChevronRight className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmitBooking}
                className="space-y-6 bg-white"
              >
                <div>
                  <button 
                    onClick={() => setSelectedSlot(null)}
                    className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4 hover:text-primary flex items-center"
                  >
                    <ChevronLeft className="w-3 h-3 mr-1" /> Change Slot
                  </button>
                  <h3 className="text-3xl font-light mb-2">
                    Final <span className="font-bold text-primary">Details</span>
                  </h3>
                  <p className="text-gray-500">
                    Workshop {selectedSlot} ({getDaySlots(selectedDate).find(s => s.id === selectedSlot)?.group}) <br/>
                    {format(selectedDate, 'MMMM do')} @ {getDaySlots(selectedDate).find(s => s.id === selectedSlot)?.time}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" htmlFor="name">Full Name</label>
                    <input 
                      required
                      type="text" 
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" htmlFor="email">Email Address</label>
                    <input 
                      required
                      type="email" 
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      placeholder="jane@example.com"
                    />
                  </div>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.getNotified}
                      onChange={(e) => setFormData({...formData, getNotified: e.target.checked})}
                      className="mt-1.5 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm text-gray-600">
                      Notify me of future artisan baking workshops and private events.
                    </span>
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-charcoal text-white font-medium py-4 rounded-xl hover:bg-black transition-all flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending Request...</span>
                    </>
                  ) : (
                    <span>Confirm Booking Request</span>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

