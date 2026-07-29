"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Users, Wallet, Send, Loader2, CheckCircle2, PartyPopper, Building2, Phone, Mail } from "lucide-react";
import { useCateringPackages } from "@/hooks/use-content";
import { cn } from "@/lib/utils";

const EVENT_TYPES = [
  { id: "office-party", label: "Office Party", emoji: "🏢" },
  { id: "wedding", label: "Wedding", emoji: "💍" },
  { id: "birthday", label: "Birthday", emoji: "🎂" },
  { id: "corporate", label: "Corporate Event", emoji: "🤝" },
  { id: "other", label: "Other", emoji: "🎉" },
];
const BUDGET_BANDS = [
  { id: "under-5k", label: "Under ₹5,000" },
  { id: "5-10k", label: "₹5,000 – 10,000" },
  { id: "10-25k", label: "₹10,000 – 25,000" },
  { id: "25k+", label: "₹25,000+" },
];

export function CateringTab() {
  const { packages: CATERING_PACKAGES, loading } = useCateringPackages();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", eventType: "office-party", eventDate: "", guestCount: 20, budget: "5-10k", message: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/catering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSubmitted(true);
    } catch (err: any) {
      alert(err?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-[72px]">
      <section className="relative py-14 sm:py-16 bg-gradient-to-b from-ohho-black via-ohho-black-light to-ohho-black overflow-hidden">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-ohho-orange/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          {/* Header */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ohho-orange/10 border border-ohho-orange/30 text-ohho-orange text-xs font-semibold tracking-wider uppercase">
              <PartyPopper className="h-3.5 w-3.5" />
              Catering &amp; Bulk Orders
            </div>
            <h2 className="mt-5 font-display text-3xl sm:text-5xl lg:text-6xl text-ohho-cream leading-[0.95]">
              OHHO for <span className="text-gradient-ohho">your event.</span>
            </h2>
            <p className="mt-4 text-ohho-cream/80 text-base sm:text-lg leading-relaxed">
              Office lunches, weddings, birthdays, corporate events — we cater
              them all. Premium burgers, pizzas, buckets &amp; sips at scale.
              Min 24-hour notice. Dedicated cart staff for mega events.
            </p>
          </div>

          {/* Packages */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {CATERING_PACKAGES.map((pkg, i) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col"
              >
                <div className="h-1 rounded-full mb-4" style={{ background: pkg.color }} />
                <div className="font-display text-2xl text-ohho-cream">{pkg.name}</div>
                <div className="text-xs text-ohho-cream-dim mt-1">{pkg.pax}</div>
                <div className="font-display text-3xl mt-3" style={{ color: pkg.color }}>{pkg.price}</div>
                <ul className="mt-4 space-y-1.5 flex-1">
                  {pkg.items.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-sm text-ohho-cream/75">
                      <CheckCircle2 className="h-3.5 w-3.5" style={{ color: pkg.color }} />
                      {it}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-xs text-ohho-cream-dim italic">{pkg.note}</div>
              </motion.div>
            ))}
          </div>

          {/* Inquiry form */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-display text-2xl text-ohho-cream">Get a custom quote</h3>
              <p className="text-sm text-ohho-cream-dim mt-1">Tell us about your event. We&apos;ll respond within 4 hours.</p>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 text-center py-10">
                    <div className="h-16 w-16 mx-auto rounded-full bg-ohho-orange/15 border-2 border-ohho-orange grid place-items-center">
                      <CheckCircle2 className="h-8 w-8 text-ohho-orange" />
                    </div>
                    <div className="mt-4 font-display text-xl text-ohho-cream">Inquiry received!</div>
                    <p className="mt-2 text-sm text-ohho-cream/70">Our catering team will call <strong className="text-ohho-gold">{form.phone}</strong> within 4 hours.</p>
                    <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", eventType: "office-party", eventDate: "", guestCount: 20, budget: "5-10k", message: "" }); }} className="mt-5 h-11 px-5 rounded-md border border-ohho-gold/30 text-ohho-cream text-sm font-semibold hover:bg-ohho-gold/10">Submit another</button>
                  </motion.div>
                ) : (
                  <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={submit} className="mt-6 space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="w-full px-3 py-2.5 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-sm placeholder:text-ohho-cream-dim/50 focus:outline-none focus:border-ohho-orange/50" />
                      <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full px-3 py-2.5 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-sm placeholder:text-ohho-cream-dim/50 focus:outline-none focus:border-ohho-orange/50" />
                    </div>
                    <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone (+91…)" className="w-full px-3 py-2.5 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-sm placeholder:text-ohho-cream-dim/50 focus:outline-none focus:border-ohho-orange/50" />

                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">Event type</label>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {EVENT_TYPES.map((t) => (
                          <button key={t.id} type="button" onClick={() => setForm({ ...form, eventType: t.id })} className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border", form.eventType === t.id ? "bg-ohho-orange text-ohho-black border-ohho-orange" : "text-ohho-cream-dim border-ohho-gold/20 hover:border-ohho-gold/50")}>
                            {t.emoji} {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-ohho-cream-dim flex items-center gap-1"><Calendar className="h-3 w-3" /> Event date</label>
                        <input required type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className="mt-1 w-full px-3 py-2.5 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-sm focus:outline-none focus:border-ohho-orange/50" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-ohho-cream-dim flex items-center gap-1"><Users className="h-3 w-3" /> Guest count</label>
                        <input required type="number" min={10} max={1000} value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) })} className="mt-1 w-full px-3 py-2.5 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-sm focus:outline-none focus:border-ohho-orange/50" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-ohho-cream-dim flex items-center gap-1"><Wallet className="h-3 w-3" /> Budget range</label>
                      <select value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="mt-1 w-full px-3 py-2.5 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-sm focus:outline-none focus:border-ohho-orange/50">
                        {BUDGET_BANDS.map((b) => <option key={b.id} value={b.id} className="bg-ohho-black">{b.label}</option>)}
                      </select>
                    </div>

                    <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your event — venue, timing, dietary preferences (optional)" rows={3} className="w-full px-3 py-2.5 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-sm placeholder:text-ohho-cream-dim/50 focus:outline-none focus:border-ohho-orange/50 resize-none" />

                    <button type="submit" disabled={submitting} className={cn("w-full h-12 rounded-md font-bold flex items-center justify-center gap-2 transition-all", submitting ? "bg-ohho-cream/10 text-ohho-cream-dim" : "bg-gradient-to-r from-ohho-orange to-ohho-orange-deep text-ohho-black hover:shadow-lg hover:shadow-ohho-orange/40")}>
                      {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <>Get my quote <Send className="h-4 w-4" /></>}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Info side */}
            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-6">
                <div className="font-display text-xl text-ohho-cream">How catering works</div>
                <ol className="mt-4 space-y-3">
                  {[
                    "Submit the inquiry form with your event details.",
                    "Our catering coordinator calls you within 4 hours to confirm menu & pricing.",
                    "Pay 50% advance to lock the date. Balance on delivery.",
                    "We deliver hot, on time, with serving staff for 50+ guest events.",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="h-6 w-6 rounded-full bg-ohho-orange text-ohho-black font-bold text-xs grid place-items-center flex-shrink-0">{i + 1}</span>
                      <span className="text-sm text-ohho-cream/80 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="glass-card rounded-2xl p-6">
                <div className="font-display text-xl text-ohho-cream">Direct contact</div>
                <div className="mt-3 space-y-2 text-sm">
                  <a href="tel:+917006712347" className="flex items-center gap-2 text-ohho-cream/80 hover:text-ohho-gold">
                    <Phone className="h-4 w-4 text-ohho-orange" /> +91 7006712347
                  </a>
                  <a href="mailto:sales@ohhofoods.com" className="flex items-center gap-2 text-ohho-cream/80 hover:text-ohho-gold">
                    <Mail className="h-4 w-4 text-ohho-orange" /> sales@ohhofoods.com
                  </a>
                  <div className="flex items-center gap-2 text-ohho-cream/80">
                    <Building2 className="h-4 w-4 text-ohho-orange" /> Kairana &amp; Shamli, UP
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
