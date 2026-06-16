import { useState } from 'react'
import { Shield, ArrowLeft, ArrowRight, Lock, AlertCircle, ChevronDown, Home, Upload, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import emailjs from '@emailjs/browser'

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT (Abuja)','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara',
]

const INCIDENT_TYPES = [
  { value: 'Physical Violence', label: 'Someone hurt me physically, hitting, beating, or any physical harm' },
  { value: 'Sexual Violence', label: 'I was touched, forced, or abused in a sexual way without my consent' },
  { value: 'Emotional / Psychological Abuse', label: 'I was threatened, controlled, humiliated, or made to feel worthless' },
  { value: 'Economic Abuse', label: 'Someone took my money, stopped me from working, or controlled my finances' },
  { value: 'Stalking / Harassment', label: 'Someone keeps following me, watching me, or will not leave me alone' },
  { value: 'Online / Digital Abuse', label: 'I was harassed, threatened, or harmed through my phone or the internet' },
  { value: 'Other', label: 'Something happened to me that is not listed here' },
]

const generateCaseId = () => {
  const year = new Date().getFullYear().toString().slice(-2)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const random = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
  return `PTH-${year}-${random}`
}

function ReportPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    incidentType: '',
    description: '',
    incidentDate: '',
    dateUncertain: false,
    state: '',
    lga: '',
    contactEmail: '',
    consent: false,
  })
  const [evidenceFile, setEvidenceFile] = useState(null)
  const [evidencePreview, setEvidencePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'dateUncertain' && checked ? { incidentDate: '' } : {}),
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo is too large. Please choose a file under 5MB.')
      return
    }
    setEvidenceFile(file)
    setEvidencePreview(URL.createObjectURL(file))
    setError('')
  }

  const removeFile = () => {
    setEvidenceFile(null)
    setEvidencePreview(null)
  }

  const handleSubmit = async () => {
    setError('')
    if (!formData.incidentType) return setError('Please choose what kind of incident this was.')
    if (formData.description.trim().length < 20) return setError('Please tell us a little more about what happened, at least a few words.')
    if (!formData.state) return setError('Please let us know which state this happened in so we can connect you with the right support.')
    if (!formData.consent) return setError('Please check the privacy box at the bottom to continue.')

    setLoading(true)
    try {
      const caseId = generateCaseId()
      let evidenceUrl = null

      // Upload evidence photo if provided
      if (evidenceFile) {
        const fileExt = evidenceFile.name.split('.').pop()
        const fileName = `${caseId}-evidence.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('evidence')
          .upload(fileName, evidenceFile)
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('evidence')
            .getPublicUrl(fileName)
          evidenceUrl = urlData?.publicUrl || null
        }
      }

      const { error: dbError } = await supabase.from('reports').insert([{
        case_id: caseId,
        incident_type: formData.incidentType,
        description: formData.description.trim(),
        incident_date: formData.dateUncertain || !formData.incidentDate ? null : formData.incidentDate,
        state: formData.state,
        lga: formData.lga.trim() || null,
        contact_email: formData.contactEmail.trim() || null,
        evidence_file_url: evidenceUrl,
        status: 'submitted',
      }])

      if (dbError) throw dbError

      if (formData.contactEmail.trim()) {
        try {
          await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            {
              to_email: formData.contactEmail.trim(),
              case_id: caseId,
            },
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
          )
        } catch (emailErr) {
          console.error('Email failed:', emailErr)
        }
      }

      navigate('/case-confirmation', { state: { caseId } })

    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen text-gray-800 overflow-x-hidden"
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
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')}
                className="hidden sm:flex items-center gap-1.5 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg font-semibold border border-purple-200 transition-colors">
                <Home className="w-4 h-4" /> Home
              </button>
              <a href="https://google.com" target="_blank" rel="noopener noreferrer"
                className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-lg">
               Quick Exit
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Safety Banner */}
      <div className="bg-purple-700 text-white text-center py-3 px-6">
        <div className="flex items-center justify-center gap-2 text-sm">
          <Lock className="w-4 h-4 flex-shrink-0" />
          <span>Your report is completely anonymous. You do not need to give your name or create an account.</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6">

        <div className="py-10">
          <button onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 mb-6 bg-white hover:bg-purple-50 px-4 py-2.5 rounded-xl border border-purple-200 shadow-sm font-semibold w-fit transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <span className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-2 block">
            Safe & Confidential
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
            Tell us what happened
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-md">
            Take your time. You are in control of what you share.
            There are no wrong answers here and no pressure to include more than you want to.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-purple-100 px-6 sm:px-8 py-8 space-y-8 mb-12">

          {/* Incident Type */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              What happened to you? <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Choose the one that feels closest. You can explain more in your own words below.
            </p>
            <div className="space-y-2">
              {INCIDENT_TYPES.map((type) => (
                <label key={type.value}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.incidentType === type.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-100 hover:border-purple-200 hover:bg-purple-50/30'
                  }`}>
                  <input
                    type="radio"
                    name="incidentType"
                    value={type.value}
                    checked={formData.incidentType === type.value}
                    onChange={handleChange}
                    className="mt-0.5 accent-purple-700 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Tell us what happened, in your own words <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Write as much or as little as you want. Your words will only be seen by the NGO assigned to support you.
            </p>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              placeholder="You can start with: 'What happened was...' just write whatever comes to mind. Take your time."
              className="w-full bg-purple-50 border-2 border-purple-100 text-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all resize-none leading-relaxed placeholder-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">{formData.description.length} characters</p>
          </div>

          {/* Evidence Photo Upload — optional */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Do you have a photo you want to include?
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">
              If you have a photo that shows what happened, an injury, a message, or anything relevant
              you can upload it here. This is completely optional. Maximum size: 5MB.
              The photo will only be visible to the NGO supporting your case.
            </p>

            {evidencePreview ? (
              <div className="relative w-fit">
                <img
                  src={evidencePreview}
                  alt="Evidence preview"
                  className="w-40 h-40 object-cover rounded-2xl border-2 border-purple-200"
                />
                <button
                  onClick={removeFile}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
                <p className="text-xs text-gray-400 mt-2">{evidenceFile?.name}</p>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-3 w-full h-32 bg-purple-50 border-2 border-dashed border-purple-200 rounded-2xl cursor-pointer hover:border-purple-400 hover:bg-purple-50/70 transition-all">
                <Upload className="w-6 h-6 text-purple-400" />
                <span className="text-sm text-purple-500 font-semibold">Click to upload a photo</span>
                <span className="text-xs text-gray-400">PNG, JPG, JPEG: max 5MB</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              When did this happen?
            </label>
            <p className="text-xs text-gray-400 mb-3">
              If you remember the date, add it below. If you are not sure, that is completely okay, just check the box.
            </p>
            <input
              type="date"
              name="incidentDate"
              value={formData.incidentDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              disabled={formData.dateUncertain}
              className="w-full bg-purple-50 border-2 border-purple-100 text-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed mb-3"
            />
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="dateUncertain"
                checked={formData.dateUncertain}
                onChange={handleChange}
                className="w-4 h-4 accent-purple-700 flex-shrink-0"
              />
              <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                I am not sure of the exact date, that is okay
              </span>
            </label>
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Which state did this happen in? <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">
              This helps us connect you with a support organisation in the right place.
              You do not need to give your exact address just the state is enough.
            </p>
            <div className="relative">
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full appearance-none bg-purple-50 border-2 border-purple-100 text-gray-700 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all">
                <option value="">Choose the state...</option>
                {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
            </div>
          </div>

          {/* LGA */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Roughly which area did this happen in?
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">
              For example; Ikeja, Enugu North, Wuse, Owerri Municipal.
              This helps narrow down the right support near you. Leave it empty if you prefer not to say.
            </p>
            <input
              type="text"
              name="lga"
              value={formData.lga}
              onChange={handleChange}
              placeholder="e.g. Ikeja, Enugu North, Wuse..."
              className="w-full bg-purple-50 border-2 border-purple-100 text-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all placeholder-gray-400"
            />
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Would you like updates sent to your email?
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">
              If you add your email, we will send your Case ID and notify you when something changes.
              If you leave this empty, your report is still completely valid
              you can always track it using your Case ID.
            </p>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full bg-purple-50 border-2 border-purple-100 text-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all placeholder-gray-400"
            />
          </div>

          {/* Consent */}
          <div className="bg-purple-50 rounded-2xl p-5 border-2 border-purple-100">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 accent-purple-700 flex-shrink-0"
              />
              <span className="text-xs text-gray-600 leading-relaxed">
                I understand that my report is anonymous and will be shared only with a verified
                support organisation in my state. I have read and accept the{' '}
                <a href="/privacy-policy" className="text-purple-700 font-bold hover:underline">
                  Privacy Policy
                </a>.
                <span className="text-red-500 ml-1">*</span>
              </span>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border-2 border-red-100 text-red-700 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 bg-purple-700 hover:bg-purple-800 disabled:bg-purple-300 text-white py-4 rounded-xl font-bold text-base transition-all shadow-xl hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting your report...
              </>
            ) : (
              <>Send My Report Safely <ArrowRight className="w-4 h-4" /></>
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            🔒 Your report is encrypted and stored securely. No one can identify you from this.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ReportPage