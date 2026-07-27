import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Vamika Bhargavi",
  description: "Learn how Vamika Bhargavi collects, protects, and handles your personal information with absolute care.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-brand-cream min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white border border-[#E8DFC8] rounded-xl shadow-xs p-8 sm:p-12">
        {/* Header */}
        <div className="text-center border-b border-[#E8DFC8] pb-8 mb-8">
          <h1 className="font-serif text-3xl sm:text-5xl text-brand-charcoal font-semibold tracking-wide lowercase">
            privacy <span className="font-normal italic text-brand-gold">policy</span>
          </h1>
          <p className="font-sans text-[10px] uppercase tracking-widest text-brand-gold font-bold mt-2">
            Last Updated: July 27, 2026
          </p>
        </div>

        {/* Content */}
        <div className="font-sans text-brand-charcoal text-sm leading-relaxed space-y-8">
          <section>
            <h2 className="font-serif text-xl text-brand-charcoal font-bold mb-3">1. introduction</h2>
            <p>
              Welcome to **Vamika & Bhargavi** ("we", "our", "us"). We are committed to protecting your privacy and ensuring a secure shopping experience. This Privacy Policy outlines how we collect, use, disclose, and safeguard your personal information when you visit our website ([vamikabhargavi.com](https://vamikabhargavi.com)) or use our mobile application.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal font-bold mb-3">2. information we collect</h2>
            <p className="mb-3">
              We collect information that is necessary to process your orders, authenticate your session, and improve your shopping experience.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                <strong className="text-brand-gold">Personal Identification Data:</strong> Name, email address, shipping/billing address, and phone number.
              </li>
              <li>
                <strong className="text-brand-gold">Authentication Data:</strong> Phone numbers used for OTP (One-Time Password) verification.
              </li>
              <li>
                <strong className="text-brand-gold">Transaction Details:</strong> Items added to your cart, orders placed, amount paid, and coupons applied.
              </li>
              <li>
                <strong className="text-brand-gold">Technical Data:</strong> IP address, device details, operating system, and browser type.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal font-bold mb-3">3. how we use your information</h2>
            <p className="mb-3">We use the collected information for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>To register and authenticate your account using secure phone-number-based OTP.</li>
              <li>To process, fulfill, and ship your orders of premium ethnic couture.</li>
              <li>To send order status updates, delivery notifications, and customer support communications.</li>
              <li>To maintain your dynamic shopping cart and digital wallet balances.</li>
              <li>To administer promotional discount campaigns and verify coupon code usage.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal font-bold mb-3">4. payment processing & security</h2>
            <p className="mb-3">
              We prioritize the safety of your financial transactions.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                All card, UPI, net banking, and digital wallet payments are securely processed through our integrated payment gateway partner, **Razorpay**.
              </li>
              <li>
                We do **not** store or access your credit card numbers, CVVs, or bank credentials. All transactions are encrypted in transit using industry-standard SSL (Secure Sockets Layer) technology through Razorpay.
              </li>
              <li>
                Any mock or test transactions executed using test credentials are strictly for evaluation and do not process real currency.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal font-bold mb-3">5. sharing your information</h2>
            <p className="mb-3">
              We do not sell, rent, or trade your personal information. We only share necessary data with trusted third parties to execute our services:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                <strong className="text-brand-gold">Delivery Partners:</strong> Shipping details are shared with logistics and courier service providers to deliver your purchases.
              </li>
              <li>
                <strong className="text-brand-gold">Communication Providers:</strong> Phone numbers are processed through secure Meta APIs to send transaction messages, OTP codes, and templates via WhatsApp or SMS.
              </li>
              <li>
                <strong className="text-brand-gold">Service Providers:</strong> Cloud hosting, server networks, and database providers (such as Neon PostgreSQL) under strict data security confidentiality.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal font-bold mb-3">6. cookies & local cache</h2>
            <p>
              We use cookies and local storage (such as SharedPreferences on mobile or browser cookies) to keep you logged in, persist items inside your shopping cart, and cache basic session preferences. You can disable cookies through your browser settings, but it may affect some functional features of our online store.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal font-bold mb-3">7. your rights & data retention</h2>
            <p>
              You have the right to request access to the personal data we hold, request corrections to any outdated details, or ask for the deletion of your account. We retain your transaction records as required by applicable tax laws and to resolve potential returns or dispute claims.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-brand-charcoal font-bold mb-3">8. contact us</h2>
            <p className="mb-2">
              If you have any questions or feedback regarding this Privacy Policy, please contact our support team:
            </p>
            <div className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-md p-4 mt-2 space-y-1 font-sans text-xs">
              <p><strong className="text-brand-charcoal">Email:</strong> vamikabhargavi@gmail.com</p>
              <p><strong className="text-brand-charcoal">Phone:</strong> +91 98739 59531</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
