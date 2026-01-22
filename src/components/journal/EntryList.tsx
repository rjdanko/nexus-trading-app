'use client'

import { JournalEntry } from '@/types/database.types'
import { format } from 'date-fns'
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Image as ImageIcon,
    Edit3,
    Trash2,
    ChevronRight
} from 'lucide-react'

interface EntryListProps {
    entries: JournalEntry[]
    onEdit?: (entry: JournalEntry) => void
    onDelete?: (id: string) => void
    onSelect?: (entry: JournalEntry) => void
}

export default function EntryList({ entries, onEdit, onDelete, onSelect }: EntryListProps) {
    const getSentimentIcon = (sentiment: string | null) => {
        switch (sentiment) {
            case 'bullish': return <TrendingUp size={16} className="text-emerald" />
            case 'bearish': return <TrendingDown size={16} className="text-crimson" />
            default: return <Minus size={16} className="text-silver" />
        }
    }

    const getResultBadge = (result: string | null) => {
        switch (result) {
            case 'win':
                return <span className="result-badge win">Win</span>
            case 'loss':
                return <span className="result-badge loss">Loss</span>
            case 'breakeven':
                return <span className="result-badge breakeven">BE</span>
            default:
                return <span className="result-badge pending">Open</span>
        }
    }

    const formatPnL = (pnl: number | null) => {
        if (pnl === null) return null
        const formatted = Math.abs(pnl).toFixed(2)
        if (pnl > 0) return <span className="pnl positive">+${formatted}</span>
        if (pnl < 0) return <span className="pnl negative">-${formatted}</span>
        return <span className="pnl neutral">${formatted}</span>
    }

    if (entries.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>No entries yet</h3>
                <p>Start documenting your trading journey by creating your first entry.</p>
            </div>
        )
    }

    return (
        <div className="entry-list">
            {entries.map((entry, index) => (
                <article
                    key={entry.id}
                    className="entry-card glass-card animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => onSelect?.(entry)}
                >
                    <div className="entry-header">
                        <div className="entry-type-badge">
                            {entry.type === 'simple' ? '📝' : '📊'}
                            <span>{entry.type === 'simple' ? 'Reflection' : 'Trade'}</span>
                        </div>
                        <span className="entry-date">
                            {format(new Date(entry.created_at), 'MMM d, yyyy • h:mm a')}
                        </span>
                    </div>

                    <div className="entry-body">
                        <h3 className="entry-title">{entry.title}</h3>

                        {entry.type === 'simple' ? (
                            <div className="simple-content">
                                <div className="sentiment-indicator">
                                    {getSentimentIcon(entry.sentiment)}
                                    <span className={`sentiment-text ${entry.sentiment}`}>
                                        {entry.sentiment || 'neutral'}
                                    </span>
                                </div>
                                {entry.content && (
                                    <p className="entry-excerpt">
                                        {entry.content.length > 150
                                            ? entry.content.substring(0, 150) + '...'
                                            : entry.content}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="technical-content">
                                <div className="trade-meta">
                                    <span className="pair-badge">{entry.pair}</span>
                                    {getResultBadge(entry.result)}
                                    {formatPnL(entry.pnl)}
                                </div>

                                <div className="trade-details">
                                    <div className="trade-detail">
                                        <span className="detail-label">Entry</span>
                                        <span className="detail-value font-mono">
                                            {entry.entry_price?.toFixed(5)}
                                        </span>
                                    </div>
                                    <div className="trade-detail">
                                        <span className="detail-label">SL</span>
                                        <span className="detail-value font-mono text-crimson">
                                            {entry.stop_loss?.toFixed(5)}
                                        </span>
                                    </div>
                                    <div className="trade-detail">
                                        <span className="detail-label">TP</span>
                                        <span className="detail-value font-mono text-emerald">
                                            {entry.take_profit?.toFixed(5)}
                                        </span>
                                    </div>
                                    <div className="trade-detail">
                                        <span className="detail-label">Lots</span>
                                        <span className="detail-value font-mono">
                                            {entry.lot_size?.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="entry-footer">
                        <div className="entry-tags">
                            {entry.image_url && (
                                <span className="has-image">
                                    <ImageIcon size={12} />
                                    Image
                                </span>
                            )}
                        </div>

                        <div className="entry-actions">
                            {onEdit && (
                                <button
                                    className="action-btn"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onEdit(entry)
                                    }}
                                >
                                    <Edit3 size={14} />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    className="action-btn delete"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDelete(entry.id)
                                    }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                            <ChevronRight size={16} className="chevron" />
                        </div>
                    </div>
                </article>
            ))}

            <style jsx>{`
        .entry-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .entry-card {
          padding: 20px;
          cursor: pointer;
          opacity: 0;
          transition: all var(--transition-fast);
        }

        .entry-card:hover {
          transform: translateX(4px);
        }

        .entry-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .entry-type-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--color-silver);
        }

        .entry-date {
          font-size: 12px;
          color: var(--color-steel);
        }

        .entry-body {
          margin-bottom: 16px;
        }

        .entry-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-ivory);
          margin-bottom: 12px;
        }

        .simple-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sentiment-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sentiment-text {
          font-size: 13px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .sentiment-text.bullish {
          color: var(--color-nexus-emerald);
        }

        .sentiment-text.bearish {
          color: var(--color-nexus-crimson);
        }

        .sentiment-text.neutral {
          color: var(--color-silver);
        }

        .entry-excerpt {
          font-size: 14px;
          color: var(--color-silver);
          line-height: 1.6;
        }

        .technical-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .trade-meta {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pair-badge {
          padding: 4px 10px;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 6px;
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
          color: var(--color-nexus-cyan);
        }

        .result-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .result-badge.win {
          background: rgba(0, 255, 136, 0.1);
          color: var(--color-nexus-emerald);
        }

        .result-badge.loss {
          background: rgba(255, 51, 102, 0.1);
          color: var(--color-nexus-crimson);
        }

        .result-badge.breakeven {
          background: rgba(255, 170, 0, 0.1);
          color: var(--color-nexus-amber);
        }

        .result-badge.pending {
          background: rgba(138, 138, 154, 0.1);
          color: var(--color-silver);
        }

        .pnl {
          font-family: var(--font-mono);
          font-size: 14px;
          font-weight: 600;
        }

        .pnl.positive {
          color: var(--color-nexus-emerald);
        }

        .pnl.negative {
          color: var(--color-nexus-crimson);
        }

        .pnl.neutral {
          color: var(--color-silver);
        }

        .trade-details {
          display: flex;
          gap: 20px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-sm);
        }

        .trade-detail {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .detail-label {
          font-size: 10px;
          color: var(--color-steel);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .detail-value {
          font-size: 13px;
          color: var(--color-pearl);
        }

        .text-crimson {
          color: var(--color-nexus-crimson);
        }

        .text-emerald {
          color: var(--color-nexus-emerald);
        }

        .text-silver {
          color: var(--color-silver);
        }

        .entry-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid var(--glass-border);
        }

        .entry-tags {
          display: flex;
          gap: 8px;
        }

        .has-image {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 4px;
          font-size: 11px;
          color: var(--color-steel);
        }

        .entry-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--color-steel);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-pearl);
        }

        .action-btn.delete:hover {
          background: rgba(255, 51, 102, 0.1);
          color: var(--color-nexus-crimson);
        }

        .chevron {
          color: var(--color-steel);
          margin-left: 8px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          text-align: center;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-pearl);
          margin-bottom: 8px;
        }

        .empty-state p {
          font-size: 14px;
          color: var(--color-steel);
          max-width: 300px;
        }
      `}</style>
        </div>
    )
}
