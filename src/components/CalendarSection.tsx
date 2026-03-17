'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { WORKSHOP_CONFIG, SlotId } from '@/lib/config';
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
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2, CalendarHeart, ExternalLink, ChevronRight as ChevronRightIcon, AlertTriangle, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CalendarSection() {
  const searchParams = useSearchParams();
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
    confirmEmail: '',
    getNotified: true,
  });

  const slotsData = {
    Saturday: [
      WORKSHOP_CONFIG.pricing.A,
      WORKSHOP_CONFIG.pricing.B,
    ],
    Sunday: [
      WORKSHOP_CONFIG.pricing.C,
      WORKSHOP_CONFIG.pricing.D,
      WORKSHOP_CONFIG.pricing.E,
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

    if (formData.email !== formData.confirmEmail) {
      alert("Emails do not match. Please check again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: format(selectedDate, 'yyyy-MM-dd'),
          slot: selectedSlot,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        alert(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('Connection error. Please check your internet.');
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
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-cream p-8 rounded-3xl shadow-sm border border-gray-100"
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
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-900 mb-2">Session Booked!</h3>
                <button 
                  onClick={() => {
                    setSubmitted(false);
                    setSelectedSlot(null);
                  }}
                  className="mt-2 text-green-600 text-sm font-semibold hover:text-green-800 transition-colors underline"
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
                    const isFull = currentCount >= WORKSHOP_CONFIG.general.maxCapacity;

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
                              {slot.group} • RM {slot.price}
                            </span>
                            <h4 className={cn(
                              "text-xl font-bold transition-colors",
                              isFull ? "text-gray-400" : "text-gray-900 group-hover:text-primary"
                            )}>
                              {slot.time}
                            </h4>
                            <p className={cn(
                              "text-xs mt-1 font-medium",
                              currentCount >= WORKSHOP_CONFIG.general.maxCapacity - 1 ? "text-red-500" : "text-gray-500"
                            )}>
                              {isFull ? "Workshop Full" : `${WORKSHOP_CONFIG.general.maxCapacity - currentCount} seats remaining`}
                            </p>
                          </div>
                          {!isFull && (
                            <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                              <ChevronRightIcon className="w-5 h-5" />
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
                onSubmit={handleSubmitBooking}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <button 
                    onClick={() => setSelectedSlot(null)}
                    className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4 hover:text-primary flex items-center"
                  >
                    <ChevronLeft className="w-3 h-3 mr-1" /> Change Slot
                  </button>
                  <h3 className="text-3xl font-light mb-2">
                    Ready to <span className="font-bold text-primary">Join?</span>
                  </h3>
                  <p className="text-gray-500">
                    <strong className="text-charcoal">{getDaySlots(selectedDate).find(s => s.id === selectedSlot)?.group} Experience:</strong> {getDaySlots(selectedDate).find(s => s.id === selectedSlot)?.time} <br/>
                    {format(selectedDate, 'MMMM do')} • <span className="text-primary font-bold">RM {getDaySlots(selectedDate).find(s => s.id === selectedSlot)?.price}</span>
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-orange-800">
                    <strong>Weekend slots fill up fast!</strong> There are only <strong className="font-bold">4 seats maximum</strong> per session to ensure personalized guidance.
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
                  <div>
                    <label className="block text-sm font-semibold mb-2" htmlFor="confirmEmail">Confirm Email</label>
                    <input 
                      required
                      type="email" 
                      id="confirmEmail"
                      value={formData.confirmEmail}
                      onChange={(e) => setFormData({...formData, confirmEmail: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      placeholder="Repeat email address"
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
                  <p className="text-[11px] text-gray-400 leading-relaxed italic border-t border-gray-100 pt-4">
                    <strong>Note:</strong> {WORKSHOP_CONFIG.general.cancellationPolicy}
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                    <p className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Secure your slot instantly with our online booking system.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <MessageCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>After booking, you can contact us directly via WhatsApp for any questions!</span>
                    </p>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-charcoal text-white font-medium py-4 rounded-xl hover:bg-black transition-all flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Opening Secure Payment...</span>
                      </>
                    ) : (
                      <>
                        <span>Proceed to Payment (RM {getDaySlots(selectedDate).find(s => s.id === selectedSlot)?.price})</span>
                        <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-bold">
                    Secured by Stripe
                  </p>

                  <a 
                    href={`https://wa.me/${WORKSHOP_CONFIG.general.whatsappNumber}?text=Hi%20I’m%20interested%20in%20your%20baking%20class`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-center items-center gap-2 w-full text-center py-3 mt-2 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium text-gray-600"
                  >
                    <MessageCircle className="w-4 h-4 mr-1.5" /> Ask on WhatsApp before booking
                  </a>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
