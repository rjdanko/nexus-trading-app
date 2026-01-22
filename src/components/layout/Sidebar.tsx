'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    BookOpen,
    BarChart3,
    Settings,
    LogOut,
    Hexagon,
    Calculator,
    Newspaper
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
    {
        href: '/',
        label: 'Dashboard',
        icon: LayoutDashboard,
        description: 'Overview & News'
    },
    {
        href: '/journal',
        label: 'Journal',
        icon: BookOpen,
        description: 'Trade Log'
    },
    {
        href: '/analytics',
        label: 'Analytics',
        icon: BarChart3,
        description: 'Performance'
    },
    {
        href: '/calculator',
        label: 'Calculator',
        icon: Calculator,
        description: 'Risk & Position'
    },
    {
        href: '/settings',
        label: 'Settings',
        icon: Settings,
        description: 'Preferences'
    },
]

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <aside className="sidebar">
            {/* Logo Section */}
            <div className="sidebar-logo">
                <div className="logo-icon">
                    <Hexagon size={28} strokeWidth={1.5} />
                    <span className="logo-glow"></span>
                </div>
                <div className="logo-text">
                    <span className="logo-name">NEXUS</span>
                    <span className="logo-tagline">Trading Hub</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <div className="nav-section">
                    <span className="nav-section-title">Navigation</span>
                    <ul className="nav-list">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`nav-item ${isActive ? 'active' : ''}`}
                                    >
                                        <div className="nav-icon-wrapper">
                                            <Icon size={20} strokeWidth={1.5} />
                                        </div>
                                        <div className="nav-content">
                                            <span className="nav-label">{item.label}</span>
                                            <span className="nav-description">{item.description}</span>
                                        </div>
                                        {isActive && <span className="nav-indicator"></span>}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </nav>

            {/* Quick Links */}
            <div className="sidebar-quick-links">
                <span className="nav-section-title">Quick Access</span>
                <div className="quick-links-grid">
                    <button className="quick-link">
                        <Newspaper size={16} />
                        <span>News</span>
                    </button>
                    <button className="quick-link">
                        <Calculator size={16} />
                        <span>Calc</span>
                    </button>
                </div>
            </div>

            {/* Logout */}
            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={18} strokeWidth={1.5} />
                    <span>Sign Out</span>
                </button>
            </div>

            <style jsx>{`
        .sidebar {
          width: 260px;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, rgba(18, 18, 26, 0.95) 0%, rgba(10, 10, 15, 0.98) 100%);
          border-right: 1px solid var(--glass-border);
          backdrop-filter: blur(20px);
          z-index: 100;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px 20px;
          border-bottom: 1px solid var(--glass-border);
        }

        .logo-icon {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(168, 85, 247, 0.15));
          border-radius: 12px;
          color: var(--color-nexus-cyan);
        }

        .logo-glow {
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, var(--color-nexus-cyan), var(--color-nexus-violet));
          border-radius: 14px;
          opacity: 0.3;
          filter: blur(8px);
          z-index: -1;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-name {
          font-size: 18px;
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

        .sidebar-nav {
          flex: 1;
          padding: 20px 12px;
          overflow-y: auto;
        }

        .nav-section {
          margin-bottom: 24px;
        }

        .nav-section-title {
          display: block;
          padding: 0 8px;
          margin-bottom: 12px;
          font-size: 11px;
          font-weight: 600;
          color: var(--color-steel);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .nav-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 12px;
          border-radius: var(--radius-md);
          text-decoration: none;
          color: var(--color-silver);
          transition: all var(--transition-fast);
          position: relative;
          overflow: hidden;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.03);
          color: var(--color-pearl);
        }

        .nav-item.active {
          background: rgba(0, 212, 255, 0.08);
          color: var(--color-nexus-cyan);
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 24px;
          background: var(--color-nexus-cyan);
          border-radius: 0 2px 2px 0;
        }

        .nav-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-sm);
          flex-shrink: 0;
        }

        .nav-item.active .nav-icon-wrapper {
          background: rgba(0, 212, 255, 0.1);
        }

        .nav-content {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .nav-label {
          font-size: 14px;
          font-weight: 500;
        }

        .nav-description {
          font-size: 11px;
          color: var(--color-steel);
          margin-top: 1px;
        }

        .nav-item.active .nav-description {
          color: rgba(0, 212, 255, 0.6);
        }

        .sidebar-quick-links {
          padding: 16px 12px;
          border-top: 1px solid var(--glass-border);
        }

        .quick-links-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 12px;
        }

        .quick-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          color: var(--color-silver);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .quick-link:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          color: var(--color-pearl);
        }

        .sidebar-footer {
          padding: 16px 12px;
          border-top: 1px solid var(--glass-border);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          background: transparent;
          border: 1px solid rgba(255, 51, 102, 0.2);
          border-radius: var(--radius-md);
          color: var(--color-nexus-crimson);
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .logout-btn:hover {
          background: rgba(255, 51, 102, 0.1);
          border-color: rgba(255, 51, 102, 0.3);
        }
      `}</style>
        </aside>
    )
}
