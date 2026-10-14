import React from "react";
import { Metadata } from "next";
import { Truck, Clock, ShieldCheck, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | Vamika Bhargavi",
  description: "Official shipping timelines, processing schedules, and delivery guidelines for Vamika Bhargavi designer wear.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="bg-brand-cream min-h-screen py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white border border-[#E8DFC8] rounded-xl shadow-xs p-6 sm:p-12">
        {/* Header */}
        <div className="text-center border-b border-[#E8DFC8] pb-8 mb-8">
          <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-bold font-sans block mb-2">
            Logistics & Fulfillment
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-brand-charcoal font-semibold tracking-wide lowercase">
            shipping & <span className="font-normal italic text-brand-gold">delivery policy</span>
          </h1>
          <p className="font-sans text-[10px] uppercase tracking-widest text-stone-400 font-medium mt-3">
            Last Updated: August 2026
          </p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#FAF6F0] border border-[#E8DFC8] p-4 rounded-lg text-center">
            <Truck className="h-5 w-5 text-brand-gold mx-auto mb-2" />
            <div className="font-serif text-xs font-bold uppercase tracking-wider text-brand-charcoal">
              Free Shipping
            </div>
            <p className="text-[11px] text-stone-500 font-sans mt-1">
              Complimentary express delivery across all serviceable PIN codes in India.
            </p>
          </div>

          <div className="bg-[#FAF6F0] border border-[#E8DFC8] p-4 rounded-lg text-center">
            <Clock className="h-5 w-5 text-brand-gold mx-auto mb-2" />
            <div className="font-serif text-xs font-bold uppercase tracking-wider text-brand-charcoal">
              Tailoring: 7-10 Days
            </div>
            <p className="text-[11px] text-stone-500 font-sans mt-1">
              Hand-cut and stitched by master artisans with delicate detailing.
            </p>
          </div>

          <div className="bg-[#FAF6F0] border border-[#E8DFC8] p-4 rounded-lg text-center">
            <ShieldCheck className="h-5 w-5 text-brand-gold mx-auto mb-2" />
            <div className="font-serif text-xs font-bold uppercase tracking-wider text-brand-charcoal">
              Delivery: 7-10 Days
            </div>
            <p className="text-[11px] text-stone-500 font-sans mt-1">
              Insured express delivery across all serviceable locations.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="font-sans text-brand-charcoal text-xs sm:text-sm leading-relaxed space-y-8">
          <section>
            <h2 className="font-serif text-lg sm:text-xl text-brand-charcoal font-bold mb-3 lowercase">
              1. slow fashion craftsmanship & tailoring schedule
            </h2>
            <p className="text-stone-600">
              At **Vamika & Bhargavi**, we uphold the principles of slow fashion. Rather than mass-manufacturing, each piece is handcrafted, embroidered, and tailored to order. Standard tailoring and quality inspection take approximately <strong>7 to 10 business days</strong> before your parcel is securely sealed for dispatch.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg sm:text-xl text-brand-charcoal font-bold mb-3 lowercase">
              2. domestic shipping across india
            </h2>
            <p className="mb-2 text-stone-600">
              We provide fully insured, complimentary domestic shipping across India:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-stone-600">
              <li><strong>Shipping Charges:</strong> Free of charge on all prepaid and COD orders above Rs. 1,000.</li>
              <li><strong>Estimated Delivery Timeline:</strong> Orders are typically processed, tailored, and delivered within <strong>7 to 10 business days</strong> across all serviceable PIN codes.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg sm:text-xl text-brand-charcoal font-bold mb-3 lowercase">
              3. real-time order tracking & awb updates
            </h2>
            <p className="text-stone-600">
              Once your package is handed over for dispatch, an automated notification containing your **Air Waybill (AWB) Tracking Code** will be sent to your registered Email address. You can also track your shipment live at any time through our customer portal under the &quot;My Orders&quot; section.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg sm:text-xl text-brand-charcoal font-bold mb-3 lowercase">
              4. cash on delivery (cod) verification
            </h2>
            <p className="text-stone-600">
              To prevent delivery failures, our customer concierge team may contact you via phone or email to confirm your delivery address prior to dispatching Cash-on-Delivery orders. Please ensure someone is available at the provided delivery address to receive the parcel and complete payment to the delivery executive.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg sm:text-xl text-brand-charcoal font-bold mb-3 lowercase">
              5. shipping inquiries & concierge assistance
            </h2>
            <div className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-md p-4 space-y-1.5 text-xs text-stone-700">
              <p><strong className="text-brand-charcoal">Studio Dispatch Hub:</strong> Srinagar, Jammu & Kashmir &ndash; 190001, India</p>
              <p><strong className="text-brand-charcoal">Concierge Email:</strong> <a href="mailto:vamikabhargavi@gmail.com" className="text-brand-gold underline">vamikabhargavi@gmail.com</a></p>
              <p><strong className="text-brand-charcoal">Tracking Assistance Helpline:</strong> +91 98739 59531</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
