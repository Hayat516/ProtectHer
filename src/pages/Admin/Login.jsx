import { useState } from 'react'
import { Shield, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

function AdminLoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleLogin = async () => {
    setError('')
    if (!formData.email.trim()) return setError('Please enter your email.')
    if (!formData.password) return setError('Please enter your password.')
    setLoading(true)
    try {
      const { data, error: dbError } = await supabase
        .from('admin')
        .select('id, name, email, password_hash')
        .eq('email', formData.email.trim().toLowerCase())
        .single()

      if (dbError || !data) return setError('No admin account found with that email.')
      if (data.password_hash !== formData.password) return setError('Incorrect password.')

      sessionStorage.setItem('admin_id', data.id)
      sessionStorage.setItem('admin_name', data.name)
      navigate('/admin/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-6"
      style={{ background: 'linear-gradient(160deg, #FAF5FF 0%, #F3E8FF 50%, #EDE9FE 100%)' }}>
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="p-2 bg-purple-700 rounded-xl"><Shield className="w-6 h-6 text-white" /></div>
            <span className="text-2xl font-extrabold text-purple-700">ProtectHer</span>
          </a>
          <p className="text-xs text-gray-400">Admin Portal — Restricted Access</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-purple-100 px-7 py-8 space-y-5">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-1">Admin Login</h1>
            <p className="text-sm text-gray-400">Platform administration and NGO management.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="admin@protecther.ng"
              className="w-full bg-purple-50 border-2 border-purple-100 text-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all placeholder-gray-400" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password" value={formData.password} onChange={handleChange}
                placeholder="Your password"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full bg-purple-50 border-2 border-purple-100 text-gray-700 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all placeholder-gray-400" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border-2 border-red-100 text-red-700 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button onClick={handleLogin} disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 disabled:bg-purple-300 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:-translate-y-0.5 disabled:cursor-not-allowed">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
              : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>

          <p className="text-center text-xs text-gray-400">
            <a href="/" className="text-purple-600 hover:underline">← Back to Homepage</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage