import { useState, useEffect } from 'react'
import {
  Shield, LogOut, CheckCircle, Clock, AlertCircle, FileText,
  Menu, X, User, Eye, MessageSquare, ChevronRight, ArrowLeft,
  ThumbsUp, ThumbsDown, Trash2, Activity
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

const STATUS_LABELS = {
  submitted: { label: 'Submitted', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  under_review: { label: 'Under Review', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  assigned: { label: 'Assigned', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  in_progress: { label: 'In Progress', color: 'text-violet-700 bg-violet-50 border-violet-200' },
  resolved: { label: 'Resolved', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
}

const NEXT_STATUS = {
  submitted: 'under_review',
  under_review: 'assigned',
  assigned: 'in_progress',
  in_progress: 'resolved',
}

const STATUS_STEPS = ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved']

function NGODashboardPage() {
  const navigate = useNavigate()
  const [view, setView] = useState('list')
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [selectedCase, setSelectedCase] = useState(null)
  const [caseLogs, setCaseLogs] = useState([])
  const [evidenceUrl, setEvidenceUrl] = useState(null)
  const [note, setNote] = useState('')
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')

  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [declineReason, setDeclineReason] = useState('')

  const [showDeletionForm, setShowDeletionForm] = useState(false)
  const [deletionReason, setDeletionReason] = useState('')
  const [deletionSubmitting, setDeletionSubmitting] = useState(false)
  const [deletionSuccess, setDeletionSuccess] = useState(false)

  const ngoId = sessionStorage.getItem('ngo_id')
  const ngoName = sessionStorage.getItem('ngo_name')
  const ngoState = sessionStorage.getItem('ngo_state')

  useEffect(() => {
    if (!ngoId) { navigate('/ngo/login'); return }
    fetchCases()
    const channel = supabase
      .channel('ngo-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, fetchCases)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const fetchCases = async () => {
    setLoading(true)
    const state = sessionStorage.getItem('ngo_state')
    if (!state || state === 'undefined' || state === 'null') {
      setCases([])
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('state', state)
      .order('created_at', { ascending: false })
    if (!error) setCases(data || [])
    else console.error('Fetch error:', error)
    setLoading(false)
  }

  const openCase = async (c) => {
    setSelectedCase(c)
    setView('detail')
    setNote('')
    setUpdateError('')
    setEvidenceUrl(null)
    setDeclineReason('')
    setShowDeletionForm(false)
    setDeletionSuccess(false)
    setDeletionReason('')

    const { data: logs, error: logsError } = await supabase
      .from('case_status_logs')
      .select('*')
      .eq('case_id', c.case_id)
      .order('created_at', { ascending: true })
    if (logsError) console.error('Logs error:', logsError)
    setCaseLogs(logs || [])

    if (c.evidence_file_url) {
      setEvidenceUrl(c.evidence_file_url)
    }
  }

  const refreshDetail = async (caseId) => {
    const { data } = await supabase.from('reports').select('*').eq('case_id', caseId).single()
    if (data) setSelectedCase(data)
    const { data: logs } = await supabase
      .from('case_status_logs').select('*')
      .eq('case_id', caseId).order('created_at', { ascending: true })
    setCaseLogs(logs || [])
    fetchCases()
  }

  const insertLog = async (caseId, oldStatus, newStatus, noteText) => {
    const { error } = await supabase.from('case_status_logs').insert([{
      case_id: caseId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: ngoId,
      note: noteText || null,
    }])
    if (error) throw new Error(error.message)
  }

  const handleAddNoteOnly = async () => {
    if (!note.trim()) return
    setUpdating(true)
    setUpdateError('')
    try {
      await insertLog(selectedCase.case_id, selectedCase.status, selectedCase.status, note.trim())
      setNote('')
      await refreshDetail(selectedCase.case_id)
    } catch (err) {
      setUpdateError(`Failed to save note: ${err.message}`)
    }
    setUpdating(false)
  }

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true)
    setUpdateError('')
    try {
      const { error } = await supabase
        .from('reports').update({ status: newStatus }).eq('case_id', selectedCase.case_id)
      if (error) throw new Error(error.message)
      await insertLog(selectedCase.case_id, selectedCase.status, newStatus, note.trim() || null)
      setNote('')
      await refreshDetail(selectedCase.case_id)
    } catch (err) {
      setUpdateError(`Failed to update: ${err.message}`)
    }
    setUpdating(false)
  }

  const handleAcceptCase = async () => {
    setUpdating(true)
    setUpdateError('')
    try {
      const { error } = await supabase.from('reports').update({
        assigned_ngo_id: ngoId,
        assigned_ngo_name: ngoName,
        assigned_ngo_phone: sessionStorage.getItem('ngo_phone') || null,
        assigned_ngo_email: sessionStorage.getItem('ngo_email') || null,
        assigned_ngo_address: sessionStorage.getItem('ngo_address') || null,
        ngo_accepted: true,
        status: 'assigned',
      }).eq('case_id', selectedCase.case_id)
      if (error) throw new Error(error.message)
      await insertLog(selectedCase.case_id, selectedCase.status, 'assigned', `Case accepted by ${ngoName}.`)
      await refreshDetail(selectedCase.case_id)
    } catch (err) {
      setUpdateError(`Failed to accept: ${err.message}`)
    }
    setUpdating(false)
  }

  const handleDeclineCase = async () => {
    if (!declineReason.trim()) return
    setUpdating(true)
    try {
      const { error } = await supabase.from('reports').update({
        ngo_accepted: false,
        ngo_rejection_reason: declineReason.trim(),
      }).eq('case_id', selectedCase.case_id)
      if (error) throw new Error(error.message)
      await insertLog(selectedCase.case_id, selectedCase.status, selectedCase.status,
        `Case declined by ${ngoName}. Reason: ${declineReason.trim()}`)
      setDeclineReason('')
      setShowDeclineModal(false)
      await refreshDetail(selectedCase.case_id)
    } catch (err) {
      setUpdateError(`Decline failed: ${err.message}`)
    }
    setUpdating(false)
  }

  const handleRequestDeletion = async () => {
    if (!deletionReason.trim()) return
    setDeletionSubmitting(true)
    const { error } = await supabase.from('deletion_requests').insert([{
      case_id: selectedCase.case_id,
      reason: deletionReason.trim(),
      requested_by: 'victim_via_ngo',
      status: 'pending',
      victim_email: selectedCase.contact_email || null,
    }])
    if (!error) {
      setDeletionSuccess(true)
      setDeletionReason('')
      setShowDeletionForm(false)
    } else {
      console.error('Deletion request error:', error)
    }
    setDeletionSubmitting(false)
  }

  const handleLogout = () => { sessionStorage.clear(); navigate('/ngo/login') }

  const counts = {
    all: cases.length,
    submitted: cases.filter(c => c.status === 'submitted').length,
    under_review: cases.filter(c => c.status === 'under_review').length,
    assigned: cases.filter(c => c.status === 'assigned').length,
    in_progress: cases.filter(c => c.status === 'in_progress').length,
    resolved: cases.filter(c => c.status === 'resolved').length,
  }
  const filtered = filter === 'all' ? cases : cases.filter(c => c.status === filter)

  // =================== DETAIL VIEW ===================
  if (view === 'detail' && selectedCase) {
    const s = STATUS_LABELS[selectedCase.status] || STATUS_LABELS['submitted']
    const nextStatus = NEXT_STATUS[selectedCase.status]
    const currentStepIndex = STATUS_STEPS.indexOf(selectedCase.status)
    const isAccepted = selectedCase.ngo_accepted === true
    const isDeclined = selectedCase.ngo_accepted === false
    const isPending = selectedCase.ngo_accepted === null || selectedCase.ngo_accepted === undefined

    return (
      <div className="w-full min-h-screen" style={{ background: '#F4F2F8' }}>
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-purple-700 rounded-lg"><Shield className="w-4 h-4 text-white" /></div>
                <div>
                  <span className="text-sm font-extrabold text-purple-700 block leading-none">ProtectHer</span>
                  <span className="text-xs text-gray-400">NGO Portal</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setView('list'); setSelectedCase(null) }}
                  className="flex items-center gap-1.5 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg font-semibold border border-purple-200 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> All Cases
                </button>
                <a href="https://google.com" target="_blank" rel="noopener noreferrer"
                  className="text-xs bg-red-600 text-white px-3 py-2 rounded-lg font-bold"> Exit</a>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
            <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
              <div>
                <p className="text-xs text-gray-400 mb-1">Case ID</p>
                <p className="font-mono font-extrabold text-gray-900 text-lg tracking-wider">{selectedCase.case_id}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Submitted {new Date(selectedCase.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-bold px-4 py-2 rounded-full border ${s.color}`}>{s.label}</span>
                {isAccepted && <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-bold border border-emerald-200">✓ Accepted</span>}
                {isDeclined && <span className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-full font-bold border border-red-200">✗ Declined</span>}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs text-gray-400 mb-2">Case Progress</p>
              <div className="flex items-center gap-0">
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`h-1.5 flex-1 rounded-full ${i <= currentStepIndex ? 'bg-purple-600' : 'bg-gray-100'}`} />
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${i < currentStepIndex ? 'bg-purple-600' : i === currentStepIndex ? 'bg-purple-600 ring-2 ring-purple-200' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${currentStepIndex === STATUS_STEPS.length - 1 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-gray-400">Submitted</span>
                <span className="text-xs text-gray-400">Resolved</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Incident Type', value: selectedCase.incident_type || 'Not provided' },
                { label: 'State', value: selectedCase.state || 'Not provided' },
                { label: 'Area / LGA', value: selectedCase.lga || 'Not specified' },
                { label: 'Date of Incident', value: selectedCase.incident_date ? new Date(selectedCase.incident_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not specified' },
                { label: 'Contact Email', value: selectedCase.contact_email || 'Anonymous — no email', warn: !selectedCase.contact_email },
                { label: 'Evidence Photo', value: selectedCase.evidence_file_url ? 'Photo attached — see below' : 'None provided' },
              ].map((item) => (
                <div key={item.label} className={`rounded-xl p-3 border ${item.warn ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-gray-100'}`}>
                  <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                  <p className={`text-sm font-semibold ${item.warn ? 'text-amber-700' : 'text-gray-800'}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {!selectedCase.contact_email && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-sm font-bold text-amber-800 mb-1">This victim is anonymous</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                They did not provide an email. You cannot contact them directly.
                Any note you save below will be visible to them when they check their Case ID on the tracking page.
              </p>
            </div>
          )}

          {isPending && selectedCase.status !== 'resolved' && (
            <div className="bg-white rounded-2xl border border-purple-200 shadow-sm p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Do You Accept This Case?</p>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Review the details above. If your organisation can support this survivor, accept the case.
                If not, decline with a reason so admin can make other arrangements.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleAcceptCase} disabled={updating}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm disabled:opacity-50 transition-all">
                  <ThumbsUp className="w-4 h-4" /> Accept This Case
                </button>
                <button onClick={() => setShowDeclineModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white hover:bg-red-50 text-red-700 font-bold text-sm border border-red-200 transition-all">
                  <ThumbsDown className="w-4 h-4" /> Decline This Case
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">What They Shared</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{selectedCase.description}</p>
          </div>

          {selectedCase.evidence_file_url && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Evidence Photo</p>
              {evidenceUrl ? (
                <>
                  <img src={evidenceUrl} alt="Evidence submitted with report"
                    className="w-full max-h-96 object-contain rounded-xl border border-gray-100 bg-gray-50"
                    onError={(e) => { e.target.style.display = 'none' }} />
                  <p className="text-xs text-gray-400 mt-2">Handle with full confidentiality.</p>
                </>
              ) : (
                <div className="bg-gray-50 rounded-xl border p-8 text-center">
                  <div className="w-5 h-5 border-2 border-purple-200 border-t-purple-700 rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Loading photo...</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Case History</p>
              <span className="text-xs text-gray-400">{caseLogs.length} entr{caseLogs.length !== 1 ? 'ies' : 'y'}</span>
            </div>
            {caseLogs.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No actions recorded yet.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {caseLogs.map((log, i) => {
                  const isStatusChange = log.old_status !== log.new_status
                  return (
                    <div key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isStatusChange ? 'bg-purple-700' : 'bg-gray-100'}`}>
                        {isStatusChange
                          ? <CheckCircle className="w-3.5 h-3.5 text-white" />
                          : <MessageSquare className="w-3.5 h-3.5 text-gray-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {isStatusChange
                            ? <span className="text-xs font-bold text-gray-700">Moved to <span className={`px-1.5 py-0.5 rounded border text-xs ${STATUS_LABELS[log.new_status]?.color}`}>{STATUS_LABELS[log.new_status]?.label}</span></span>
                            : <span className="text-xs font-bold text-gray-500">Note added</span>}
                          <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {log.note && <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2.5 border border-gray-100 leading-relaxed">{log.note}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-5 md:p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Take Action</p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Document your action <span className="text-gray-400 font-normal">(recommended)</span>
              </label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4}
                placeholder={!selectedCase.contact_email
                  ? 'This victim is anonymous. Notes here appear on their tracking page.\n\nE.g. "We have reviewed your case. If safe, visit us at [address] or call [number]..."'
                  : 'E.g. Contacted survivor, referred to legal team, follow-up scheduled...'}
                className="w-full bg-gray-50 border-2 border-gray-200 focus:border-purple-400 text-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none placeholder-gray-400 leading-relaxed transition-all" />
              {!selectedCase.contact_email && (
                <p className="text-xs text-amber-700 mt-1.5 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  💬 Notes here are visible to the victim on the tracking page.
                </p>
              )}
            </div>
            {updateError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{updateError}</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleAddNoteOnly} disabled={updating || !note.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <MessageSquare className="w-4 h-4" /> Save Note Only
              </button>
              {nextStatus && selectedCase.status !== 'resolved' && (
                <button onClick={() => handleUpdateStatus(nextStatus)} disabled={updating}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm transition-all shadow-lg disabled:opacity-50">
                  {updating
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</>
                    : <>Move to {STATUS_LABELS[nextStatus]?.label} <ChevronRight className="w-4 h-4" /></>}
                </button>
              )}
            </div>
            {selectedCase.status === 'resolved' && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                <p className="text-sm font-bold text-emerald-800 mb-1">🌸 This case is resolved</p>
                <p className="text-xs text-emerald-700">You can still add notes above.</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Deletion Request</p>
            {deletionSuccess ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                <p className="text-sm font-bold text-emerald-800">Deletion request submitted ✓</p>
                <p className="text-xs text-emerald-700 mt-1">Admin will permanently delete all data for this case.</p>
              </div>
            ) : showDeletionForm ? (
              <div>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                  Please document the victim's reason. Admin will review and permanently remove all data.
                </p>
                <textarea value={deletionReason} onChange={(e) => setDeletionReason(e.target.value)}
                  rows={3} placeholder="Reason the victim wants their report deleted..."
                  className="w-full bg-gray-50 border-2 border-gray-200 text-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none placeholder-gray-400 mb-3" />
                <div className="flex gap-3">
                  <button onClick={() => setShowDeletionForm(false)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm">Cancel</button>
                  <button onClick={handleRequestDeletion} disabled={deletionSubmitting || !deletionReason.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                    {deletionSubmitting
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
                      : 'Submit to Admin'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                  If the victim has requested their report be deleted, submit the request here.
                  Admin will permanently delete all case data. If the victim provided an email, they will be notified.
                </p>
                <button onClick={() => setShowDeletionForm(true)}
                  className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl border border-red-200 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Request Case Deletion
                </button>
              </div>
            )}
          </div>
        </div>

        {showDeclineModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(10,0,20,0.75)', backdropFilter: 'blur(4px)' }}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-extrabold text-gray-900">Decline This Case</h3>
                <button onClick={() => setShowDeclineModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                Please provide a reason. Admin will be notified so another arrangement can be made for this survivor.
              </p>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Reason <span className="text-red-500">*</span></label>
              <textarea value={declineReason} onChange={(e) => setDeclineReason(e.target.value)}
                rows={3} placeholder="e.g. Outside our specialisation, at full capacity..."
                className="w-full bg-gray-50 border-2 border-gray-200 text-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none placeholder-gray-400 mb-5" />
              <div className="flex gap-3">
                <button onClick={() => setShowDeclineModal(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm">Cancel</button>
                <button onClick={handleDeclineCase} disabled={updating || !declineReason.trim()}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {updating
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
                    : 'Confirm Decline'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // =================== LIST VIEW ===================
  return (
    <div className="w-full min-h-screen" style={{ background: '#F4F2F8' }}>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-purple-700 rounded-lg"><Shield className="w-4 h-4 text-white" /></div>
              <div>
                <span className="text-sm font-extrabold text-purple-700 block leading-none">ProtectHer</span>
                <span className="text-xs text-gray-400">NGO Portal</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 text-purple-400" />
                <span className="font-semibold">{ngoName}</span>
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg font-semibold border border-red-100 transition-colors">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-gray-100 space-y-1">
              <div className="px-3 py-2 text-sm font-semibold text-gray-700">{ngoName}</div>
              <button onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-extrabold text-gray-900 mb-1">Case Dashboard</h1>
          <p className="text-sm text-gray-400">
            Reports from <span className="font-semibold text-gray-700">{ngoState || '—'}</span>
          </p>
          {(!ngoState || ngoState === 'undefined') && (
            <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
              <p className="text-xs text-red-700 font-semibold">Session error — please log out and back in.</p>
              <button onClick={() => { sessionStorage.clear(); navigate('/ngo/login') }}
                className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold flex-shrink-0">Log out</button>
            </div>
          )}
        </div>

        {/* FIXED: 5 cards, all consistent with filter pills */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { key: 'submitted',    label: 'New Reports',  icon: <AlertCircle className="w-4 h-4" />, color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-100'    },
            { key: 'under_review', label: 'Under Review', icon: <Clock className="w-4 h-4" />,       color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-100'   },
            { key: 'assigned',     label: 'Assigned',     icon: <CheckCircle className="w-4 h-4" />, color: 'text-purple-700',  bg: 'bg-purple-50',  border: 'border-purple-100'  },
            { key: 'in_progress',  label: 'In Progress',  icon: <Activity className="w-4 h-4" />,    color: 'text-violet-700',  bg: 'bg-violet-50',  border: 'border-violet-100'  },
            { key: 'resolved',     label: 'Resolved',     icon: <FileText className="w-4 h-4" />,    color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          ].map((s) => (
            <button key={s.key} onClick={() => setFilter(s.key)}
              className={`${s.bg} border ${s.border} rounded-2xl p-4 text-left hover:shadow-md transition-all ${filter === s.key ? 'ring-2 ring-purple-400 ring-offset-1' : ''}`}>
              <div className={`${s.color} mb-2`}>{s.icon}</div>
              <div className={`text-2xl font-extrabold ${s.color}`}>{counts[s.key]}</div>
              <div className="text-xs font-medium text-gray-500 mt-0.5">{s.label}</div>
            </button>
          ))}
        </div>

        {/* Filter pills — unchanged */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {['all', 'submitted', 'under_review', 'assigned', 'in_progress', 'resolved'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs font-bold px-4 py-2 rounded-full border transition-all ${
                filter === f ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-gray-500 border-gray-200 hover:border-purple-300'
              }`}>
              {f === 'all' ? `All (${counts.all})` : STATUS_LABELS[f]?.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-7 h-7 border-2 border-purple-200 border-t-purple-700 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading cases...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <CheckCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500">No cases in this category</p>
            <p className="text-xs text-gray-400 mt-1">
              {filter !== 'all' ? 'Try a different filter.' : `No reports from ${ngoState} yet.`}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => {
              const s = STATUS_LABELS[c.status] || STATUS_LABELS['submitted']
              return (
                <div key={c.case_id} onClick={() => openCase(c)}
                  className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-mono font-bold text-gray-900 text-sm">{c.case_id}</span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${s.color}`}>{s.label}</span>
                        {c.evidence_file_url && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">📎 Evidence</span>}
                        {!c.contact_email && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Anonymous</span>}
                        {c.ngo_accepted === false && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">Declined</span>}
                        {c.ngo_accepted === true && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Accepted</span>}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                        <span className="font-medium text-gray-600">{c.incident_type}</span>
                        <span>•</span>
                        <span>{c.state}{c.lga ? `, ${c.lga}` : ''}</span>
                        <span>•</span>
                        <span>{new Date(c.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      {c.description && <p className="text-xs text-gray-500 mt-2 line-clamp-1">{c.description}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-purple-700 font-bold bg-purple-50 group-hover:bg-purple-100 px-3 py-2 rounded-lg border border-purple-100 flex-shrink-0">
                      <Eye className="w-3.5 h-3.5" /> View
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default NGODashboardPage