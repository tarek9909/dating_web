import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import api from '../api/client';
import { sound } from '../utils/sound';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const navigate = useNavigate();
  const mainRef = useRef(null);

  // Request Form State
  const [formData, setFormData] = useState({
    name: '',
    recipientName: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Interactive Teaser Evasion & Simulation State
  const [hasEvaded, setHasEvaded] = useState(false);
  const [noPos, setNoPos] = useState({ left: '0px', top: '0px' });
  const [tauntIndex, setTauntIndex] = useState(0);
  const [showTaunt, setShowTaunt] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const arenaRef = useRef(null);

  // Creative Lebanese chat language taunts for the runaway button
  const taunts = [
    'Wen rayi7? Ma fi la2 hon 😏',
    'Jarreb marra tenye ya 7abib 2albe 😂',
    'Bala 7arakat 2ar3a! Kbous l a7mar 💅',
    'Error 404: La2 Mish Mawjoudeh 🇱🇧',
    'Chou mfakkar 7alak saree3? 💨',
    'Khalasna ba2a, kbous Yes w khallina nrou7 nekol 🍕',
    'Walaaww! Baddak teksor bi khatre? 🥺💔'
  ];

  const visionPresets = [
    '🍕 Pizza nos leil w raseef w de7ek',
    '🌅 Ghouroub 3al Raouche w cocktail',
    '🌯 Shawarma 3al saj w sahra bil siyara',
    '🕹️ Arcade w matcha ice cream',
    '🍝 3asha raye2 w pasta 3a daw l shmou3'
  ];

  const handleNoEvade = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      sound.playWhoosh();
    } catch {
      // ignore
    }

    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    
    // Bounds for evasion within the card arena
    const paddingX = 50;
    const paddingY = 24;
    const maxW = Math.max(80, rect.width - paddingX * 2);
    const maxH = Math.max(40, rect.height - paddingY * 2);

    let randomX = paddingX + Math.random() * maxW;
    let randomY = paddingY + Math.random() * maxH;
    let attempts = 0;

    // Ensure NO button does not land anywhere near the centered YES button
    while (attempts < 15) {
      const distFromCenter = Math.hypot(randomX - rect.width / 2, randomY - rect.height / 2);
      if (distFromCenter >= 115) break;
      randomX = paddingX + Math.random() * maxW;
      randomY = paddingY + Math.random() * maxH;
      attempts++;
    }

    // Safety fallback: if still too close to center, force to an outer corner
    if (Math.hypot(randomX - rect.width / 2, randomY - rect.height / 2) < 115) {
      randomX = Math.random() > 0.5 ? paddingX + 15 : rect.width - paddingX - 15;
      randomY = Math.random() > 0.5 ? paddingY + 8 : rect.height - paddingY - 8;
    }

    setHasEvaded(true);
    setNoPos({
      left: `${Math.round(randomX)}px`,
      top: `${Math.round(randomY)}px`
    });

    setTauntIndex((prev) => prev + 1);
    setShowTaunt(true);
  };

  const triggerProposalAcceptance = () => {
    try {
      sound.playCelebration();
    } catch {
      // ignore
    }

    try {
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#b90040', '#e31754', '#ffb2ba', '#ffd9dc', '#ffffff', '#ffd166']
      });
      setTimeout(() => {
        confetti({
          particleCount: 70,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
          colors: ['#ffb2ba', '#db2965', '#ffd166']
        });
        confetti({
          particleCount: 70,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
          colors: ['#ffb2ba', '#db2965', '#ffd166']
        });
      }, 220);
    } catch {
      // ignore
    }

    setAccepted(true);
  };

  const resetProposalSimulation = () => {
    setAccepted(false);
    setShowTaunt(false);
    setHasEvaded(false);
    setNoPos({ left: '0px', top: '0px' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const applyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      notes: prev.notes ? `${prev.notes} • ${preset}` : preset
    }));
  };

  const handleFormSubmission = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      sound.playPop();
      await api.public.submitRequest(formData);
      setSubmitted(true);
      sound.playCelebration();
    } catch (err) {
      setError(err.message || 'Sar fi ghalat bil talab, dkhilak jarreb marra tenyeh.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Header Entrance
      gsap.fromTo(
        '.gsap-header',
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );

      // 2. Hero Section Entrance Timeline
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .fromTo('.gsap-hero-badge', { y: -20, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.6 })
        .fromTo('.gsap-hero-title', { y: 35, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85 }, '-=0.3')
        .fromTo('.gsap-hero-subtitle', { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75 }, '-=0.4')
        .fromTo('.gsap-hero-action', { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, duration: 0.7 }, '-=0.3')
        .fromTo('.gsap-hero-trust', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.75 }, '-=0.3');

      // 3. Floating Ambient Orbs (continuous slow drift)
      gsap.to('.gsap-ambient-orb-1', {
        x: 40,
        y: -35,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
      gsap.to('.gsap-ambient-orb-2', {
        x: -45,
        y: 40,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
      gsap.to('.gsap-ambient-orb-3', {
        x: 35,
        y: 30,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // 4. Interactive Demo Section
      gsap.fromTo(
        '.gsap-demo-header',
        { y: 35, opacity: 0 },
        {
          scrollTrigger: { trigger: '#demo-section', start: 'top 85%' },
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out'
        }
      );

      gsap.fromTo(
        '.gsap-demo-card',
        { y: 60, opacity: 0, scale: 0.96 },
        {
          scrollTrigger: { trigger: '#demo-section', start: 'top 75%' },
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power3.out'
        }
      );

      // 5. Bento Features Section
      gsap.fromTo(
        '.gsap-features-header',
        { y: 35, opacity: 0 },
        {
          scrollTrigger: { trigger: '#features', start: 'top 85%' },
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out'
        }
      );

      gsap.fromTo(
        '.gsap-feature-card',
        { y: 50, opacity: 0 },
        {
          scrollTrigger: { trigger: '#features', start: 'top 78%' },
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.85,
          ease: 'power3.out'
        }
      );

      // 6. 3-Step Journey Timeline
      gsap.fromTo(
        '.gsap-steps-header',
        { y: 35, opacity: 0 },
        {
          scrollTrigger: { trigger: '#how-it-works', start: 'top 85%' },
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out'
        }
      );

      gsap.fromTo(
        '.gsap-step-card',
        { y: 45, opacity: 0 },
        {
          scrollTrigger: { trigger: '#how-it-works', start: 'top 78%' },
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.85,
          ease: 'power3.out'
        }
      );

      // 8. Custom Proposal VIP Request Section
      gsap.fromTo(
        '.gsap-request-card',
        { y: 55, opacity: 0, scale: 0.97 },
        {
          scrollTrigger: { trigger: '#request-section', start: 'top 78%' },
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.95,
          ease: 'power3.out'
        }
      );

      // 9. Footer Content
      gsap.fromTo(
        '.gsap-footer-content',
        { y: 30, opacity: 0 },
        {
          scrollTrigger: { trigger: 'footer', start: 'top 95%' },
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out'
        }
      );
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="bg-[#fffafa] font-body-md text-on-surface relative min-h-screen selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden">
      {/* Ambient Blurred Background Lights */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="gsap-ambient-orb-1 absolute -top-32 left-1/4 w-[650px] h-[650px] rounded-full bg-rose-200/35 blur-[130px]"></div>
        <div className="gsap-ambient-orb-2 absolute top-1/3 -right-20 w-[550px] h-[550px] rounded-full bg-amber-100/40 blur-[140px]"></div>
        <div className="gsap-ambient-orb-3 absolute -bottom-24 left-1/3 w-[600px] h-[600px] rounded-full bg-pink-200/30 blur-[150px]"></div>
      </div>

      {/* Header Bar */}
      <header className="gsap-header fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-rose-100/70 shadow-[0_4px_30px_rgba(185,0,64,0.03)]">
        <div className="h-20 max-w-max-content-width mx-auto px-margin-mobile lg:px-margin-desktop flex items-center justify-between gap-space-md">
          <div
            className="flex items-center gap-space-sm cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-rose-400 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(227,23,84,0.3)] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-title-editorial text-[22px] font-bold text-on-surface tracking-tight leading-none">
                Yalla Yes 🇱🇧
              </span>
              <span className="font-label-sm text-[10px] text-primary font-bold tracking-widest uppercase mt-0.5">
                Da3wat Gharamiye 3al Ousoul
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-space-xs p-1.5 rounded-full bg-surface-container-low/70 border border-rose-100/80 backdrop-blur-md">
            <button
              onClick={() => scrollToSection('demo-section')}
              className="px-space-md py-space-xs font-label-md text-label-md rounded-full font-semibold text-on-surface-variant hover:text-primary hover:bg-white hover:shadow-sm transition-all"
            >
              L Tejrobe
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="px-space-md py-space-xs rounded-full font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-white hover:shadow-sm transition-all font-medium"
            >
              L Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="px-space-md py-space-xs rounded-full font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-white hover:shadow-sm transition-all font-medium"
            >
              Kif Btsir?
            </button>
            <button
              onClick={() => scrollToSection('request-section')}
              className="px-space-md py-space-xs rounded-full font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-white hover:shadow-sm transition-all font-medium"
            >
              B3atle L Link
            </button>
          </nav>

          <div className="flex items-center gap-space-sm">
            <button
              onClick={() => scrollToSection('request-section')}
              className="hidden sm:inline-flex items-center justify-center px-space-lg py-space-xs rounded-full bg-gradient-to-r from-primary to-rose-600 text-white font-label-lg text-label-lg shadow-[0_4px_16px_rgba(227,23,84,0.35)] hover:shadow-[0_6px_22px_rgba(227,23,84,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold cursor-pointer"
            >
              <span>B3atle L Link</span>
              <span className="text-sm ml-1">→</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              title="Portal Login"
              className="w-9 h-9 rounded-full bg-rose-50/80 border border-rose-200/80 text-primary flex items-center justify-center shadow-sm hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full pt-20 bg-transparent">
        <div className="flex flex-col w-full">
          {/* HERO SECTION */}
          <section className="relative w-full overflow-hidden px-margin-mobile lg:px-margin-desktop pt-space-2xl pb-space-3xl flex flex-col items-center text-center">
            {/* Micro Badge */}
            <div className="gsap-hero-badge inline-flex items-center gap-space-xs px-space-md py-space-2xs rounded-full bg-white/95 border border-rose-200/80 shadow-[0_4px_16px_rgba(185,0,64,0.06)] mb-space-lg transition-transform duration-300 hover:scale-105">
              <span className="material-symbols-outlined text-primary text-[16px]">sentiment_satisfied</span>
              <span className="font-label-md text-label-md text-on-surface font-semibold tracking-wider">
                Mesh ra7 te2dar/te2dri t2oul/t2ouli la2 🇱🇧
              </span>
            </div>

            {/* Editorial Headline with Lebanese Flair */}
            <h1 className="gsap-hero-title max-w-4xl font-display-xl text-[40px] md:text-[58px] leading-[1.15] tracking-tight text-on-surface mb-space-md font-bold">
              Badel ma tes2al/tes2ali "Btetla3/btetla3i ma3e?" khallikoun tsarrkho:
              <span className="block mt-space-2xs text-transparent bg-clip-text bg-gradient-to-r from-primary via-rose-600 to-amber-500 font-extrabold">
                "Yalla Yes!"
              </span>
            </h1>

            {/* Subtitle */}
            <p className="gsap-hero-subtitle max-w-2xl font-body-lg text-body-lg text-on-surface-variant mb-space-2xl leading-relaxed font-normal">
              Da3weh interactive mfassaleh 3al milli la ma te2dar/te2dri ella ma t2oul/t2ouli Yes 😉 ma3 zer &quot;La2&quot; byehrob kel ma tjarrib/tjarbi tekbso/tekbsi, celebration beats, ekhtiyar l akel wl meshwar, w boarding pass rasmiyeh direct 3al WhatsApp.
            </p>

            {/* Dual Actions */}
            <div className="flex flex-wrap items-center justify-center gap-space-md mb-space-3xl">
              <button
                onClick={() => scrollToSection('request-section')}
                className="gsap-hero-action px-space-2xl py-3.5 rounded-full bg-gradient-to-r from-primary via-rose-600 to-primary-container text-white font-label-lg text-label-lg font-bold tracking-wider shadow-[0_8px_25px_rgba(227,23,84,0.35)] hover:shadow-[0_12px_32px_rgba(227,23,84,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
              >
                Jehezli/Jehezileh l link →
              </button>
              <button
                onClick={() => scrollToSection('demo-section')}
                className="gsap-hero-action px-space-xl py-3.5 rounded-full bg-white/90 border border-rose-200 text-on-surface font-label-lg text-label-lg font-semibold shadow-sm hover:border-primary-container hover:text-primary transition-all duration-300 cursor-pointer"
              >
                Jarreb/Jarbi ohrob/horbi men l Yes
              </button>
            </div>

            {/* Trust Badges Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md w-full max-w-3xl">
              <div className="gsap-hero-trust p-space-md rounded-2xl bg-white/90 border border-rose-100/90 flex items-center gap-space-sm shadow-sm text-left backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-primary shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                </div>
                <div>
                  <div className="font-label-lg text-label-lg font-bold text-on-surface">Ma fi la2 bi 2amousna</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">L zer byohrob deghre</div>
                </div>
              </div>

              <div className="gsap-hero-trust p-space-md rounded-2xl bg-white/90 border border-rose-100/90 flex items-center gap-space-sm shadow-sm text-left backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-tertiary shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
                </div>
                <div>
                  <div className="font-label-lg text-label-lg font-bold text-on-surface">Tarab w aswat celebration</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">Far7a w tarab bil date</div>
                </div>
              </div>

              <div className="gsap-hero-trust p-space-md rounded-2xl bg-white/90 border border-rose-100/90 flex items-center gap-space-sm shadow-sm text-left backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-secondary shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                </div>
                <div>
                  <div className="font-label-lg text-label-lg font-bold text-on-surface">Ticket 3al WhatsApp deghre</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">L ticket deghre 3al WhatsApp</div>
                </div>
              </div>
            </div>
          </section>

          {/* INTERACTIVE PROPOSAL SIMULATION STAGE */}
          <section className="relative w-full px-margin-mobile lg:px-margin-desktop py-space-3xl flex flex-col items-center" id="demo-section">
            <div className="w-full max-w-max-content-width flex flex-col items-center relative">
              <div className="gsap-demo-header text-center mb-space-xl">
                <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-widest">
                  Jarreb bi Idak 🎯
                </span>
                <h2 className="font-headline-md text-headline-md text-on-surface mt-space-2xs font-bold">
                  Jarreb/Jarbi tkbous/tekbsi "La2" iza fik/fikie 😉
                </h2>
              </div>

              {/* Proposal Frame Container (Max 540px) */}
              <div className="gsap-demo-card w-full max-w-max-invitation-width relative rounded-3xl bg-white border border-rose-200/90 p-space-xl sm:p-space-2xl shadow-[0_25px_60px_-15px_rgba(185,0,64,0.12)] flex flex-col items-center text-center overflow-hidden">
                {/* Card Header Bar */}
                <div className="w-full flex items-center justify-between pb-space-md mb-space-lg border-b border-rose-100">
                  <span className="inline-flex items-center gap-space-2xs px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-primary font-label-sm text-label-sm font-semibold">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                    Tajrobeh 7ayyeh
                  </span>
                  <span className="font-title-editorial text-[17px] text-secondary italic font-semibold">
                    Nesbet l 2aboul 100% 🇱🇧
                  </span>
                </div>

                {/* Gen Z Street Romance Photo Preview */}
                <div className="w-full h-52 rounded-2xl overflow-hidden relative mb-space-lg shadow-md border border-rose-200/70 group">
                  <img
                    alt="Couple sharing street pizza"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src="/images/genz_hero.jpg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25"></div>
                  <div className="absolute top-3 right-3 bg-rose-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
                    📸 Soura 3al khafif
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                    <span className="font-label-md text-label-md bg-black/60 px-3 py-1 rounded-full backdrop-blur-md font-medium">
                      L Jem3a • 7:00 l masa
                    </span>
                    <span className="font-label-sm text-label-sm text-rose-200 font-semibold bg-rose-950/60 px-2.5 py-1 rounded-full backdrop-blur-md">
                      Meshwar pizza w de7ek 🍕
                    </span>
                  </div>
                </div>

                {/* Proposal Question in Lebanese */}
                <p className="font-title-editorial text-title-editorial text-primary font-bold mb-space-2xs text-[20px]">
                  Maya ❤️
                </p>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm font-bold">
                  Btetla3/btetla3i ma3e date hal weekend? 🍕
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs mb-space-xl">
                  Na22o 3al rawa2.. bass ntebho l zer byohrob!
                </p>

                {/* Itinerary Snapshot Badges */}
                <div className="flex flex-wrap justify-center gap-space-xs mb-space-2xl w-full">
                  <div className="inline-flex items-center gap-1.5 px-space-sm py-space-2xs rounded-full bg-rose-50 text-on-surface text-body-sm font-semibold border border-rose-200/60 shadow-sm">
                    <span>🍕</span> Atyab men man2oushet l sobe7
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-space-sm py-space-2xs rounded-full bg-amber-50 text-on-surface text-body-sm font-semibold border border-amber-200/60 shadow-sm">
                    <span>🕶️</span> Kazdara bi naddarat 2loub
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-space-sm py-space-2xs rounded-full bg-pink-50 text-on-surface text-body-sm font-semibold border border-pink-200/60 shadow-sm">
                    <span>🍦</span> Bouza 3al ba7er 3a 7sebe
                  </div>
                </div>

                {/* Dynamic Proposal Button Arena */}
                <div
                  ref={arenaRef}
                  className="relative w-full min-h-[140px] flex items-center justify-center gap-5 sm:gap-6 py-3"
                  id="decision-arena"
                >
                  {/* YES Primary Button */}
                  <button
                    onClick={triggerProposalAcceptance}
                    className="relative z-20 px-space-xl py-3 rounded-full bg-gradient-to-r from-primary to-rose-600 text-white font-label-lg text-label-lg font-bold tracking-wider uppercase shadow-[0_6px_25px_rgba(227,23,84,0.45)] hover:scale-105 active:scale-95 transition-transform duration-200 flex items-center gap-space-xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                    <span>YES! Akeed ❤️</span>
                  </button>

                  {/* Reserved slot for NO button - keeps YES button stationary when NO evades */}
                  <div className="relative w-28 h-12 flex items-center justify-center">
                    {!hasEvaded && (
                      <button
                        onMouseEnter={handleNoEvade}
                        onTouchStart={handleNoEvade}
                        onClick={handleNoEvade}
                        className="w-full h-full rounded-full bg-surface-container-high border border-rose-200 text-on-surface-variant font-label-md text-label-md cursor-pointer select-none hover:bg-rose-100 font-semibold shadow-sm flex items-center justify-center transition-all duration-200"
                      >
                        La2 💔
                      </button>
                    )}
                  </div>

                  {/* Runaway NO Button - leaps smoothly around arena when hovered/touched */}
                  {hasEvaded && (
                    <button
                      onMouseEnter={handleNoEvade}
                      onTouchStart={handleNoEvade}
                      onClick={handleNoEvade}
                      className="absolute z-30 transition-all duration-200 ease-out px-space-lg py-space-xs rounded-full bg-surface-container-high border border-rose-300 text-on-surface-variant font-label-md text-label-md cursor-pointer select-none hover:bg-rose-100 font-semibold shadow-md whitespace-nowrap"
                      style={{
                        left: noPos.left,
                        top: noPos.top,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      La2 💔
                    </button>
                  )}
                </div>

                {/* Playful Lebanese Taunt Toast */}
                <div
                  className={`h-7 text-primary font-label-md text-label-md font-bold transition-opacity duration-300 ${
                    showTaunt ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {taunts[tauntIndex % taunts.length]}
                </div>

                {/* Success Modal Overlay */}
                {accepted && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-space-xl text-center z-30 animate-fadeIn">
                    <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-primary mb-space-md animate-bounce border border-rose-200 shadow-sm">
                      <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        celebration
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase font-bold">
                      2alet Yalla Yes! 🎉
                    </span>
                    <h4 className="font-display-lg text-display-lg text-on-surface mt-space-2xs mb-space-xs font-bold">
                      Mabrouk Ya King/Queen! ❤️
                    </h4>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg max-w-xs leading-relaxed">
                      L meshwar sar rasmi! L ticket nkhadmet wl tafasil weslo 3al WhatsApp. Jehhiz/Jehzi 7alak/ik lal sahra! 🇱🇧
                    </p>
                    <div className="px-space-md py-space-xs rounded-xl bg-surface-container-low border border-rose-200 text-primary font-label-md text-label-md font-semibold flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      <span>Ticket L Meshwar: #YY-BEIRUT-9482</span>
                    </div>
                    <button
                      onClick={resetProposalSimulation}
                      className="mt-space-lg px-space-md py-space-2xs rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm hover:text-on-surface hover:bg-rose-200 transition-colors font-semibold cursor-pointer"
                    >
                      3ida kaman marra 🔄
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* FEATURES GRID: 4 PILLARS */}
          <section className="w-full max-w-max-content-width mx-auto px-margin-mobile lg:px-margin-desktop py-space-3xl" id="features">
            <div className="gsap-features-header flex flex-col md:flex-row md:items-end justify-between mb-space-2xl gap-space-md">
              <div>
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-bold">
                  Gharam 3al Rawa2 💖
                </span>
                <h2 className="font-display-lg text-display-lg text-on-surface tracking-tight mt-space-2xs font-bold">
                  Leh ra7 t2oul/t2ouli "Yes" ghasben 3annak/ik?
                </h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                Kel shi ma3moul la tefra7/tefra7i w tkayyif/tkayfi 3al date, w tkoun zekra ma btentasa.
              </p>
            </div>

            {/* 4 Bento Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg">
              {/* Card 1: Kinetic Evasion */}
              <div className="gsap-feature-card group p-space-xl rounded-3xl bg-white/95 border border-rose-100/90 flex flex-col justify-between shadow-[0_4px_24px_rgba(185,0,64,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(185,0,64,0.1)] hover:border-rose-300/80 backdrop-blur-sm">
                <div className="mb-space-md">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/60 border border-rose-200/90 flex items-center justify-center text-primary mb-space-lg shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <span className="material-symbols-outlined text-[26px]">directions_run</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-primary text-[11px] font-bold mb-2 uppercase tracking-wider">
                    Zowghan Zaki 💨
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-bold">
                    Zer byohrob 3al saree3 💨
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    El "No" button mbarmaj bi zaka lebneni: bya3ref enno ma fi kelmet la2, w bydall yzoukh men el mouse wl touch ma3 taunts mahdoumeh.
                  </p>
                </div>

                {/* Telemetry Widget 1: Dodge Vector Precision */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-50/80 via-white to-rose-50/40 border border-rose-200/80 shadow-[0_2px_12px_rgba(185,0,64,0.04)] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="font-label-sm text-[11px] sm:text-[12px] font-bold text-on-surface">
                        Di2et l Zowghan
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-rose-100/90 border border-rose-200 text-primary font-extrabold text-[12px] tracking-tight shadow-sm">
                      99.8%
                    </span>
                  </div>

                  {/* Luxury Glowing Progress Track */}
                  <div className="relative w-full h-2 bg-rose-100/80 rounded-full overflow-hidden p-0.5 shadow-inner">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary via-rose-500 to-amber-400 shadow-[0_0_10px_rgba(227,23,84,0.6)] w-[99.8%] animate-pulse"></div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-on-surface-variant font-medium pt-0.5">
                    <span>Nesbet l zowghan l da2i2a</span>
                    <span className="text-emerald-700 font-bold">Ma fi hroub 🇱🇧</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Curated Date Vibes */}
              <div className="gsap-feature-card group p-space-xl rounded-3xl bg-white/95 border border-rose-100/90 flex flex-col justify-between shadow-[0_4px_24px_rgba(185,0,64,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(185,0,64,0.1)] hover:border-amber-300/80 backdrop-blur-sm">
                <div className="mb-space-md">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-200/90 flex items-center justify-center text-amber-700 mb-space-lg shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                    <span className="material-symbols-outlined text-[26px]">restaurant</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/70 text-amber-800 text-[11px] font-bold mb-2 uppercase tracking-wider">
                    Na22o 3a Zou2koun 🍕
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-bold">
                    Chou 3abalna nekol? 🍕
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Btena22o l akel wl vibe sawa: shawarma 3al saj, pizza nos leil, aw 3asha raye2 bi Beirut w pasta 3a daw l shmou3.
                  </p>
                </div>

                {/* Telemetry Widget 2: Curated Chips */}
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-50/60 via-white to-rose-50/40 border border-rose-200/80 shadow-[0_2px_12px_rgba(185,0,64,0.04)] flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-on-surface-variant px-0.5">
                    <span className="flex items-center gap-1 text-amber-800 font-bold">
                      <span className="material-symbols-outlined text-[14px]">stars</span>
                      Jaww l Date
                    </span>
                    <span className="text-[10px] bg-amber-100/80 text-amber-900 px-1.5 py-0.5 rounded-md font-bold">
                      A7la Shi
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="group/chip flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white border border-rose-200/80 hover:border-primary hover:bg-rose-50/60 transition-all duration-200 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm group-hover/chip:scale-125 transition-transform">🍕</span>
                        <span className="font-label-sm text-[11px] font-bold text-rose-950">Pizza nos leil</span>
                      </div>
                      <span className="text-[10px] text-rose-600 font-semibold">Pizza w raseef</span>
                    </div>

                    <div className="group/chip flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white border border-amber-200/80 hover:border-amber-400 hover:bg-amber-50/60 transition-all duration-200 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm group-hover/chip:scale-125 transition-transform">🕹️</span>
                        <span className="font-label-sm text-[11px] font-bold text-amber-950">Arcade w de7ek</span>
                      </div>
                      <span className="text-[10px] text-amber-700 font-semibold">Sahra bil Beirut</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Procedural Audio */}
              <div className="gsap-feature-card group p-space-xl rounded-3xl bg-white/95 border border-rose-100/90 flex flex-col justify-between shadow-[0_4px_24px_rgba(185,0,64,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(185,0,64,0.1)] hover:border-pink-300/80 backdrop-blur-sm">
                <div className="mb-space-md">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100/60 border border-pink-200/90 flex items-center justify-center text-secondary mb-space-lg shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <span className="material-symbols-outlined text-[26px]">music_note</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-50 border border-pink-200/70 text-secondary text-[11px] font-bold mb-2 uppercase tracking-wider">
                    Tarab w Naghmat 🎵
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-bold">
                    Tarab w naghmat bahjeh 🎵
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Mowa2essirat sawtiyeh 7ayyeh: naghmat romance, celebration chimes, w zaghroutet fara7 lama tekbous Yes.
                  </p>
                </div>

                {/* Telemetry Widget 3: Multi-Bar Waveform */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-50/70 via-white to-rose-50/40 border border-rose-200/80 shadow-[0_2px_12px_rgba(185,0,64,0.04)] flex flex-col gap-2">
                  <div className="flex items-center justify-between px-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-rose-600 animate-pulse">graphic_eq</span>
                      <span className="font-label-sm text-[11px] sm:text-[12px] font-bold text-on-surface">
                        Aswat l Fara7
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100/80 text-secondary font-extrabold border border-pink-200">
                      Sot Hi-Fi
                    </span>
                  </div>

                  {/* Dynamic Multi-Bar Waveform Equalizer */}
                  <div className="flex items-center justify-center gap-1.5 h-9 px-3 bg-rose-50/70 border border-rose-200/70 rounded-xl shadow-inner">
                    <span className="w-1.5 h-3 bg-secondary/80 rounded-full animate-pulse"></span>
                    <span className="w-1.5 h-6 bg-rose-500 rounded-full animate-[pulse_1s_ease-in-out_infinite_0.1s]"></span>
                    <span className="w-1.5 h-4 bg-primary rounded-full animate-[pulse_1s_ease-in-out_infinite_0.2s]"></span>
                    <span className="w-1.5 h-7 bg-gradient-to-t from-primary to-amber-400 rounded-full shadow-sm animate-[pulse_1s_ease-in-out_infinite_0.3s]"></span>
                    <span className="w-1.5 h-5 bg-rose-500 rounded-full animate-[pulse_1s_ease-in-out_infinite_0.4s]"></span>
                    <span className="w-1.5 h-3 bg-secondary/70 rounded-full animate-[pulse_1s_ease-in-out_infinite_0.5s]"></span>
                    <span className="w-1.5 h-7 bg-gradient-to-t from-primary to-rose-400 rounded-full shadow-sm animate-[pulse_1s_ease-in-out_infinite_0.2s]"></span>
                    <span className="w-1.5 h-4 bg-amber-500 rounded-full animate-[pulse_1s_ease-in-out_infinite_0.1s]"></span>
                    <span className="w-1.5 h-2 bg-secondary/60 rounded-full animate-pulse"></span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-on-surface-variant font-medium px-0.5">
                    <span>Naghmat l Yes</span>
                    <span className="text-secondary font-bold">Zaghroutet l Yes 🎉</span>
                  </div>
                </div>
              </div>

              {/* Card 4: WhatsApp Delivery */}
              <div className="gsap-feature-card group p-space-xl rounded-3xl bg-white/95 border border-rose-100/90 flex flex-col justify-between shadow-[0_4px_24px_rgba(185,0,64,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(185,0,64,0.1)] hover:border-emerald-300/80 backdrop-blur-sm">
                <div className="mb-space-md">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 border border-emerald-200/90 flex items-center justify-center text-emerald-700 mb-space-lg shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                    <span className="material-symbols-outlined text-[26px]">send_to_mobile</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-[11px] font-bold mb-2 uppercase tracking-wider">
                    Tasleem Fawri 🎫
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-bold">
                    Ticket rasmiyeh 3al WhatsApp 🎫
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Bass tekbous/tekbsi Yes, deghre byenshana3 carte rasmi lal meshwar ma3 l wa2et wl matra7, w byousal risalet WhatsApp jehze lal share.
                  </p>
                </div>

                {/* Telemetry Widget 4: Speed Telemetry */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-50/70 via-white to-emerald-50/50 border border-rose-200/80 shadow-[0_2px_12px_rgba(185,0,64,0.04)] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                        <span className="material-symbols-outlined text-[13px]">bolt</span>
                      </div>
                      <span className="font-label-sm text-[11px] sm:text-[12px] font-bold text-on-surface">
                        Ser3et l Ersel
                      </span>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-[12px] shadow-sm">
                      <span>Khelal 3 Sowaneh</span>
                      <span className="text-[10px]">⚡</span>
                    </div>
                  </div>

                  {/* Benchmark Bar */}
                  <div className="relative w-full h-2 bg-emerald-100/70 rounded-full overflow-hidden p-0.5 shadow-inner">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] w-[95%]"></div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-on-surface-variant font-medium pt-0.5">
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      Ersel 3al WhatsApp
                    </span>
                    <span className="text-on-surface-variant/80 font-medium">Ser3et l ersel l fawriyeh</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3-STEP JOURNEY TIMELINE */}
          <section className="w-full max-w-max-content-width mx-auto px-margin-mobile lg:px-margin-desktop py-space-3xl" id="how-it-works">
            <div className="gsap-steps-header text-center mb-space-3xl">
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-bold">
                Bi 3 Khotwat Bass ⚡
              </span>
              <h2 className="font-display-lg text-display-lg text-on-surface tracking-tight mt-space-2xs font-bold">
                Kif btsir l khabriyyeh?
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-xl relative">
              {/* Step 01 */}
              <div className="gsap-step-card flex flex-col items-start p-space-xl rounded-2xl bg-white border border-rose-100 relative shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center font-display-lg text-[22px] font-bold text-primary mb-space-lg shadow-sm">
                  01
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-bold">
                  Btektob/btektbi l tafasil
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  3abbe/3abbi l form bil esem, l noukat benatkoun, w chou 3abalak/ik meshwar bi hal form.
                </p>
              </div>

              {/* Step 02 */}
              <div className="gsap-step-card flex flex-col items-start p-space-xl rounded-2xl bg-white border border-rose-100 relative shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center font-display-lg text-[22px] font-bold text-secondary mb-space-lg shadow-sm">
                  02
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-bold">
                  Mnhaddirlak/ik l link
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Ne7na mn3mlak/ik saf7et da3weh ma3 zer "La2" yalle byohrob wl aswat l mahdoumeh.
                </p>
              </div>

              {/* Step 03 */}
              <div className="gsap-step-card flex flex-col items-start p-space-xl rounded-2xl bg-white border border-rose-100 relative shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center font-display-lg text-[22px] font-bold text-tertiary mb-space-lg shadow-sm">
                  03
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-bold">
                  Bteb3atla/bteb3atlo l link
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Bteb3atla/bteb3atlo l link 3al WhatsApp, bas tjarreb/yjarreb tekbous/yekbous la2, bta3tik/bya3tik Yes rasmiyeh ma3 ticket!
                </p>
              </div>
            </div>
          </section>

          {/* ULTRA-PREMIUM RESTYLED REQUEST FORM SECTION */}
          <section
            className="w-full max-w-max-content-width mx-auto px-margin-mobile lg:px-margin-desktop py-space-3xl flex justify-center relative"
            id="request-section"
          >
            {/* Ambient Radial Spotlight Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-rose-400/20 via-primary/15 to-amber-300/20 rounded-full blur-[140px] pointer-events-none"></div>

            <div className="w-full max-w-2xl relative group">
              {/* Subtle Animated Gradient Border Aura */}
              <div className="absolute -inset-1 bg-gradient-to-r from-rose-400/30 via-primary/25 to-amber-300/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-700"></div>

              {/* Main Card */}
              <div className="gsap-request-card relative rounded-3xl bg-white/95 backdrop-blur-2xl border border-rose-200/90 p-space-xl sm:p-space-2xl shadow-[0_30px_70px_-15px_rgba(227,23,84,0.15),0_0_0_1px_rgba(255,255,255,0.9)_inset]">
                {/* VIP Pill Badge */}
                <div className="flex justify-center mb-space-lg">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 shadow-sm text-primary font-label-sm text-[11px] font-bold tracking-wider uppercase">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                    <span>Wasel 3andak/ik 3al WhatsApp bi se3tein ⚡</span>
                  </div>
                </div>

                {/* Form Header */}
                <div className="text-center mb-space-2xl">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-rose-500 text-white flex items-center justify-center shadow-[0_8px_22px_rgba(227,23,84,0.35)] mb-space-sm transform group-hover:scale-105 transition-transform duration-300">
                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      drafts
                    </span>
                  </div>
                  <h2 className="font-headline-md text-[28px] sm:text-[32px] text-on-surface font-bold tracking-tight">
                    Sammem/Sammi Da3wtak
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 max-w-md mx-auto">
                    Bta3tina l tafasil, w ne7na mnhaddirlak/ik l link w mneb3atlak/ik yeh deghre 3al WhatsApp bala ayya ta32id.
                  </p>
                </div>

                {submitted ? (
                  <div className="p-space-xl rounded-2xl bg-gradient-to-b from-rose-50/80 to-white border border-rose-200 text-center flex flex-col items-center gap-space-sm shadow-inner">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[32px]">check_circle</span>
                    </div>
                    <h3 className="font-headline-sm font-bold text-on-surface text-[22px]">Wosol talabak/ik ya batal/bataleh! ❤️</h3>
                    <p className="font-body-md text-on-surface-variant max-w-md leading-relaxed">
                      Yislam dayyetak/ik ya <strong>{formData.name}</strong>! Stalamna tafasil talabak/ik la{' '}
                      <strong>{formData.recipientName}</strong>. Fari2na 3am yjehhiz l link w ra7 netwasal ma3ak/ik deghre 3al WhatsApp 3al raqam{' '}
                      <span className="text-primary font-semibold dir-ltr">{formData.phone}</span>.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', recipientName: '', phone: '', email: '', notes: '' });
                      }}
                      className="mt-space-md px-space-xl py-2.5 rounded-full bg-primary text-white font-label-md font-semibold hover:bg-primary-container shadow-md transition-all cursor-pointer"
                    >
                      B3atle da3weh tenyeh
                    </button>
                  </div>
                ) : (
                  <form className="flex flex-col gap-space-lg" onSubmit={handleFormSubmission}>
                    {error && (
                      <div className="p-space-sm rounded-xl bg-red-50 border border-red-200 text-error text-body-sm font-medium flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Two-column: Names */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="font-label-md text-label-md font-semibold text-on-surface flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                          <span>Esmak/ik l karim *</span>
                        </label>
                        <div className="relative">
                          <input
                            className="w-full px-4 py-3 rounded-xl bg-rose-50/40 hover:bg-rose-50/70 focus:bg-white border border-rose-200/80 text-on-surface font-body-md outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-primary placeholder-on-surface-variant/50 shadow-sm transition-all duration-200"
                            placeholder="Mithal: Tarek Mansour"
                            required
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="font-label-md text-label-md font-semibold text-on-surface flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-rose-500">favorite</span>
                          <span>Esem l ghali / l ghalyeh *</span>
                        </label>
                        <div className="relative">
                          <input
                            className="w-full px-4 py-3 rounded-xl bg-rose-50/40 hover:bg-rose-50/70 focus:bg-white border border-rose-200/80 text-on-surface font-body-md outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-primary placeholder-on-surface-variant/50 shadow-sm transition-all duration-200"
                            placeholder="Mithal: Maya"
                            required
                            type="text"
                            name="recipientName"
                            value={formData.recipientName}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Two-column: Contact */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="font-label-md text-label-md font-semibold text-on-surface flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-emerald-600">chat</span>
                          <span>WhatsApp *</span>
                        </label>
                        <div className="relative">
                          <input
                            className="w-full px-4 py-3 rounded-xl bg-rose-50/40 hover:bg-rose-50/70 focus:bg-white border border-rose-200/80 text-on-surface font-body-md outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-primary placeholder-on-surface-variant/50 shadow-sm transition-all duration-200"
                            placeholder="81 784 130"
                            required
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="font-label-md text-label-md font-semibold text-on-surface flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-primary">mail</span>
                          <span>L Email *</span>
                        </label>
                        <div className="relative">
                          <input
                            className="w-full px-4 py-3 rounded-xl bg-rose-50/40 hover:bg-rose-50/70 focus:bg-white border border-rose-200/80 text-on-surface font-body-md outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-primary placeholder-on-surface-variant/50 shadow-sm transition-all duration-200"
                            placeholder="taswad50@gmail.com"
                            required
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Date Vision & Inside Notes */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <div className="flex items-center justify-between">
                        <label className="font-label-md text-label-md font-semibold text-on-surface flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-amber-500">auto_awesome</span>
                          <span>Chou l fekra b-belak/ik?</span>
                        </label>
                        <span className="text-[11px] text-on-surface-variant/70 font-medium">Ekhtiyari</span>
                      </div>
                      <div className="relative">
                        <textarea
                          className="w-full px-4 py-3 rounded-xl bg-rose-50/40 hover:bg-rose-50/70 focus:bg-white border border-rose-200/80 text-on-surface font-body-md outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-primary placeholder-on-surface-variant/50 shadow-sm transition-all duration-200 resize-none"
                          placeholder="Mithal: Mne7eb l pizza nos leil, w ghenniyeh la Ziad Rahbani, wl meshwar l jem3a l masa 3al mina..."
                          rows={3}
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                        />
                      </div>

                      {/* Quick Inspiration Chips in Lebanese */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[11px] text-on-surface-variant font-semibold">Afkar saree3a:</span>
                        {visionPresets.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => applyPreset(preset)}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-primary border border-rose-200/70 transition-colors cursor-pointer"
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit Button with Shimmer Sweep */}
                    <div className="pt-2">
                      <button
                        disabled={loading}
                        className="relative group overflow-hidden w-full py-4 rounded-full bg-gradient-to-r from-primary via-rose-600 to-primary-container text-white font-label-lg text-[15px] font-bold uppercase tracking-wider shadow-[0_10px_30px_rgba(227,23,84,0.38)] hover:shadow-[0_15px_40px_rgba(227,23,84,0.55)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                        type="submit"
                      >
                        {/* Shimmer sweep */}
                        <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 pointer-events-none"></div>

                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>3am njehezlak/ik l link...</span>
                          </>
                        ) : (
                          <>
                            <span>Yalla Jehezli/Jehezileh L Link</span>
                            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                              arrow_forward
                            </span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Trust Security Strip */}
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-y-1 gap-x-4 text-center text-on-surface-variant/80 font-label-sm text-[11px] font-medium border-t border-rose-100 pt-4">
                      <div className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-emerald-600">verified_user</span>
                        <span>Khosousiyeh temmeh w encrypted 🔒</span>
                      </div>
                      <span className="hidden sm:inline text-rose-200">•</span>
                      <div className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-emerald-600">chat</span>
                        <span>Tasleem fawri 3al WhatsApp 💬</span>
                      </div>
                      <span className="hidden sm:inline text-rose-200">•</span>
                      <div className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-primary">favorite</span>
                        <span>Nesbet l 2aboul madmouneh 100% 🇱🇧</span>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full bg-white border-t border-rose-100 pt-space-2xl pb-0 shadow-sm overflow-hidden">
        <div className="gsap-footer-content max-w-max-content-width mx-auto px-margin-mobile lg:px-margin-desktop flex flex-col items-center text-center gap-space-lg pb-0">
          <div className="flex flex-col items-center gap-space-xs">
            <div
              className="flex items-center gap-space-xs cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <span className="material-symbols-outlined text-primary text-[22px]">auto_awesome</span>
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
                Yalla Yes 🇱🇧
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
              A7la tari2a la te3zom 7ada 3a date interactive w romantic bala ayya ta32id.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-space-lg">
            <button
              onClick={() => scrollToSection('demo-section')}
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors font-semibold"
            >
              L Tejrobe
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors font-semibold"
            >
              L Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors font-semibold"
            >
              Kif Btsir
            </button>
            <button
              onClick={() => scrollToSection('request-section')}
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors font-semibold"
            >
              B3atle L Link
            </button>
            <Link
              to="/login"
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors font-semibold"
            >
              Portal l Zabayen
            </Link>
          </nav>

          <div className="flex flex-wrap items-center justify-center gap-3 text-on-surface-variant">
            <a
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low border border-rose-200/80 hover:border-emerald-500 hover:bg-emerald-50 text-on-surface font-label-md text-xs font-bold transition-all shadow-xs group"
              href="https://wa.me/96181784130"
              target="_blank"
              rel="noreferrer"
              title="WhatsApp: 81 784 130"
            >
              <span className="material-symbols-outlined text-[18px] text-emerald-600 group-hover:scale-110 transition-transform">
                chat
              </span>
              <span>81 784 130</span>
            </a>
            <a
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low border border-rose-200/80 hover:border-primary hover:bg-rose-50 text-on-surface font-label-md text-xs font-bold transition-all shadow-xs group"
              href="mailto:taswad50@gmail.com"
              title="Email: taswad50@gmail.com"
            >
              <span className="material-symbols-outlined text-[18px] text-primary group-hover:scale-110 transition-transform">
                mail
              </span>
              <span>taswad50@gmail.com</span>
            </a>
            <Link
              className="w-9 h-9 rounded-full bg-surface-container-low border border-rose-200/80 flex items-center justify-center hover:bg-rose-100 hover:text-primary transition-colors"
              to="/login"
              title="Portal Login"
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
            </Link>
          </div>

          <div className="w-full pt-4 pb-0 mb-0 font-label-sm text-label-sm text-outline tracking-wider font-semibold uppercase flex flex-col sm:flex-row items-center justify-center gap-1.5 leading-none">
            <span>© {new Date().getFullYear()} YALLA YES.</span>
            <span className="hidden sm:inline text-rose-300">•</span>
            <span className="normal-case">Designed with love for the best dates across Lebanon 🇱🇧</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
