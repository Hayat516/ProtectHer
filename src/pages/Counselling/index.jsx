import { useState } from 'react'
import { Shield, Heart, CheckCircle, ArrowRight, Home, ArrowLeft, Menu, X, Phone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function CounsellingPage() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="w-full min-h-screen bg-white text-gray-800">

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

      {/* Hero with image */}
     <section className="relative min-h-[380px] flex items-end pb-12 px-6 md:px-12 overflow-hidden">
  <div className="absolute inset-0">
     <img
      src="https://plus.unsplash.com/premium_photo-1723802441213-540674875129?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2FzZSUyMHRyYWNraW5nJTIwd29tZW4lMjB0cmF1bWF8ZW58MHx8MHx8fDA%3D"
      alt=""
      className="w-full h-full object-cover"
      style={{ objectPosition: 'center 20%' }}
     />
  <div className="absolute inset-0"
      style={{ background: 'linear-gradient(to bottom, rgba(28,10,46,0.55) 0%, rgba(59,7,100,0.92) 100%)' }} />
  </div>
        <div className="relative max-w-3xl mx-auto w-full">
          <button onClick={() => navigate('/get-help')}
            className="flex items-center gap-2 text-sm text-white/75 hover:text-white mb-6 bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl border border-white/20 font-semibold w-fit transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-3 block">Counselling Services</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-tight">
            You Don't Have to Face This Alone
          </h1>
          <p className="text-purple-200/85 text-sm leading-relaxed max-w-xl">
            Counselling is a private, judgment-free space to process what you've been through, at your own pace.
            No name required. No pressure to share more than you want.
          </p>
        </div>
      </section>

      {/* What to expect + image */}
      <section className="py-16 px-6 md:px-12 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-7">What to Expect</h2>
            <div className="space-y-6">
              {[
                { title: 'A safe, non-judgmental space', desc: 'Everything you share is confidential. You will never be pressured to share more than you are comfortable with.' },
                { title: 'Professional, trained counsellors', desc: 'Our NGO partners connect you with trauma counsellors experienced specifically in GBV cases.' },
                { title: 'No account, no identity required', desc: 'You do not need to register or give your name. Your Case ID from your report is enough to proceed.' },
                { title: 'Available across Nigeria', desc: 'NGO partner counsellors are active in every state in person, by phone, or online.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">{item.title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-xl">
            <img src="https://images.unsplash.com/photo-1712523300928-d65b794343d8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGNhc2UlMjB0cmFja2luZyUyMHdvbWVuJTIwdHJhdW1hfGVufDB8fDB8fHww"
              alt="Support" className="w-full h-72 lg:h-96 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-950/65 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="text-sm font-semibold leading-snug">"Healing is not linear. You are allowed to take your time."</p>
              <p className="text-xs text-purple-200 mt-1">Counselling available across all 36 states.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Types */}
      <section className="py-16 px-6 md:px-12" style={{ background: '#F9F7FF' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Types of Support Available</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: <Heart className="w-5 h-5 text-rose-700" />, bg: 'bg-rose-50', border: 'border-rose-100', title: 'One-on-One Counselling', desc: 'Private sessions with a trained trauma counsellor in person, by phone, or online.' },
              { icon: <Phone className="w-5 h-5 text-amber-700" />, bg: 'bg-amber-50', border: 'border-amber-100', title: 'Crisis Support', desc: 'Immediate emotional support for acute distress. Available through NGO partners 24/7.' },
              { icon: <CheckCircle className="w-5 h-5 text-purple-700" />, bg: 'bg-purple-50', border: 'border-purple-100', title: 'Group Support', desc: 'Survivor-led group sessions facilitated by trained counsellors. Share and heal together.' },
            ].map((type) => (
              <div key={type.title} className={`${type.bg} border ${type.border} rounded-2xl p-6 hover:shadow-md transition-all duration-300`}>
                <div className="mb-4">{type.icon}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-2">{type.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{type.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-6 md:px-12" style={{ background: '#0F0520' }}>
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-xl font-bold mb-3">Ready to Connect with a Counsellor?</h2>
          <p className="text-purple-300/80 text-sm leading-relaxed mb-8">
            Find a verified NGO near you they will connect you with a trained counsellor in your state.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/find-ngo')}
              className="inline-flex items-center justify-center gap-2 bg-white text-purple-700 hover:bg-purple-50 px-7 py-3.5 rounded-xl font-bold text-sm transition-all shadow-xl hover:-translate-y-0.5">
              Find NGO Near You <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/report')}
              className="inline-flex items-center justify-center gap-2 bg-white/8 text-white hover:bg-white/15 border border-white/15 px-7 py-3.5 rounded-xl font-bold text-sm transition-all">
              Report an Incident
            </button>
          </div>
        </div>
      </section>

      <div className="py-6 bg-gray-950 text-center">
        <p className="text-xs text-gray-600">© 2026 ProtectHer. Supporting survivors across Nigeria.</p>
      </div>
    </div>
  )
}

export default CounsellingPage