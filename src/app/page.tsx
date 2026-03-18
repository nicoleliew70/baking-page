'use client';

import React, { Suspense } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Sparkles, ChefHat, MessageCircle } from 'lucide-react';
import CalendarSection from '@/components/CalendarSection';
import { trackEvent } from '@/lib/gtag';
import { EventSchema, FAQSchema, BreadcrumbSchema, PersonSchema } from '@/components/SeoSchemas';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

export default function Home() {
  return (
    <>
      {/* SEO Schemas */}
      <EventSchema />
      <FAQSchema />
      <BreadcrumbSchema />
      <PersonSchema />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-cream/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tighter uppercase">
            Nicole's <span className="text-primary">Baking</span>
          </div>
          <div className="hidden md:flex space-x-8 text-sm font-medium uppercase tracking-widest">
            <a className="hover:text-primary transition-colors" href="#classes">Experiences</a>
            <a className="hover:text-primary transition-colors" href="#story">Our Story</a>
            <a className="hover:text-primary transition-colors" href="#calendar">Book Now</a>
          </div>
          <div>
            <a className="bg-primary text-white px-6 py-2.5 rounded-custom text-sm font-semibold hover:opacity-90 transition-all" href="#calendar" onClick={() => trackEvent('click', 'navigation', 'Nav - Book an Experience')}>
              Book an Experience
            </a>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden" aria-label="Hero section">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="z-10"
            >
              <motion.span variants={fadeIn} className="text-primary font-semibold tracking-widest uppercase text-xs mb-4 block">
                Hands-on baking experiences in Sandakan, Sabah
              </motion.span>
              <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-light leading-tight mb-6">
                Create beautiful <br/>
                <span className="font-semibold italic">desserts</span>
              </motion.h1>
              <motion.div variants={fadeIn} className="text-lg text-gray-600 mb-8 max-w-md leading-relaxed">
                <p className="mb-4">Learn to create beautiful desserts — and take them home <Sparkles className="w-5 h-5 ml-1 inline text-primary" /></p>
                <ul className="text-base space-y-2 font-medium">
                  <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> No experience needed</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> All ingredients provided</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Small group experiences (max 4 students)</li>
                </ul>
              </motion.div>
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4">
                <a className="bg-charcoal text-white px-8 py-4 rounded-custom text-center font-medium hover:bg-black transition-all" href="#classes" onClick={() => trackEvent('click', 'hero', 'Hero - Explore Experiences')}>
                  Explore Experiences
                </a>
                <a className="border border-charcoal text-charcoal px-8 py-4 rounded-custom text-center font-medium hover:bg-charcoal hover:text-white transition-all" href="#calendar" onClick={() => trackEvent('click', 'hero', 'Hero - Check Schedule')}>
                  Check Schedule
                </a>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 2 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative hidden md:block"
            >
              <div className="rounded-custom overflow-hidden shadow-2xl hover:rotate-0 transition-transform duration-700">
                <img 
                  alt="Nicole Liew, Master Baker at Nicole's Baking" 
                  className="w-full h-[600px] object-cover object-top" 
                  src="/chef-nicole.webp"
                />
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute -bottom-6 -left-6 bg-white p-6 rounded-custom shadow-xl hidden lg:block"
              >
                <p className="text-sm font-bold text-gray-400 uppercase mb-1">Success Rate</p>
                <p className="text-3xl font-bold text-primary">98%</p>
                <p className="text-xs text-gray-500 mt-1">Students mastering baguette crust</p>
              </motion.div>
            </motion.div>

          </div>
        </section>

        {/* Our Story */}
        <section className="section-padding bg-white" id="story" aria-label="Our story section">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="order-2 md:order-1 grid grid-cols-2 gap-4"
            >
              <motion.div variants={fadeIn} className="space-y-4 pt-12">
                <img alt="Nicole Liew teaching a student" className="rounded-custom shadow-lg hover:scale-[1.02] transition-transform duration-500 w-full object-cover" src="/story-teaching.webp"/>
                <img alt="A group posing with their fresh bakes" className="rounded-custom shadow-lg hover:scale-[1.02] transition-transform duration-500 w-full object-cover" src="/story-group.webp"/>
              </motion.div>
              <motion.div variants={fadeIn} className="space-y-4">
                <img alt="Nicole Liew holding a fresh sourdough loaf" className="rounded-custom shadow-lg hover:scale-[1.02] transition-transform duration-500 w-full object-cover" src="/story-sourdough.webp"/>
              </motion.div>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="order-1 md:order-2"
            >
              <motion.h2 variants={fadeIn} className="text-4xl font-light mb-8 italic">
                The story behind every <span className="font-bold text-charcoal">perfect crumb.</span>
              </motion.h2>
              <motion.p variants={fadeIn} className="text-gray-600 mb-6 leading-relaxed">
                Founded by Master Baker <span className="font-bold">Nicole Liew</span>, our studio is dedicated to preserving traditional baking methods while embracing modern aesthetics. We believe that baking is a sensory journey meant to be shared.
              </motion.p>
              <motion.div variants={fadeIn} className="bg-cream p-6 rounded-custom border border-gray-100 mb-8 shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-primary">Why students love our experiences:</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span><strong>Intimate classes:</strong> Max 4 students for personalized guidance.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span><strong>Everything provided:</strong> Premium ingredients, utensils, &amp; appliances.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span><strong>Take it home:</strong> Full recipes provided and you bring home your baked goods!</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span><strong>Zero stress:</strong> We'll worry about the cleaning, you just have fun.</span>
                  </li>
                </ul>
                <p className="text-sm font-bold text-green-600 mt-6 flex items-center">
                  <ChefHat className="w-5 h-5 mr-3 flex-shrink-0" /> Perfect for beginners — we guide you step by step!
                </p>
              </motion.div>
              <motion.a variants={fadeIn} href="#calendar" className="text-primary font-bold border-b-2 border-primary pb-1 hover:text-charcoal hover:border-charcoal transition-all" onClick={() => trackEvent('click', 'story', 'Story - Book Today Link')}>
                Book your session today →
              </motion.a>
            </motion.div>

          </div>
        </section>

        {/* Experiences Catalog */}
        <section className="section-padding bg-cream" id="classes" aria-label="Available experiences section">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex justify-between items-end mb-12"
            >
              <div>
                <h2 className="text-4xl font-light mb-2">Upcoming <span className="font-bold">Experiences</span></h2>
                <p className="text-gray-500">Perfect for Kids, Teens, and Adults (2-4 hours per experience).</p>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  title: "Adults Cheesecake Duo", 
                  hours: "3 Hours", 
                  level: "Adults (18+)", 
                  description: "Learn to make **2 full cheesecakes from scratch** in a fun, hands-on session<br/><br/>✔ 3–4 hour guided experience<br/>✔ Beginner-friendly (no experience needed)<br/>✔ All ingredients & tools provided<br/>✔ Take home everything you make<br/>✔ Small group (max 4 students)",
                  price: "RM 250", 
                  status: "Open", 
                  src: "/cheesecake-experience.webp" 
                },
                { 
                  title: "Teens Brownie & Ice Cream", 
                  hours: "3 Hours", 
                  level: "Teens (13-17)", 
                  description: "Create delicious brownies and make your own vanilla ice cream from scratch!<br/><br/>✔ 3 hour guided experience<br/>✔ Beginner-friendly (no experience needed)<br/>✔ All ingredients & tools provided<br/>✔ Take home everything you make<br/>✔ Small group (max 4 students)",
                  price: "RM 200", 
                  status: "Open", 
                  src: "/brownie-experience.webp" 
                },
                { 
                  title: "Kids Cupcake Experience", 
                  hours: "3 Hours", 
                  level: "Kids (9-12)", 
                  description: "Perfect for young bakers wanting to learn, create, and have fun in the kitchen!<br/><br/>✔ 3 hour guided experience<br/>✔ Beginner-friendly (no experience needed)<br/>✔ All ingredients & tools provided<br/>✔ Take home everything you make<br/>✔ Small group (max 4 students)",
                  price: "RM 150", 
                  status: "Open", 
                  src: "/cupcake-experience.webp" 
                },
              ].map((cls, idx) => (
                <div key={idx} className="h-full">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: idx * 0.15 }}
                    className="bg-white p-4 rounded-custom border border-gray-100 shadow-sm hover:shadow-xl transition-all h-full flex flex-col group"
                  >
                  <a href="#calendar" className="block img-hover-zoom rounded-custom mb-6 aspect-[4/3] bg-gray-100 overflow-hidden relative">
                    <img alt={cls.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={cls.src}/>
                  </a>
                  <div className="flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase px-2 py-1 rounded">
                        {cls.level}
                      </span>
                      {cls.status === "Open" ? (
                        <div className="flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          <span className="text-green-700 text-[10px] font-bold uppercase tracking-wider">Booking Open</span>
                        </div>
                      ) : (
                        <span className="bg-red-100 text-red-700 text-[10px] font-bold uppercase px-2 py-1 rounded">Sold Out</span>
                      )}
                    </div>
                    <a href="#calendar" className="block hover:text-primary transition-colors">
                      <h3 className="text-2xl font-semibold mb-2 text-charcoal">{cls.title}</h3>
                    </a>
                    <p 
                      className="text-sm text-gray-600 mb-4 leading-relaxed flex-grow" 
                      dangerouslySetInnerHTML={{ __html: cls.description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                    ></p>
                    <div className="mt-auto pt-4 border-t border-gray-50 text-sm">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                          <span className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">Duration</span>
                          <span className="font-semibold text-charcoal">{cls.hours}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">Course Fee</span>
                          <p className="text-xl font-bold text-primary">{cls.price}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <a href="#calendar" onClick={() => trackEvent('click', 'class_card', `Class - Book Now - ${cls.title}`)} className="block w-full text-center bg-primary text-white font-semibold py-3.5 rounded-xl hover:bg-primary/90 transition-all">
                          Book Now
                        </a>
                        <a 
                          href={`https://wa.me/601133848412?text=Hi%20I’m%20interested%20in%20your%20baking%20class`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackEvent('generate_lead', 'whatsapp', `Class - WhatsApp - ${cls.title}`)}
                          className="flex justify-center items-center gap-2 w-full text-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-xs font-medium text-gray-600"
                        >
                          <MessageCircle className="w-4 h-4 mr-1.5" /> Ask on WhatsApp before booking
                        </a>
                      </div>
                    </div>
                  </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Functional Booking Calendar */}
        <Suspense fallback={<div className="h-96 flex items-center justify-center bg-cream rounded-2xl animate-pulse">Loading Booking System...</div>}>
          <CalendarSection />
        </Suspense>

        {/* Testimonials */}
        <section className="section-padding bg-charcoal text-white text-center" aria-label="Student testimonials section">
          <div className="max-w-3xl mx-auto px-6">
            <svg className="w-12 h-12 text-primary mx-auto mb-8 opacity-50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V4H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM3.017 21L3.017 18C3.017 16.8954 3.91243 16 5.017 16H8.017C8.56928 16 9.017 15.5523 9.017 15V9C9.017 8.44772 8.56928 8 8.017 8H4.017C3.46472 8 3.017 8.44772 3.017 9V11C3.017 11.5523 2.56928 12 2.017 12H1.017V4H11.017V15C11.017 18.3137 8.33071 21 5.017 21H3.017Z"></path>
            </svg>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-light italic leading-relaxed mb-8"
            >
              "The Fundamentals class changed my entire perspective on baking! Nicole's teaching style is patient, precise, and incredibly inspiring. I highly recommend her Sandakan workshop to anyone wanting to learn."
            </motion.p>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center border border-primary/30">
                <span className="text-primary font-bold text-sm">AR</span>
              </div>
              <div className="text-left">
                <p className="font-bold">Aisyah Rahman</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest">Sandakan Home Baker</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-cream border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="text-xl font-bold tracking-tighter uppercase mb-6">
              Nicole's <span className="text-primary">Baking</span>
            </div>
            <p className="text-gray-500 max-w-sm mb-4">
              Nurturing the Sandakan community of bakers through expert-led education and artisanal tradition.
            </p>
            <p className="text-gray-500 max-w-sm font-medium">
              📍 Sandakan, Sabah, Malaysia
            </p>
          </div>
          <div>
            <h4 className="font-bold uppercase text-xs tracking-widest mb-6">Explore</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a className="hover:text-primary transition-colors" href="#">All Experiences</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Private Events</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase text-xs tracking-widest mb-6">Connect</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="mailto:nicoleliew70@gmail.com" className="hover:text-primary transition-colors">nicoleliew70@gmail.com</a></li>
              <li><a href="https://wa.me/601133848412" className="hover:text-primary transition-colors">+60 11-3384 8412</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-gray-200 text-xs text-gray-400 flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} Nicole Baking. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="flex items-center text-gray-500">
              Bank details provided upon booking confirmation.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}

