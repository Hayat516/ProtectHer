import { useState } from 'react'
import { Shield, Home, ArrowLeft, Menu, X, ChevronDown, ChevronUp, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SECTIONS = [
  {
    title: 'Your Safety Is Our Priority',
    content: 'This platform exists for one reason to make it safer for you to report, get help, and be heard. Nothing on ProtectHer is designed to expose you or put you at risk. Your privacy is not an afterthought, it is built into how this platform works at every level.',
  },
  {
    title: 'You Are Anonymous Here',
    content: 'You do not need to give your name, phone number, or create an account to use ProtectHer. When you submit a report, only what you choose to share is stored. Your Case ID is the only thing that connects you to your report and only you know it.',
  },
  {
    title: 'What We Collect',
    content: 'When you submit a report, we store: the type of incident, your description, the date it happened, the state and LGA, and optionally your email address if you want updates. We never collect biometric data, location tracking, or device identifiers.',
  },
  {
    title: 'Who Sees Your Report',
    content: 'Only the verified NGO assigned to your state can access your report. Our admin team may review reports for platform quality and safety. No advertisers, no third parties, no government bodies receive your data.',
  },
  {
    title: 'How Your Data Is Protected',
    content: 'All data is stored securely using Supabase infrastructure with industry-standard encryption. Row Level Security policies ensure only authorised parties can read specific records. No report is ever publicly accessible.',
  },
  {
    title: 'Who We Are',
    content: 'ProtectHer is a final-year academic project developed by a Computer Science student at Olabisi Onabanjo University, Nigeria. It is a web-based platform built to support survivors of gender-based violence through anonymous reporting and verified NGO connections.',
  },
  {
    title: 'Cookies and Tracking',
    content: 'ProtectHer does not use advertising cookies or third-party tracking. No data from your visit is shared with external platforms or used for marketing purposes.',
  },
  {
    title: 'Requesting Data Deletion',
    content: 'If you want your report removed, contact any verified NGO on our Find NGO page with your Case ID. We will process deletion requests within 30 days.',
  },
  {
    title: 'Changes to This Policy',
    content: 'We may update this policy as the platform develops. The latest version is always on this page. Last updated: January 2026.',
  },
]

function AccordionItem({ section, index, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group gap-4">
        <div className="flex items-start gap-4">
          <span className="text-xs font-bold text-purple-400 mt-0.5 flex-shrink-0 w-5 tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className={`text-sm font-bold transition-colors ${open ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-800'}`}>
            {section.title}
          </span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-purple-500 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-300 flex-shrink-0 group-hover:text-purple-400 transition-colors" />}
      </button>
      {open && (
        <div className="pb-6 pl-9 pr-2">
          <p className="text-sm text-gray-500 leading-relaxed">{section.content}</p>
        </div>
      )}
    </div>
  )
}

function PrivacyPolicyPage() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="w-full min-h-screen text-gray-800" style={{ background: '#FAF8FF' }}>

      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between py-4">
            <a href="/" className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-700 rounded-lg"><Shield className="w-5 h-5 text-white" /></div>
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
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg hover:bg-gray-100">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-gray-100">
              <button onClick={() => { navigate('/'); setMobileMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-50 rounded-lg">
                <Home className="w-4 h-4" /> Back to Home
              </button>
            </div>
          )}
        </div>
      </nav>

      <section className="py-16 px-6 md:px-12 border-b border-purple-100"
      style={{ background: 'linear-gradient(135deg, #FAF5FF 0%, #EDE9FE 100%)' }}>
  <div className="max-w-3xl mx-auto">
    <button onClick={() => navigate('/')}
      className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 mb-8 bg-white hover:bg-purple-50 px-4 py-2.5 rounded-xl border border-purple-200 shadow-sm font-semibold w-fit transition-colors">
      <ArrowLeft className="w-4 h-4" /> Back to Home
    </button>
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2.5 bg-purple-100 rounded-xl border border-purple-200">
        <Lock className="w-5 h-5 text-purple-700" />
      </div>
      <span className="text-xs font-bold text-purple-500 uppercase tracking-widest">Your Privacy</span>
    </div>
    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-5 leading-tight">
      Privacy Policy
    </h1>
    <p className="text-gray-500 text-sm leading-relaxed max-w-lg mb-4">
      Written in plain language no legal jargon. We want you to understand exactly
      what happens to your information when you use this platform.
    </p>
    <p className="text-xs text-gray-400">Last updated: January 2026</p>
  </div>
</section>
      {/* Accordion — white card, light background */}
      <section className="py-14 px-6 md:px-12">
        <div className="max-w-3xl mx-auto space-y-4">

          <div className="bg-white rounded-3xl border border-purple-100 shadow-sm px-6 sm:px-8 py-2">
            {SECTIONS.map((section, i) => (
              <AccordionItem key={i} section={section} index={i} defaultOpen={i === 0} />
            ))}
          </div>

          {/* Data request card */}
          <div className="bg-purple-700 rounded-2xl p-6 text-white">
            <p className="text-sm font-bold mb-2">Need to request data deletion?</p>
            <p className="text-sm text-purple-200/80 leading-relaxed">
              Find a verified NGO on our{' '}
              <button onClick={() => navigate('/find-ngo')}
                className="text-white font-bold underline underline-offset-2 hover:text-purple-200 transition-colors">
                Find NGO
              </button>{' '}
              page and reach out with your Case ID. We respond within 30 days.
            </p>
          </div>
        </div>
      </section>

      <div className="py-6 bg-gray-900 text-center">
        <p className="text-xs text-gray-500">© 2026 ProtectHer. Supporting survivors across Nigeria.</p>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage