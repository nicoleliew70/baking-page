'use client';

export const runtime = 'edge';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle, CalendarDays, MessageSquare, ArrowLeft } from 'lucide-react';
import { WORKSHOP_CONFIG } from '@/lib/config';

export default function CancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Nav */}
      <nav className="w-full bg-cream/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="/" className="text-xl font-bold tracking-tighter uppercase">
            Nicole's <span className="text-primary">Baking</span>
          </a>
          <a href="/" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </a>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-lg w-full"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <XCircle className="w-10 h-10 text-gray-400" />
          </motion.div>

          {/* Heading */}
          <div className="text-center mb-10">
            <p className="text-gray-400 font-semibold tracking-widest uppercase text-xs mb-3">Payment Cancelled</p>
            <h1 className="text-4xl md:text-5xl font-light leading-tight mb-4">
              No worries — <span className="font-semibold italic">come back anytime.</span>
            </h1>
            <p className="text-gray-500 leading-relaxed">
              Your booking was not completed and you have not been charged. Your spot is still open — head back to the calendar whenever you're ready.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/#calendar')}
              className="flex items-center justify-center gap-3 w-full bg-charcoal text-white font-semibold py-4 rounded-custom hover:bg-black transition-all"
            >
              <CalendarDays className="w-5 h-5" />
              Return to Booking Calendar
            </button>

            <a
              href={`https://wa.me/${WORKSHOP_CONFIG.general.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full border border-gray-200 bg-white text-gray-700 font-semibold py-4 rounded-custom hover:border-primary hover:text-primary transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              Have questions? Chat on WhatsApp
            </a>

            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center gap-2 w-full text-gray-400 font-medium py-3 hover:text-primary transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-gray-400">
          <p className="font-bold uppercase tracking-[0.2em] mb-1">Nicole Baking Workshop</p>
          <p>📍 Sandakan, Sabah, Malaysia</p>
        </div>
      </footer>
    </div>
  );
}
