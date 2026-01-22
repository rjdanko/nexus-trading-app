import { JournalEntry } from '@/types/database.types'

export interface TradeStats {
    totalTrades: number
    winningTrades: number
    losingTrades: number
    breakevenTrades: number
    winRate: number
    profitFactor: number
    averageRR: number
    totalPnL: number
    averagePnL: number
    largestWin: number
    largestLoss: number
    currentStreak: number
    streakType: 'win' | 'loss' | 'none'
    bestPair: string | null
    worstPair: string | null
}

export function calculateTradeStats(entries: JournalEntry[]): TradeStats {
    const technicalTrades = entries.filter(e => e.type === 'technical' && e.result)

    if (technicalTrades.length === 0) {
        return {
            totalTrades: 0,
            winningTrades: 0,
            losingTrades: 0,
            breakevenTrades: 0,
            winRate: 0,
            profitFactor: 0,
            averageRR: 0,
            totalPnL: 0,
            averagePnL: 0,
            largestWin: 0,
            largestLoss: 0,
            currentStreak: 0,
            streakType: 'none',
            bestPair: null,
            worstPair: null
        }
    }

    const wins = technicalTrades.filter(t => t.result === 'win')
    const losses = technicalTrades.filter(t => t.result === 'loss')
    const breakevens = technicalTrades.filter(t => t.result === 'breakeven')

    const totalPnL = technicalTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const totalWinPnL = wins.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const totalLossPnL = Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0))

    // Calculate R:R for each trade
    const calculateRR = (trade: JournalEntry): number => {
        if (!trade.entry_price || !trade.stop_loss || !trade.exit_price) return 0
        const risk = Math.abs(trade.entry_price - trade.stop_loss)
        const reward = Math.abs(trade.exit_price - trade.entry_price)
        return risk > 0 ? reward / risk : 0
    }

    const rrValues = technicalTrades.map(calculateRR).filter(rr => rr > 0)
    const averageRR = rrValues.length > 0 ? rrValues.reduce((a, b) => a + b, 0) / rrValues.length : 0

    // Calculate current streak
    const sortedTrades = [...technicalTrades].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    let currentStreak = 0
    let streakType: 'win' | 'loss' | 'none' = 'none'

    if (sortedTrades.length > 0) {
        const firstResult = sortedTrades[0].result
        if (firstResult === 'win' || firstResult === 'loss') {
            streakType = firstResult
            for (const trade of sortedTrades) {
                if (trade.result === firstResult) {
                    currentStreak++
                } else {
                    break
                }
            }
        }
    }

    // Calculate pair performance
    const pairStats: Record<string, { wins: number; losses: number; pnl: number }> = {}

    technicalTrades.forEach(trade => {
        if (trade.pair) {
            if (!pairStats[trade.pair]) {
                pairStats[trade.pair] = { wins: 0, losses: 0, pnl: 0 }
            }
            if (trade.result === 'win') pairStats[trade.pair].wins++
            if (trade.result === 'loss') pairStats[trade.pair].losses++
            pairStats[trade.pair].pnl += trade.pnl || 0
        }
    })

    const pairEntries = Object.entries(pairStats)
    const bestPair = pairEntries.length > 0
        ? pairEntries.sort((a, b) => b[1].pnl - a[1].pnl)[0][0]
        : null
    const worstPair = pairEntries.length > 0
        ? pairEntries.sort((a, b) => a[1].pnl - b[1].pnl)[0][0]
        : null

    const pnlValues = technicalTrades.map(t => t.pnl || 0)
    const largestWin = Math.max(...pnlValues, 0)
    const largestLoss = Math.min(...pnlValues, 0)

    return {
        totalTrades: technicalTrades.length,
        winningTrades: wins.length,
        losingTrades: losses.length,
        breakevenTrades: breakevens.length,
        winRate: (wins.length / technicalTrades.length) * 100,
        profitFactor: totalLossPnL > 0 ? totalWinPnL / totalLossPnL : totalWinPnL > 0 ? Infinity : 0,
        averageRR,
        totalPnL,
        averagePnL: totalPnL / technicalTrades.length,
        largestWin,
        largestLoss: Math.abs(largestLoss),
        currentStreak,
        streakType,
        bestPair,
        worstPair
    }
}

export function formatCurrency(value: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value)
}

export function formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function formatNumber(value: number, decimals = 2): string {
    return value.toFixed(decimals)
}

export function getPnLColor(pnl: number): string {
    if (pnl > 0) return 'var(--color-nexus-emerald)'
    if (pnl < 0) return 'var(--color-nexus-crimson)'
    return 'var(--color-silver)'
}

export function getResultBadgeClass(result: 'win' | 'loss' | 'breakeven' | null): string {
    switch (result) {
        case 'win': return 'badge-emerald'
        case 'loss': return 'badge-crimson'
        case 'breakeven': return 'badge-amber'
        default: return ''
    }
}
