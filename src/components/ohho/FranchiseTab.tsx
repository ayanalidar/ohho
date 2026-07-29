"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Wrench, Settings, Trophy, Handshake, Sparkles,
  Building2, Phone, Mail, MapPin, Calculator, TrendingUp, Clock, CheckCircle2, Loader2, Send,
} from "lucide-react";
import { ventureStages, ohhoStats, testedLocations } from "@/data/menu";
import { useNav } from "@/components/ohho/nav-context";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = { Target, Wrench, Settings, Trophy, Handshake };

const LOCATION_TYPES = [
  { id: "mall", label: "Mall / Food Court" },
  { id: "high-street", label: "High Street" },
  { id: "station", label: "Railway / Metro Station" },
  { id: "food-court", label: "Standalone Food Court" },
  { id: "other", label: "Other" },
];
const INVESTMENT_BANDS = [
  { id: "1.5-3L", label: "₹1.5 – 3 Lakh" },
  { id: "3-5L", label: "₹3 – 5 Lakh" },
  { id: "5-10L", label: "₹5 – 10 Lakh" },
  { id: "10L+", label: "₹10 Lakh+" },
];
const TIMELINES = [
  { id: "immediate", label: "Immediately (within 30 days)" },
  { id: "1-3-months", label: "1 – 3 months" },
  { id: "3-6-months", label: "3 – 6 months" },
  { id: "exploring", label: "Just exploring" },
];

