'use client';

export const runtime = 'edge';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, MessageSquare, ArrowLeft, Loader2 } from 'lucide-react';
import { WORKSHOP_CONFIG } from '@/lib/config';
import { trackEvent } from '@/lib/gtag';

export default function SuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    // Track successful purchase
    trackEvent('purchase', 'ecommerce', 'Booking Success');

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

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
            className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </motion.div>

          {/* Heading */}
          <div className="text-center mb-10">
            <p className="text-primary font-semibold tracking-widest uppercase text-xs mb-3">Payment Successful</p>
            <h1 className="text-4xl md:text-5xl font-light leading-tight mb-4">
              Your spot is <span className="font-semibold italic">secured!</span>
            </h1>
            <p className="text-gray-500 leading-relaxed">
              We've received your payment and sent a confirmation email to your inbox. We can't wait to bake with you!
            </p>
          </div>

          {/* Detail card */}
          <div className="bg-white rounded-custom border border-gray-100 shadow-sm p-6 mb-8 space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">📧</span>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Confirmation Email</p>
                <p className="text-sm text-gray-600">Check your inbox (and spam folder) for your booking details.</p>
              </div>
            </div>
            <div className="border-t border-gray-50" />
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">📋</span>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Cancellation Policy</p>
                <p className="text-sm text-gray-600">{WORKSHOP_CONFIG.general.cancellationPolicy}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <a
              href={`https://wa.me/${WORKSHOP_CONFIG.general.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('generate_lead', 'whatsapp', 'Success Page WhatsApp Click')}
              className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white font-semibold py-4 rounded-custom hover:bg-[#20bd5a] transition-all shadow-md shadow-green-200"
            >
              <MessageSquare className="w-5 h-5" />
              Chat with Nicole on WhatsApp
            </a>
            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center gap-2 w-full text-gray-400 font-medium py-3 hover:text-primary transition-colors text-sm"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Redirecting to home in {countdown}s</span>
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

