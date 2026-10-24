"use client";

import AppleSpinner from "@/components/ui/AppleSpinner";
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, MonitorPlay, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLenis } from 'lenis/react';
import Link from 'next/link';
import { COMPANY_WEBSITE_PLANS } from '@/constants/companyWebsitePlans';
import { ECOMMERCE_PLANS } from '@/constants/ecommercePlans';
// Note: Additional plans (software, web portal, internal tools, maintenance) are kept in @/constants for developer reference.

// ─── TIERED CARD (Company Website, E-Commerce, Software) ────────────────────
/**
 * TieredCard
 * Renders a service card with a tab-based tier selector.
 * All content comes from the `service` prop shaped by a plans constants file.
 * Optional fields: service.useCases[], service.process[], service.techLabel
 */
const TieredCard = ({ service }) => {
  // Default to the "Most Popular" tier (Business) on mount
  const defaultIdx = service.tiers.findIndex(t => t.isPopular) ?? 1;
  const [activeTierIdx, setActiveTierIdx] = useState(defaultIdx === -1 ? 1 : defaultIdx);
  const activeTier = service.tiers[activeTierIdx] || service.tiers[0];
  const [navigatingId, setNavigatingId] = useState(null);

  return (
    <div className="group relative cursor-pointer w-full h-full transform-gpu will-change-transform">
      {/* Hover glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${service.glow} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[16px] transform-gpu will-change-transform`}
      />

      <div
        className="relative h-full w-full bg-[#080808] backdrop-blur-3xl ring-1 ring-white/10 group-hover:ring-green-400/30 ring-inset rounded-[16px] px-5 pb-5 pt-4 md:px-7 md:pb-7 md:pt-6 flex flex-col transition-all duration-500 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_20px_40px_rgba(0,0,0,0.8)] transform-gpu will-change-transform"
        style={{ WebkitBackfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
      >
        {/* ── Title & Description ─────────────────────── */}
        <h3 className="text-[22px] md:text-[28px] font-display font-medium text-white mb-2 leading-tight relative z-10 w-full whitespace-nowrap">
          {service.title}
        </h3>
        <p className="text-[15px] md:text-[17px] text-[#B0B0B0] leading-relaxed mb-3 relative z-10 w-full">
          {service.desc}
        </p>

        {/* ── Use-case chips (optional) ────────────────── */}
        {service.useCases && service.useCases.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3 relative z-10" aria-label="What we can build">
            {service.useCases.map((uc, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-[4px] bg-white/5 border border-white/10 text-[11px] text-white/50 font-mono tracking-wide"
              >
                {uc}
              </span>
            ))}
          </div>
        )}

        {/* ── Positioning hint (optional) — helps buyers pick the right card ─ */}
        {service.positionHint && (
          <p className="text-[11px] text-white/35 leading-snug mb-4 relative z-10 italic">
            {service.positionHint.text}{' '}
            {service.positionHint.link && (
              <a
                href={service.positionHint.link.href}
                onClick={(e) => { e.stopPropagation(); setNavigatingId('service-' + service.id); }}
                className="text-white/60 hover:text-white underline underline-offset-2 not-italic focus:outline-none focus:ring-1 focus:ring-white/40 rounded"
              >
                {service.positionHint.link.label}
              </a>
            )}
          </p>
        )}

        {/* ── Tier Tabs ────────────────────────────────── */}
        <div
          className="relative z-10 flex flex-col md:flex-row gap-1.5 mb-5 p-1 bg-black/40 border border-white/10 rounded-[12px] shadow-inner"
          role="tablist"
          aria-label="Pricing tiers"
        >
          {service.tiers.map((tier, idx) => (
            <button
              key={tier.id}
              role="tab"
              aria-selected={activeTierIdx === idx}
              aria-controls={`tier-panel-${tier.id}`}
              id={`tier-tab-${tier.id}`}
              onClick={(e) => { e.stopPropagation(); setActiveTierIdx(idx); }}
              className={`relative flex-1 py-2 px-3 rounded-[8px] transition-all text-left md:text-center overflow-hidden
                focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-1 focus:ring-offset-black
                ${activeTierIdx === idx
                  ? 'bg-[#171B21] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] text-white'
                  : 'bg-transparent hover:bg-white/5 text-white/60 hover:text-white/80'
                }`}
            >
              {/* Active indicator underline */}
              {activeTierIdx === idx && (
                <motion.div
                  layoutId={`active-tab-indicator-${service.title.replace(/\s+/g, '-')}`}
                  className="absolute bottom-0 left-[15%] right-[15%] h-[2px] bg-white rounded-t-full shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <div className="flex justify-between items-center md:flex-col md:justify-center md:gap-1 relative z-10">
                <span className={`text-[14px] md:text-[16px] font-medium transition-colors ${activeTierIdx === idx ? 'text-white' : 'text-inherit'}`}>
                  {tier.name}
                </span>
                {tier.isPopular && (
                  <span className={`text-[9px] md:text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded transition-colors ${
                    activeTierIdx === idx ? 'text-white bg-white/20' : 'text-white/40 bg-white/10'
                  }`}>
                    Most Popular
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* ── Feature List ─────────────────────────────── */}
        <div
          id={`tier-panel-${activeTier.id}`}
          role="tabpanel"
          aria-labelledby={`tier-tab-${activeTier.id}`}
        >
          <ul className="flex flex-col gap-2 mb-auto relative z-10 overflow-y-auto pr-2 max-h-[180px] md:max-h-none scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {activeTier.bullets.map((bullet, idx) => {
              const isInheritLine = bullet.startsWith('Everything in');
              return (
                <li key={idx} className="flex items-start gap-2.5 text-[14px] md:text-[15px] text-white/80 font-sans">
                  {isInheritLine ? (
                    <ArrowRight aria-hidden="true" className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                  ) : (
                    <Check aria-hidden="true" className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                  )}
                  <span className={`leading-tight ${isInheritLine ? 'font-semibold text-white' : ''}`}>
                    {bullet}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── "How we work" process strip (optional) ────── */}
        {service.process && service.process.length > 0 && (
          <div className="relative z-10 mt-3 pt-3 border-t border-white/[0.06]">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">How we work</p>
            <ol className="flex flex-col gap-1.5" aria-label="Our process">
              {service.process.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span
                    className="shrink-0 w-4 h-4 rounded-full bg-white/15 border border-white/30 text-white text-[9px] font-bold flex items-center justify-center mt-0.5"
                    aria-hidden="true"
                  >
                    {idx + 1}
                  </span>
                  <span className="text-[13px] text-white/60 leading-tight">
                    <strong className="text-white/80">{step.label}</strong>
                    {step.desc ? ` — ${step.desc}` : ''}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* ── Footer ───────────────────────────────────── */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-3 relative z-10">

          {/* Add-ons chips */}
          {service.addons && service.addons.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[13px] text-white/40 w-full mb-0.5">Optional Add-ons:</span>
              {service.addons.map((addon, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded-[4px] bg-white/5 border border-white/10 text-[12px] text-[#B0B0B0]"
                  title={addon.price ?? "Ask for quote"}
                >
                  {addon.name}
                  {addon.price ? ` — ${addon.price}` : ''}
                </span>
              ))}
            </div>
          )}

          {/* Price + CTA row */}
          <div className="flex flex-col min-[450px]:flex-row min-[450px]:items-end justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              {/* Discounted price — shows strikethrough original when present */}
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[20px] md:text-[24px] font-semibold text-white">
                  {activeTier.price}
                </span>
                {activeTier.priceSuffix && (
                  <span className="text-[13px] md:text-[14px] font-normal text-white/50 -ml-1">
                    {activeTier.priceSuffix}
                  </span>
                )}
                {activeTier.originalPrice && (
                  <span className="text-[13px] text-white/35 line-through">
                    {activeTier.originalPrice}
                  </span>
                )}
                {activeTier.originalPrice && (
                  <span className="text-[12px] text-green-400/80 font-medium">
                    Limited offer
                  </span>
                )}
              </div>
              {/* Trust & delivery line — per-tier if set, else card-level fallback */}
              <span className="text-[12px] text-[#808080]">
                {activeTier.trustLine || service.trustLine}
              </span>
              {/* De-emphasised tech stack — dynamic tooltip */}
              <span
                className="text-[12px] text-white/25 mt-1 cursor-help"
                title={service.techLabel || 'Built with Next.js, Tailwind CSS, and Framer Motion'}
              >
                {service.techLabel ? service.techLabel.split(',')[0] : 'Built with Next.js'}
              </span>
            </div>

            <div className="flex flex-col gap-2 min-[450px]:items-end">
              {/* Primary CTA */}
              <Link
                href={service.storeLink || '/store'}
                onClick={(e) => { e.stopPropagation(); setNavigatingId('service-' + service.id); }}
                aria-label={service.ctaLabel || 'Get a Free Quote'}
                className="group/btn relative w-full min-[450px]:w-auto px-4 py-2
                  bg-white/10 hover:bg-white/20
                  border border-white/20 hover:border-white/40
                  rounded-lg text-[15px] md:text-[16px] font-medium text-white hover:text-white
                  transition-all motion-safe:transition-all motion-reduce:transition-none
                  flex items-center justify-center gap-1.5
                  focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#080808]"
              >
                {navigatingId === 'service-' + service.id ? <AppleSpinner size={16} className="text-white mr-1 inline-block" /> : null}
                {service.ctaText || 'Get a Free Quote'}{' '}
                <ArrowRight
                  aria-hidden="true"
                  className="w-4 h-4 transform motion-safe:group-hover/btn:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>

          {/* ── License protection note (optional) ─────────────── */}
          {service.licenseNote && (
            <div
              className="flex items-start gap-1.5 mt-1 pt-3 border-t border-white/[0.06] cursor-help group/lic w-full"
              tabIndex={0}
              title={service.licenseNote.full}
              aria-label={`License terms: ${service.licenseNote.full}`}
              role="note"
            >
              <ShieldCheck
                aria-hidden="true"
                className="w-3.5 h-3.5 text-white/65 shrink-0 group-hover/lic:text-white/90 transition-colors"
              />
              <span className="text-[12px] text-white/45 leading-snug group-hover/lic:text-white/70 transition-colors">
                {service.licenseNote.short}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── SIMPLE CARD (all other services) ────────────────────────────────────────
/**
 * SimpleCard
 * The original card layout — kept unchanged for Enterprise E-Commerce, SaaS, etc.
 */
const SimpleCard = ({ service }) => {
  const [navigatingId, setNavigatingId] = useState(null);
  return (
  <div className="group relative cursor-pointer w-full h-full transform-gpu will-change-transform">
    <div
      className={`absolute inset-0 bg-gradient-to-br ${service.glow} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[16px] transform-gpu will-change-transform`}
    />
    <div
      className="relative h-full w-full bg-[#080808] backdrop-blur-3xl ring-1 ring-white/10 group-hover:ring-white/30 ring-inset rounded-[16px] px-6 pb-6 pt-5 md:px-8 md:pb-8 md:pt-6 flex flex-col transition-all duration-500 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_20px_40px_rgba(0,0,0,0.8)] transform-gpu will-change-transform"
      style={{ WebkitBackfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
    >
      <h3 className="text-[16px] min-[350px]:text-[19px] md:text-[26px] font-display font-medium text-white mb-3 leading-tight relative z-10 transition-all w-full whitespace-nowrap">
        {service.title}
      </h3>
      <p className="text-[14px] md:text-[16px] text-[#B0B0B0] leading-relaxed mb-6 relative z-10 w-[95%]">
        {service.desc}
      </p>

      <ul className="flex flex-col gap-3 mb-auto relative z-10">
        {service.bullets.map((bullet, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-[14px] md:text-[15px] text-white/75 font-sans">
            <Check aria-hidden="true" className="w-4 h-4 text-white shrink-0 mt-1" />
            <span className="leading-tight">{bullet}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 pt-5 border-t border-white/10 flex flex-col gap-4 relative z-10">
        {/* Tech tags — kept for non-Company-Website cards */}
        <div className="flex flex-wrap gap-2 mb-1">
          {service.tags && service.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 rounded-[4px] bg-white/5 border border-white/10 text-[10px] text-white/50 font-mono uppercase tracking-wider group-hover:border-white/20 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-[14px] md:text-[16px] font-medium text-white/80">{service.price}</span>
          <Link
            href={service.storeLink || '/store'}
            onClick={(e) => { e.stopPropagation(); setNavigatingId('service-' + service.id); }}
            className="text-[13px] md:text-[14px] font-medium text-white/80 group-hover:text-white flex items-center gap-1.5 transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#080808] rounded"
          >{navigatingId === 'service-' + service.id ? <AppleSpinner size={14} className="text-white mr-1.5 inline-block" /> : null}Explore{' '}<ArrowRight aria-hidden="true" className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  </div>
  );
};

// ─── CARD DISPATCHER ─────────────────────────────────────────────────────────
const CardItem = ({ service, index }) => {
  if (service.isTiered) return <TieredCard service={service} />;
  return <SimpleCard service={service} />;
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ServicesStoryteller() {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const lenis = useLenis();

  // Scroll smoothly to services section when triggered from hero CTA
  useEffect(() => {
    const handleExpand = () => {
      const container = containerRef.current;
      if (container) {
        const targetY = container.getBoundingClientRect().top + window.scrollY;
        if (lenis) {
          lenis.scrollTo(targetY, { duration: 1.2, offset: 0 });
        } else {
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('expandServices', handleExpand);
    return () => window.removeEventListener('expandServices', handleExpand);
  }, [lenis]);

  // ── Services data ──────────────────────────────────────────────────────────
  // Only the first two cards (Company Website & E-Commerce Store) are retained and rendered.
  // Other service categories are omitted completely from rendering so they cannot be seen,
  // inspected, or turned on in the browser.
  const services = [
    {
      ...COMPANY_WEBSITE_PLANS,
      icon: <MonitorPlay aria-hidden="true" className="w-7 h-7 text-white" strokeWidth={1.5} />,
      flex: "1.2",
    },
    {
      ...ECOMMERCE_PLANS,
      icon: <ShoppingCart aria-hidden="true" className="w-7 h-7 text-white" strokeWidth={1.5} />,
      flex: "1",
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="w-full relative z-40 bg-black h-auto">
      <div
        ref={stickyRef}
        className="w-full flex flex-col items-center px-[13px] relative h-auto overflow-visible justify-start pt-[26vh] md:pt-[28vh] pb-[2vh]"
      >

        {/* Section heading */}
        <motion.div
          className="absolute top-[8vh] md:top-[10vh] w-full flex flex-col items-center text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-[36px] md:text-[48px] font-display font-medium text-white text-center leading-tight tracking-tight">
            Our Services
          </h2>
          <div className="overflow-hidden mt-4">
            <h3 className="text-[20px] min-[350px]:text-[24px] min-[400px]:text-[28px] md:text-[36px] lg:text-[42px] font-display font-medium text-white leading-tight tracking-tight whitespace-nowrap">
              Which one do you need?
            </h3>
          </div>
        </motion.div>

        {/* Dynamic Grid */}
        <div className="relative z-20 w-full flex flex-col gap-3 justify-center items-center">
          {/* Row 1 — Company Website + Enterprise E-Commerce */}
          <div className="w-full flex flex-col md:flex-row gap-3">
            {services.map((service, i) => (
              <motion.div
                key={service.title || i}
                layout
                className="w-full transform-gpu will-change-transform"
                style={{ flex: service.flex, zIndex: i + 1 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <CardItem service={service} index={i} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* "Not sure yet?" transition heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full flex justify-center overflow-hidden mt-12 md:mt-16"
        >
          <p className="text-[40px] md:text-[64px] font-display font-medium text-white/40 text-center tracking-tight pb-2">
            Not sure yet?
          </p>
        </motion.div>

      </div>
    </div>
  );
}
