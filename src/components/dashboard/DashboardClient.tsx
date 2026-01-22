'use client'

import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import GlobalNews from '@/components/dashboard/GlobalNews'
import RiskCalculator from '@/components/dashboard/RiskCalculator'
import StatsCard from '@/components/analytics/StatsCard'
import { User } from '@supabase/supabase-js'
import {
    Target,
    DollarSign,
    Activity,
    BarChart3,
    BookOpen,
    ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'

interface DashboardClientProps {
    user: User
    stats: {
        totalTrades: number
        winRate: number
        totalPnL: number
        totalEntries: number
    }
}

export default function DashboardClient({ user, stats }: DashboardClientProps) {
    return (
        <div className="app-layout">
            <Sidebar />

            <main className="main-content">
                <Header
                    user={user}
                    title="Dashboard"
                    subtitle="Your trading command center"
                />

                <div className="dashboard-content">
                    {/* Stats Row */}
                    <section className="stats-section">
                        <div className="section-header">
                            <h2>Overview</h2>
                            <Link href="/analytics" className="view-all-link">
                                View Analytics
                                <ArrowUpRight size={14} />
                            </Link>
                        </div>
                        <div className="stats-grid">
                            <StatsCard
                                title="Total Trades"
                                value={stats.totalTrades}
                                icon={BarChart3}
                                variant="info"
                                subtitle="All time"
                            />
                            <StatsCard
                                title="Win Rate"
                                value={`${stats.winRate.toFixed(1)}%`}
                                icon={Target}
                                variant={stats.winRate >= 50 ? 'success' : 'danger'}
                                change={stats.winRate >= 50 ? 5.2 : -3.1}
                                changeLabel="vs last month"
                            />
                            <StatsCard
                                title="Total P&L"
                                value={`$${Math.abs(stats.totalPnL).toFixed(2)}`}
                                icon={DollarSign}
                                variant={stats.totalPnL >= 0 ? 'success' : 'danger'}
                                subtitle={stats.totalPnL >= 0 ? 'Profit' : 'Loss'}
                            />
                            <StatsCard
                                title="Journal Entries"
                                value={stats.totalEntries}
                                icon={BookOpen}
                                variant="default"
                                subtitle="Total reflections"
                            />
                        </div>
                    </section>

                    {/* Main Grid */}
                    <div className="dashboard-grid">
                        {/* News Widget */}
                        <section className="news-section">
                            <GlobalNews />
                        </section>

                        {/* Calculator Widget */}
                        <section className="calculator-section">
                            <RiskCalculator />
                        </section>
                    </div>

                    {/* Quick Actions */}
                    <section className="quick-actions-section">
                        <h3>Quick Actions</h3>
                        <div className="quick-actions-grid">
                            <Link href="/journal" className="quick-action-card glass-card">
                                <div className="action-icon green">
                                    <BookOpen size={24} />
                                </div>
                                <div className="action-content">
                                    <h4>New Journal Entry</h4>
                                    <p>Record your thoughts and trades</p>
                                </div>
                            </Link>
                            <Link href="/calculator" className="quick-action-card glass-card">
                                <div className="action-icon cyan">
                                    <Target size={24} />
                                </div>
                                <div className="action-content">
                                    <h4>Position Calculator</h4>
                                    <p>Calculate lot size & risk</p>
                                </div>
                            </Link>
                            <Link href="/analytics" className="quick-action-card glass-card">
                                <div className="action-icon purple">
                                    <Activity size={24} />
                                </div>
                                <div className="action-content">
                                    <h4>View Performance</h4>
                                    <p>Analyze your trading stats</p>
                                </div>
                            </Link>
                        </div>
                    </section>
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
        .dashboard-content {
          flex: 1;
          padding: 24px 32px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .section-header h2 {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-ivory);
        }
        .view-all-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--color-nexus-cyan);
          text-decoration: none;
          transition: color var(--transition-fast);
        }
        .view-all-link:hover {
          color: var(--color-ivory);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 24px;
        }
        .news-section,
        .calculator-section {
          min-height: 500px;
        }
        .quick-actions-section h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-ivory);
          margin-bottom: 16px;
        }
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .quick-action-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          text-decoration: none;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .quick-action-card:hover {
          transform: translateY(-2px);
        }
        .action-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }
        .action-icon.green {
          background: rgba(0, 255, 136, 0.1);
          color: var(--color-nexus-emerald);
        }
        .action-icon.cyan {
          background: rgba(0, 212, 255, 0.1);
          color: var(--color-nexus-cyan);
        }
        .action-icon.purple {
          background: rgba(168, 85, 247, 0.1);
          color: var(--color-nexus-violet);
        }
        .action-content h4 {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-ivory);
          margin-bottom: 4px;
        }
        .action-content p {
          font-size: 12px;
          color: var(--color-steel);
        }
        @media (max-width: 1400px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .quick-actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    )
}
