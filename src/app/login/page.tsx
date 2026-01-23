'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Hexagon, ArrowRight, Github, Chrome } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        setMessage('Check your email for the confirmation link!')
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Background Effects */}
      <div className="bg-grid"></div>
      <div className="bg-glow glow-1"></div>
      <div className="bg-glow glow-2"></div>
      <div className="bg-glow glow-3"></div>

      {/* Login Card */}
      <div className="login-container">
        <div className="login-card glass-card-elevated">
          {/* Header */}
          <div className="login-header">
            <div className="logo">
              <div className="logo-icon">
                <Hexagon size={32} strokeWidth={1.5} />
              </div>
              <div className="logo-text">
                <span className="logo-name">NEXUS</span>
                <span className="logo-tagline">Trading Hub</span>
              </div>
            </div>
            <h1 className="login-title">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="login-subtitle">
              {isLogin
                ? 'Sign in to continue to your trading dashboard'
                : 'Start your journey to better trading'
              }
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="oauth-buttons">
            <button
              className="oauth-btn"
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
            >
              <Chrome size={18} />
              <span>Continue with Google</span>
            </button>
            <button
              className="oauth-btn"
              onClick={() => handleOAuthLogin('github')}
              disabled={isLoading}
            >
              <Github size={18} />
              <span>Continue with GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="divider">
            <span>or continue with email</span>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="login-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="input-field with-icon"
                  placeholder="trader@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field with-icon with-action"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="forgot-password">
                <button type="button" className="link-btn">
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {message && (
              <div className="success-message">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="submit-btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="toggle-auth">
            <span>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </span>
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setMessage('')
              }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="features-section">
          <div className="feature animate-fade-in stagger-1">
            <span className="feature-icon">📊</span>
            <span className="feature-text">Risk Calculator</span>
          </div>
          <div className="feature animate-fade-in stagger-2">
            <span className="feature-icon">📝</span>
            <span className="feature-text">Trade Journal</span>
          </div>
          <div className="feature animate-fade-in stagger-3">
            <span className="feature-icon">📈</span>
            <span className="feature-text">Analytics</span>
          </div>
          <div className="feature animate-fade-in stagger-4">
            <span className="feature-icon">📰</span>
            <span className="feature-text">Market News</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
        }

        .bg-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        .glow-1 {
          width: 400px;
          height: 400px;
          background: rgba(0, 212, 255, 0.15);
          top: -100px;
          left: -100px;
        }

        .glow-2 {
          width: 300px;
          height: 300px;
          background: rgba(168, 85, 247, 0.1);
          bottom: -50px;
          right: -50px;
        }

        .glow-3 {
          width: 200px;
          height: 200px;
          background: rgba(0, 255, 136, 0.08);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .login-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          width: 100%;
          max-width: 440px;
          position: relative;
          z-index: 10;
        }

        .login-card {
          width: 100%;
          padding: 40px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(168, 85, 247, 0.2));
          border-radius: 16px;
          color: var(--color-nexus-cyan);
          box-shadow: 
            0 0 30px rgba(0, 212, 255, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .logo-name {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.1em;
          background: linear-gradient(135deg, var(--color-nexus-cyan) 0%, var(--color-nexus-violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-tagline {
          font-size: 11px;
          color: var(--color-steel);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .login-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--color-ivory);
          margin-bottom: 8px;
        }

        .login-subtitle {
          font-size: 14px;
          color: var(--color-steel);
        }

        .oauth-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .oauth-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 14px 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          color: var(--color-pearl);
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .oauth-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .oauth-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--glass-border);
        }

        .divider span {
          font-size: 12px;
          color: var(--color-steel);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-silver);
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-steel);
          pointer-events: none;
        }

        .input-field.with-icon {
          padding-left: 52px;
        }

        .input-field.with-action {
          padding-right: 52px;
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          top: 0;
          bottom: 0;
          margin: auto;
          height: 32px;
          width: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: var(--color-steel);
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .password-toggle:hover {
          color: var(--color-pearl);
          background: rgba(255, 255, 255, 0.05);
        }

        .forgot-password {
          text-align: right;
          margin-top: -8px;
        }

        .link-btn {
          background: none;
          border: none;
          color: var(--color-nexus-cyan);
          font-family: var(--font-display);
          font-size: 13px;
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .link-btn:hover {
          color: var(--color-ivory);
        }

        .error-message {
          padding: 12px 16px;
          background: rgba(255, 51, 102, 0.1);
          border: 1px solid rgba(255, 51, 102, 0.2);
          border-radius: var(--radius-md);
          color: var(--color-nexus-crimson);
          font-size: 13px;
        }

        .success-message {
          padding: 12px 16px;
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: var(--radius-md);
          color: var(--color-nexus-emerald);
          font-size: 13px;
        }

        .submit-btn {
          width: 100%;
          padding: 16px 24px;
          font-size: 15px;
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .toggle-auth {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--glass-border);
          font-size: 13px;
          color: var(--color-steel);
        }

        .features-section {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          border-radius: 9999px;
          opacity: 0;
        }

        .feature-icon {
          font-size: 16px;
        }

        .feature-text {
          font-size: 12px;
          font-weight: 500;
          color: var(--color-silver);
        }
      `}</style>
    </div>
  )
}

