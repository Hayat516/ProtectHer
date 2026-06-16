import { useState, useEffect } from 'react'
import {
  Shield, LogOut, CheckCircle, Clock, Users, FileText,
  X, Search, Eye, Menu, AlertCircle, ChevronDown, User,
  Trash2, Phone, Mail, MapPin, Building
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import emailjs from '@emailjs/browser'

const STATUS_LABELS = {
  submitted: { label: 'Submitted', color: 'text-slate-700 bg-slate-50 border-slate-200' },
  under_review: { label: 'Under Review', color: 'text-amber-800 bg-amber-50 border-amber-200' },
  assigned: { label: 'Assigned', color: 'text-violet-800 bg-violet-50 border-violet-200' },
  in_progress: { label: 'In Progress', color: 'text-blue-800 bg-blue-50 border-blue-200' },
  resolved: { label: 'Resolved', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
}

const NGO_STATUS = {
  pending: { label: 'Pending', color: 'text-amber-800 bg-amber-50 border-amber-200' },
  approved: { label: 'Approved', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
  rejected: { label: 'Rejected', color: 'text-red-800 bg-red-50 border-red-200' },
}

function AdminDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('ngos')
  const [reports, setReports] = useState([])
  const [ngos, setNgos] = useState([])
  const [deletionRequests, setDeletionRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [selectedReportLogs, setSelectedReportLogs] = useState([])
  const [selectedReportSignedUrl, setSelectedReportSignedUrl] = useState(null)
  const [selectedNGO, setSelectedNGO] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionModal, setActionModal] = useState(null)
  const [actionReason, setActionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  const adminName = sessionStorage.getItem('admin_name')
  const adminId = sessionStorage.getItem('admin_id')

  useEffect(() => {
    if (!adminId) { navigate('/admin/login'); return }
    fetchAll()
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ngos' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deletion_requests' }, fetchAll)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    const [{ data: r }, { data: n }, { data: d }] = await Promise.all([
      supabase.from('reports').select('*').order('created_at', { ascending: false }),
      supabase.from('ngos').select('*').order('created_at', { ascending: false }),
      supabase.from('deletion_requests').select('*').order('created_at', { ascending: false }),
    ])
    setReports(r || [])
    setNgos(n || [])
    setDeletionRequests(d || [])
    setLoading(false)
  }

  const openReportDetail = async (r) => {
    setSelectedReport(r)
    setSelectedReportSignedUrl(null)
    setSelectedReportLogs([])

    const { data: logs } = await supabase
      .from('case_status_logs').select('*')
      .eq('case_id', r.case_id).order('created_at', { ascending: true })
    setSelectedReportLogs(logs || [])

    if (r.evidence_file_url) {
      const parts = r.evidence_file_url.split('/evidence/')
      const fileName = parts[1]
      if (fileName) {
        const { data: urlData } = await supabase.storage
          .from('evidence').createSignedUrl(decodeURIComponent(fileName), 3600)
        setSelectedReportSignedUrl(urlData?.signedUrl || null)
      }
    }
  }

  const handleDeleteReport = async (caseId) => {
    if (!window.confirm(`Permanently delete case ${caseId}? This cannot be undone.`)) return
    await supabase.from('case_status_logs').delete().eq('case_id', caseId)
    await supabase.from('deletion_requests').delete().eq('case_id', caseId)
    await supabase.from('reports').delete().eq('case_id', caseId)
    setSelectedReport(null)
    fetchAll()
  }

  const handleApproveDeletion = async (req) => {
    // Delete report and all related data
    await supabase.from('case_status_logs').delete().eq('case_id', req.case_id)
    await supabase.from('deletion_requests').delete().eq('id', req.id)
    await supabase.from('reports').delete().eq('case_id', req.case_id)

    // Notify victim if email available
    if (req.victim_email) {
      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_NGO_APPROVAL_TEMPLATE,
          {
            to_email: req.victim_email,
            subject_line: 'Your ProtectHer Report Has Been Deleted',
            message_body:
              `Your request to delete case ${req.case_id} has been processed.\n\n` +
              `Your report and all associated data have been permanently removed from our system.\n\n` +
              `If you need support in the future, ProtectHer is always here for you.\n\n` +
              `— ProtectHer Admin`,
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        )
      } catch (e) { console.error('Deletion email failed:', e) }
    }
    fetchAll()
  }

  const handleRejectDeletion = async (req) => {
    await supabase.from('deletion_requests')
      .update({ status: 'rejected' }).eq('id', req.id)
    fetchAll()
  }

  const handleOpenAction = (ngo, type) => {
    setActionModal({ ngo, type })
    setActionReason('')
    setActionError('')
    setActionSuccess('')
  }

  const handleConfirmAction = async () => {
    if (actionModal.type === 'reject' && !actionReason.trim()) {
      return setActionError('Please provide a reason.')
    }
    setActionLoading(true)
    setActionError('')
    const newStatus = actionModal.type === 'approve' ? 'approved' : 'rejected'
    try {
      const { error: dbError } = await supabase
        .from('ngos').update({ status: newStatus }).eq('id', actionModal.ngo.id)
      if (dbError) throw dbError

      const templateParams = actionModal.type === 'approve'
        ? {
            to_email: actionModal.ngo.email,
            subject_line: 'Your ProtectHer NGO Application Has Been Approved',
            message_body:
              `Hello ${actionModal.ngo.name},\n\nYour organisation has been approved as a ProtectHer NGO partner.\n\n` +
              `Login here: ${window.location.origin}/ngo/login\n\nYour login email: ${actionModal.ngo.email}\n\n` +
              `— ProtectHer Admin`,
          }
        : {
            to_email: actionModal.ngo.email,
            subject_line: 'Update on Your ProtectHer NGO Application',
            message_body:
              `Hello ${actionModal.ngo.name},\n\nWe are unable to approve your application at this time.\n\n` +
              `Reason: ${actionReason.trim()}\n\n— ProtectHer Admin`,
          }

      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_NGO_APPROVAL_TEMPLATE,
          templateParams,
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        )
        setActionSuccess(
          actionModal.type === 'approve'
            ? `${actionModal.ngo.name} approved and notified.`
            : `${actionModal.ngo.name} rejected and notified.`
        )
      } catch (e) {
        setActionSuccess(`Status updated. Email failed — contact ${actionModal.ngo.email} manually.`)
      }
      await fetchAll()
    } catch (err) {
      setActionError('Something went wrong.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleLogout = () => { sessionStorage.clear(); navigate('/admin/login') }

  const filteredReports = reports.filter(r => {
    const matchSearch = !searchTerm ||
      r.case_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.incident_type?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const pendingNGOs = ngos.filter(n => n.status === 'pending').length
  const pendingDeletions = deletionRequests.filter(d => d.status === 'pending').length
  const stats = {
    total: reports.length,
    submitted: reports.filter(r => r.status === 'submitted').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    activeNGOs: ngos.filter(n => n.status === 'approved').length,
  }

  return (
    <div className="w-full min-h-screen" style={{ background: '#F4F2F8' }}>

      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-purple-700 rounded-lg"><Shield className="w-4 h-4 text-white" /></div>
              <div>
                <span className="text-sm font-extrabold text-purple-700 block leading-none">ProtectHer</span>
                <span className="text-xs text-gray-400">Admin Panel</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              {pendingNGOs > 0 && (
                <button onClick={() => setTab('ngos')}
                  className="flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-200 hover:bg-amber-100">
                  <AlertCircle className="w-3.5 h-3.5" /> {pendingNGOs} pending NGO
                </button>
              )}
              {pendingDeletions > 0 && (
                <button onClick={() => setTab('deletions')}
                  className="flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full border border-red-200 hover:bg-red-100">
                  <Trash2 className="w-3.5 h-3.5" /> {pendingDeletions} deletion request{pendingDeletions > 1 ? 's' : ''}
                </button>
              )}
              <span className="text-sm text-gray-500">{adminName}</span>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg font-semibold border border-red-100 transition-colors">
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
              <div className="px-3 py-1.5 text-xs text-gray-400">{adminName}</div>
              <button onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 rounded-lg">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Reports', value: stats.total, icon: <FileText className="w-4 h-4" />, accent: 'text-violet-600', border: 'border-violet-100' },
            { label: 'Awaiting Review', value: stats.submitted, icon: <Clock className="w-4 h-4" />, accent: 'text-amber-700', border: 'border-amber-100' },
            { label: 'Resolved', value: stats.resolved, icon: <CheckCircle className="w-4 h-4" />, accent: 'text-emerald-700', border: 'border-emerald-100' },
            { label: 'Active NGOs', value: stats.activeNGOs, icon: <Users className="w-4 h-4" />, accent: 'text-blue-700', border: 'border-blue-100' },
          ].map((s) => (
            <div key={s.label} className={`bg-white border ${s.border} rounded-2xl p-5 shadow-sm`}>
              <div className={`${s.accent} mb-3`}>{s.icon}</div>
              <div className="text-3xl font-extrabold text-gray-900 mb-0.5">{s.value}</div>
              <div className="text-xs font-medium text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 shadow-sm mb-5 w-fit flex-wrap">
          {[
            { key: 'ngos', label: 'NGO Management', badge: pendingNGOs > 0 ? pendingNGOs : null },
            { key: 'reports', label: 'Reports', badge: null },
            { key: 'deletions', label: 'Deletion Requests', badge: pendingDeletions > 0 ? pendingDeletions : null },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                tab === t.key ? 'bg-purple-700 text-white' : 'text-gray-500 hover:text-purple-700'
              }`}>
              {t.label}
              {t.badge && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  tab === t.key ? 'bg-white/30 text-white' : 'bg-red-100 text-red-700'
                }`}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-7 h-7 border-2 border-purple-200 border-t-purple-700 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading...</p>
          </div>

        ) : tab === 'reports' ? (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Case ID, state, type..."
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div className="relative">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-sm text-gray-600 font-medium focus:outline-none focus:ring-2 focus:ring-purple-400">
                  <option value="all">All Statuses</option>
                  {Object.entries(STATUS_LABELS).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <span className="text-xs text-gray-400 self-center">{filteredReports.length} reports</span>
            </div>

            <div className="space-y-2">
              {filteredReports.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No reports found</p>
                </div>
              ) : filteredReports.map((r) => {
                const s = STATUS_LABELS[r.status] || STATUS_LABELS['submitted']
                return (
                  <div key={r.case_id}
                    className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-purple-200 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-mono font-bold text-gray-900 text-sm">{r.case_id}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${s.color}`}>{s.label}</span>
                          {r.evidence_file_url && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">📎 Evidence</span>}
                          {r.ngo_accepted === false && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">NGO Declined</span>}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                          <span className="font-medium text-gray-600">{r.incident_type}</span>
                          <span>•</span><span>{r.state}{r.lga ? `, ${r.lga}` : ''}</span>
                          <span>•</span><span>{new Date(r.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        {r.assigned_ngo_name && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <User className="w-3 h-3 text-purple-400" />
                            <span className="text-xs text-purple-600 font-semibold">{r.assigned_ngo_name}</span>
                            {r.ngo_accepted === true && <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 rounded font-bold">Accepted</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => openReportDetail(r)}
                          className="flex items-center gap-1.5 text-xs text-purple-700 font-bold bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-lg border border-purple-100 transition-colors">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button onClick={() => handleDeleteReport(r.case_id)}
                          className="flex items-center gap-1 text-xs text-red-600 font-bold bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg border border-red-100 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>

        ) : tab === 'deletions' ? (
          <div className="space-y-3">
            {deletionRequests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Trash2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No deletion requests</p>
              </div>
            ) : deletionRequests.map((req) => (
              <div key={req.id}
                className={`bg-white rounded-2xl border p-5 ${req.status === 'pending' ? 'border-red-200 shadow-sm' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-mono font-bold text-gray-900 text-sm">{req.case_id}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        req.status === 'pending' ? 'text-red-700 bg-red-50 border-red-200' : 'text-gray-500 bg-gray-50 border-gray-200'
                      }`}>{req.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1"><strong>Reason:</strong> {req.reason || 'No reason provided'}</p>
                    {req.victim_email && <p className="text-xs text-gray-400"><strong>Email:</strong> {req.victim_email}</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(req.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  {req.status === 'pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleApproveDeletion(req)}
                        className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                        Delete Report
                      </button>
                      <button onClick={() => handleRejectDeletion(req)}
                        className="text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                        Reject Request
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        ) : (
          // NGOs tab
          <div className="space-y-2">
            {[...ngos].sort((a, b) => {
              const order = { pending: 0, approved: 1, rejected: 2 }
              return (order[a.status] ?? 3) - (order[b.status] ?? 3)
            }).map((ngo) => {
              const s = NGO_STATUS[ngo.status] || NGO_STATUS['pending']
              const activeCases = reports.filter(r => r.assigned_ngo_id === ngo.id && r.status !== 'resolved').length
              const resolvedCases = reports.filter(r => r.assigned_ngo_id === ngo.id && r.status === 'resolved').length

              return (
                <div key={ngo.id}
                  className={`bg-white rounded-2xl border p-4 md:p-5 transition-all ${ngo.status === 'pending' ? 'border-amber-200 shadow-sm' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-sm">{ngo.name}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${s.color}`}>{s.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-2">
                        <span>{ngo.state || ngo.states_covered}</span>
                        <span>•</span><span>{ngo.email}</span>
                        {ngo.phone && <><span>•</span><span>{ngo.phone}</span></>}
                        {ngo.specialization && <><span>•</span><span className="text-purple-600 font-medium">{ngo.specialization}</span></>}
                      </div>
                      {ngo.status === 'approved' && (
                        <div className="flex gap-4 text-xs">
                          <span className="text-violet-600 font-semibold">{activeCases} active</span>
                          <span className="text-emerald-600 font-semibold">{resolvedCases} resolved</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0 flex-wrap">
                      {/* View details button — always visible */}
                      <button onClick={() => setSelectedNGO(ngo)}
                        className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-lg border border-purple-100 transition-colors">
                        <Eye className="w-3.5 h-3.5 inline mr-1" />Details
                      </button>
                      {ngo.status === 'pending' && (
                        <>
                          <button onClick={() => handleOpenAction(ngo, 'approve')}
                            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
                            Approve
                          </button>
                          <button onClick={() => handleOpenAction(ngo, 'reject')}
                            className="text-xs font-bold bg-white hover:bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-200 transition-colors">
                            Reject
                          </button>
                        </>
                      )}
                      {ngo.status === 'approved' && (
                        <button onClick={() => handleOpenAction(ngo, 'reject')}
                          className="text-xs text-gray-400 hover:text-red-700 px-3 py-2 rounded-lg border border-gray-200 hover:border-red-200 font-semibold transition-colors">
                          Revoke
                        </button>
                      )}
                      {ngo.status === 'rejected' && (
                        <button onClick={() => handleOpenAction(ngo, 'approve')}
                          className="text-xs text-gray-400 hover:text-emerald-700 px-3 py-2 rounded-lg border border-gray-200 hover:border-emerald-200 font-semibold transition-colors">
                          Re-approve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* NGO Detail Modal */}
      {selectedNGO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(10,0,20,0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-extrabold text-gray-900">NGO Details</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedNGO.name}</p>
              </div>
              <button onClick={() => setSelectedNGO(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { icon: <Building className="w-4 h-4" />, label: 'Organisation', value: selectedNGO.name },
                { icon: <MapPin className="w-4 h-4" />, label: 'State', value: selectedNGO.state || selectedNGO.states_covered },
                { icon: <MapPin className="w-4 h-4" />, label: 'LGA', value: selectedNGO.lga || 'Not provided' },
                { icon: <MapPin className="w-4 h-4" />, label: 'Address', value: selectedNGO.address || 'Not provided' },
                { icon: <Mail className="w-4 h-4" />, label: 'Email', value: selectedNGO.email },
                { icon: <Phone className="w-4 h-4" />, label: 'Phone', value: selectedNGO.phone || 'Not provided' },
                { icon: <User className="w-4 h-4" />, label: 'Specialisation', value: selectedNGO.specialization || 'Not provided' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-purple-400 flex-shrink-0 mt-0.5">{item.icon}</div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                  </div>
                </div>
              ))}

              {selectedNGO.description && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">About</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedNGO.description}</p>
                </div>
              )}

              {selectedNGO.website && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Website</p>
                  <a href={selectedNGO.website} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-purple-700 font-semibold hover:underline">{selectedNGO.website}</a>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {selectedNGO.status === 'pending' && (
                <>
                  <button onClick={() => { setSelectedNGO(null); handleOpenAction(selectedNGO, 'approve') }}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors">
                    Approve
                  </button>
                  <button onClick={() => { setSelectedNGO(null); handleOpenAction(selectedNGO, 'reject') }}
                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors">
                    Reject
                  </button>
                </>
              )}
              {selectedNGO.status !== 'pending' && (
                <button onClick={() => setSelectedNGO(null)}
                  className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm">
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NGO Approve/Reject Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(10,0,20,0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-extrabold text-gray-900">
                  {actionModal.type === 'approve' ? 'Approve NGO' : 'Reject NGO'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{actionModal.ngo.name}</p>
              </div>
              <button onClick={() => setActionModal(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {actionSuccess ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-4">{actionModal.type === 'approve' ? '✅' : '📋'}</div>
                <p className="text-sm text-gray-600 mb-6">{actionSuccess}</p>
                <button onClick={() => setActionModal(null)}
                  className="bg-purple-700 text-white px-7 py-2.5 rounded-xl font-bold text-sm">Done</button>
              </div>
            ) : (
              <>
                {actionModal.type === 'reject' && (
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea value={actionReason} onChange={(e) => setActionReason(e.target.value)}
                      rows={3} placeholder="e.g. Unable to verify documentation..."
                      className="w-full bg-gray-50 border-2 border-gray-200 text-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none placeholder-gray-400" />
                  </div>
                )}
                {actionModal.type === 'approve' && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-5 text-sm text-emerald-800">
                    They will receive an email with login instructions immediately.
                  </div>
                )}
                {actionError && (
                  <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">{actionError}</div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setActionModal(null)}
                    className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm">Cancel</button>
                  <button onClick={handleConfirmAction} disabled={actionLoading}
                    className={`flex-1 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 ${
                      actionModal.type === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                    }`}>
                    {actionLoading
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
                      : actionModal.type === 'approve' ? 'Approve & Notify' : 'Reject & Notify'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(10,0,20,0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[88vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5 sticky top-0 bg-white pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-extrabold text-gray-900">Report Detail</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedReport.case_id}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDeleteReport(selectedReport.case_id)}
                  className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg font-bold border border-red-100 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                <button onClick={() => { setSelectedReport(null); setSelectedReportLogs([]); setSelectedReportSignedUrl(null) }}
                  className="p-2 hover:bg-gray-100 rounded-xl">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {[
                { label: 'Status', value: STATUS_LABELS[selectedReport.status]?.label || selectedReport.status },
                { label: 'Incident Type', value: selectedReport.incident_type || 'Not provided' },
                { label: 'State', value: selectedReport.state || 'Not provided' },
                { label: 'LGA / Area', value: selectedReport.lga || 'Not provided' },
                { label: 'Incident Date', value: selectedReport.incident_date ? new Date(selectedReport.incident_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not provided' },
                { label: 'Submitted', value: new Date(selectedReport.created_at).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                { label: 'Contact Email', value: selectedReport.contact_email || 'Anonymous' },
                { label: 'Evidence', value: selectedReport.evidence_file_url ? 'Photo attached' : 'None' },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                </div>
              ))}
            </div>

            {selectedReport.assigned_ngo_name && (
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 mb-5">
                <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">Assigned NGO</p>
                <p className="text-sm font-bold text-gray-900 mb-1">{selectedReport.assigned_ngo_name}</p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  {selectedReport.assigned_ngo_phone && <span>📞 {selectedReport.assigned_ngo_phone}</span>}
                  {selectedReport.assigned_ngo_email && <span>✉️ {selectedReport.assigned_ngo_email}</span>}
                </div>
                {selectedReport.ngo_accepted === true && <span className="inline-block mt-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">✓ Accepted</span>}
                {selectedReport.ngo_accepted === false && (
                  <div className="mt-2">
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">✗ Declined</span>
                    {selectedReport.ngo_rejection_reason && <p className="text-xs text-red-600 mt-1">Reason: {selectedReport.ngo_rejection_reason}</p>}
                  </div>
                )}
              </div>
            )}

            <div className="mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">
                {selectedReport.description}
              </p>
            </div>

            {selectedReport.evidence_file_url && (
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Evidence Photo</p>
                {selectedReportSignedUrl ? (
                  <img src={selectedReportSignedUrl} alt="Evidence"
                    className="w-full max-h-80 object-contain rounded-xl border border-gray-100 bg-gray-50" />
                ) : (
                  <div className="bg-gray-50 rounded-xl border p-8 text-center">
                    <div className="w-5 h-5 border-2 border-purple-200 border-t-purple-700 rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Loading evidence...</p>
                  </div>
                )}
              </div>
            )}

            {selectedReportLogs.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Case History</p>
                <div className="space-y-2">
                  {selectedReportLogs.map((log, i) => (
                    <div key={i} className="flex items-start gap-3 pb-2 border-b border-gray-50 last:border-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${log.old_status !== log.new_status ? 'bg-purple-100' : 'bg-gray-100'}`}>
                        <div className={`w-2 h-2 rounded-full ${log.old_status !== log.new_status ? 'bg-purple-600' : 'bg-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          {log.old_status !== log.new_status
                            ? <span className="text-xs font-bold text-gray-700">→ {STATUS_LABELS[log.new_status]?.label}</span>
                            : <span className="text-xs font-bold text-gray-500">Note</span>}
                          <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {log.note && <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2 border border-gray-100">{log.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard