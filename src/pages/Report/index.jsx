import { useState, useEffect } from 'react'
import {
  Shield, ArrowLeft, ArrowRight, Lock, AlertCircle,
  ChevronDown, Home, Upload, X, Save, Clock
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import emailjs from '@emailjs/browser'

const DRAFT_KEY = 'protecther_report_draft'

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT (Abuja)','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara',
]

const INCIDENT_TYPES = [
  { value: 'Physical Violence', label: 'Someone hurt me physically; hitting, beating, or any physical harm' },
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

const EMPTY_FORM = {
  incidentType: '', description: '', incidentDate: '',
  dateUncertain: false, state: '', lga: '', contactEmail: '', consent: false,
}

function ReportPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(() => {
    // Load draft on mount
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) return { ...EMPTY_FORM, ...JSON.parse(saved) }
    } catch {}
    return EMPTY_FORM
  })

  const [evidenceFile, setEvidenceFile] = useState(null)
  const [evidencePreview, setEvidencePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [draftSaved, setDraftSaved] = useState(false)
  const [hasDraft, setHasDraft] = useState(false)

  useEffect(() => {
    const existing = localStorage.getItem(DRAFT_KEY)
    if (existing) {
      try {
        const parsed = JSON.parse(existing)
        if (parsed.description || parsed.incidentType || parsed.state) {
          setHasDraft(true)
        }
      } catch {}
    }
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'dateUncertain' && checked ? { incidentDate: '' } : {}),
    }))
    setDraftSaved(false)
  }

  const handleSaveDraft = () => {
    const draftData = { ...formData }
    delete draftData.consent // don't save consent
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData))
    setDraftSaved(true)
    setHasDraft(true)
    setTimeout(() => setDraftSaved(false), 3000)
  }

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
    setFormData(EMPTY_FORM)
    setEvidenceFile(null)
    setEvidencePreview(null)
    setHasDraft(false)
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
    if (formData.description.trim().length < 20) return setError('Please tell us a little more about what happened.')
    if (!formData.state) return setError('Please let us know which state this happened in.')
    if (!formData.consent) return setError('Please check the privacy box at the bottom to continue.')

    setLoading(true)
    try {
      const caseId = generateCaseId()
      let evidenceFileUrl = null

      if (evidenceFile) {
        const fileExt = evidenceFile.name.split('.').pop()
        const fileName = `${caseId}-evidence.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('evidence')
          .upload(fileName, evidenceFile, { upsert: true })

        if (uploadError) {
          console.error('Upload error:', uploadError)
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('evidence')
            .getPublicUrl(fileName)
          evidenceFileUrl = publicUrlData?.publicUrl || null
          console.log('Evidence URL:', evidenceFileUrl)
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
        evidence_file_url: evidenceFileUrl,
        status: 'submitted',
      }])

      if (dbError) throw dbError

      // Clear draft on successful submission
      localStorage.removeItem(DRAFT_KEY)

      if (formData.contactEmail.trim()) {
        try {
          await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            { to_email: formData.contactEmail.trim(), case_id: caseId },
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

      <div className="bg-purple-700 text-white text-center py-3 px-6">
        <div className="flex items-center justify-center gap-2 text-sm">
          <Lock className="w-4 h-4 flex-shrink-0" />
          <span>Your report is completely anonymous. No account or personal information is required.</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6">

        <div className="py-10">
          <button onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 mb-6 bg-white hover:bg-purple-50 px-4 py-2.5 rounded-xl border border-purple-200 shadow-sm font-semibold w-fit transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>

          <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
            <div>
              <span className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-2 block">Safe & Confidential</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">Tell us what happened</h1>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={handleSaveDraft}
                className="flex items-center gap-1.5 text-xs text-purple-700 bg-white hover:bg-purple-50 px-3 py-2 rounded-xl border border-purple-200 font-semibold transition-colors">
                <Save className="w-3.5 h-3.5" />
                {draftSaved ? 'Saved ✓' : 'Save Draft'}
              </button>
              {hasDraft && (
                <button onClick={handleClearDraft}
                  className="text-xs text-gray-400 hover:text-red-600 px-3 py-2 rounded-xl border border-gray-200 hover:border-red-200 font-semibold transition-colors">
                  Clear Draft
                </button>
              )}
            </div>
          </div>

          {hasDraft && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 mb-2">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                A saved draft has been loaded. Your progress is preserved.
              </p>
            </div>
          )}

          <p className="text-gray-500 text-sm leading-relaxed max-w-md">
            Take your time. There are no wrong answers. Share only what you feel comfortable with.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-purple-100 px-6 sm:px-8 py-8 space-y-8 mb-12">

          {/* Incident Type */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              What happened to you? <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Choose the one that feels closest. You can explain more below.
            </p>
            <div className="space-y-2">
              {INCIDENT_TYPES.map((type) => (
                <label key={type.value}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.incidentType === type.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-100 hover:border-purple-200 hover:bg-purple-50/30'
                  }`}>
                  <input type="radio" name="incidentType" value={type.value}
                    checked={formData.incidentType === type.value}
                    onChange={handleChange}
                    className="mt-0.5 accent-purple-700 flex-shrink-0" />
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
            <textarea name="description" value={formData.description} onChange={handleChange}
              rows={6}
              placeholder="You can start with: 'What happened was...' just write whatever comes to mind. Take your time."
              className="w-full bg-purple-50 border-2 border-purple-100 text-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all resize-none leading-relaxed placeholder-gray-400" />
            <p className="text-xs text-gray-400 mt-1">{formData.description.length} characters</p>
          </div>

          {/* Evidence Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Do you have a photo you want to include?
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">
              If you have a photo that shows what happened; an injury, a message, or anything relevant,
              you can upload it here. Maximum 5MB. The photo will only be visible to the NGO supporting your case.
            </p>

            {evidencePreview ? (
              <div className="relative w-fit">
                <img src={evidencePreview} alt="Evidence preview"
                  className="w-40 h-40 object-cover rounded-2xl border-2 border-purple-200" />
                <button onClick={removeFile}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg">
                  <X className="w-3.5 h-3.5" />
                </button>
                <p className="text-xs text-gray-400 mt-2">{evidenceFile?.name}</p>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-3 w-full h-32 bg-purple-50 border-2 border-dashed border-purple-200 rounded-2xl cursor-pointer hover:border-purple-400 hover:bg-purple-50/70 transition-all">
                <Upload className="w-6 h-6 text-purple-400" />
                <span className="text-sm text-purple-500 font-semibold">Click to upload a photo</span>
                <span className="text-xs text-gray-400">PNG, JPG, JPEG — max 5MB</span>
                <input type="file" accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">When did this happen?</label>
            <p className="text-xs text-gray-400 mb-3">
              If you remember the date, add it below. If you are not sure, check the box below.
            </p>
            <input type="date" name="incidentDate" value={formData.incidentDate} onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              disabled={formData.dateUncertain}
              className="w-full bg-purple-50 border-2 border-purple-100 text-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all disabled:opacity-40 mb-3" />
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="dateUncertain" checked={formData.dateUncertain}
                onChange={handleChange} className="w-4 h-4 accent-purple-700 flex-shrink-0" />
              <span className="text-sm text-gray-500">I am not sure of the exact date,  that is okay</span>
            </label>
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Which state did this happen in? <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">
              This helps us connect you with a support organisation in the right place.
              Just the state is enough, no exact address needed.
            </p>
            <div className="relative">
              <select name="state" value={formData.state} onChange={handleChange}
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
              For example; Ikeja, Enugu North, Wuse. Leave empty if you prefer not to say.
            </p>
            <input type="text" name="lga" value={formData.lga} onChange={handleChange}
              placeholder="e.g. Ikeja, Enugu North, Wuse..."
              className="w-full bg-purple-50 border-2 border-purple-100 text-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all placeholder-gray-400" />
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Would you like updates sent to your email?
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">
              If you add your email, we will send your Case ID and notify you when something changes.
              Leave empty to stay fully anonymous.
            </p>
            <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange}
              placeholder="your@email.com"
              className="w-full bg-purple-50 border-2 border-purple-100 text-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all placeholder-gray-400" />
          </div>

          {/* Consent */}
          <div className="bg-purple-50 rounded-2xl p-5 border-2 border-purple-100">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange}
                className="mt-0.5 w-4 h-4 accent-purple-700 flex-shrink-0" />
              <span className="text-xs text-gray-600 leading-relaxed">
                I understand that my report is anonymous and will be shared only with a verified support
                organisation in my state. I have read and accept the{' '}
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

          {/* Bottom actions */}
          <div className="space-y-3">
            <button onClick={handleSubmit} disabled={loading}
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

            <button onClick={handleSaveDraft}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white hover:bg-purple-50 text-purple-700 font-semibold text-sm border border-purple-200 transition-all">
              <Save className="w-4 h-4" />
              {draftSaved ? 'Draft Saved ✓' : 'Save as Draft, Continue Later'}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400">
            🔒 Encrypted and stored securely. No one can identify you from this report.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ReportPage