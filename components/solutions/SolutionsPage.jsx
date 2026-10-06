"use client";

import React, { useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Layers,
  Zap,
  TrendingUp,
  Server,
  Cpu,
  GitBranch,
  Package,
  ShoppingBag,
  Wrench,
  ChevronRight,
  ExternalLink,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// ─── Design tokens inline ────────────────────────────────────────────────────

const eyebrow =
  "text-[11px] font-mono font-medium uppercase tracking-[0.12em] text-brand-blue";
const sectionLabel =
  "text-[11px] font-mono font-medium uppercase tracking-[0.12em] text-slate-400";
const h1Class =
  "font-display font-medium text-brand-navy dark:text-white leading-[1.05] tracking-[-0.02em]";
const h2Class =
  "font-display font-medium text-brand-navy dark:text-white leading-[1.1] tracking-[-0.015em]";
const bodyMuted =
  "font-sans text-slate-500 dark:text-slate-400 leading-relaxed";

// ─── Sub-components ──────────────────────────────────────────────────────────

function Divider() {
  return <div className="w-full h-px bg-slate-200 dark:bg-brand-surface/8" />;
}

function PillBadge({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-brand-blue/8 dark:bg-brand-blue/12 border border-brand-blue/20 text-brand-blue text-[11px] font-mono tracking-widest uppercase">
      {children}
    </span>
  );
}

function CapabilityRow({ icon: Icon, label, desc }) {
  return (
    <div className="flex gap-4 py-5 border-b border-slate-100 dark:border-white/6 last:border-none">
      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-[4px] bg-slate-100 dark:bg-brand-surface/6 text-brand-blue mt-0.5">
        <Icon size={15} />
      </div>
      <div>
        <p className="text-[14px] font-sans font-medium text-brand-navy dark:text-white mb-0.5">
          {label}
        </p>
        <p className="text-[13px] font-sans text-slate-500 dark:text-slate-400 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

// ─── CSS pipeline diagram ─────────────────────────────────────────────────────

function PipelineDiagram() {
  const steps = [
    { label: "Scope", sub: "Define" },
    { label: "Build", sub: "Develop" },
    { label: "Launch", sub: "Deploy" },
    { label: "Iterate", sub: "Improve" },
  ];
  return (
    <div className="w-full rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 bg-brand-cloud dark:bg-brand-surface p-6 md:p-8 overflow-hidden">
      <p className={`${sectionLabel} mb-6`}>Engagement Lifecycle</p>
      <div className="flex items-center gap-0 w-full">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center flex-1 min-w-0">
              <div
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-[13px] font-mono font-semibold mb-2 ${
                  i === 0
                    ? "border-brand-blue bg-brand-blue text-white"
                    : i === 1
                    ? "border-brand-blue/60 bg-brand-blue/10 text-brand-blue"
                    : i === 2
                    ? "border-brand-teal/60 bg-brand-teal/10 text-brand-teal"
                    : "border-brand-cyan/60 bg-brand-cyan/10 text-brand-cyan"
                }`}
              >
                {i + 1}
              </div>
              <span className="text-[12px] font-sans font-medium text-brand-navy dark:text-white">
                {step.label}
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                {step.sub}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 max-w-[60px] h-px bg-gradient-to-r from-brand-blue/40 to-brand-teal/40 mx-1 mb-6" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Architecture diagram (CSS-only) ─────────────────────────────────────────

function ArchDiagram() {
  const layers = [
    {
      label: "Frontend",
      items: ["Next.js / React", "Responsive UI", "Dark Mode"],
      color: "brand-blue",
    },
    {
      label: "Backend",
      items: ["Node.js API", "Auth & RBAC", "Webhooks"],
      color: "brand-teal",
    },
    {
      label: "Data",
      items: ["MongoDB / Postgres", "Redis Cache", "CDN"],
      color: "brand-cyan",
    },
    {
      label: "DevOps",
      items: ["CI/CD Pipeline", "Docker", "Monitoring"],
      color: "brand-blue",
    },
  ];
  return (
    <div className="w-full rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 bg-brand-cloud dark:bg-brand-surface p-6 overflow-hidden">
      <p className={`${sectionLabel} mb-5`}>Typical Stack Composition</p>
      <div className="grid grid-cols-2 gap-3">
        {layers.map((layer, i) => (
          <div
            key={i}
            className="rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 bg-brand-surface dark:bg-brand-surface p-4"
          >
            <p
              className={`text-[10px] font-mono font-medium tracking-widest uppercase text-${layer.color} mb-2`}
            >
              {layer.label}
            </p>
            {layer.items.map((item, j) => (
              <div
                key={j}
                className="flex items-center gap-2 py-0.5 text-[12px] font-sans text-slate-600 dark:text-slate-400"
              >
                <div className={`w-1 h-1 rounded-full bg-${layer.color}/60`} />
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Terminal snippet ─────────────────────────────────────────────────────────

function TerminalSnippet({ lines }) {
  return (
    <div className="rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 bg-brand-surface overflow-hidden font-mono text-[12px]">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-brand-surface/4">
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <div className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="ml-auto text-[10px] text-slate-500 dark:text-slate-400 tracking-widest uppercase">
          Terminal
        </span>
      </div>
      <div className="p-4 space-y-1">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-brand-teal select-none">›</span>
            <span
              className={
                line.type === "comment"
                  ? "text-slate-600 dark:text-slate-300"
                  : line.type === "output"
                  ? "text-slate-400"
                  : "text-slate-200"
              }
            >
              {line.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SolutionsPage() {
  return (
    <div className="w-full font-sans bg-transparent">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="pt-[100px] pb-[80px] px-6 border-b border-brand-navy/[0.08] dark:border-white/8">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className={`${eyebrow} mb-5 block`}>
                Solutions Overview
              </span>
              <h1
                className={`${h1Class} text-[40px] md:text-[52px] lg:text-[60px] mb-6`}
              >
                Build.{" "}
                <span className="text-brand-blue">Launch.</span>{" "}
                <span className="text-brand-teal">Maintain.</span>{" "}
                <span className="text-brand-cyan">Improve.</span>
              </h1>
              <p className={`${bodyMuted} text-[17px] max-w-[500px] mb-10`}>
                Codalina is a digital technology partner — not just a
                marketplace. We design and engineer web platforms, commerce
                systems, and custom software products from the ground up and
                keep them operational long-term.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/store">
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight size={16} />}>
                    Explore Products
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg">
                    About Codalina
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Pipeline diagram */}
            <div>
              <PipelineDiagram />
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { n: "Next.js", t: "Frontend" },
                  { n: "Node.js", t: "API Layer" },
                  { n: "MongoDB", t: "Database" },
                  { n: "Cloudflare CDN", t: "Delivery" },
                ].map((item) => (
                  <div
                    key={item.n}
                    className="flex items-center gap-3 p-3 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 bg-brand-surface dark:bg-brand-surface"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
                    <div>
                      <p className="text-[12px] font-sans font-medium text-brand-navy dark:text-white">
                        {item.n}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                        {item.t}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCT MARKETPLACE ──────────────────────────────────────────── */}
      <section className="py-[80px] px-6 border-b border-brand-navy/[0.08] dark:border-white/8">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <PillBadge>
                  <ShoppingBag size={10} />
                  Marketplace
                </PillBadge>
              </div>
              <h2 className={`${h2Class} text-[32px] md:text-[40px] mb-5`}>
                A curated digital marketplace with real selection.
              </h2>
              <p className={`${bodyMuted} text-[16px] mb-8`}>
                The Codalina marketplace is where we sell verified technology
                products — hardware, peripherals, and digital goods — directly
                sourced from manufacturers and authorized distributors. No
                third-party sellers. No counterfeit risk.
              </p>

              <div className="space-y-0">
                <CapabilityRow
                  icon={Check}
                  label="Verified authentic products"
                  desc="Every product listed is sourced directly from the manufacturer or authorized distributor, with official warranty coverage."
                />
                <CapabilityRow
                  icon={Package}
                  label="Hardware and digital goods"
                  desc="From smartwatches and audio equipment to software licenses, templates, and digital products."
                />
                <CapabilityRow
                  icon={Zap}
                  label="Real-time inventory and pricing"
                  desc="Inventory and pricing reflects live availability. No bait-and-switch on listed prices."
                />
              </div>

              <div className="mt-8">
                <Link href="/store">
                  <Button variant="outline" rightIcon={<ChevronRight size={15} />}>
                    Browse the Marketplace
                  </Button>
                </Link>
              </div>
            </div>

            {/* Category visual */}
            <div className="rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 bg-brand-cloud dark:bg-brand-surface overflow-hidden">
              <div className="p-5 border-b border-brand-navy/[0.08] dark:border-white/10">
                <p className={sectionLabel}>Product Categories</p>
              </div>
              {[
                { cat: "Smartwatches", count: "Active", color: "brand-blue" },
                { cat: "Audio & Headphones", count: "Active", color: "brand-teal" },
                { cat: "Power Accessories", count: "Active", color: "brand-cyan" },
                { cat: "Adapters & Cables", count: "Active", color: "brand-blue" },
                { cat: "Software & Templates", count: "Active", color: "brand-teal" },
              ].map((row) => (
                <Link
                  key={row.cat}
                  href={`/store?category=${encodeURIComponent(row.cat)}`}
                  className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/6 last:border-none hover:bg-brand-surface dark:hover:bg-brand-surface/4 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full bg-${row.color}`} />
                    <span className="text-[14px] font-sans text-brand-navy dark:text-white">
                      {row.cat}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest group-hover:text-brand-blue transition-colors">
                    {row.count} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CUSTOM SOFTWARE ───────────────────────────────────────────────── */}
      <section className="py-[80px] px-6 border-b border-brand-navy/[0.08] dark:border-white/8">
        <div className="max-w-[1100px] mx-auto">
          <span className={`${eyebrow} mb-6 block`}>Custom Software</span>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left: Arch diagram */}
            <div className="order-2 lg:order-1">
              <ArchDiagram />
              <div className="mt-4">
                <TerminalSnippet
                  lines={[
                    { type: "comment", text: "# Initialize Codalina project scaffold" },
                    { type: "cmd", text: "npx create-codalina-app ./my-platform" },
                    { type: "output", text: "✓  Scaffold created" },
                    { type: "output", text: "✓  Auth, RBAC, and API configured" },
                    { type: "output", text: "✓  Dark mode design system applied" },
                    { type: "cmd", text: "npm run dev" },
                    { type: "output", text: "▲ Ready at http://localhost:3000" },
                  ]}
                />
              </div>
            </div>

            {/* Right: Content */}
            <div className="order-1 lg:order-2">
              <h2 className={`${h2Class} text-[32px] md:text-[40px] mb-5`}>
                Precision-engineered web platforms for real problems.
              </h2>
              <p className={`${bodyMuted} text-[16px] mb-8`}>
                When off-the-shelf software is the wrong fit, Codalina designs
                and builds custom web platforms — from ecommerce systems to
                SaaS applications — using modern, maintainable technology stacks.
              </p>
              <div className="space-y-0">
                <CapabilityRow
                  icon={Code2}
                  label="Full-stack web development"
                  desc="React / Next.js frontends paired with Node.js or Python backends. Built for performance, SEO, and long-term maintainability."
                />
                <CapabilityRow
                  icon={Server}
                  label="API design and integration"
                  desc="RESTful and GraphQL API design, third-party integrations, webhooks, and event-driven architecture."
                />
                <CapabilityRow
                  icon={Cpu}
                  label="Hardware-integrated software"
                  desc="Software that connects to physical devices — scanners, IoT sensors, payment terminals, and custom hardware."
                />
                <CapabilityRow
                  icon={GitBranch}
                  label="Version-controlled, testable codebase"
                  desc="Git-based development with CI/CD pipelines, automated testing, and structured code review."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUR PILLARS ─────────────────────────────────────────────────── */}
      <section className="py-[80px] px-6 border-b border-brand-navy/[0.08] dark:border-white/8 bg-brand-cloud dark:bg-[#0A0F17]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <span className={`${eyebrow} mb-4 block`}>The Four Pillars</span>
            <h2 className={`${h2Class} text-[32px] md:text-[40px] mb-4`}>
              How we work with you.
            </h2>
            <p className={`${bodyMuted} max-w-[500px] mx-auto`}>
              Every Codalina engagement — product or platform — follows the same
              disciplined lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                index: "01",
                phase: "Build",
                color: "text-brand-blue",
                borderColor: "border-brand-blue/20",
                bgColor: "bg-brand-blue/5",
                icon: Code2,
                headline: "Engineering from first principles.",
                body:
                  "We start with architecture, not templates. Every system is designed for the specific constraints of the problem — performance requirements, user scale, data structure, and business logic.",
                items: [
                  "Requirements analysis & technical scoping",
                  "System architecture and database design",
                  "Iterative development with milestone reviews",
                ],
              },
              {
                index: "02",
                phase: "Launch",
                color: "text-brand-teal",
                borderColor: "border-brand-teal/20",
                bgColor: "bg-brand-teal/5",
                icon: Zap,
                headline: "Deploy with confidence.",
                body:
                  "Production deployments that account for DNS, caching, SSL, load balancing, and environment configuration. We handle the infrastructure so your product goes live cleanly.",
                items: [
                  "Zero-downtime deployment pipelines",
                  "CDN, SSL, and domain configuration",
                  "Staging and production environment parity",
                ],
              },
              {
                index: "03",
                phase: "Maintain",
                color: "text-brand-cyan",
                borderColor: "border-brand-cyan/20",
                bgColor: "bg-brand-cyan/5",
                icon: Wrench,
                headline: "Ongoing operations, not one-time delivery.",
                body:
                  "Software that runs without attention degrades. We provide structured maintenance engagements that keep your platform secure, current, and operational.",
                items: [
                  "Security patches and dependency updates",
                  "Performance monitoring and alerting",
                  "Bug fixes and regression testing",
                ],
              },
              {
                index: "04",
                phase: "Improve",
                color: "text-brand-blue",
                borderColor: "border-brand-blue/20",
                bgColor: "bg-brand-blue/5",
                icon: TrendingUp,
                headline: "Data-informed iteration.",
                body:
                  "Good software gets measurably better over time. We build improvement loops into our engagements — analytics, user feedback, and structured review cycles.",
                items: [
                  "Analytics integration and event tracking",
                  "User feedback collection and prioritization",
                  "Feature roadmap development",
                ],
              },
            ].map((pillar) => (
              <div
                key={pillar.phase}
                className={`rounded-[4px] border ${pillar.borderColor} ${pillar.bgColor} p-8`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div
                    className={`w-10 h-10 rounded-[4px] border ${pillar.borderColor} bg-brand-surface dark:bg-brand-surface flex items-center justify-center ${pillar.color}`}
                  >
                    <pillar.icon size={18} />
                  </div>
                  <span
                    className={`text-[11px] font-mono ${pillar.color} opacity-40 tracking-widest`}
                  >
                    {pillar.index}
                  </span>
                </div>
                <span className={`${pillar.color} text-[11px] font-mono tracking-widest uppercase font-medium`}>
                  {pillar.phase}
                </span>
                <h3 className="text-[20px] font-display font-medium text-brand-navy dark:text-white mt-2 mb-3 leading-tight">
                  {pillar.headline}
                </h3>
                <p className={`${bodyMuted} text-[14px] mb-6`}>{pillar.body}</p>
                <ul className="space-y-2">
                  {pillar.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check
                        size={13}
                        className={`${pillar.color} mt-0.5 flex-shrink-0`}
                      />
                      <span className="text-[13px] font-sans text-slate-600 dark:text-slate-300">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOFTWARE PRODUCTS ────────────────────────────────────────────── */}
      <section className="py-[80px] px-6 border-b border-brand-navy/[0.08] dark:border-white/8">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-16 items-start">
            {/* Left: content */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <PillBadge>
                  <Layers size={10} />
                  Digital Products
                </PillBadge>
              </div>
              <h2 className={`${h2Class} text-[32px] md:text-[38px] mb-5`}>
                Off-the-shelf software products — when custom isn't required.
              </h2>
              <p className={`${bodyMuted} text-[15px] mb-6`}>
                We build and sell standardized digital products — templates, UI
                kits, automation scripts, and SaaS tools — designed for teams
                that need fast, high-quality starting points without the overhead
                of a full custom engagement.
              </p>
              <p className={`${bodyMuted} text-[15px] mb-8`}>
                These products are built to the same engineering standard as our
                custom work. Documented, maintained, and updated.
              </p>
              <Link href="/store?type=software">
                <Button variant="outline" rightIcon={<ExternalLink size={14} />}>
                  View Software Products
                </Button>
              </Link>
            </div>

            {/* Right: product type grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Code2,
                  title: "UI Component Kits",
                  desc: "React and Next.js component libraries built with the Codalina design system. Dark mode, accessible, TypeScript-ready.",
                },
                {
                  icon: Layers,
                  title: "SaaS Starter Templates",
                  desc: "Full-stack application scaffolds with authentication, role-based access control, and Stripe integration pre-wired.",
                },
                {
                  icon: Server,
                  title: "API Boilerplates",
                  desc: "Production-grade Node.js API templates with rate limiting, logging, JWT auth, and OpenAPI documentation.",
                },
                {
                  icon: GitBranch,
                  title: "Automation Scripts",
                  desc: "Data pipeline scripts, report generators, and integration tools built for reliability on server environments.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 bg-brand-surface dark:bg-brand-surface p-5"
                >
                  <div className="w-8 h-8 rounded-[4px] bg-brand-blue/8 flex items-center justify-center text-brand-blue mb-4">
                    <item.icon size={15} />
                  </div>
                  <h3 className="text-[14px] font-sans font-medium text-brand-navy dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[13px] font-sans text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WARRANTY & SUPPORT ───────────────────────────────────────────── */}
      <section className="py-[80px] px-6 border-b border-brand-navy/[0.08] dark:border-white/8">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className={`${eyebrow} mb-5 block`}>Support</span>
              <h2 className={`${h2Class} text-[32px] md:text-[40px] mb-5`}>
                Warranty verification and product support.
              </h2>
              <p className={`${bodyMuted} text-[16px] mb-8`}>
                Every hardware product sold through the Codalina marketplace
                carries a traceable warranty. You can verify your product's
                authenticity and warranty status using our warranty check tool —
                with no account required.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  "Scan QR code or enter serial number to verify",
                  "Warranty status and coverage period shown instantly",
                  "Direct escalation path to manufacturer support",
                  "Purchase receipt attached to warranty record",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check size={14} className="text-brand-teal mt-0.5 flex-shrink-0" />
                    <span className="text-[14px] font-sans text-slate-600 dark:text-slate-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/warranty">
                <Button variant="outline" rightIcon={<ChevronRight size={15} />}>
                  Check Warranty Status
                </Button>
              </Link>
            </div>

            {/* Warranty UI mockup */}
            <div className="rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 bg-brand-cloud dark:bg-brand-surface overflow-hidden">
              <div className="p-5 border-b border-brand-navy/[0.08] dark:border-white/10 flex items-center justify-between">
                <p className={sectionLabel}>Warranty Lookup</p>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-brand-surface/20" />
                  <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-brand-surface/20" />
                  <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-brand-surface/20" />
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Search input mockup */}
                <div className="relative">
                  <div className="w-full h-10 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 bg-brand-surface dark:bg-brand-surface flex items-center px-3 gap-2">
                    <div className="w-4 h-4 rounded-[2px] border border-brand-navy/[0.08] dark:border-white/20" />
                    <span className="text-[13px] font-mono text-slate-400">
                      Enter serial number or scan QR
                    </span>
                  </div>
                </div>
                {/* Result card */}
                <div className="rounded-[4px] border border-brand-teal/30 bg-brand-teal/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-[4px] border border-brand-teal/30 bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-brand-teal" />
                    </div>
                    <div>
                      <p className="text-[13px] font-sans font-medium text-brand-teal mb-0.5">
                        Warranty Active
                      </p>
                      <p className="text-[12px] font-mono text-slate-500 dark:text-slate-400">
                        SN: COD-2026-SW-00471
                      </p>
                      <p className="text-[12px] font-sans text-slate-500 dark:text-slate-400 mt-1">
                        Smartwatch X3 Pro · Valid until Dec 2027
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 bg-brand-surface dark:bg-brand-surface p-4 space-y-2">
                  {[
                    ["Product", "Smartwatch X3 Pro"],
                    ["Purchase Date", "Dec 12, 2026"],
                    ["Coverage", "12 months limited"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                        {label}
                      </span>
                      <span className="text-[12px] font-sans text-brand-navy dark:text-white">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-[100px] px-6 bg-brand-navy dark:bg-[#050D18]">
        <div className="max-w-[700px] mx-auto text-center">
          <span className="text-[11px] font-mono font-medium uppercase tracking-[0.12em] text-brand-teal block mb-6">
            Start Here
          </span>
          <h2 className="font-display font-medium text-white text-[36px] md:text-[48px] leading-[1.05] tracking-[-0.015em] mb-6">
            Technology that works, long after launch.
          </h2>
          <p className="font-sans text-slate-400 text-[17px] mb-10 leading-relaxed">
            Whether you need a product to buy, a platform to build, or a system
            to maintain — Codalina is the partner that stays through every phase.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/store">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-brand-surface hover:bg-brand-surface/90 text-brand-navy border-white"
                rightIcon={<ArrowRight size={16} />}
              >
                Browse the Marketplace
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/20 text-white hover:bg-brand-surface/8"
              >
                About Codalina
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
