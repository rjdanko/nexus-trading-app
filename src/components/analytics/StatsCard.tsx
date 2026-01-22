'use client'

import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: string | number
    subtitle?: string
    change?: number
    changeLabel?: string
    icon?: LucideIcon
    variant?: 'default' | 'success' | 'danger' | 'warning' | 'info'
    size?: 'default' | 'large'
}

export default function StatsCard({
    title,
    value,
    subtitle,
    change,
    changeLabel,
    icon: Icon,
    variant = 'default',
    size = 'default'
}: StatsCardProps) {
    const getVariantStyles = () => {
        switch (variant) {
            case 'success':
                return {
                    iconBg: 'rgba(0, 255, 136, 0.1)',
                    iconColor: 'var(--color-nexus-emerald)',
                    glowColor: 'rgba(0, 255, 136, 0.15)'
                }
            case 'danger':
                return {
                    iconBg: 'rgba(255, 51, 102, 0.1)',
                    iconColor: 'var(--color-nexus-crimson)',
                    glowColor: 'rgba(255, 51, 102, 0.15)'
                }
            case 'warning':
                return {
                    iconBg: 'rgba(255, 170, 0, 0.1)',
                    iconColor: 'var(--color-nexus-amber)',
                    glowColor: 'rgba(255, 170, 0, 0.15)'
                }
            case 'info':
                return {
                    iconBg: 'rgba(0, 212, 255, 0.1)',
                    iconColor: 'var(--color-nexus-cyan)',
                    glowColor: 'rgba(0, 212, 255, 0.15)'
                }
            default:
                return {
                    iconBg: 'rgba(255, 255, 255, 0.05)',
                    iconColor: 'var(--color-silver)',
                    glowColor: 'transparent'
                }
        }
    }

    const styles = getVariantStyles()

    const getChangeIcon = () => {
        if (change === undefined) return null
        if (change > 0) return <TrendingUp size={14} />
        if (change < 0) return <TrendingDown size={14} />
        return <Minus size={14} />
    }

    const getChangeColor = () => {
        if (change === undefined) return 'var(--color-steel)'
        if (change > 0) return 'var(--color-nexus-emerald)'
        if (change < 0) return 'var(--color-nexus-crimson)'
        return 'var(--color-steel)'
    }

    return (
        <div className={`stats-card glass-card ${size}`}>
            <div className="stats-header">
                {Icon && (
                    <div
                        className="stats-icon"
                        style={{
                            background: styles.iconBg,
                            boxShadow: `0 0 20px ${styles.glowColor}`
                        }}
                    >
                        <Icon size={size === 'large' ? 24 : 20} style={{ color: styles.iconColor }} />
                    </div>
                )}
                <span className="stats-title">{title}</span>
            </div>

            <div className="stats-body">
                <span className="stats-value font-mono">{value}</span>
                {subtitle && <span className="stats-subtitle">{subtitle}</span>}
            </div>

            {change !== undefined && (
                <div className="stats-footer">
                    <span className="stats-change" style={{ color: getChangeColor() }}>
                        {getChangeIcon()}
                        {change > 0 ? '+' : ''}{change}%
                    </span>
                    {changeLabel && <span className="stats-change-label">{changeLabel}</span>}
                </div>
            )}

            <style jsx>{`
        .stats-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
          overflow: hidden;
        }

        .stats-card.large {
          padding: 24px;
        }

        .stats-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 100px;
          height: 100px;
          background: ${styles.glowColor};
          filter: blur(40px);
          border-radius: 50%;
          pointer-events: none;
        }

        .stats-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stats-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${size === 'large' ? '48px' : '40px'};
          height: ${size === 'large' ? '48px' : '40px'};
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }

        .stats-title {
          font-size: ${size === 'large' ? '14px' : '12px'};
          font-weight: 500;
          color: var(--color-silver);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stats-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stats-value {
          font-size: ${size === 'large' ? '36px' : '28px'};
          font-weight: 700;
          color: var(--color-ivory);
          line-height: 1.1;
        }

        .stats-subtitle {
          font-size: 13px;
          color: var(--color-steel);
        }

        .stats-footer {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-top: 12px;
          border-top: 1px solid var(--glass-border);
        }

        .stats-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 500;
        }

        .stats-change-label {
          font-size: 12px;
          color: var(--color-steel);
        }
      `}</style>
        </div>
    )
}
