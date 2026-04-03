import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import useAuthStore from './store/authStore'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Header from './components/layout/Header'
import Spinner from './components/ui/Spinner'

import Home            from './pages/Home'
import Login           from './pages/Login'
import Exam            from './pages/Exam'
import Study           from './pages/Study'
import Results         from './pages/Results'
import AdminDashboard  from './pages/admin/AdminDashboard'
import Upload          from './pages/admin/Upload'
import UploadPreview   from './pages/admin/UploadPreview'
import Tests           from './pages/admin/Tests'
import Users           from './pages/admin/Users'

export default function App() {
  const loading = useAuthStore(s => s.loading)

  useEffect(() => {
    // No cleanup — App never unmounts, and returning unsubscribe
    // breaks StrictMode (kills the auth listener on dev double-mount)
    useAuthStore.getState().init()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Authenticated */}
        <Route path="/" element={
          <ProtectedRoute><Home /></ProtectedRoute>
        } />
        <Route path="/exam/:testId" element={
          <ProtectedRoute><Exam /></ProtectedRoute>
        } />
        <Route path="/study/:testId" element={
          <ProtectedRoute><Study /></ProtectedRoute>
        } />
        <Route path="/results/:sessionId" element={
          <ProtectedRoute><Results /></ProtectedRoute>
        } />

        {/* Admin only */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/upload" element={
          <ProtectedRoute adminOnly><Upload /></ProtectedRoute>
        } />
        <Route path="/admin/upload/preview" element={
          <ProtectedRoute adminOnly><UploadPreview /></ProtectedRoute>
        } />
        <Route path="/admin/tests" element={
          <ProtectedRoute adminOnly><Tests /></ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute adminOnly><Users /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
