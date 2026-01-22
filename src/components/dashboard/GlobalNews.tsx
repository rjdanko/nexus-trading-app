'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Clock, ExternalLink, RefreshCw } from 'lucide-react'

interface NewsItem {
    id: string
    title: string
    source: string
    time: string
    impact: 'high' | 'medium' | 'low'
    sentiment: 'bullish' | 'bearish' | 'neutral'
    currency: string
    url?: string
}

// Mock news data - in production, this would come from ForexFactory or similar API
const mockNews: NewsItem[] = [
    {
        id: '1',
        title: 'Fed Chair Powell signals potential rate pause amid cooling inflation',
        source: 'Reuters',
        time: '15m ago',
        impact: 'high',
        sentiment: 'bullish',
        currency: 'USD'
    },
    {
        id: '2',
        title: 'ECB expected to maintain hawkish stance in upcoming meeting',
        source: 'Bloomberg',
        time: '32m ago',
        impact: 'high',
        sentiment: 'bullish',
        currency: 'EUR'
    },
    {
        id: '3',
        title: 'UK GDP growth beats expectations at 0.3% quarterly',
        source: 'Financial Times',
        time: '1h ago',
        impact: 'medium',
        sentiment: 'bullish',
        currency: 'GBP'
    },
    {
        id: '4',
        title: 'Japan CPI rises to 3.2%, BOJ under pressure to adjust YCC',
        source: 'Nikkei',
        time: '2h ago',
        impact: 'high',
        sentiment: 'bearish',
        currency: 'JPY'
    },
    {
        id: '5',
        title: 'Oil prices drop on demand concerns from China slowdown',
        source: 'CNBC',
        time: '3h ago',
        impact: 'medium',
        sentiment: 'bearish',
        currency: 'OIL'
    },
    {
        id: '6',
        title: 'Gold consolidates near $2,000 ahead of key US data',
        source: 'Kitco',
        time: '4h ago',
        impact: 'low',
        sentiment: 'neutral',
        currency: 'XAU'
    }
]

export default function GlobalNews() {
    const [news, setNews] = useState<NewsItem[]>(mockNews)
    const [isLoading, setIsLoading] = useState(false)
    const [lastUpdated, setLastUpdated] = useState(new Date())

    const refreshNews = async () => {
        setIsLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setNews(mockNews)
        setLastUpdated(new Date())
        setIsLoading(false)
    }

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'var(--color-nexus-crimson)'
            case 'medium': return 'var(--color-nexus-amber)'
            case 'low': return 'var(--color-nexus-emerald)'
            default: return 'var(--color-steel)'
        }
    }

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'bullish': return <TrendingUp size={14} className="sentiment-icon bullish" />
            case 'bearish': return <TrendingDown size={14} className="sentiment-icon bearish" />
            default: return null
        }
    }

    return (
        <div className="news-widget glass-card">
            <div className="news-header">
                <div className="news-title-section">
                    <h3 className="news-title">Market News</h3>
                    <span className="news-subtitle">Real-time updates</span>
                </div>
                <div className="news-actions">
                    <span className="last-updated">
                        <Clock size={12} />
                        {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                        className={`refresh-btn ${isLoading ? 'spinning' : ''}`}
                        onClick={refreshNews}
                        disabled={isLoading}
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            <div className="news-list">
                {news.map((item, index) => (
                    <article
                        key={item.id}
                        className="news-item animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <div className="news-item-header">
                            <span
                                className="impact-indicator"
                                style={{ backgroundColor: getImpactColor(item.impact) }}
                            ></span>
                            <span className="currency-badge">{item.currency}</span>
                            {getSentimentIcon(item.sentiment)}
                        </div>
                        <h4 className="news-item-title">{item.title}</h4>
                        <div className="news-item-meta">
                            <span className="news-source">{item.source}</span>
                            <span className="news-time">{item.time}</span>
                        </div>
                    </article>
                ))}
            </div>

            <button className="view-all-btn">
                View All News
                <ExternalLink size={14} />
            </button>

            <style jsx>{`
        .news-widget {
          padding: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .news-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--glass-border);
        }

        .news-title-section {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .news-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-ivory);
        }

        .news-subtitle {
          font-size: 12px;
          color: var(--color-steel);
        }

        .news-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .last-updated {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--color-steel);
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          color: var(--color-silver);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .refresh-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-pearl);
        }

        .refresh-btn.spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .news-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .news-item {
          padding: 14px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid transparent;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          cursor: pointer;
          opacity: 0;
        }

        .news-item:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: var(--glass-border);
        }

        .news-item-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .impact-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .currency-badge {
          padding: 2px 8px;
          background: rgba(0, 212, 255, 0.1);
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          color: var(--color-nexus-cyan);
          letter-spacing: 0.05em;
        }

        :global(.sentiment-icon) {
          margin-left: auto;
        }

        :global(.sentiment-icon.bullish) {
          color: var(--color-nexus-emerald);
        }

        :global(.sentiment-icon.bearish) {
          color: var(--color-nexus-crimson);
        }

        .news-item-title {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-pearl);
          line-height: 1.5;
          margin-bottom: 8px;
        }

        .news-item-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .news-source {
          font-size: 11px;
          font-weight: 500;
          color: var(--color-silver);
        }

        .news-time {
          font-size: 11px;
          color: var(--color-steel);
        }

        .view-all-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          margin-top: 16px;
          background: transparent;
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          color: var(--color-silver);
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .view-all-btn:hover {
          background: rgba(255, 255, 255, 0.03);
          color: var(--color-pearl);
          border-color: rgba(255, 255, 255, 0.1);
        }
      `}</style>
        </div>
    )
}
