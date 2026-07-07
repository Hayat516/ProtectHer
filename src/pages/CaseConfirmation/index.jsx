import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Shield, Copy, ArrowRight, Home, Menu, X } from 'lucide-react'

function CaseConfirmationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const caseId = location.state?.caseId
  const [copied, setCopied] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!caseId) {
    navigate('/')
    return null
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(caseId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="w-full min-h-screen text-gray-800"
      style={{ background: 'linear-gradient(160deg, #FAF5FF 0%, #F3E8FF 40%, #EDE9FE 100%)' }}>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-purple-100 shadow-sm">
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
                className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors">
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

      <div className="max-w-lg mx-auto px-6 py-16">

        {/* Soft opening — no checkmark, just warmth */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-5">🌸</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 leading-snug">
            We received your report.
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
            It took courage to get here. Whatever happens next, you don't have to
            figure it out alone. Someone will be with you.
          </p>
        </div>

        {/* Case ID — the most important thing */}
        <div className="bg-white rounded-3xl border border-purple-100 shadow-sm px-6 py-7 mb-4">
          <p className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-4 text-center">
            Your Case ID
          </p>
          <div className="bg-purple-50 rounded-2xl px-5 py-4 border border-purple-100 flex items-center justify-between mb-5">
            <span className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-widest font-mono">
              {caseId}
            </span>
            <button onClick={handleCopy}
              className="flex items-center gap-1.5 text-sm text-purple-700 font-bold bg-white hover:bg-purple-50 px-3 py-2 rounded-xl border border-purple-200 transition-all flex-shrink-0 ml-3">
              <Copy className="w-4 h-4" />
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          {/* Save reminder — gentle not alarming */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-4">
            <p className="text-sm font-semibold text-amber-800 mb-1">
              Please save this somewhere safe
            </p>
            <p className="text-xs text-amber-700/80 leading-relaxed">
              This is how you'll check on your case. You can screenshot this page or
              write it down. We're not able to recover it for you later.
            </p>
          </div>
        </div>

        {/* What happens next — soft and human */}
        <div className="bg-white rounded-3xl border border-purple-100 shadow-sm px-6 py-7 mb-6">
          <p className="text-sm font-bold text-gray-800 mb-5">What happens from here</p>
          <div className="space-y-5">
            {[
              {
                num: '1',
                text: 'A real person at a verified NGO in your state will read your report usually within 48 hours.',
              },
              {
                num: '2',
                text: 'You can check in on your case any time using your Case ID. No one will rush you.',
              },
              {
                num: '3',
                text: 'If you shared your email, you may hear from us when something changes with your case.',
              },
            ].map((item) => (
              <div key={item.num} className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-700 text-xs font-extrabold">{item.num}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Gentle closing message */}
        <div className="text-center mb-8 px-4">
          <p className="text-sm text-gray-400 leading-relaxed">
            You did something hard today. Take care of yourself. 💜
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => navigate('/tracking', { state: { caseId } })}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:-translate-y-0.5">
            Check My Case <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-600 py-3.5 rounded-xl font-bold text-sm transition-all border border-gray-200">
            <Home className="w-4 h-4" /> Go Home
          </button>
        </div>

        {/* Support link */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Need someone to talk to right now?{' '}
          <button onClick={() => navigate('/get-help')}
            className="text-purple-600 font-bold hover:underline">
            Get support here
          </button>
        </p>

      </div>
    </div>
  )
}

export default CaseConfirmationPage