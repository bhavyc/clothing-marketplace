import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Vamika Bhargavi",
  description: "Read the official Terms of Service and guidelines for shopping with Vamika Bhargavi.",
};

export default function TermsPage() {
  return (
    <div className="bg-brand-cream min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white border border-[#E8DFC8] rounded-xl shadow-xs p-8 sm:p-12">
        {/* Header */}
        <div className="text-center border-b border-[#E8DFC8] pb-8 mb-8">
          <h1 className="font-serif text-3xl sm:text-5xl text-brand-charcoal font-semibold tracking-wide lowercase">
            terms & <span className="font-normal italic text-brand-gold">conditions</span>
          </h1>
          <p className="font-sans text-[10px] uppercase tracking-widest text-brand-gold font-bold mt-2">
            Last Updated: July 27, 2026
          </p>
        </div>

        {/* Content */}
        <div className="font-sans text-brand-charcoal text-sm leading-relaxed space-y-8">
          <section>
            <h2 className="font-serif text-xl text-brand-charcoal font-bold mb-3">1. acceptance of terms</h2>
            <p>
              By accessing our website ([vamikabhargavi.com](https://vamikabhargavi.com)) or using our mobile application, you agree to comply with and be bound by the following Terms and Conditions. If you do not agree with any part of these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal font-bold mb-3">2. account registration & eligibility</h2>
            <p className="mb-3">
              To browse our collections and complete a purchase, you may need to register an account.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>You must provide accurate, current, and complete personal registration details.</li>
              <li>Account authentication relies on a secure One-Time Password (OTP) sent to your registered phone number. You are responsible for maintaining the confidentiality of your session.</li>
              <li>We reserve the right to suspend or terminate accounts that provide misleading information.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal font-bold mb-3">3. products & handcrafted variations</h2>
            <p>
              Our collections feature premium, custom-designed mother-daughter wear and traditional ethnic clothing. Since many of our products include delicate handcrafts, Aari embroidery, or specific fabric dyes, minor variations in color, layout, or texture are natural characteristics of the artisanal process and are not considered product defects.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal font-bold mb-3">4. pricing, orders & payments</h2>
            <p className="mb-3">
              All transactions are subject to product availability and pricing validation.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Prices are displayed in Indian Rupees (INR) and are inclusive/exclusive of applicable taxes as designated at checkout.</li>
              <li>We reserve the right to refuse or cancel any orders due to stock errors or pricing inaccuracies.</li>
              <li>Payments are processed securely through our gateway partner, **Razorpay**. By submitting an order, you agree to be bound by Razorpay's terms of service and transaction authorization regulations.</li>
              <li>Promotional coupon codes must be entered during checkout to apply discounts. Coupons cannot be applied retrospectively after an order is placed.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal font-bold mb-3">5. shipping, deliveries & returns</h2>
            <p className="mb-3">
              Orders are dispatched and delivered in partnership with verified logistics networks.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Delivery timelines listed on the product page are estimates and may vary due to location or logistics constraints.</li>
              <li>Returns or replacements can be initiated through your user profile under the specified return policy timeline, subject to condition inspections by our seller partners.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal font-bold mb-3">6. intellectual property rights</h2>
            <p>
              All website content, software, custom designs, clothing patterns, branding assets, monograms, logos, typography, and images are the exclusive intellectual property of **Vamika & Bhargavi**. You are prohibited from copying, distributing, or replicating any designs or codebase elements without our prior written authorization.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal font-bold mb-3">7. limitation of liability</h2>
            <p>
              We endeavor to keep our online platform fully functional and database systems secure. However, we are not liable for any temporary server outages, connection timeouts (such as serverless database cold starts), or network latency beyond our immediate control.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal font-bold mb-3">8. governing law & jurisdiction</h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of Jammu & Kashmir and the Republic of India. Any legal disputes arising out of your use of our services shall be subject to the exclusive jurisdiction of the courts located in Srinagar, Jammu & Kashmir, India.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal font-bold mb-3">9. support & inquiries</h2>
            <p className="mb-2">
              If you require clarification on any of these Terms and Conditions, please reach out to our administration desk:
            </p>
            <div className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-md p-4 mt-2 space-y-1 font-sans text-xs">
              <p><strong className="text-brand-charcoal">Email:</strong> bhargavivamika@gmail.com</p>
              <p><strong className="text-brand-charcoal">Phone:</strong> +91 98739 59531</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
