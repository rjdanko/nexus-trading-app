'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { User } from '@supabase/supabase-js'
import { Save, User as UserIcon, Bell, Shield, Loader2 } from 'lucide-react'

export default function SettingsPage() {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState<'success' | 'error'>('success')

    // Settings state
    const [settings, setSettings] = useState({
        fullName: '',
        defaultRisk: 1,
        defaultBalance: 10000,
        emailNotifications: true,
        tradeReminders: false,
    })

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const loadUserAndProfile = async () => {
            setIsLoading(true)
            
            // Get user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUser(user)

            // Get profile from Supabase
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profileData) {
                setSettings({
                    fullName: profileData.full_name || user.email?.split('@')[0] || '',
                    defaultRisk: profileData.default_risk_percent || 1,
                    defaultBalance: profileData.default_account_balance || 10000,
                    emailNotifications: true, // These would be stored in a separate preferences table
                    tradeReminders: false,
                })
            } else {
                // Profile doesn't exist yet, use defaults
                setSettings(prev => ({
                    ...prev,
                    fullName: user.email?.split('@')[0] || ''
                }))
            }
            
            setIsLoading(false)
        }
        loadUserAndProfile()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleSave = async () => {
        if (!user) return
        
        setIsSaving(true)
        setMessage('')

        try {
            // Update profile in Supabase
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email!,
                    full_name: settings.fullName,
                    default_risk_percent: settings.defaultRisk,
                    default_account_balance: settings.defaultBalance,
                    updated_at: new Date().toISOString(),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any)

            if (error) throw error

            setMessage('Settings saved successfully!')
            setMessageType('success')
        } catch (error: unknown) {
            console.error('Error saving settings:', error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to save settings'
            setMessage(errorMessage)
            setMessageType('error')
        } finally {
            setIsSaving(false)
            setTimeout(() => setMessage(''), 3000)
        }
    }

    if (isLoading) {
        return (
            <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                    <Header user={user} title="Settings" subtitle="Manage your preferences" />
                    <div className="settings-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-nexus-cyan)' }} />
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="app-layout">
            <Sidebar />

            <main className="main-content">
                <Header
                    user={user}
                    title="Settings"
                    subtitle="Manage your preferences"
                />

                <div className="settings-content">
                    {/* Profile Section */}
                    <section className="settings-section glass-card">
                        <div className="section-header">
                            <div className="section-icon">
                                <UserIcon size={20} />
                            </div>
                            <div>
                                <h3>Profile</h3>
                                <p>Manage your account information</p>
                            </div>
                        </div>

                        <div className="settings-grid">
                            <div className="setting-item">
                                <label className="setting-label">Display Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={settings.fullName}
                                    onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                                    placeholder="Your name"
                                />
                            </div>

                            <div className="setting-item">
                                <label className="setting-label">Email</label>
                                <input
                                    type="email"
                                    className="input-field"
                                    value={user?.email || ''}
                                    disabled
                                />
                                <span className="setting-hint">Email cannot be changed</span>
                            </div>
                        </div>
                    </section>

                    {/* Trading Defaults */}
                    <section className="settings-section glass-card">
                        <div className="section-header">
                            <div className="section-icon cyan">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h3>Trading Defaults</h3>
                                <p>Set your default risk parameters</p>
                            </div>
                        </div>

                        <div className="settings-grid">
                            <div className="setting-item">
                                <label className="setting-label">Default Risk %</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={settings.defaultRisk}
                                    onChange={(e) => setSettings({ ...settings, defaultRisk: Number(e.target.value) })}
                                    step="0.5"
                                    min="0.1"
                                    max="10"
                                />
                            </div>

                            <div className="setting-item">
                                <label className="setting-label">Default Account Balance</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={settings.defaultBalance}
                                    onChange={(e) => setSettings({ ...settings, defaultBalance: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Notifications */}
                    <section className="settings-section glass-card">
                        <div className="section-header">
                            <div className="section-icon amber">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h3>Notifications</h3>
                                <p>Configure how you receive updates</p>
                            </div>
                        </div>

                        <div className="toggle-list">
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <span className="toggle-label">Email Notifications</span>
                                    <span className="toggle-description">Receive weekly trading summaries</span>
                                </div>
                                <button
                                    className={`toggle-switch ${settings.emailNotifications ? 'active' : ''}`}
                                    onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                                >
                                    <span className="toggle-knob"></span>
                                </button>
                            </div>

                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <span className="toggle-label">Trade Reminders</span>
                                    <span className="toggle-description">Daily reminder to log your trades</span>
                                </div>
                                <button
                                    className={`toggle-switch ${settings.tradeReminders ? 'active' : ''}`}
                                    onClick={() => setSettings({ ...settings, tradeReminders: !settings.tradeReminders })}
                                >
                                    <span className="toggle-knob"></span>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Save Button */}
                    <div className="save-section">
                        {message && (
                            <span className={`save-message ${messageType}`}>{message}</span>
                        )}
                        <button
                            className="btn-primary"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </main>

            <style jsx>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
        }
        .main-content {
          flex: 1;
          margin-left: 260px;
          display: flex;
          flex-direction: column;
        }
        .settings-content {
          flex: 1;
          padding: 24px 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 800px;
        }
        .settings-section {
          padding: 24px;
        }
        .section-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--glass-border);
        }
        .section-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-md);
          color: var(--color-silver);
        }
        .section-icon.cyan {
          background: rgba(0, 212, 255, 0.1);
          color: var(--color-nexus-cyan);
        }
        .section-icon.amber {
          background: rgba(255, 170, 0, 0.1);
          color: var(--color-nexus-amber);
        }
        .section-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-ivory);
          margin-bottom: 4px;
        }
        .section-header p {
          font-size: 13px;
          color: var(--color-steel);
        }
        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .setting-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .setting-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-silver);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .setting-hint {
          font-size: 11px;
          color: var(--color-steel);
        }
        .toggle-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .toggle-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-md);
        }
        .toggle-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .toggle-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-pearl);
        }
        .toggle-description {
          font-size: 12px;
          color: var(--color-steel);
        }
        .toggle-switch {
          position: relative;
          width: 48px;
          height: 28px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .toggle-switch.active {
          background: var(--color-nexus-cyan);
        }
        .toggle-knob {
          position: absolute;
          top: 4px;
          left: 4px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform var(--transition-fast);
        }
        .toggle-switch.active .toggle-knob {
          transform: translateX(20px);
        }
        .save-section {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 16px;
        }
        .save-message {
          font-size: 13px;
          color: var(--color-nexus-emerald);
        }
        .save-message.error {
          color: var(--color-nexus-crimson);
        }
        .save-message.success {
          color: var(--color-nexus-emerald);
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
        </div>
    )
}
