import { useState, useEffect } from 'react'
import { Shield, MapPin, Phone, Mail, CheckCircle, Home, ArrowLeft, Menu, X, ChevronDown, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT (Abuja)','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara',
]

function FindNGOPage() {
  const navigate = useNavigate()
  const [ngos, setNgos] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedState, setSelectedState] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  const fetchNGOs = async (state) => {
    setLoading(true)
    setHasFetched(true)
    const query = supabase
      .from('ngos')
      .select('id, name, state, lga, address, phone, email, specialization, description')
      .eq('status', 'approved')
      .order('name', { ascending: true })
    if (state) query.eq('state', state)
    const { data, error } = await query
    if (!error) setNgos(data || [])
    setLoading(false)
  }

  const handleStateChange = (state) => {
    setSelectedState(state)
    if (state) fetchNGOs(state)
    else { setNgos([]); setHasFetched(false) }
  }

  return (
    <div className="w-full min-h-screen bg-white text-gray-800">

      {/* Navbar */}
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
                className="text-xs bg-red-600 text-white px-3 py-2 rounded-lg font-bold">Exit</a>
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

      {/* Hero */}
      <section className="relative py-20 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1920&q=80"
            alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(160deg, rgba(20,5,40,0.95) 0%, rgba(59,7,100,0.90) 60%, rgba(91,33,182,0.85) 100%)' }} />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <button onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white mb-8 bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl border border-white/15 font-semibold w-fit transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <span className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-4 block">Support Near You</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-tight max-w-xl">
            Find an NGO in Your State
          </h1>
          <p className="text-purple-200/80 text-sm leading-relaxed max-w-lg mb-10">
            You don't need to know any organisation names. Just select your state below
            and we'll show you verified NGOs ready to support you offering counselling,
            legal help, shelter referrals, and more.
          </p>

          {/* State Selector — big and obvious */}
          <div className="max-w-sm">
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-widest mb-3">
              Select Your State
            </label>
            <div className="relative">
              <select value={selectedState} onChange={(e) => handleStateChange(e.target.value)}
                className="w-full appearance-none bg-white text-gray-800 rounded-2xl px-5 py-4 pr-12 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-xl">
                <option value="">Choose a state...</option>
                {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 px-6 md:px-12" style={{ background: '#F9F7FF' }}>
        <div className="max-w-4xl mx-auto">

          {/* Initial state — no state selected */}
          {!selectedState && !hasFetched && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <MapPin className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Select your state above</p>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                NGOs will appear here once you choose your state. All listed organisations are verified by ProtectHer.
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-700 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-500">Finding NGOs in {selectedState}...</p>
            </div>
          )}

          {/* No results */}
          {!loading && hasFetched && ngos.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Users className="w-10 h-10 text-gray-200 mx-auto mb-4" />
              <p className="text-sm font-semibold text-gray-700 mb-2">No NGOs listed yet in {selectedState}</p>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed mb-6">
                We are actively onboarding NGOs across all states. In the meantime, please use our emergency helplines.
              </p>
              <button onClick={() => navigate('/get-help')}
                className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg">
                View Emergency Helplines
              </button>
            </div>
          )}

          {/* NGO Cards */}
          {!loading && ngos.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {ngos.length} verified organisation{ngos.length !== 1 ? 's' : ''} in {selectedState}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">All NGOs are reviewed and approved by ProtectHer</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ngos.map((ngo) => (
                  <div key={ngo.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-purple-200 hover:shadow-lg transition-all duration-300 group">
                    {/* Card top accent */}
                    <div className="h-1.5 bg-gradient-to-r from-purple-700 to-violet-500" />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">{ngo.name}</h3>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {ngo.state}{ngo.lga ? `, ${ngo.lga}` : ''}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-100 flex-shrink-0">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </div>
                      </div>

                      {ngo.specialization && (
                        <p className="text-xs text-purple-700 font-semibold bg-purple-50 px-3 py-1.5 rounded-lg w-fit mb-3 border border-purple-100">
                          {ngo.specialization}
                        </p>
                      )}

                      {ngo.description && (
                        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{ngo.description}</p>
                      )}

                      <div className="space-y-2 pt-3 border-t border-gray-50">
                        {ngo.phone && (
                          <a href={`tel:${ngo.phone}`}
                            className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 font-bold transition-colors">
                            <Phone className="w-3.5 h-3.5 flex-shrink-0" /> {ngo.phone}
                          </a>
                        )}
                        {ngo.email && (
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Mail className="w-3.5 h-3.5 flex-shrink-0" /> {ngo.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <div className="py-6 bg-gray-950 text-center">
        <p className="text-xs text-gray-600">© 2026 ProtectHer. Supporting survivors across Nigeria.</p>
      </div>
    </div>
  )
}

export default FindNGOPage