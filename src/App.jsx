import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/Home/index.jsx'
import ReportPage from './pages/Report/index.jsx'
import CaseConfirmationPage from './pages/CaseConfirmationPage/index.jsx'
import TrackingPage from './pages/Tracking/index.jsx'
import GetHelpPage from './pages/GetHelp/index.jsx'
import CounsellingPage from './pages/Counselling/index.jsx'
import FindNGOPage from './pages/FindNGO/index.jsx'
import PrivacyPolicyPage from './pages/PrivacyPolicy/index.jsx'
import NGORegisterPage from './pages/NGO/Register.jsx'
import NGOLoginPage from './pages/NGO/Login.jsx'
import NGODashboardPage from './pages/NGO/index.jsx'
import AdminLoginPage from './pages/Admin/Login.jsx'
import AdminDashboard from './pages/Admin/Dashboard.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/report" element={<ReportPage />} />
      <Route path="/case-confirmation" element={<CaseConfirmationPage />} />
      <Route path="/tracking" element={<TrackingPage />} />
      <Route path="/get-help" element={<GetHelpPage />} />
      <Route path="/counselling" element={<CounsellingPage />} />
      <Route path="/find-ngo" element={<FindNGOPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/ngo/register" element={<NGORegisterPage />} />
      <Route path="/ngo/login" element={<NGOLoginPage />} />
      <Route path="/ngo/dashboard" element={<NGODashboardPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  )
}

export default App