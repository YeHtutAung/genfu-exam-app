import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import useAuthStore from './store/authStore'
import useTheme from './hooks/useTheme'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Spinner from './components/ui/Spinner'
import { ToastProvider } from './components/ui/Toast'
import { LANGUAGES, useI18n, useLanguageStore } from './lib/i18n'

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Exam = lazy(() => import('./pages/Exam'))
const Study = lazy(() => import('./pages/Study'))
const StudySummary = lazy(() => import('./pages/StudySummary'))
const Results = lazy(() => import('./pages/Results'))
const Tips = lazy(() => import('./pages/Tips'))
const Bookmarks = lazy(() => import('./pages/Bookmarks'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const Upload = lazy(() => import('./pages/admin/Upload'))
const UploadPreview = lazy(() => import('./pages/admin/UploadPreview'))
const Tests = lazy(() => import('./pages/admin/Tests'))
const Users = lazy(() => import('./pages/admin/Users'))
const QuestionImages = lazy(() => import('./pages/admin/QuestionImages'))

function AppRoutes({ theme, toggleTheme }) {
  const location = useLocation()
  const { t } = useI18n()

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[90] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        {t('common.skipToContent')}
      </a>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <div id="main-content" tabIndex={-1}>
        <Suspense fallback={<RouteSpinner />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Public */}
              <Route path="/login" element={<Login />} />

            {/* Authenticated */}
            <Route path="/" element={
              <ProtectedRoute><Home /></ProtectedRoute>
            } />
            <Route path="/exam/:testId" element={
              <ProtectedRoute><Exam /></ProtectedRoute>
            } />
            <Route path="/simulation/:testId" element={
              <ProtectedRoute><Exam /></ProtectedRoute>
            } />
            <Route path="/study/:testId" element={
              <ProtectedRoute><Study /></ProtectedRoute>
            } />
            <Route path="/study/:testId/summary/:sessionId" element={
              <ProtectedRoute><StudySummary /></ProtectedRoute>
            } />
            <Route path="/results/:sessionId" element={
              <ProtectedRoute><Results /></ProtectedRoute>
            } />
            <Route path="/tips" element={
              <ProtectedRoute><Tips /></ProtectedRoute>
            } />
            <Route path="/bookmarks" element={
              <ProtectedRoute><Bookmarks /></ProtectedRoute>
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
            <Route path="/admin/images" element={
              <ProtectedRoute adminOnly><QuestionImages /></ProtectedRoute>
            } />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </div>
      <Footer theme={theme} toggleTheme={toggleTheme} />
    </>
  )
}

function RouteSpinner() {
  return (
    <div className="flex justify-center py-20">
      <Spinner />
    </div>
  )
}

export default function App() {
  const loading = useAuthStore(s => s.loading)
  const language = useLanguageStore(s => s.language)
  const { theme, toggle: toggleTheme } = useTheme()

  useEffect(() => {
    useAuthStore.getState().init()
  }, [])

  useEffect(() => {
    const option = LANGUAGES.find(item => item.code === language)
    document.documentElement.lang = option?.htmlLang ?? 'ja'
  }, [language])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <Spinner />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes theme={theme} toggleTheme={toggleTheme} />
      </ToastProvider>
    </BrowserRouter>
  )
}
