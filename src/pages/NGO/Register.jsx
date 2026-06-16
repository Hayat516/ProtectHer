import { useState } from 'react'
import { Shield, ArrowRight, CheckCircle, Home, Menu, X, AlertCircle, ChevronDown, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

const NIGERIAN_STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT (Abuja)','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara']
const SPECIALIZATIONS = ['Gender-Based Violence Support','Legal Aid & Advocacy','Shelter & Safe Housing','Medical Support & Referrals','Psychological Counselling','Child Protection','Economic Empowerment','General Women\'s Rights']

function NGORegisterPage() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '',
    state: '', lga: '', address: '', specialization: '', description: '', website: '', consent: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async () => {
    setError('')
    if (!formData.name.trim()) return setError('Organisation name is required.')
    if (!formData.email.trim()) return setError('Email address is required.')
    if (formData.password.length < 8) return setError('Password must be at least 8 characters.')
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.')
    if (!formData.phone.trim()) return setError('Phone number is required.')
    if (!formData.state) return setError('Please select your state.')
    if (!formData.specialization) return setError('Please select your area of specialisation.')
    if (!formData.consent) return setError('Please accept the terms to continue.')

    setLoading(true)
    try {
      const { error: dbError } = await supabase.from('ngos').insert([{
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password_hash: formData.password,
        phone: formData.phone.trim(),
        state: formData.state,
        lga: formData.lga.trim() || null,
        address: formData.address.trim() || null,
        specialization: formData.specialization,
        description: formData.description.trim() || null,
        website: formData.website.trim() || null,
        status: 'pending',
      }])
      if (dbError) throw dbError
      setSubmitted(true)
    } catch (err) {
      if (err?.code === '23505') setError('An organisation with this email already exists.')
      else setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-purple-50 border-2 border-purple-100 text-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all placeholder-gray-400"

  if (submitted) {
  return (
    <div className="w-full min-h-screen flex items-center justify-center px-6"
      style={{ background: 'linear-gradient(160deg, #FAF5FF 0%, #EDE9FE 100%)' }}>
      <div className="max-w-md w-full text-center">
        <div className="text-4xl mb-6">📋</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Application Received</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Thank you for registering with ProtectHer. Your application has been submitted and is now under review.
        </p>
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 mb-6 text-left">
          <p className="text-xs font-bold text-purple-700 mb-3">What happens next</p>
          <div className="space-y-3">
            {[
              'Our admin team reviews your organisation details — this usually takes within 24 to 48 hours.',
              `You will receive an email at ${formData.email} confirming whether your application has been approved or if we need more information.`,
              'If approved, the email will contain a direct link and instructions to log in to your NGO dashboard.',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-700 text-xs font-bold">{i + 1}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8">
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>Please check your inbox within 48 hours</strong> — including your spam folder.
            The email will come from ProtectHer and will tell you exactly what to do next.
          </p>
        </div>
        <button onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-7 py-3 rounded-xl font-bold text-sm transition-all shadow-lg">
          Back to Home
        </button>
      </div>
    </div>
  )
}

  return (
    <div className="w-full min-h-screen text-gray-800"
      style={{ background: 'linear-gradient(160deg, #FAF5FF 0%, #F3E8FF 40%, #EDE9FE 100%)' }}>

      <nav className="sticky top-0 z-50 bg-white border-b border-purple-100 shadow-sm">
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
              <button onClick={() => navigate('/ngo/login')}
                className="text-sm text-gray-500 hover:text-purple-700 font-medium transition-colors">
                Already registered? Login
              </button>
            </div>
            <div className="md:hidden flex items-center gap-2">
              <a href="https://google.com" target="_blank" rel="noopener noreferrer"
                className="text-xs bg-red-600 text-white px-3 py-2 rounded-lg font-bold">⚡ Exit</a>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg hover:bg-gray-100">
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
              <button onClick={() => { navigate('/ngo/login'); setMobileMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                Already registered? Login
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <button onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 mb-8 bg-white hover:bg-purple-50 px-4 py-2.5 rounded-xl border border-purple-200 shadow-sm font-semibold w-fit transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        <div className="mb-8">
          <span className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2 block">For Organisations</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Register Your NGO</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Join ProtectHer's verified network. Applications are reviewed by our admin team and approved within 48 hours.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-purple-100 px-6 sm:px-8 py-8 space-y-5">

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Organisation Name <span className="text-red-500">*</span></label>
            <input type="text" name="name" value={formData.name} onChange={handleChange}
              placeholder="e.g. Women Support Initiative Lagos" className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Email Address <span className="text-red-500">*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="org@example.com" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Phone Number <span className="text-red-500">*</span></label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="08012345678" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Password <span className="text-red-500">*</span></label>
              <input type="password" name="password" value={formData.password} onChange={handleChange}
                placeholder="Min. 8 characters" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Confirm Password <span className="text-red-500">*</span></label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                placeholder="Repeat password" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">State <span className="text-red-500">*</span></label>
              <div className="relative">
                <select name="state" value={formData.state} onChange={handleChange}
                  className={`${inputClass} appearance-none pr-10`}>
                  <option value="">Select state</option>
                  {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">LGA <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="text" name="lga" value={formData.lga} onChange={handleChange}
                placeholder="e.g. Ikeja" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Area of Specialisation <span className="text-red-500">*</span></label>
            <div className="relative">
              <select name="specialization" value={formData.specialization} onChange={handleChange}
                className={`${inputClass} appearance-none pr-10`}>
                <option value="">Select specialisation</option>
                {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">About Your Organisation <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea name="description" value={formData.description} onChange={handleChange}
              rows={3} placeholder="Brief description of your work and communities you serve..."
              className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Website <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="url" name="website" value={formData.website} onChange={handleChange}
              placeholder="https://yourorganisation.org" className={inputClass} />
          </div>

          <div className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-100">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange}
                className="mt-0.5 w-4 h-4 accent-purple-700 flex-shrink-0" />
              <span className="text-xs text-gray-700 leading-relaxed">
                I confirm that our organisation is legitimately registered to support GBV survivors in Nigeria,
                and that the information provided is accurate. I agree to ProtectHer's{' '}
                <a href="/privacy-policy" className="text-purple-700 font-bold hover:underline">Privacy Policy</a>.
                <span className="text-red-500 ml-1">*</span>
              </span>
            </label>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border-2 border-red-100 text-red-700 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 bg-purple-700 hover:bg-purple-800 disabled:bg-purple-300 text-white py-4 rounded-xl font-bold text-base transition-all shadow-xl hover:-translate-y-0.5 disabled:cursor-not-allowed">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
              : <>Submit Application <ArrowRight className="w-4 h-4" /></>}
          </button>

          <p className="text-center text-xs text-gray-400">
            Already registered?{' '}
            <button onClick={() => navigate('/ngo/login')} className="text-purple-700 font-bold hover:underline">Login here</button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default NGORegisterPage