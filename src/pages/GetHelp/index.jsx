import { useState } from 'react'
import { Shield, Phone, Heart, Users, ArrowRight, Home, ArrowLeft, Menu, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const HOTLINES = [
  {
    name: 'Emergency Services',
    number: '112',
    desc: 'If you are in immediate physical danger right now call this first. Police and emergency response.',
    available: '24/7',
    emergency: true,
  },
  {
    name: 'NAPTIP Hotline',
    number: '0800-6278471',
    desc: 'National Agency for the Prohibition of Trafficking in Persons handles GBV and trafficking cases across all of Nigeria.',
    available: '24/7',
    emergency: false,
  },
  {
    name: 'WARIF Helpline',
    number: '08000-927430',
    desc: 'Women At Risk International Foundation shelter, counselling, and legal support for survivors.',
    available: 'Mon–Sat, 8am–8pm',
    emergency: false,
  },
  {
    name: 'Project Alert',
    number: '01-7922688',
    desc: 'Legal aid, shelter referrals and crisis counselling for women across Nigeria.',
    available: 'Business Hours',
    emergency: false,
  },
]

const SUPPORT_TYPES = [
  {
    icon: <Heart className="w-5 h-5 text-white" />,
    title: 'Speak to a Counsellor',
    desc: 'Sometimes you just need someone to listen without judging. Trained trauma counsellors are available, no name required, no pressure.',
    link: '/counselling',
    linkText: 'Go to Counselling',
    iconBg: 'bg-rose-700',
    img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80',
  },
  {
    icon: <Users className="w-5 h-5 text-white" />,
    title: 'Connect With an NGO',
    desc: 'Verified organisations trained in GBV support are in every state, they provide practical help, legal guidance, and shelter referrals.',
    link: '/find-ngo',
    linkText: 'Find an NGO Near You',
    iconBg: 'bg-purple-700',
    img: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&q=80',
  },
  {
    icon: <Shield className="w-5 h-5 text-white" />,
    title: 'Report What Happened',
    desc: 'You can report anonymously at any time. No name, no phone number. Just your words and a Case ID to follow your progress.',
    link: '/report',
    linkText: 'Report an Incident',
    iconBg: 'bg-indigo-700',
    img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&q=80',
  },
]

function GetHelpPage() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="w-full min-h-screen bg-white text-gray-800">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between py-4">
            <a href="/" className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-700 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-purple-700 tracking-tight">ProtectHer</span>
            </a>
            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => navigate('/')}
                className="flex items-center gap-1.5 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg font-semibold border border-purple-200 transition-colors">
                <Home className="w-4 h-4" /> Home
              </button>
              <a href="https://google.com" target="_blank" rel="noopener noreferrer"
                className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold">
                 Quick Exit
              </a>
            </div>
            <div className="md:hidden flex items-center gap-2">
              <a href="https://google.com" target="_blank" rel="noopener noreferrer"
                className="text-xs bg-red-600 text-white px-3 py-2 rounded-lg font-bold"> Exit</a>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-gray-100 space-y-1">
              <button onClick={() => { navigate('/'); setMobileMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-50 rounded-lg">
                <Home className="w-4 h-4" /> Back to Home
              </button>
              <a href="https://google.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg">
                Quick Exit
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Page Header */}
      <section className="py-14 px-6 md:px-12 border-b border-gray-100"
        style={{ background: 'linear-gradient(135deg, #FAF5FF 0%, #EDE9FE 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 mb-8 bg-white hover:bg-purple-50 px-4 py-2.5 rounded-xl border border-purple-200 shadow-sm font-semibold w-fit transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 leading-tight">
            What kind of support do you need?
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
            There is no wrong answer. Everything here is free, confidential, and available
            without giving your name.
          </p>
        </div>
      </section>

      {/* EMERGENCY FIRST — victims in danger need this immediately */}
      <section className="py-12 px-6 md:px-12 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-6 bg-red-600 rounded-full flex-shrink-0" />
            <div>
              <h2 className="text-base font-extrabold text-gray-900">Are you in danger right now?</h2>
              <p className="text-xs text-gray-400 mt-0.5">Free helplines no name needed, completely confidential.</p>
            </div>
          </div>

          <div className="space-y-3">
            {HOTLINES.map((line) => (
              <div key={line.name}
                className={`flex items-start gap-4 p-5 rounded-2xl border-l-4 bg-gray-50 ${
                  line.emergency
                    ? 'border-red-500 bg-red-50/40'
                    : 'border-purple-400'
                } hover:shadow-sm transition-all`}>
                <div className={`p-3 rounded-xl flex-shrink-0 ${
                  line.emergency ? 'bg-red-100' : 'bg-purple-100'
                }`}>
                  <Phone className={`w-4 h-4 ${
                    line.emergency ? 'text-red-600' : 'text-purple-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-sm">{line.name}</h3>
                    {line.emergency && (
                      <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
                        CALL FIRST
                      </span>
                    )}
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {line.available}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-2">{line.desc}</p>
                  <a href={`tel:${line.number.replace(/\D/g, '')}`}
                    className={`text-lg font-extrabold transition-colors ${
                      line.emergency
                        ? 'text-red-600 hover:text-red-800'
                        : 'text-purple-700 hover:text-purple-900'
                    }`}>
                    {line.number}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Types — after emergency */}
      <section className="py-12 px-6 md:px-12" style={{ background: '#F9F7FF' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="text-base font-extrabold text-gray-900 mb-1">Other ways we can help</h2>
            <p className="text-sm text-gray-400">Choose what feels right for your situation right now.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {SUPPORT_TYPES.map((type) => (
              <div key={type.title}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={type.img}
                    alt={type.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-gray-900/10 to-transparent" />
                  <div className={`absolute top-4 left-4 p-2.5 ${type.iconBg} rounded-xl shadow-lg`}>
                    {type.icon}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-sm mb-2 leading-snug">{type.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{type.desc}</p>
                  <button onClick={() => navigate(type.link)}
                    className="flex items-center gap-2 text-sm font-bold text-purple-700 hover:text-purple-900 transition-colors group/btn">
                    {type.linkText}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="py-12 px-6 md:px-12 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-6 bg-purple-600 rounded-full flex-shrink-0" />
            <div>
              <h2 className="text-base font-extrabold text-gray-900">Protecting your privacy</h2>
              <p className="text-xs text-gray-400 mt-0.5">Simple steps to stay safe while using this platform.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Use the Quick Exit button at any time to leave this site immediately.',
              'Browse in Incognito or Private mode so your browser does not save history.',
              'Clear your browser history after visiting if someone shares your device.',
              'You never need to create an account or give your name anywhere on this platform.',
              'Your Case ID is private keep it somewhere only you can see.',
              'If you are in immediate danger, do not wait, call 112 right now.',
            ].map((tip, i) => (
              <div key={i}
                className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-purple-100 hover:bg-purple-50/20 transition-colors">
                <div className="w-5 h-5 bg-purple-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">{i + 1}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="py-5 bg-gray-900 text-center">
        <p className="text-xs text-gray-500">© 2026 ProtectHer. Supporting survivors across Nigeria.</p>
      </div>
    </div>
  )
}

export default GetHelpPage