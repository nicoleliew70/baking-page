'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, MessageSquare, ArrowLeft, Loader2 } from 'lucide-react';
import { WORKSHOP_CONFIG } from '@/lib/config';

export default function SuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
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
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-primary/5 p-8 md:p-12 text-center border border-gray-100"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </motion.div>

        <h1 className="text-4xl font-bold text-charcoal mb-4">
          Booking <span className="text-primary">Secured!</span>
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Payment successful! Your spot is officially reserved. We've sent a confirmation email and a calendar invite to your inbox.
        </p>

        <div className="space-y-4 mb-10">
          <a 
            href={`https://wa.me/${WORKSHOP_CONFIG.general.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white font-bold py-4 rounded-xl hover:bg-[#20bd5a] transition-all shadow-lg shadow-green-200 group"
          >
            <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Message Nicole on WhatsApp</span>
          </a>
          
          <button 
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 w-full text-gray-500 font-medium py-2 hover:text-primary transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home Now</span>
          </button>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-medium uppercase tracking-widest">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Auto-redirecting in {countdown}s</span>
          </div>
        </div>
      </motion.div>
      
      <p className="mt-8 text-gray-400 text-xs uppercase tracking-[0.2em] font-bold">
        Nicole Baking Workshop
      </p>
    </div>
  );
}
