import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { contactFormSchema, type ContactFormData } from "@/schema/contactFormSchema";
import { submitContactForm } from "@/api/landingContactApi";
import { Loader2, Milestone } from "lucide-react";
import {
  Calendar,
  Users,
  Globe,
  Handshake,
  BadgeCheck,
  ScanLine,
  Image,
  BarChart3,
  Smartphone,
  Palette,
  Eye,
  Award,
  Clock,
  Sparkles,
  ClipboardCheck,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Menu,
  X,
  ArrowRight,
  Check,
  Play,
  Quote,
  Star,
  Send,
  Zap,
  Shield,
  Target,
  Heart,
  Lightbulb,
  TrendingUp,
  MonitorSmartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import LanguageSwitcher from "@/components/shared/languageSwitcher";

// ─── Smooth scroll helper ────────────────────────────────────────────
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// ─── Intersection Observer hook for scroll animations ────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Animated section wrapper ────────────────────────────────────────
function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─── Section label badge ─────────────────────────────────────────────
function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-700">
      <Milestone className="size-3.5" />
      {children}
    </span>
  );
}

// ═════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ═════════════════════════════════════════════════════════════════════
export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // ─── CONTACT FORM STATE ───
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [cooldown, setCooldown] = useState(false);

  const handleFormChange = useCallback(
    (field: keyof ContactFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear field error on change
      if (formErrors[field]) {
        setFormErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [formErrors]
  );

  useEffect(() => {
    if (formStatus === "success") {
      const timer = setTimeout(() => setFormStatus("idle"), 5000);
      return () => clearTimeout(timer);
    }
  }, [formStatus]);

  const handleContactSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (cooldown || formStatus === "loading") return;

      // Validate with Zod
      const result = contactFormSchema.safeParse(formData);
      if (!result.success) {
        const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
        for (const issue of result.error.issues) {
          const field = issue.path[0] as keyof ContactFormData;
          if (!fieldErrors[field]) {
            fieldErrors[field] = t(`landing.contact.${issue.message}`);
          }
        }
        setFormErrors(fieldErrors);
        return;
      }

      setFormErrors({});
      setFormStatus("loading");

      try {
        await submitContactForm(result.data);
        setFormStatus("success");
        setFormData({ firstName: "", lastName: "", email: "", phone: "", message: "" });
        // Cooldown to prevent spam
        setCooldown(true);
        setTimeout(() => setCooldown(false), 30000); // 30s cooldown
        // Reset success after 5s
        setTimeout(() => setFormStatus("idle"), 5000);
      } catch {
        setFormStatus("error");
        setTimeout(() => setFormStatus("idle"), 5000);
      }
    },
    [formData, cooldown, formStatus, t]
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ─── NAV LINKS ───
  const navLinks = [
    { label: t("landing.nav.services"), id: "services" },
    { label: t("landing.nav.features"), id: "features" },
    { label: t("landing.nav.howItWorks"), id: "how-it-works" },
    { label: t("landing.nav.pricing"), id: "pricing" },
    { label: t("landing.nav.testimonials"), id: "testimonials" },
    { label: t("landing.nav.contact"), id: "contact" },
  ];

  return (
    <div className="landing-page min-h-screen bg-white text-slate-800 overflow-x-hidden">
      {/* ═══════════  NAVBAR  ═══════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-lg shadow-md"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <button onClick={() => scrollTo("hero")}  >
            <img src="/eventinos-logo.jpeg" alt="Eventinas Logo" className="h-10 w-auto object-contain" />
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="text-sm font-medium text-slate-600 transition hover:text-purple-600"
              >
                {l.label}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher allowedLanguages={['en', 'fr']} />
            <Button
              variant="ghost"
              className="text-sm font-medium"
              onClick={() => navigate("/login")}
            >
              {t("landing.nav.login")}
            </Button>
            <Button
              className="rounded-full bg-gradient-to-r from-purple-700 to-purple-500 px-6 text-white shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-shadow"
              onClick={() => scrollTo("contact")}
            >
              {t("landing.nav.getStarted")}
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden text-slate-700"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-lg border-t px-6 pb-6 pt-2 shadow-lg">
            <div className="mb-4 pt-2">
              <LanguageSwitcher allowedLanguages={['en', 'fr']} />
            </div>
            {navLinks.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  scrollTo(l.id);
                  setMobileOpen(false);
                }}
                className="block w-full py-3 text-left text-sm font-medium text-slate-700 hover:text-purple-600 border-b border-slate-100 last:border-0"
              >
                {l.label}
              </button>
            ))}
            <Button
              className="mt-4 w-full rounded-full bg-gradient-to-r from-purple-700 to-purple-500 text-white"
              onClick={() => navigate("/login")}
            >
              {t("landing.nav.login")}
            </Button>
          </div>
        )}
      </header>

      {/* ═══════════  HERO  ═══════════ */}
      <section
        id="hero"
        className="relative flex min-h-screen items-center overflow-hidden pt-20"
      >
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-purple-200/60 to-purple-200/40 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-purple-200/40 to-purple-200/30 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-gradient-to-b from-purple-100/20 to-transparent blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-3 lg:gap-16 items-center">
          {/* Text */}
          <AnimatedSection className="lg:col-span-2">
            <SectionBadge>{t("landing.hero.badge")}</SectionBadge>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {t("landing.hero.title")}{" "}
              <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 bg-clip-text text-transparent">
                {t("landing.hero.titleHighlight")}
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
              {t("landing.hero.description")}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                className="h-12 rounded-full bg-gradient-to-r from-purple-700 to-purple-500 px-8 text-base text-white shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all hover:scale-105"
                onClick={() => scrollTo("pricing")}
              >
                {t("landing.hero.ctaPrimary")}
                <ArrowRight className="ml-1 size-4" />
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-full px-8 text-base border-slate-300 hover:border-purple-300 hover:bg-purple-50 transition-all"
                onClick={() => scrollTo("how-it-works")}
              >
                <Play className="mr-1 size-4 text-purple-600" />
                {t("landing.hero.ctaSecondary")}
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 flex gap-10">
              {[
                { value: "500+", label: t("landing.hero.stats.events") },
                { value: "50K+", label: t("landing.hero.stats.participants") },
                { value: "99%", label: t("landing.hero.stats.satisfaction") },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-purple-600">{s.value}</p>
                  <p className="text-sm text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* App banner image */}
          <AnimatedSection delay={200} className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-purple-400/20 to-purple-400/20 blur-2xl" />
              <img
                src="/banner.png"
                alt="Eventinas Mobile App"
                className="relative w-72 sm:w-80 lg:w-96 rounded-3xl drop-shadow-2xl"
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════  SERVICES (Why Unique)  ═══════════ */}
      <section id="services" className="relative py-24 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="text-center">
            <SectionBadge>{t("landing.services.badge")}</SectionBadge>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              {t("landing.services.title")}{" "}
              <span className="text-purple-600">{t("landing.services.titleHighlight")}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-500">
              {t("landing.services.description")}
            </p>
          </AnimatedSection>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => {
              const icons = [Calendar, Users, Globe, Handshake];
              const colors = [
                "from-purple-600 to-purple-400",
                "from-purple-500 to-rose-500",
                "from-emerald-500 to-teal-500",
                "from-amber-500 to-orange-500",
              ];
              const Icon = icons[i];
              const color = colors[i];
              return (
                <AnimatedSection key={i} delay={i * 100}>
                  <div className="group relative h-full rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-purple-100/50 hover:-translate-y-1">
                    <div
                      className={`mb-5 inline-flex rounded-xl bg-gradient-to-br ${color} p-3 text-white shadow-lg`}
                    >
                      <Icon className="size-6" />
                    </div>
                    <h3 className="text-lg font-semibold">{t(`landing.services.items.${i}.title`)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {t(`landing.services.items.${i}.description`)}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-purple-600 opacity-0 transition group-hover:opacity-100">
                      {t("landing.services.learnMore")} <ChevronRight className="size-4" />
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════  FEATURES  ═══════════ */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="text-center">
            <SectionBadge>{t("landing.features.badge")}</SectionBadge>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              {t("landing.features.title")}{" "}
              <span className="text-purple-600">{t("landing.features.titleHighlight")}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-500">
              {t("landing.features.description")}
            </p>
          </AnimatedSection>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const icons = [BadgeCheck, ScanLine, Image, BarChart3, Mail, ClipboardCheck];
              const Icon = icons[i];
              return (
                <AnimatedSection key={i} delay={i * 80}>
                  <div className="group flex gap-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-purple-50 hover:border-purple-200">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 transition group-hover:bg-purple-600 group-hover:text-white">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t(`landing.features.items.${i}.title`)}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        {t(`landing.features.items.${i}.description`)}
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════  COMMUNICATION TOOL (Feature Image)  ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-600 to-purple-700 py-24 text-white">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-60 w-60 rounded-full bg-white/5 blur-2xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
          <AnimatedSection>
            <SectionBadge>{t("landing.communication.badge")}</SectionBadge>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl text-white">
              {t("landing.communication.title")}{" "}
              <span className="text-white/80">{t("landing.communication.titleHighlight")}</span>
            </h2>
            <ul className="mt-8 space-y-5">
              {[0, 1, 2, 3].map((i) => {
                const icons = [Smartphone, Palette, Eye, Award];
                const Icon = icons[i];
                return (
                  <li key={i} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur">
                      <Icon className="size-5" />
                    </div>
                    <p className="text-sm leading-relaxed text-white/85">
                      {t(`landing.communication.items.${i}`)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </AnimatedSection>

          <AnimatedSection delay={200} className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-white/5 blur-2xl" />
              <img
                src="/banner.png"
                alt="Eventinas Mobile App"
                className="relative w-72 sm:w-80 lg:w-96 rounded-3xl drop-shadow-2xl"
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════  HOW IT WORKS  ═══════════ */}
      <section id="how-it-works" className="py-24 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="text-center">
            <SectionBadge>{t("landing.howItWorks.badge")}</SectionBadge>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              {t("landing.howItWorks.title")}{" "}
              <span className="text-purple-600">{t("landing.howItWorks.titleHighlight")}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-500">
              {t("landing.howItWorks.description")}
            </p>
          </AnimatedSection>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {[0, 1, 2].map((i) => {
              const steps = ["01", "02", "03"];
              const icons = [Clock, Sparkles, TrendingUp];
              const colors = [
                "from-purple-600 to-purple-400",
                "from-purple-500 to-rose-500",
                "from-emerald-500 to-teal-500",
              ];
              const Icon = icons[i];
              const step = steps[i];
              const color = colors[i];
              return (
                <AnimatedSection key={i} delay={i * 150}>
                  <div className="relative h-full rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-purple-100/30 hover:-translate-y-1 overflow-hidden group">
                    {/* Step number watermark */}
                    <span className="absolute -top-2 -right-2 text-8xl font-black text-slate-100 select-none transition group-hover:text-purple-100">
                      {step}
                    </span>
                    <div
                      className={`relative mb-5 inline-flex rounded-xl bg-gradient-to-br ${color} p-3 text-white shadow-lg`}
                    >
                      <Icon className="size-6" />
                    </div>
                    <h3 className="relative text-xl font-bold">{t(`landing.howItWorks.items.${i}.title`)}</h3>
                    <p className="relative mt-3 text-sm leading-relaxed text-slate-500">
                      {t(`landing.howItWorks.items.${i}.description`)}
                    </p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════  INTERFACE  ═══════════ */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <AnimatedSection>
              <SectionBadge>{t("landing.interface.badge")}</SectionBadge>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                {t("landing.interface.title")}{" "}
                <span className="text-purple-600">{t("landing.interface.titleHighlight")}</span>
              </h2>
              <p className="mt-5 text-slate-500 leading-relaxed">
                {t("landing.interface.description")}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check className="size-3.5" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">{t(`landing.interface.features.${i}`)}</span>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200} className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-purple-200/40 to-purple-200/30 blur-2xl" />
                <div className="relative grid grid-cols-2 gap-4 rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
                  {[0, 1, 2, 3].map((i) => {
                    const icons = [Smartphone, Palette, Zap, Shield];
                    const Icon = icons[i];
                    return (
                      <div key={i} className="rounded-xl bg-slate-50 p-4 text-center transition hover:bg-purple-50 hover:shadow-md">
                        <Icon className="mx-auto size-7 text-purple-600" />
                        <p className="mt-2 text-sm font-semibold text-slate-700">{t(`landing.interface.stats.${i}.label`)}</p>
                        <p className="text-xs text-slate-400">{t(`landing.interface.stats.${i}.value`)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════  PRICING  ═══════════ */}
      <section id="pricing" className="py-24 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="text-center">
            <SectionBadge>{t("landing.pricing.badge")}</SectionBadge>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              {t("landing.pricing.title")}{" "}
              <span className="text-purple-600">{t("landing.pricing.titleHighlight")}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-500">
              {t("landing.pricing.description")}
            </p>
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="size-4 text-emerald-500" />
                {t("landing.pricing.highlights.0")}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="size-4 text-emerald-500" />
                {t("landing.pricing.highlights.1")}
              </div>
            </div>
          </AnimatedSection>

          <div className="mt-16 grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
            {/* Basic */}
            <AnimatedSection delay={0}>
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-lg">
                <div className="mb-6">
                  <span className="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {t("landing.pricing.plans.basic.name")}
                  </span>
                  <p className="mt-2 text-sm text-slate-500">{t("landing.pricing.plans.basic.subtitle")}</p>
                </div>
                <ul className="space-y-4">
                  {[0, 1, 2, 3].map((i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                      {t(`landing.pricing.plans.basic.features.${i}`)}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="mt-8 w-full rounded-full border-slate-300 hover:bg-purple-50 hover:border-purple-300"
                  onClick={() => scrollTo("contact")}
                >
                  {t("landing.pricing.plans.basic.cta")}
                </Button>
              </div>
            </AnimatedSection>

            {/* Premium */}
            <AnimatedSection delay={150}>
              <div className="relative h-full rounded-2xl border-2 border-purple-500 bg-white p-8 shadow-xl shadow-purple-100/50">
                <div className="absolute -top-3.5 right-6 rounded-full bg-gradient-to-r from-purple-700 to-purple-500 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                  {t("landing.pricing.plans.premium.badge")}
                </div>
                <div className="mb-6">
                  <span className="rounded-full bg-purple-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-purple-700">
                    {t("landing.pricing.plans.premium.name")}
                  </span>
                  <p className="mt-2 text-sm text-slate-500">{t("landing.pricing.plans.premium.subtitle")}</p>
                </div>
                <ul className="space-y-4">
                  {[0, 1, 2, 3].map((i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <Check className="mt-0.5 size-4 shrink-0 text-purple-500" />
                      {t(`landing.pricing.plans.premium.features.${i}`)}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-8 w-full rounded-full bg-gradient-to-r from-purple-700 to-purple-500 text-white shadow-lg shadow-purple-200 hover:shadow-purple-300"
                  onClick={() => scrollTo("contact")}
                >
                  {t("landing.pricing.plans.premium.cta")}
                </Button>
              </div>
            </AnimatedSection>
          </div>

          {/* Support note */}
          <AnimatedSection delay={200} className="mt-12 text-center">
            <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-100 p-8">
              <h3 className="text-lg font-bold text-slate-800">{t("landing.pricing.support.title")}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                {t("landing.pricing.support.description")}
              </p>
              <Button
                className="mt-4 rounded-full bg-gradient-to-r from-purple-700 to-purple-500 px-6 text-white shadow-lg shadow-purple-200"
                onClick={() => scrollTo("contact")}
              >
                {t("landing.pricing.support.cta")}
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════  FAQ  ═══════════ */}
      <section id="faq" className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <AnimatedSection className="text-center">
            <SectionBadge>{t("landing.faq.badge")}</SectionBadge>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              {t("landing.faq.title")}{" "}
              <span className="text-purple-600">{t("landing.faq.titleHighlight")}</span>
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={100} className="mt-12">
            <Accordion type="single" collapsible className="space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-xl border border-slate-200 bg-white px-6 shadow-sm data-[state=open]:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {t(`landing.faq.items.${i}.question`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-500 leading-relaxed">
                    {t(`landing.faq.items.${i}.answer`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════  TESTIMONIALS  ═══════════ */}
      <section id="testimonials" className="py-24 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="text-center">
            <SectionBadge>{t("landing.testimonials.badge")}</SectionBadge>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              {t("landing.testimonials.title")}{" "}
              <span className="text-purple-600">{t("landing.testimonials.titleHighlight")}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-500">
              {t("landing.testimonials.description")}
            </p>
          </AnimatedSection>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <AnimatedSection key={i} delay={i * 120}>
                <div className="group h-full rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-purple-100/30 hover:-translate-y-1">
                  <Quote className="mb-4 size-8 text-purple-200" />
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className="size-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 italic">
                    "{t(`landing.testimonials.items.${i}.text`)}"
                  </p>
                  <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-400 text-sm font-bold text-white">
                      {t(`landing.testimonials.items.${i}.name`)
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t(`landing.testimonials.items.${i}.name`)}</p>
                      <p className="text-xs text-slate-500">{t(`landing.testimonials.items.${i}.role`)}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════  MISSION & VISION  ═══════════ */}
      <section className="relative overflow-hidden bg-slate-900 py-24 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/3 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-60 w-60 rounded-full bg-purple-600/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <AnimatedSection className="text-center">
            <SectionBadge>{t("landing.mission.badge")}</SectionBadge>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl text-white">
              {t("landing.mission.title")}{" "}
              <span className="text-purple-400">{t("landing.mission.titleHighlight")}</span>
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-white/70 leading-relaxed">
              {t("landing.mission.description")}
            </p>
          </AnimatedSection>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => {
              const icons = [Heart, Shield, Lightbulb, Target];
              const Icon = icons[i];
              return (
                <AnimatedSection key={i} delay={i * 100}>
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                      <Icon className="size-6 text-purple-400" />
                    </div>
                    <h3 className="font-bold text-lg">{t(`landing.mission.values.${i}.title`)}</h3>
                    <p className="mt-2 text-sm text-white/60">{t(`landing.mission.values.${i}.description`)}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════  TEAM / NEWSLETTER  ═══════════ */}
      <section className="py-24 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <AnimatedSection>
              <SectionBadge>{t("landing.team.badge")}</SectionBadge>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                {t("landing.team.title")}{" "}
                <span className="text-purple-600">{t("landing.team.titleHighlight")}</span>
              </h2>
              <p className="mt-4 text-slate-500 leading-relaxed">
                {t("landing.team.description")}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-6">
                {[0, 1, 2, 3].map((i) => {
                  const icons = [Zap, MonitorSmartphone, Shield, Users];
                  const Icon = icons[i];
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                        <Icon className="size-5" />
                      </div>
                      <span className="font-medium text-sm">{t(`landing.team.features.${i}`)}</span>
                    </div>
                  );
                })}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 p-10 text-white shadow-xl">
                <h3 className="text-2xl font-bold">{t("landing.team.newsletter.title")}</h3>
                <p className="mt-3 text-sm text-white/70">
                  {t("landing.team.newsletter.description")}
                </p>
                <div className="mt-6 flex gap-3">
                  <Input
                    placeholder={t("landing.team.newsletter.placeholder")}
                    className="h-11 flex-1 rounded-full border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:border-white/40 focus-visible:ring-white/20"
                  />
                  <Button className="h-11 rounded-full bg-white px-6 text-purple-700 font-semibold hover:bg-white/90 transition">
                    {t("landing.team.newsletter.cta")}
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════  CONTACT  ═══════════ */}
      <section id="contact" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="text-center">
            <SectionBadge>{t("landing.contact.badge")}</SectionBadge>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              {t("landing.contact.title")}{" "}
              <span className="text-purple-600">{t("landing.contact.titleHighlight")}</span>
            </h2>
          </AnimatedSection>

          <div className="mt-16 grid gap-12 lg:grid-cols-5">
            {/* Info */}
            <AnimatedSection className="lg:col-span-2 space-y-8">
              {[0, 1, 2].map((i) => {
                const icons = [MapPin, Mail, Phone];
                const Icon = icons[i];
                return (
                  <div key={i} className="group flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 transition group-hover:bg-purple-600 group-hover:text-white">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{t(`landing.contact.info.${i}.title`)}</p>
                      <p className="text-sm text-slate-500">{t(`landing.contact.info.${i}.text`)}</p>
                      <button className="mt-1 text-xs font-semibold uppercase tracking-wide text-purple-600 hover:text-purple-700 transition">
                        {t(`landing.contact.info.${i}.link`)}
                      </button>
                    </div>
                  </div>
                );
              })}
            </AnimatedSection>

            {/* Form */}
            <AnimatedSection delay={200} className="lg:col-span-3">
              {formStatus === "success" ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-green-200 bg-green-50 p-12 text-center shadow-sm">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                    <Check className="size-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-800">
                    {t("landing.contact.form.successTitle")}
                  </h3>
                  <p className="mt-2 text-sm text-green-600">
                    {t("landing.contact.form.successMessage")}
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleContactSubmit}
                  className="space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
                  noValidate
                >
                  {formStatus === "error" && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                      {t("landing.contact.form.errorMessage")}
                    </div>
                  )}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        {t("landing.contact.form.firstName")} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="John"
                        className={`h-11 rounded-lg ${formErrors.firstName ? "border-red-400 focus-visible:ring-red-200" : ""}`}
                        value={formData.firstName}
                        onChange={(e) => handleFormChange("firstName", e.target.value)}
                        disabled={formStatus === "loading"}
                        maxLength={50}
                      />
                      {formErrors.firstName && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        {t("landing.contact.form.lastName")} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Doe"
                        className={`h-11 rounded-lg ${formErrors.lastName ? "border-red-400 focus-visible:ring-red-200" : ""}`}
                        value={formData.lastName}
                        onChange={(e) => handleFormChange("lastName", e.target.value)}
                        disabled={formStatus === "loading"}
                        maxLength={50}
                      />
                      {formErrors.lastName && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.lastName}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        {t("landing.contact.form.email")} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        className={`h-11 rounded-lg ${formErrors.email ? "border-red-400 focus-visible:ring-red-200" : ""}`}
                        value={formData.email}
                        onChange={(e) => handleFormChange("email", e.target.value)}
                        disabled={formStatus === "loading"}
                        maxLength={100}
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        {t("landing.contact.form.phone")}
                      </label>
                      <Input
                        type="tel"
                        placeholder="+1 234 567 890"
                        className={`h-11 rounded-lg ${formErrors.phone ? "border-red-400 focus-visible:ring-red-200" : ""}`}
                        value={formData.phone}
                        onChange={(e) => handleFormChange("phone", e.target.value)}
                        disabled={formStatus === "loading"}
                        maxLength={20}
                      />
                      {formErrors.phone && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      {t("landing.contact.form.message")} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder={t("landing.contact.form.messagePlaceholder")}
                      className={`w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm shadow-xs outline-none transition placeholder:text-slate-400 ${
                        formErrors.message
                          ? "border-red-400 focus:ring-2 focus:ring-red-100"
                          : "border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                      }`}
                      value={formData.message}
                      onChange={(e) => handleFormChange("message", e.target.value)}
                      disabled={formStatus === "loading"}
                      maxLength={2000}
                    />
                    {formErrors.message && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.message}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-400 text-right">
                      {formData.message.length}/2000
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={formStatus === "loading" || cooldown}
                    className="h-11 w-full rounded-full bg-gradient-to-r from-purple-700 to-purple-500 text-white shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-shadow disabled:opacity-60"
                  >
                    {formStatus === "loading" ? (
                      <Loader2 className="mr-1.5 size-4 animate-spin" />
                    ) : (
                      <Send className="mr-1.5 size-4" />
                    )}
                    {cooldown
                      ? t("landing.contact.form.cooldown")
                      : formStatus === "loading"
                        ? t("landing.contact.form.sending")
                        : t("landing.contact.form.submit")}
                  </Button>
                </form>
              )}
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════  FOOTER  ═══════════ */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <button
                onClick={() => scrollTo("hero")}
                className="flex items-center gap-2 text-xl font-bold"
              >
                <Calendar className="size-6 text-purple-600" />
                <span className="bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
                  Eventinas
                </span>
              </button>
              <p className="mt-4 text-sm text-slate-500 leading-relaxed">
                {t("landing.footer.description")}
              </p>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wide text-slate-800">
                {t("landing.footer.company.title")}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <li key={i}>
                    <button className="text-sm text-slate-500 hover:text-purple-600 transition">
                      {t(`landing.footer.company.links.${i}`)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wide text-slate-800">
                {t("landing.footer.product.title")}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <li key={i}>
                    <button className="text-sm text-slate-500 hover:text-purple-600 transition">
                      {t(`landing.footer.product.links.${i}`)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wide text-slate-800">
                {t("landing.footer.legal.title")}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {[0, 1, 2, 3].map((i) => (
                  <li key={i}>
                    <button className="text-sm text-slate-500 hover:text-purple-600 transition">
                      {t(`landing.footer.legal.links.${i}`)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row">
            <p className="text-sm text-slate-400">
              {t("landing.footer.copyright", { year: new Date().getFullYear() })}
            </p>
            <div className="flex gap-4">
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  className="text-xs font-medium text-slate-400 hover:text-purple-600 transition"
                >
                  {t(`landing.footer.social.${i}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
