import { useState, useEffect } from 'react'
import { Shield, CheckCircle, ArrowRight, Menu, X, Lock, Heart, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="w-full min-h-screen bg-white text-gray-800 overflow-x-hidden">

      {/* ======================== NAVBAR ======================== */}
      <nav className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-18 py-4">

            {/* Logo */}
            <a href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="p-1.5 bg-purple-700 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-purple-700 tracking-tight">
                ProtectHer
              </span>
            </a>

            {/* Desktop Nav Links — Centered */}
            <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              <a href="/" className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors duration-200">
                Home
              </a>
              <a href="/get-help" className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors duration-200">
                Get Help
              </a>
              <a href="/counselling" className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors duration-200">
                Counselling
              </a>
              <a href="/find-ngo" className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors duration-200">
                Find NGO Near You
              </a>
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => navigate('/report')}
                className="text-sm font-medium text-purple-700 hover:text-purple-800 transition-colors duration-200"
              >
                Report Incident
              </button>
              
                <a href="https://google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex-shrink-0"
              >
                Quick Exit
              </a>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 space-y-1">
              {[
                { label: 'Home', href: '/' },
                { label: 'Get Help', href: '/get-help' },
                { label: 'Counselling', href: '/counselling' },
                { label: 'Find NGO Near You', href: '/find-ngo' },
              ].map((link) => (
                
                <a key={link.href}
                  href={link.href}
                  className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 pb-1 flex flex-col gap-2">
                <button
                  onClick={() => { navigate('/report'); setIsMenuOpen(false) }}
                  className="w-full text-sm font-semibold text-purple-700 border border-purple-200 hover:bg-purple-50 px-4 py-2.5 rounded-lg transition-colors"
                >
                  Report Incident
                </button>
                
                  <a href="https://google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-semibold text-center transition-colors"
                >
                  Quick Exit
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

     {/* ======================== HERO SECTION ======================== */}
<section className="relative min-h-screen flex items-center justify-center px-6 md:px-12 py-24 overflow-hidden">

  {/* Background Image */}
  <div
  className="absolute inset-0"
  style={{
    backgroundImage: "url('https://media.istockphoto.com/id/1284137924/photo/young-lgbt-couple-supporting-gay-rights.webp?a=1&b=1&s=612x612&w=0&k=20&c=wWIQ3uqU0s6BYKX-wVsAT_R-HLcQwuDp1uZZ_U9KB7I=')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }}
/>
 {/* Dark Purple Overlay —*/}
<div
  className="absolute inset-0"
  style={{ background: 'linear-gradient(135deg, rgba(59,7,100,0.78) 0%, rgba(91,33,182,0.74) 50%, rgba(109,40,217,0.70) 100%)' }}
/>
  {/* Dot Pattern */}
  <div
    className="absolute inset-0 opacity-[0.01]"
    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
  />

  {/* Centered Content */}
  <div className="relative max-w-3xl mx-auto text-center">

    <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full text-xs font-semibold mb-8 border border-white/20">
      <Lock className="w-3.5 h-3.5" />
      Safe. Anonymous. Trusted. Available 24/7.
    </div>

    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
      You Are Not Alone.
      <br />
      <span className="text-purple-200">Your Safety Matters.</span>
    </h1>

    <p className="text-base sm:text-lg text-purple-100/90 mb-10 leading-relaxed max-w-xl mx-auto">
      ProtectHer is a safe and anonymous platform for reporting
      gender based violence in Nigeria. Your voice matters, and
      we are here to support you every step of the way.
    </p>

    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
      <button
        onClick={() => navigate('/report')}
        className="inline-flex items-center justify-center gap-2.5 bg-white text-purple-700 hover:bg-purple-50 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 shadow-xl hover:-translate-y-0.5"
      >
        Report Incident <ArrowRight className="w-4 h-4" />
      </button>
      <button
        onClick={() => navigate('/tracking')}
        className="inline-flex items-center justify-center gap-2.5 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/30 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200"
      >
        Track My Case
      </button>
    </div>

    <div className="flex flex-wrap gap-4 justify-center">
      {['100% Anonymous', 'Verified NGO Partners', 'End-to-End Encrypted'].map((item) => (
        <div key={item} className="flex items-center gap-1.5 text-purple-200 text-sm font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          {item}
        </div>
      ))}
    </div>
  </div>
</section>

{/* ======================== FEATURE CARDS ======================== */}
<section className="py-16 px-6 md:px-12" style={{ background: '#F5F0FF' }}>
  <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
    {[
      {
        icon: <Shield className="w-6 h-6 text-purple-700" />,
        title: 'Safe Reporting',
        desc: 'Submit reports anonymously with no account required.',
        img: 'https://images.unsplash.com/photo-1586739050530-2fddeb1770d4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2FmZSUyMHJlcG9ydGluZ3xlbnwwfHwwfHx8MA%3D%3D',
      },
      {
        icon: <Users className="w-6 h-6 text-purple-700" />,
        title: 'Verified NGO Network',
        desc: 'Connected to trusted organisations across all 36 states.',
        img: 'https://plus.unsplash.com/premium_photo-1683842188982-e2920f594fda?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dmVyaWZpZWQlMjBuZ28lMjBuZXR3b3JrfGVufDB8fDB8fHww',
      },
      {
        icon: <CheckCircle className="w-6 h-6 text-purple-700" />,
        title: 'Case Tracking',
        desc: 'Monitor your case progress using your unique Case ID.',
        img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=70',
      },
    ].map((card) => (
      <div key={card.title}
        className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300">
        {/* Card Image */}
        <div className="h-36 overflow-hidden">
          <img src={card.img} alt={card.title}
            className="w-full h-full object-cover" />
        </div>
        {/* Card Body */}
        <div className="p-5 flex items-start gap-4">
          <div className="p-2.5 bg-purple-50 rounded-xl flex-shrink-0 border border-purple-100">
            {card.icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">{card.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>

      {/* ======================== WHY PROTECTHER ======================== */}
<section className="py-24 px-6 md:px-12 bg-white">
  <div className="max-w-6xl mx-auto">

    <div className="text-center mb-14">
      <span className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-3 block">Why Choose Us</span>
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Why ProtectHer?</h2>
      <p className="text-gray-500 max-w-xl mx-auto text-base leading-relaxed">
        Built specifically for survivors and women across Nigeria
        with your safety and dignity at the centre of every decision.
      </p>
    </div>

    {/* Image + Cards Split */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
      {/* Left — Image */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=80"
          alt="Women supporting each other"
          className="w-full h-72 lg:h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <p className="text-sm font-semibold">You are not alone.</p>
          <p className="text-xs text-purple-200">Support is available 24/7 across Nigeria.</p>
        </div>
      </div>

      {/* Right — Cards */}
      <div className="space-y-4">
        {[
          {
            icon: <Shield className="w-6 h-6 text-white" />,
            title: 'Anonymous Reporting',
            desc: 'Report incidents safely without revealing your identity. Your privacy is our highest priority, protected at every step.',
            bg: 'bg-purple-700',
          },
          {
            icon: <CheckCircle className="w-6 h-6 text-white" />,
            title: 'Verified NGO Support',
            desc: 'Get connected with trusted NGOs verified by our team, ready to provide professional guidance and real support.',
            bg: 'bg-violet-600',
          },
          {
            icon: <Lock className="w-6 h-6 text-white" />,
            title: 'Safe and Secure',
            desc: 'All data is encrypted and stored securely with the highest standards of confidentiality.',
            bg: 'bg-indigo-600',
          },
        ].map((card) => (
          <div key={card.title}
            className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-300">
            <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              {card.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">{card.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

      {/* ======================== HOW IT WORKS ======================== */}
<section className="py-24 px-6 md:px-12" style={{ background: '#F5F0FF' }}>
  <div className="max-w-4xl mx-auto">
    <div className="text-center mb-14">
      <span className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-3 block">The Process</span>
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
      <p className="text-gray-500 text-base max-w-md mx-auto leading-relaxed">
        Three simple steps to report safely and get the support you deserve.
      </p>
    </div>

    <div className="space-y-5">
      {[
  {
    step: '01',
    title: 'Submit Your Report Safely',
    desc: 'Share your experience in a secure and confidential environment. Take your time and include as much or as little detail as you are comfortable sharing.',
    img: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=120&q=70',
    imgAlt: 'Woman privately using phone',
  },
  {
    step: '02',
    title: 'Get Assigned to a Verified NGO',
    desc: 'Our system automatically matches you with a verified NGO partner in your state, best equipped to support your situation.',
    img: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=120&q=70',
    imgAlt: 'Support workers ready to help',
  },
  {
    step: '03',
    title: 'Track Your Case Progress',
    desc: 'Use your unique Case ID to stay informed at every step. Monitor your case progress with full transparency from start to resolution.',
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=120&q=70',
    imgAlt: 'Checking case progress',
  },
].map((item) => (
  <div key={item.step}
    className="flex gap-5 items-start bg-white p-5 sm:p-6 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-700 flex items-center justify-center">
      <span className="text-white font-extrabold text-sm">{item.step}</span>
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
    </div>
    <div className="hidden sm:block flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-purple-100">
      <img src={item.img} alt={item.imgAlt} className="w-full h-full object-cover" />
    </div>
  </div>
))}
    </div>
  </div>
</section>

  {/* ======================== STATS SECTION ======================== */}
<section className="py-24 px-6 md:px-12" style={{ background: '#FAF7FF' }}>
  <div className="max-w-5xl mx-auto">

    <div className="mb-14">
      <p className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-4">
        Built Around You
      </p>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight max-w-lg">
        Every decision on this platform was made with one person in mind you.
      </h2>
    </div>

    {/* Each stat is its own standalone card — separated, breathing room */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

      <div className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-500 cursor-default">
        <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-6">Coverage</p>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-7xl font-black text-gray-900 group-hover:text-purple-700 transition-colors duration-500 leading-none tabular-nums">36</span>
          <span className="text-xl font-bold text-gray-300 group-hover:text-purple-300 transition-colors duration-500">states</span>
        </div>
        <p className="text-sm text-gray-900 font-bold mb-2">Nigeria-wide NGO network</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Verified support organisations active across every state. Wherever you are, someone trained to help is within reach.
        </p>
      </div>

      <div className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-500 cursor-default">
        <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-6">Privacy</p>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-7xl font-black text-gray-900 group-hover:text-purple-700 transition-colors duration-500 leading-none">100%</span>
        </div>
        <p className="text-sm text-gray-900 font-bold mb-2">Completely anonymous</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          No name. No phone number. No account ever. Your identity is never stored, never shared, never required.
        </p>
      </div>

      <div className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-500 cursor-default">
        <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-6">Availability</p>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-7xl font-black text-gray-900 group-hover:text-purple-700 transition-colors duration-500 leading-none tabular-nums">24/7</span>
        </div>
        <p className="text-sm text-gray-900 font-bold mb-2">Always here, never closed</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Midnight, 3am, any moment you feel ready the platform is on. Come whenever you need to.
        </p>
      </div>

      <div className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-500 cursor-default">
        <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-6">Response</p>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-7xl font-black text-gray-900 group-hover:text-purple-700 transition-colors duration-500 leading-none tabular-nums">48h</span>
        </div>
        <p className="text-sm text-gray-900 font-bold mb-2">Real human review</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          A trained NGO professional, a real person, not a bot will review every single report within 48 hours.
        </p>
      </div>

    </div>
  </div>
</section>

{/* ======================== CTA SECTION ======================== */}
<section className="py-24 px-6 md:px-12" style={{ background: '#FAF7FF' }}>
  <div className="max-w-5xl mx-auto">

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

      {/* Left */}
      <div>
        <p className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-5">
          Whenever You Are Ready
        </p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
          You deserve safety.<br />
          <span className="text-purple-700">You deserve support.</span>
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-10 max-w-md">
          Reporting takes courage. ProtectHer makes it as safe and simple as possible
          completely anonymous, no account, no judgment. A real person will be there for you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button onClick={() => navigate('/report')}
            className="inline-flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-8 py-4 rounded-xl font-bold text-sm transition-all shadow-xl hover:-translate-y-0.5">
            Report an Incident <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => navigate('/get-help')}
            className="inline-flex items-center justify-center gap-2 text-purple-700 hover:text-purple-900 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 px-8 py-4 rounded-xl font-bold text-sm transition-all">
            Get Help Now
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
          Available right now across all 36 states of Nigeria
        </div>
      </div>

      {/* Right — trust signals as plain editorial list */}
      <div className="lg:pt-14">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
          What makes this safe
        </p>
        <div className="space-y-0 divide-y divide-gray-100">
          {[
            {
              title: 'No identity required',
              desc: 'Report without giving your name, phone number, or creating any account.',
            },
            {
              title: 'Your data is encrypted',
              desc: 'Only the NGO assigned to your case can access your report. Nobody else.',
            },
            {
              title: 'Real people, real support',
              desc: 'Trained NGO professionals review every report. Not automated systems.',
            },
            {
              title: 'You stay in control',
              desc: 'Your unique Case ID lets you check progress and stay informed on your own terms.',
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 py-5 group cursor-default">
              <div className="w-px h-8 bg-gray-200 group-hover:bg-purple-400 transition-colors duration-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">{item.title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  </div>
</section>

 <footer style={{ background: '#2D0B55' }}>
  {/* Safety strip */}
  <div className="border-b border-white/8 py-8 px-6 md:px-12">
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-purple-200" />
        </div>
        <div>
          <p className="text-white text-sm font-bold">You are not alone.</p>
          <p className="text-purple-300/60 text-xs">Support is available 24/7 across all 36 states.</p>
        </div>
      </div>
      <a href="https://google.com" target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-lg flex-shrink-0">
        <X className="w-4 h-4" /> Quick Exit
      </a>
    </div>
  </div>

  {/* Links */}
  <div className="py-12 px-6 md:px-12">
    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

      <div className="sm:col-span-2 lg:col-span-1">
        <a href="/" className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-purple-600 rounded-lg">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-extrabold text-white">ProtectHer</span>
        </a>
        <p className="text-sm text-purple-200/50 leading-relaxed mb-5 max-w-xs">
          Safe, anonymous reporting for survivors of gender-based violence across Nigeria.
        </p>
        <div className="inline-flex items-center gap-2 bg-emerald-800/40 text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-700/30">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Available 24/7
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-purple-200/60 uppercase tracking-widest mb-5">Support</h4>
        <ul className="space-y-3">
          {[
            { label: 'Get Help', href: '/get-help' },
            { label: 'Counselling', href: '/counselling' },
            { label: 'Find NGO Near You', href: '/find-ngo' },
            { label: 'Track My Case', href: '/tracking' },
          ].map((link) => (
            <li key={link.href}>
              <a href={link.href} className="text-sm text-purple-200/50 hover:text-white transition-colors">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-xs font-bold text-purple-200/60 uppercase tracking-widest mb-5">Take Action</h4>
        <ul className="space-y-3">
          {[
            { label: 'Report an Incident', href: '/report' },
            { label: 'NGO Registration', href: '/ngo/register' },
            { label: 'NGO Login', href: '/ngo/login' },
          ].map((link) => (
            <li key={link.href}>
              <a href={link.href} className="text-sm text-purple-200/50 hover:text-white transition-colors">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-xs font-bold text-purple-200/60 uppercase tracking-widest mb-5">Emergency</h4>
        <div className="space-y-4 mb-5">
          <div>
            <p className="text-xs text-purple-300/40 mb-1">Police / Emergency</p>
            <a href="tel:112" className="text-white font-extrabold text-lg hover:text-purple-200 transition-colors">112</a>
          </div>
          <div>
            <p className="text-xs text-purple-300/40 mb-1">NAPTIP Hotline</p>
            <a href="tel:08006278471" className="text-white font-bold text-sm hover:text-purple-200 transition-colors">0800-6278471</a>
          </div>
        </div>
        <a href="/privacy-policy" className="text-xs text-purple-300/40 hover:text-purple-200 transition-colors">
          Privacy Policy
        </a>
      </div>
    </div>
  </div>

  <div className="border-t border-white/5 py-5 px-6 md:px-12">
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-xs text-purple-300/25 text-center sm:text-left">
        © 2026 ProtectHer. All rights reserved. Supporting survivors, building safer communities in Nigeria.
      </p>
      <p className="text-xs text-purple-300/20">Built with care for every woman in Nigeria.</p>
    </div>
  </div>
</footer>
    </div>
  )
}

export default HomePage