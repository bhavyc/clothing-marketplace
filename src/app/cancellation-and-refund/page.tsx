import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { RotateCcw, Clock, ShieldCheck, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | Vamika Bhargavi",
  description: "Official Cancellation, Return and Refund Policy for Vamika Bhargavi exclusive boutique couture.",
};

export default function CancellationAndRefundPage() {
  return (
    <div className="bg-brand-cream min-h-screen py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white border border-[#E8DFC8] rounded-xl shadow-xs p-6 sm:p-12">
        {/* Header */}
        <div className="text-center border-b border-[#E8DFC8] pb-8 mb-8">
          <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-bold font-sans block mb-2">
            Compliance & Customer Assurance
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-brand-charcoal font-semibold tracking-wide lowercase">
            cancellation & <span className="font-normal italic text-brand-gold">refund policy</span>
          </h1>
          <p className="font-sans text-[10px] uppercase tracking-widest text-stone-400 font-medium mt-3">
            Last Updated: August 2026
          </p>
        </div>

        {/* Highlight Banner */}
        <div className="bg-[#FAF6F0] border border-[#E8DFC8] rounded-lg p-4 sm:p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-3 bg-brand-charcoal text-brand-cream rounded-full shrink-0">
            <RotateCcw className="h-5 w-5 text-brand-gold" />
          </div>
          <div className="text-xs font-sans text-brand-charcoal space-y-1">
            <div className="font-bold uppercase tracking-wider text-[11px] text-brand-charcoal">
              Seamless 7-Day Return Window & 5-7 Day Refund Settlement
            </div>
            <p className="text-stone-600 leading-relaxed">
              We stand behind our craftsmanship. Eligible returns are inspected and refunds are credited back to your original payment method within 5-7 business days.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="font-sans text-brand-charcoal text-xs sm:text-sm leading-relaxed space-y-8">
          <section>
            <h2 className="font-serif text-lg sm:text-xl text-brand-charcoal font-bold mb-3 lowercase">
              1. order cancellation window
            </h2>
            <p className="mb-2">
              You may cancel your order free of charge before the tailoring or dispatch process has commenced:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-stone-600">
              <li>
                <strong className="text-brand-charcoal">Pre-dispatch Cancellations:</strong> Cancellation requests initiated within <strong>24 hours</strong> of order placement will receive a 100% full refund to the original payment source.
              </li>
              <li>
                <strong className="text-brand-charcoal">Post-dispatch:</strong> Once an ensemble has been handed over to our courier partner and an AWB tracking code has been generated, the order cannot be cancelled directly in-transit. You may initiate a return after receiving the package.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg sm:text-xl text-brand-charcoal font-bold mb-3 lowercase">
              2. return eligibility & guidelines
            </h2>
            <p className="mb-2">
              We accept return and replacement requests within <strong>7 days</strong> of delivery under the following conditions:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-stone-600">
              <li>The garment must be unused, unwashed, unaltered, and with all original brand tags, labels, and boutique packaging intact.</li>
              <li>Handcrafted artisanal ensembles undergo rigorous quality checks before dispatch. If you receive a damaged, defective, or incorrect piece, please notify us within <strong>48 hours</strong> of delivery with clear photographs.</li>
              <li>Items ordered under clearance sales or heavily customized made-to-measure orders (custom height/alterations) are eligible for complimentary size adjustments rather than full return, unless defective.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg sm:text-xl text-brand-charcoal font-bold mb-3 lowercase">
              3. refund process & settlement timeline
            </h2>
            <p className="mb-3">
              Once your returned package is received at our Kashmir boutique studio and passes quality inspection:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
              <div className="border border-[#E8DFC8] bg-[#FAF8F5] p-4 rounded-lg">
                <Clock className="h-4 w-4 text-brand-gold mb-2" />
                <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-1">
                  Online Prepaid (Razorpay / UPI / Cards)
                </h3>
                <p className="text-[11px] text-stone-600 leading-normal">
                  Refund will be initiated to your original bank account / card / UPI ID within <strong>24-48 hours</strong> of approval. It typically reflects in your bank account within <strong>5 to 7 business days</strong> as per banking and Razorpay gateway settlement cycles.
                </p>
              </div>

              <div className="border border-[#E8DFC8] bg-[#FAF8F5] p-4 rounded-lg">
                <ShieldCheck className="h-4 w-4 text-brand-gold mb-2" />
                <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-1">
                  Cash On Delivery (COD) & Store Credits
                </h3>
                <p className="text-[11px] text-stone-600 leading-normal">
                  For COD orders, refunds are credited instantly as Store Wallet Credits (no expiry) or transferred via NEFT/IMPS to your verified bank account upon sharing your IFSC and account details.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-lg sm:text-xl text-brand-charcoal font-bold mb-3 lowercase">
              4. exchange & size alterations
            </h2>
            <p className="text-stone-600">
              We offer one-time complimentary size adjustments or exchanges. If your ensemble requires slight alteration in top length, sleeve length, or waist fitting, our master tailors will gladly alter it to your desired silhouette. Reach out to our concierge to initiate an exchange.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg sm:text-xl text-brand-charcoal font-bold mb-3 lowercase">
              5. how to initiate a return or cancellation
            </h2>
            <p className="mb-3 text-stone-600">
              You can initiate returns directly from your customer account or by contacting our concierge team:
            </p>
            <div className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-md p-4 space-y-1.5 text-xs text-stone-700">
              <p><strong className="text-brand-charcoal">Online Portal:</strong> Visit your <Link href="/orders" className="text-brand-gold font-bold underline">My Orders</Link> dashboard and click &quot;Request Return&quot;.</p>
              <p><strong className="text-brand-charcoal">Customer Email:</strong> <a href="mailto:vamikabhargavi@gmail.com" className="text-brand-gold underline">vamikabhargavi@gmail.com</a></p>
              <p><strong className="text-brand-charcoal">Concierge Helpline / Phone:</strong> +91 98739 59531</p>
              <p><strong className="text-brand-charcoal">Operating Hours:</strong> Monday &ndash; Saturday: 10:00 AM &ndash; 7:00 PM IST</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
