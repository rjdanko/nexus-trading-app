'use client'

import { User } from '@supabase/supabase-js'
import { Bell, Search, User as UserIcon } from 'lucide-react'

interface HeaderProps {
    user: User | null
    title: string
    subtitle?: string
}

export default function Header({ user, title, subtitle }: HeaderProps) {
    return (
        <header className="header">
            <div className="header-left">
                <div className="page-info">
                    <h1 className="page-title">{title}</h1>
                    {subtitle && <p className="page-subtitle">{subtitle}</p>}
                </div>
            </div>

            <div className="header-right">
                {/* Search */}
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search trades, notes..."
                        className="search-input"
                    />
                    <kbd className="search-shortcut">⌘K</kbd>
                </div>

                {/* Notifications */}
                <button className="header-btn">
                    <Bell size={20} strokeWidth={1.5} />
                    <span className="notification-dot"></span>
                </button>

                {/* User Menu */}
                <div className="user-menu">
                    <div className="user-avatar">
                        <UserIcon size={18} strokeWidth={1.5} />
                    </div>
                    <div className="user-info">
                        <span className="user-name">
                            {user?.email?.split('@')[0] || 'Trader'}
                        </span>
                        <span className="user-status">Pro Account</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 32px;
          background: rgba(10, 10, 15, 0.5);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--glass-border);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .page-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .page-title {
          font-size: 24px;
          font-weight: 600;
          color: var(--color-ivory);
          letter-spacing: -0.02em;
        }

        .page-subtitle {
          font-size: 13px;
          color: var(--color-steel);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          color: var(--color-steel);
          pointer-events: none;
        }

        .search-input {
          width: 280px;
          padding: 10px 16px 10px 44px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          color: var(--color-pearl);
          font-family: var(--font-display);
          font-size: 13px;
          outline: none;
          transition: all var(--transition-fast);
        }

        .search-input::placeholder {
          color: var(--color-steel);
        }

        .search-input:focus {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--color-nexus-cyan);
          box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
        }

        .search-shortcut {
          position: absolute;
          right: 12px;
          padding: 3px 6px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 4px;
          color: var(--color-steel);
          font-family: var(--font-mono);
          font-size: 11px;
        }

        .header-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          color: var(--color-silver);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .header-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          color: var(--color-pearl);
        }

        .notification-dot {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 8px;
          height: 8px;
          background: var(--color-nexus-cyan);
          border-radius: 50%;
          border: 2px solid var(--color-obsidian);
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 12px 6px 6px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .user-menu:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .user-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, var(--color-nexus-cyan) 0%, var(--color-nexus-violet) 100%);
          border-radius: var(--radius-sm);
          color: var(--color-void);
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-pearl);
          text-transform: capitalize;
        }

        .user-status {
          font-size: 11px;
          color: var(--color-nexus-cyan);
        }
      `}</style>
        </header>
    )
}
