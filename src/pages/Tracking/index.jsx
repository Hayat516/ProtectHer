import { useState } from 'react'
import {
  Shield, Search, AlertCircle, CheckCircle, Home,
  ArrowLeft, Menu, X, Lock, MessageSquare, Phone, Mail, MapPin
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

const STATUS_CONFIG = {
  submitted: { label: 'Report Received', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', emoji: '📩', desc: 'Your report has been received. A support organisation in your state will review it soon.' },
  under_review: { label: 'Being Reviewed', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', emoji: '👁️', desc: 'Someone is reviewing your report right now. You do not need to do anything.' },
  assigned: { label: 'NGO Assigned', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', emoji: '🤝', desc: 'A verified support organisation has taken on your case. Their details are shown below.' },
  in_progress: { label: 'Support In Progress', color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200', emoji: '💜', desc: 'Your case is actively being handled. Check for messages from your support team below.' },
  resolved: { label: 'Case Resolved', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', emoji: '🌸', desc: 'Your case has been resolved. We hope you received the support you needed.' },
}

const TIMELINE_STEPS = ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved']

function TrackingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const prefilled = location.state?.caseId || ''

  const [caseIdInput, setCaseIdInput] = useState(prefilled)
  const [report, setReport] = useState(null)
  const [ngoNotes, setNgoNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSearch = async () => {
    const trimmed = caseIdInput.trim().toUpperCase()
    if (!trimmed) return setError('Please enter your Case ID to continue.')
    if (!trimmed.startsWith('PTH-')) return setError('That does not look right. Your Case ID starts with PTH-')

    setError('')
    setLoading(true)
    setReport(null)
    setNgoNotes([])

    try {
      const { data, error: dbError } = await supabase
        .from('reports')
        .select('case_id, incident_type, state, lga, status, created_at, incident_date, assigned_ngo_name, assigned_ngo_phone, assigned_ngo_email, assigned_ngo_address, ngo_accepted')
        .eq('case_id', trimmed)
        .single()

      if (dbError || !data) {
        setError('We could not find a report with that Case ID. Please double-check and try again.')
      } else {
        setReport(data)
        const { data: logs } = await supabase
          .from('case_status_logs')
          .select('note, created_at, new_status')
          .eq('case_id', trimmed)
          .not('note', 'is', null)
          .order('created_at', { ascending: false })
        setNgoNotes(logs || [])
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const currentStepIndex = report ? TIMELINE_STEPS.indexOf(report.status) : -1
  const statusInfo = report ? (STATUS_CONFIG[report.status] || STATUS_CONFIG['submitted']) : null
  const showNGODetails = report && report.ngo_accepted === true && report.assigned_ngo_name

  return (
    <div className="w-full min-h-screen text-gray-800"
      style={{ background: 'linear-gradient(160deg, #FAF5FF 0%, #F3E8FF 40%, #EDE9FE 100%)' }}>

      <nav className="sticky top-0 z-50 bg-white border-b border-purple-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="flex items-center justify-between py-4">
            <a href="/" className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-700 rounded-lg"><Shield className="w-5 h-5 text-white" /></div>
              <span className="text-lg md:text-xl font-bold text-purple-700 tracking-tight">ProtectHer</span>
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

      <div className="max-w-xl mx-auto px-4 py-10 md:py-14">

        <button onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 mb-8 bg-white hover:bg-purple-50 px-4 py-2.5 rounded-xl border border-purple-200 shadow-sm font-semibold w-fit transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="mb-8">
          <span className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-2 block">Private & Secure</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 leading-tight">Check in on your case</h1>
          <p className="text-gray-500 text-sm leading-relaxed">Enter your Case ID. No login needed, no name required.</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-3xl shadow-xl border border-purple-100 px-5 sm:px-7 py-7 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <label className="text-sm font-bold text-gray-800">Your Case ID</label>
          </div>
          <p className="text-xs text-gray-400 mb-4 ml-6">Looks like this: PTH-26-ABCXYZ</p>
          <div className="flex gap-2 flex-col sm:flex-row">
            <input type="text" value={caseIdInput}
              onChange={(e) => setCaseIdInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="PTH-26-XXXXXX"
              className="flex-1 bg-purple-50 border-2 border-purple-100 text-gray-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all placeholder-gray-300 uppercase" />
            <button onClick={handleSearch} disabled={loading}
              className="flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 disabled:bg-purple-300 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex-shrink-0">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Search className="w-4 h-4" /> Check</>}
            </button>
          </div>
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 mt-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {report && statusInfo && (
          <div className="space-y-4">

            {/* Status */}
            <div className={`${statusInfo.bg} border-2 ${statusInfo.border} rounded-3xl px-6 py-7`}>
              <div className="text-4xl mb-4">{statusInfo.emoji}</div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Current Status</p>
              <p className={`text-xl font-extrabold ${statusInfo.color} mb-3`}>{statusInfo.label}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{statusInfo.desc}</p>
            </div>

            {/* NGO Details — shown when case is assigned and NGO accepted */}
            {showNGODetails && (
              <div className="bg-white rounded-2xl border-2 border-purple-200 shadow-sm px-5 py-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">
                    Your Support Organisation
                  </p>
                </div>
                <p className="text-base font-extrabold text-gray-900 mb-3">{report.assigned_ngo_name}</p>
                <div className="space-y-2.5">
                  {report.assigned_ngo_phone && (
                    <a href={`tel:${report.assigned_ngo_phone.replace(/\D/g, '')}`}
                      className="flex items-center gap-3 text-sm text-purple-700 hover:text-purple-900 font-semibold group">
                      <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                        <Phone className="w-3.5 h-3.5 text-purple-600" />
                      </div>
                      {report.assigned_ngo_phone}
                    </a>
                  )}
                  {report.assigned_ngo_email && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      {report.assigned_ngo_email}
                    </div>
                  )}
                  {report.assigned_ngo_address && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      {report.assigned_ngo_address}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                  Only contact them when you feel safe to do so. Use the Quick Exit button above if needed.
                </p>
              </div>
            )}

            {/* Case summary */}
            <div className="bg-white rounded-2xl border border-purple-100 shadow-sm px-5 py-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Your Report</p>
              <div className="space-y-3">
                {[
                  { label: 'Case ID', value: report.case_id, mono: true },
                  { label: 'Type of Incident', value: report.incident_type },
                  { label: 'Location', value: report.state + (report.lga ? `, ${report.lga}` : '') },
                  { label: 'Date Submitted', value: new Date(report.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  report.incident_date && { label: 'Date of Incident', value: new Date(report.incident_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) },
                ].filter(Boolean).map((item) => (
                  <div key={item.label} className="flex justify-between items-start gap-4 py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-400 font-medium flex-shrink-0">{item.label}</span>
                    <span className={`text-sm text-gray-800 font-semibold text-right ${item.mono ? 'font-mono' : ''}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-purple-100 shadow-sm px-5 py-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Progress</p>
              <div className="space-y-4">
                {TIMELINE_STEPS.map((step, index) => {
                  const stepInfo = STATUS_CONFIG[step]
                  const isDone = index <= currentStepIndex
                  const isCurrent = index === currentStepIndex
                  return (
                    <div key={step} className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isDone ? 'bg-purple-700' : 'bg-gray-100'}`}>
                        {isDone ? <CheckCircle className="w-4 h-4 text-white" /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                      </div>
                      <div className="flex-1 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-sm font-bold ${isDone ? 'text-gray-900' : 'text-gray-300'}`}>{stepInfo.label}</p>
                          {isCurrent && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">You are here</span>}
                        </div>
                        <p className={`text-xs mt-0.5 leading-relaxed ${isDone ? 'text-gray-500' : 'text-gray-300'}`}>{stepInfo.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* NGO Messages */}
            {ngoNotes.length > 0 && (
              <div className="bg-white rounded-2xl border border-purple-200 shadow-sm px-5 py-5">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">Messages from Your Support Team</p>
                </div>
                <div className="space-y-3">
                  {ngoNotes.map((n, i) => (
                    <div key={i} className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                      <p className="text-sm text-gray-800 leading-relaxed mb-2">{n.note}</p>
                      <p className="text-xs text-gray-400">{new Date(n.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-center text-xs text-gray-400 pb-4">
              Need support now?{' '}
              <button onClick={() => navigate('/get-help')} className="text-purple-600 font-bold hover:underline">
                Get Help
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackingPage