'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import StatsCard from '@/components/analytics/StatsCard'
import { JournalEntry } from '@/types/database.types'
import { calculateTradeStats, TradeStats } from '@/lib/analytics'
import { User } from '@supabase/supabase-js'
import {
    Target,
    TrendingUp,
    DollarSign,
    Percent,
    Activity,
    Award,
    AlertTriangle,
    BarChart3
} from 'lucide-react'

export default function AnalyticsPage() {
    const [user, setUser] = useState<User | null>(null)
    const [entries, setEntries] = useState<JournalEntry[]>([])
    const [stats, setStats] = useState<TradeStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all')

    const supabase = createClient()
    const router = useRouter()

    const loadEntries = async (userId: string) => {
        setIsLoading(true)
        const { data } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (data) {
            setEntries(data as JournalEntry[])
            const calculatedStats = calculateTradeStats(data as JournalEntry[])
            setStats(calculatedStats)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUser(user)
            loadEntries(user.id)
        }
        getUser()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getFilteredStats = () => {
        if (!entries.length) return null

        let filteredEntries = entries
        const now = new Date()

        if (timeframe === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            filteredEntries = entries.filter(e => new Date(e.created_at) >= weekAgo)
        } else if (timeframe === 'month') {
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
            filteredEntries = entries.filter(e => new Date(e.created_at) >= monthAgo)
        }

        return calculateTradeStats(filteredEntries)
    }

    const displayStats = getFilteredStats() || stats

    return (
        <div className="app-layout">
            <Sidebar />

            <main className="main-content">
                <Header
                    user={user}
                    title="Analytics"
                    subtitle="Track your trading performance"
                />

                <div className="analytics-content">
                    {/* Timeframe Selector */}
                    <div className="timeframe-selector">
                        <button
                            className={`timeframe-btn ${timeframe === 'week' ? 'active' : ''}`}
                            onClick={() => setTimeframe('week')}
                        >
                            This Week
                        </button>
                        <button
                            className={`timeframe-btn ${timeframe === 'month' ? 'active' : ''}`}
                            onClick={() => setTimeframe('month')}
                        >
                            This Month
                        </button>
                        <button
                            className={`timeframe-btn ${timeframe === 'all' ? 'active' : ''}`}
                            onClick={() => setTimeframe('all')}
                        >
                            All Time
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="loading-grid">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="skeleton-card"></div>
                            ))}
                        </div>
                    ) : displayStats && displayStats.totalTrades > 0 ? (
                        <>
                            {/* Primary Stats */}
                            <section className="stats-section">
                                <h3 className="section-title">Overview</h3>
                                <div className="stats-grid primary">
                                    <StatsCard
                                        title="Total Trades"
                                        value={displayStats.totalTrades}
                                        icon={BarChart3}
                                        variant="info"
                                        size="large"
                                    />
                                    <StatsCard
                                        title="Win Rate"
                                        value={`${displayStats.winRate.toFixed(1)}%`}
                                        icon={Target}
                                        variant={displayStats.winRate >= 50 ? 'success' : 'danger'}
                                        size="large"
                                        subtitle={`${displayStats.winningTrades}W / ${displayStats.losingTrades}L`}
                                    />
                                    <StatsCard
                                        title="Profit Factor"
                                        value={displayStats.profitFactor === Infinity ? '∞' : displayStats.profitFactor.toFixed(2)}
                                        icon={Activity}
                                        variant={displayStats.profitFactor >= 1 ? 'success' : 'danger'}
                                        size="large"
                                        subtitle="Gross profit / Gross loss"
                                    />
                                    <StatsCard
                                        title="Total P&L"
                                        value={`$${Math.abs(displayStats.totalPnL).toFixed(2)}`}
                                        icon={DollarSign}
                                        variant={displayStats.totalPnL >= 0 ? 'success' : 'danger'}
                                        size="large"
                                        subtitle={displayStats.totalPnL >= 0 ? 'Net Profit' : 'Net Loss'}
                                    />
                                </div>
                            </section>

                            {/* Secondary Stats */}
                            <section className="stats-section">
                                <h3 className="section-title">Performance Metrics</h3>
                                <div className="stats-grid secondary">
                                    <StatsCard
                                        title="Average R:R"
                                        value={`1:${displayStats.averageRR.toFixed(2)}`}
                                        icon={Percent}
                                        variant="default"
                                    />
                                    <StatsCard
                                        title="Average P&L"
                                        value={`$${displayStats.averagePnL.toFixed(2)}`}
                                        icon={TrendingUp}
                                        variant={displayStats.averagePnL >= 0 ? 'success' : 'danger'}
                                    />
                                    <StatsCard
                                        title="Largest Win"
                                        value={`$${displayStats.largestWin.toFixed(2)}`}
                                        icon={Award}
                                        variant="success"
                                    />
                                    <StatsCard
                                        title="Largest Loss"
                                        value={`$${displayStats.largestLoss.toFixed(2)}`}
                                        icon={AlertTriangle}
                                        variant="danger"
                                    />
                                </div>
                            </section>

                            {/* Streak & Pairs */}
                            <div className="metrics-row">
                                {/* Current Streak */}
                                <div className="metric-card glass-card">
                                    <h4 className="metric-title">Current Streak</h4>
                                    <div className={`streak-display ${displayStats.streakType}`}>
                                        <span className="streak-count">{displayStats.currentStreak}</span>
                                        <span className="streak-type">
                                            {displayStats.streakType === 'win' && 'Winning Streak 🔥'}
                                            {displayStats.streakType === 'loss' && 'Losing Streak'}
                                            {displayStats.streakType === 'none' && 'No Active Streak'}
                                        </span>
                                    </div>
                                </div>

                                {/* Best & Worst Pairs */}
                                <div className="metric-card glass-card">
                                    <h4 className="metric-title">Pair Performance</h4>
                                    <div className="pairs-display">
                                        {displayStats.bestPair && (
                                            <div className="pair-item best">
                                                <span className="pair-label">Best Performer</span>
                                                <span className="pair-value">{displayStats.bestPair}</span>
                                            </div>
                                        )}
                                        {displayStats.worstPair && (
                                            <div className="pair-item worst">
                                                <span className="pair-label">Needs Improvement</span>
                                                <span className="pair-value">{displayStats.worstPair}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Win/Loss Distribution */}
                                <div className="metric-card glass-card">
                                    <h4 className="metric-title">Trade Distribution</h4>
                                    <div className="distribution-bar">
                                        <div
                                            className="bar-segment wins"
                                            style={{ width: `${(displayStats.winningTrades / displayStats.totalTrades) * 100}%` }}
                                        >
                                            <span>{displayStats.winningTrades}</span>
                                        </div>
                                        <div
                                            className="bar-segment losses"
                                            style={{ width: `${(displayStats.losingTrades / displayStats.totalTrades) * 100}%` }}
                                        >
                                            <span>{displayStats.losingTrades}</span>
                                        </div>
                                        {displayStats.breakevenTrades > 0 && (
                                            <div
                                                className="bar-segment breakeven"
                                                style={{ width: `${(displayStats.breakevenTrades / displayStats.totalTrades) * 100}%` }}
                                            >
                                                <span>{displayStats.breakevenTrades}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="distribution-legend">
                                        <span className="legend-item wins">Wins</span>
                                        <span className="legend-item losses">Losses</span>
                                        <span className="legend-item breakeven">Breakeven</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state glass-card">
                            <div className="empty-icon">📊</div>
                            <h3>No trading data yet</h3>
                            <p>Start logging your technical trades in the Journal to see your analytics here.</p>
                        </div>
                    )}
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

        .analytics-content {
          flex: 1;
          padding: 24px 32px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .timeframe-selector {
          display: flex;
          gap: 8px;
          align-self: flex-start;
          padding: 4px;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
        }

        .timeframe-btn {
          padding: 10px 20px;
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--color-silver);
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .timeframe-btn:hover {
          color: var(--color-pearl);
        }

        .timeframe-btn.active {
          background: rgba(0, 212, 255, 0.1);
          color: var(--color-nexus-cyan);
        }

        .stats-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-ivory);
        }

        .stats-grid {
          display: grid;
          gap: 16px;
        }

        .stats-grid.primary {
          grid-template-columns: repeat(4, 1fr);
        }

        .stats-grid.secondary {
          grid-template-columns: repeat(4, 1fr);
        }

        .metrics-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .metric-card {
          padding: 24px;
        }

        .metric-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-silver);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 16px;
        }

        .streak-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .streak-count {
          font-family: var(--font-mono);
          font-size: 48px;
          font-weight: 700;
          color: var(--color-ivory);
        }

        .streak-display.win .streak-count {
          color: var(--color-nexus-emerald);
          text-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
        }

        .streak-display.loss .streak-count {
          color: var(--color-nexus-crimson);
        }

        .streak-type {
          font-size: 14px;
          color: var(--color-silver);
        }

        .pairs-display {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pair-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-sm);
        }

        .pair-label {
          font-size: 12px;
          color: var(--color-steel);
        }

        .pair-value {
          font-family: var(--font-mono);
          font-size: 14px;
          font-weight: 600;
        }

        .pair-item.best .pair-value {
          color: var(--color-nexus-emerald);
        }

        .pair-item.worst .pair-value {
          color: var(--color-nexus-crimson);
        }

        .distribution-bar {
          display: flex;
          height: 40px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          margin-bottom: 12px;
        }

        .bar-segment {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 30px;
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
        }

        .bar-segment.wins {
          background: var(--color-nexus-emerald);
          color: var(--color-void);
        }

        .bar-segment.losses {
          background: var(--color-nexus-crimson);
          color: white;
        }

        .bar-segment.breakeven {
          background: var(--color-nexus-amber);
          color: var(--color-void);
        }

        .distribution-legend {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--color-steel);
        }

        .legend-item::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 2px;
        }

        .legend-item.wins::before {
          background: var(--color-nexus-emerald);
        }

        .legend-item.losses::before {
          background: var(--color-nexus-crimson);
        }

        .legend-item.breakeven::before {
          background: var(--color-nexus-amber);
        }

        .loading-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .skeleton-card {
          height: 140px;
          background: var(--color-graphite);
          border-radius: var(--radius-lg);
          animation: pulse 1.5s ease-in-out infinite;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px;
          text-align: center;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 24px;
        }

        .empty-state h3 {
          font-size: 20px;
          font-weight: 600;
          color: var(--color-ivory);
          margin-bottom: 8px;
        }

        .empty-state p {
          font-size: 14px;
          color: var(--color-steel);
          max-width: 400px;
        }

        @media (max-width: 1400px) {
          .stats-grid.primary,
          .stats-grid.secondary {
            grid-template-columns: repeat(2, 1fr);
          }

          .metrics-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    )
}
