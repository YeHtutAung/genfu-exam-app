import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import Spinner from '../components/ui/Spinner'
import PageTransition from '../components/ui/PageTransition'
import Button from '../components/ui/Button'
import LanguageSelect from '../components/ui/LanguageSelect'
import BrandMark from '../components/ui/BrandMark'
import { useI18n } from '../lib/i18n'

const registerCopy = {
  ja: { confirm: 'パスワード（確認）', mismatch: 'パスワードが一致しません', google: 'Googleで登録' },
  en: { confirm: 'Confirm password', mismatch: 'Passwords must match', google: 'Sign up with Google' },
  my: { confirm: 'စကားဝှက် အတည်ပြုရန်', mismatch: 'စကားဝှက်များ တူညီရပါမည်', google: 'Google ဖြင့် စာရင်းသွင်းရန်' },
}

export default function Login() {
  const { t, language } = useI18n()
  const copy = registerCopy[language] || registerCopy.ja
  const user = useAuthStore(s => s.user)
  const authError = useAuthStore(s => s.error)
  const signInWithEmail = useAuthStore(s => s.signInWithEmail)
  const signInWithGoogle = useAuthStore(s => s.signInWithGoogle)
  const signUp = useAuthStore(s => s.signUp)
  const resetPassword = useAuthStore(s => s.resetPassword)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [mode, setMode] = useState('login')
  const [confirmationSent, setConfirmationSent] = useState(false)
  const [validationError, setValidationError] = useState('')

  if (user) return <Navigate to="/" replace />

  const switchMode = nextMode => {
    setMode(nextMode)
    setConfirmationSent(false)
    setValidationError('')
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setValidationError('')
    if (mode === 'register' && password !== confirmPassword) {
      setValidationError(copy.mismatch)
      return
    }
    setSubmitting(true)
    try {
      if (mode === 'reset') {
        const { error } = await resetPassword(email)
        if (!error) setConfirmationSent(true)
      } else if (mode === 'login') {
        const { error } = await signInWithEmail(email, password)
        if (!error) navigate('/')
      } else {
        const { error, confirmationNeeded } = await signUp(email, password)
        if (!error && confirmationNeeded) setConfirmationSent(true)
        if (!error && !confirmationNeeded) navigate('/')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-bg px-4 py-5 sm:flex sm:items-center sm:justify-center sm:py-10">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex justify-end"><LanguageSelect /></div>
          <div className="mt-7 text-center">
            <BrandMark className="mx-auto h-[60px] w-[60px]" />
            <h1 className="mt-5 text-[30px] font-extrabold leading-tight tracking-tight text-text-primary">
              {mode === 'reset' ? t('login.resetTitle') : mode === 'login' ? t('login.welcomeBack') : t('login.niceToMeet')}
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              {mode === 'reset' ? t('login.resetSubtitle') : mode === 'login' ? t('login.loginSubtitle') : t('login.registerSubtitle')}
            </p>
          </div>

          <section className="mt-7">
            {mode !== 'reset' && (
              <div className="mb-5 grid grid-cols-2 rounded-[14px] bg-[#EAE5D8] p-1">
                {['login', 'register'].map(tab => (
                  <button key={tab} type="button" onClick={() => switchMode(tab)} className={`min-h-10 rounded-[11px] text-sm font-bold transition-all ${mode === tab ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary'}`}>
                    {tab === 'login' ? t('common.login') : t('login.register')}
                  </button>
                ))}
              </div>
            )}

            {(authError || validationError) && <div className="mb-4 rounded-xl border border-wrong/20 bg-[#FDECEA] p-3 text-sm text-wrong">{validationError || authError}</div>}
            {confirmationSent && <div className="mb-4 rounded-xl border border-correct/20 bg-[#E7F6ED] p-3 text-sm text-correct">{mode === 'reset' ? t('login.resetSent') : t('login.confirmationSent')}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field id="email" label={t('login.email')} type="email" value={email} onChange={setEmail} />
              {mode !== 'reset' && <Field id="password" label={t('login.password')} type="password" value={password} onChange={setPassword} />}
              {mode === 'register' && <Field id="confirm-password" label={copy.confirm} type="password" value={confirmPassword} onChange={setConfirmPassword} />}
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? <Spinner size="h-5 w-5" /> : mode === 'reset' ? t('login.sendResetLink') : mode === 'login' ? t('common.login') : t('login.createAccount')}
              </Button>
            </form>

            {mode === 'login' && <button type="button" onClick={() => switchMode('reset')} className="mt-3 text-sm font-semibold text-primary">{t('login.forgotPassword')}</button>}
            {mode !== 'reset' && <div className="my-5 flex items-center gap-3"><span className="h-px flex-1 bg-theme-border" /><span className="text-xs text-text-secondary">{t('login.or')}</span><span className="h-px flex-1 bg-theme-border" /></div>}
            {mode !== 'reset' && (
              <Button onClick={signInWithGoogle} variant="outline" className="w-full">
                <GoogleLogo />{mode === 'register' ? copy.google : t('login.google')}
              </Button>
            )}
          </section>

          <p className="mt-5 text-center text-sm text-text-secondary">
            {mode === 'reset' ? <button onClick={() => switchMode('login')} className="font-bold text-primary">{t('login.backToLogin')}</button> : mode === 'login' ? <>{t('login.noAccount')} <button onClick={() => switchMode('register')} className="font-bold text-primary">{t('login.register')}</button></> : <>{t('login.hasAccount')} <button onClick={() => switchMode('login')} className="font-bold text-primary">{t('common.login')}</button></>}
          </p>
        </div>
      </main>
    </PageTransition>
  )
}

function Field({ id, label, type, value, onChange }) {
  return <label htmlFor={id} className="block text-sm font-semibold text-text-primary">{label}<input id={id} type={type} required value={value} onChange={event => onChange(event.target.value)} className="signal-input mt-1.5" /></label>
}

function GoogleLogo() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
}