export function FranchiseTab() {
  const { navigate } = useNav();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", city: "",
    locationType: "high-street", investment: "1.5-3L", timeline: "exploring", message: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/franchise", {
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

  // ROI calculator state
  const [inv, setInv] = useState(35);
  const [sales, setSales] = useState(12);
  const [exp, setExp] = useState(8);
  const monthlyProfit = Math.max(0, sales - exp);
  const annualProfit = monthlyProfit * 12;
  const paybackMonths = monthlyProfit > 0 ? Math.ceil(inv / monthlyProfit) : 0;
  const breakEven = Math.ceil(exp / (1 - 0.05)); // rough — need sales = exp + 5% tax

  return (
    <div className="pt-[72px]">
      <section className="relative py-20 sm:py-28 bg-ohho-black grain overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-ohho-orange/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-ohho-gold/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
          {/* Header */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ohho-gold/10 border border-ohho-gold/30 text-ohho-gold text-xs font-semibold tracking-wider uppercase">
              <Building2 className="h-3.5 w-3.5" />
              Own an OHHO Franchise
            </div>
            <h2 className="mt-5 font-display text-4xl sm:text-6xl text-ohho-cream leading-[0.95]">
              From cart to <span className="text-gradient-ohho">passive income.</span>
            </h2>
            <p className="mt-4 text-ohho-cream/80 text-lg leading-relaxed">
              We don&apos;t hand over unproven locations. We scout, build, operate, and
              prove the model ourselves — then offer the winning territory to you.
              Passive income, on a verified cash-flow asset.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
            {ohhoStats.map((s) => (
              <div key={s.label} className="glass-card rounded-xl p-5 text-center">
                <div className="font-display text-4xl sm:text-5xl text-ohho-gold ohho-glow">
                  {s.value}<span className="text-ohho-orange">{s.suffix}</span>
                </div>
                <div className="mt-2 text-xs uppercase tracking-wider text-ohho-cream-dim">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tested locations */}
          <div className="mt-12">
            <h3 className="font-display text-2xl sm:text-3xl text-ohho-cream mb-5">
              Tested locations — operational
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {testedLocations.map((loc) => (
                <div key={loc.city} className="glass-card glass-card-hover rounded-2xl overflow-hidden flex">
                  <div className="relative w-32 flex-shrink-0">
                    <img src={loc.image} alt={loc.city} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4 flex-1">
                    <div className="font-display text-xl text-ohho-cream">{loc.city}</div>
                    <div className="text-xs text-ohho-cream-dim flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />{loc.area}
                    </div>
                    <div className="mt-2 text-xs text-ohho-cream/70 line-clamp-2">{loc.note}</div>
                    <div className="mt-2 flex items-center gap-3 text-[11px]">
                      <span className="text-ohho-gold">⭐ {loc.rating}</span>
                      <span className="text-ohho-cream-dim">{loc.customers.toLocaleString()}+ served</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5-stage model */}
          <div className="mt-16">
            <h3 className="font-display text-2xl sm:text-3xl text-ohho-cream mb-8">
              The 5-stage OHHO model
            </h3>
            <div className="relative">
              <div className="absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-ohho-orange via-ohho-gold to-ohho-red/40" />
              <ol className="space-y-6">
                {ventureStages.map((stage) => {
                  const Icon = ICONS[stage.icon] ?? Target;
                  return (
                    <li key={stage.id} className="relative pl-20">
                      <div
                        className="absolute left-0 top-0 h-14 w-14 rounded-xl grid place-items-center border-2"
                        style={{ backgroundColor: "rgba(14,10,4,0.9)", borderColor: stage.color, boxShadow: `0 0 0 4px rgba(14,10,4,1), 0 0 24px -2px ${stage.color}55` }}
                      >
                        <Icon className="h-6 w-6" style={{ color: stage.color }} />
                      </div>
                      <div className="glass-card glass-card-hover rounded-xl p-6">
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <span className="font-display text-3xl leading-none" style={{ color: stage.color }}>0{stage.id}</span>
                          <h4 className="font-display text-2xl text-ohho-cream">{stage.title}</h4>
                          <span className="ml-auto text-xs uppercase tracking-wider text-ohho-cream-dim">{stage.short}</span>
                        </div>
                        <p className="mt-4 text-ohho-cream/80 leading-relaxed">{stage.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* ROI Calculator + Application form */}
          <div className="mt-16 grid lg:grid-cols-2 gap-6">
            {/* ROI Calculator */}
            <div className="glass-card rounded-2xl p-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ohho-orange/10 border border-ohho-orange/30 text-ohho-orange text-xs font-semibold tracking-wider uppercase mb-4">
                <Calculator className="h-3.5 w-3.5" />
                ROI Calculator
              </div>
              <h3 className="font-display text-2xl text-ohho-cream">Estimate your returns</h3>
              <p className="text-sm text-ohho-cream-dim mt-1">Drag the sliders. Numbers update live.</p>

              <div className="mt-6 space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ohho-cream-dim">Initial investment</span>
                    <span className="font-display text-ohho-gold">₹{inv} Lakh</span>
                  </div>
                  <input type="range" min={10} max={100} step={5} value={inv} onChange={(e) => setInv(Number(e.target.value))} className="w-full accent-ohho-orange" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ohho-cream-dim">Monthly sales</span>
                    <span className="font-display text-ohho-gold">₹{sales} Lakh</span>
                  </div>
                  <input type="range" min={5} max={30} step={1} value={sales} onChange={(e) => setSales(Number(e.target.value))} className="w-full accent-ohho-orange" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ohho-cream-dim">Monthly expenses</span>
                    <span className="font-display text-ohho-gold">₹{exp} Lakh</span>
                  </div>
                  <input type="range" min={3} max={20} step={1} value={exp} onChange={(e) => setExp(Number(e.target.value))} className="w-full accent-ohho-orange" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-ohho-black/50 border border-ohho-gold/15">
                  <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">Monthly profit</div>
                  <div className="font-display text-2xl text-ohho-gold mt-1">₹{monthlyProfit}L</div>
                </div>
                <div className="p-4 rounded-xl bg-ohho-black/50 border border-ohho-gold/15">
                  <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">Annual profit</div>
                  <div className="font-display text-2xl text-ohho-gold mt-1">₹{annualProfit}L</div>
                </div>
                <div className="p-4 rounded-xl bg-ohho-black/50 border border-ohho-gold/15">
                  <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">Payback period</div>
                  <div className="font-display text-2xl text-ohho-orange mt-1">
                    {paybackMonths > 0 ? `${paybackMonths} mo` : "—"}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-ohho-black/50 border border-ohho-gold/15">
                  <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">Break-even sales</div>
                  <div className="font-display text-2xl text-ohho-cream mt-1">₹{breakEven}L/mo</div>
                </div>
              </div>
              <div className="mt-3 text-[11px] text-ohho-cream-dim flex items-start gap-1.5">
                <Sparkles className="h-3 w-3 text-ohho-gold mt-0.5 flex-shrink-0" />
                Estimates only. Actual returns depend on location, footfall, and operations. Talk to us for a detailed unit-economics breakdown.
              </div>
            </div>

            {/* Application form */}
            <div className="glass-card rounded-2xl p-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ohho-gold/10 border border-ohho-gold/30 text-ohho-gold text-xs font-semibold tracking-wider uppercase mb-4">
                <Send className="h-3.5 w-3.5" />
                Apply Now
              </div>
              <h3 className="font-display text-2xl text-ohho-cream">Franchise application</h3>
              <p className="text-sm text-ohho-cream-dim mt-1">We respond within 24 hours.</p>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 text-center py-10"
                  >
                    <div className="h-16 w-16 mx-auto rounded-full bg-ohho-orange/15 border-2 border-ohho-orange grid place-items-center">
                      <CheckCircle2 className="h-8 w-8 text-ohho-orange" />
                    </div>
                    <div className="mt-4 font-display text-xl text-ohho-cream">Application received!</div>
                    <p className="mt-2 text-sm text-ohho-cream/70">
                      Our team will reach out to <strong className="text-ohho-gold">{form.email}</strong> within 24 hours.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", city: "", locationType: "high-street", investment: "1.5-3L", timeline: "exploring", message: "" }); }}
                      className="mt-5 px-5 py-2 rounded-md border border-ohho-gold/30 text-ohho-cream text-sm font-semibold hover:bg-ohho-gold/10"
                    >
                      Submit another
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={submit}
                    className="mt-6 space-y-3"
                  >
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="w-full px-3 py-2.5 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-sm placeholder:text-ohho-cream-dim/50 focus:outline-none focus:border-ohho-orange/50" />
                      <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full px-3 py-2.5 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-sm placeholder:text-ohho-cream-dim/50 focus:outline-none focus:border-ohho-orange/50" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone (+91…)" className="w-full px-3 py-2.5 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-sm placeholder:text-ohho-cream-dim/50 focus:outline-none focus:border-ohho-orange/50" />
                      <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Preferred city" className="w-full px-3 py-2.5 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-sm placeholder:text-ohho-cream-dim/50 focus:outline-none focus:border-ohho-orange/50" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">Location type</label>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {LOCATION_TYPES.map((t) => (
                          <button key={t.id} type="button" onClick={() => setForm({ ...form, locationType: t.id })} className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border", form.locationType === t.id ? "bg-ohho-orange text-ohho-black border-ohho-orange" : "text-ohho-cream-dim border-ohho-gold/20 hover:border-ohho-gold/50")}>{t.label}</button>
                        ))}
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">Investment capacity</label>
                        <select value={form.investment} onChange={(e) => setForm({ ...form, investment: e.target.value })} className="mt-1 w-full px-3 py-2.5 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-sm focus:outline-none focus:border-ohho-orange/50">
                          {INVESTMENT_BANDS.map((b) => <option key={b.id} value={b.id} className="bg-ohho-black">{b.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">Timeline</label>
                        <select value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className="mt-1 w-full px-3 py-2.5 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-sm focus:outline-none focus:border-ohho-orange/50">
                          {TIMELINES.map((t) => <option key={t.id} value={t.id} className="bg-ohho-black">{t.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about yourself and your location (optional)" rows={3} className="w-full px-3 py-2.5 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-sm placeholder:text-ohho-cream-dim/50 focus:outline-none focus:border-ohho-orange/50 resize-none" />
                    <button type="submit" disabled={submitting} className={cn("w-full py-3 rounded-md font-bold flex items-center justify-center gap-2 transition-all", submitting ? "bg-ohho-cream/10 text-ohho-cream-dim" : "bg-gradient-to-r from-ohho-orange to-ohho-orange-deep text-ohho-black hover:shadow-lg hover:shadow-ohho-orange/40")}>
                      {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <>Submit application <Send className="h-4 w-4" /></>}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Franchise package summary */}
          <div className="mt-12 grid sm:grid-cols-3 gap-4">
            {[
              { icon: Clock, label: "Setup time", value: "45 days" },
              { icon: Building2, label: "Space required", value: "50 – 150 sq. ft." },
              { icon: TrendingUp, label: "Royalty", value: "4 – 8% of sales" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="glass-card rounded-xl p-5 text-center">
                  <Icon className="h-7 w-7 mx-auto text-ohho-orange mb-2" />
                  <div className="font-display text-xl text-ohho-cream">{s.value}</div>
                  <div className="text-xs text-ohho-cream-dim mt-1">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
