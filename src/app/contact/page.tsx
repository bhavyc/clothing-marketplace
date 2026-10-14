"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending inquiry
    setSubmitted(true);
  };

  return (
    <div className="bg-brand-cream min-h-screen py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase tracking-[0.35em] text-brand-gold font-bold font-sans block">
            We Would Love To Hear From You
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-brand-charcoal font-semibold tracking-wide lowercase">
            contact our <span className="font-normal italic text-brand-gold">concierge</span>
          </h1>
          <p className="font-sans text-xs sm:text-sm text-stone-500 max-w-xl mx-auto leading-relaxed">
            Whether you need assistance with custom measurements, bridal orders, tracking, or general styling advice, our boutique team is here to assist you.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E8DFC8] p-6 rounded-xl shadow-xs text-center space-y-2">
            <div className="w-10 h-10 bg-[#FAF6F0] rounded-full flex items-center justify-center mx-auto text-brand-gold">
              <Phone className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-brand-charcoal">
              Phone & Concierge
            </h3>
            <p className="text-xs text-stone-600 font-sans">
              <a href="tel:+919873959531" className="hover:text-brand-gold transition-colors block">
                +91 98739 59531
              </a>
            </p>
            <span className="text-[10px] text-gray-400 block font-sans uppercase tracking-widest">
              Mon &ndash; Sat, 10 AM &ndash; 7 PM IST
            </span>
          </div>

          <div className="bg-white border border-[#E8DFC8] p-6 rounded-xl shadow-xs text-center space-y-2">
            <div className="w-10 h-10 bg-[#FAF6F0] rounded-full flex items-center justify-center mx-auto text-brand-gold">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-brand-charcoal">
              Email Concierge
            </h3>
            <p className="text-xs text-stone-600 font-sans truncate">
              <a href="mailto:vamikabhargavi@gmail.com" className="hover:text-brand-gold transition-colors block">
                vamikabhargavi@gmail.com
              </a>
            </p>
            <span className="text-[10px] text-gray-400 block font-sans uppercase tracking-widest">
              Response within 24 hours
            </span>
          </div>

          <div className="bg-white border border-[#E8DFC8] p-6 rounded-xl shadow-xs text-center space-y-2">
            <div className="w-10 h-10 bg-[#FAF6F0] rounded-full flex items-center justify-center mx-auto text-brand-gold">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-brand-charcoal">
              Studio & Atelier
            </h3>
            <p className="text-xs text-stone-600 font-sans leading-relaxed">
              Residency Road, Srinagar, Jammu & Kashmir &ndash; 190001, India
            </p>
            <span className="text-[10px] text-gray-400 block font-sans uppercase tracking-widest">
              By Prior Appointment
            </span>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="bg-white border border-[#E8DFC8] rounded-xl shadow-xs p-6 sm:p-10 max-w-2xl mx-auto">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
              <h3 className="font-serif text-2xl font-semibold text-brand-charcoal">
                Thank You For Reaching Out
              </h3>
              <p className="text-xs text-stone-600 font-sans max-w-md mx-auto leading-relaxed">
                Your message has been received by our boutique concierge. We will get back to you via email or phone within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
                }}
                className="mt-4 px-6 py-2.5 bg-brand-charcoal text-brand-cream text-xs uppercase tracking-widest font-bold rounded hover:bg-brand-gold transition-all"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-[#E8DFC8] pb-4">
                <h3 className="font-serif text-xl font-semibold text-brand-charcoal lowercase">
                  send us an inquiry
                </h3>
                <p className="text-xs text-stone-500 font-sans mt-0.5">
                  Fill out your details below and our styling team will connect with you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-charcoal mb-1.5 font-sans">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 border border-[#E8DFC8] rounded-md text-xs font-sans focus:outline-hidden focus:border-brand-gold bg-[#FAF6F0]/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-charcoal mb-1.5 font-sans">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 border border-[#E8DFC8] rounded-md text-xs font-sans focus:outline-hidden focus:border-brand-gold bg-[#FAF6F0]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-charcoal mb-1.5 font-sans">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 border border-[#E8DFC8] rounded-md text-xs font-sans focus:outline-hidden focus:border-brand-gold bg-[#FAF6F0]/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-charcoal mb-1.5 font-sans">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E8DFC8] rounded-md text-xs font-sans focus:outline-hidden focus:border-brand-gold bg-white"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Custom Tailoring">Custom Tailoring / Made-to-measure</option>
                    <option value="Order Tracking">Order & Delivery Status</option>
                    <option value="Returns & Exchange">Returns & Exchanges</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-charcoal mb-1.5 font-sans">
                  Message / Requirements *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your requirements, specific design queries, or order number..."
                  className="w-full px-3.5 py-2.5 border border-[#E8DFC8] rounded-md text-xs font-sans focus:outline-hidden focus:border-brand-gold bg-[#FAF6F0]/30 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-charcoal text-brand-cream hover:bg-brand-gold rounded-md text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Send className="h-3.5 w-3.5" />
                Submit Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
