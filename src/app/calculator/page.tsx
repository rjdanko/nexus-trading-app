'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import RiskCalculator from '@/components/dashboard/RiskCalculator'
import { User } from '@supabase/supabase-js'

export default function CalculatorPage() {
    const [user, setUser] = useState<User | null>(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUser(user)
        }
        getUser()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="app-layout">
            <Sidebar />

            <main className="main-content">
                <Header
                    user={user}
                    title="Risk Calculator"
                    subtitle="Position sizing and risk management"
                />

                <div className="calculator-content">
                    <div className="calculator-wrapper">
                        <RiskCalculator />
                    </div>

                    <div className="info-section glass-card">
                        <h3>💡 Risk Management Tips</h3>
                        <ul>
                            <li>Never risk more than <strong>1-2%</strong> of your account per trade</li>
                            <li>Aim for a minimum risk-reward ratio of <strong>1:2</strong></li>
                            <li>Adjust lot size based on stop loss distance, not targets</li>
                            <li>Consider volatility when setting stop loss levels</li>
                            <li>Keep a trading journal to track your risk management</li>
                        </ul>
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
        .calculator-content {
          flex: 1;
          padding: 24px 32px;
          display: grid;
          grid-template-columns: 500px 1fr;
          gap: 24px;
          align-items: start;
        }
        .calculator-wrapper {
          min-height: 600px;
        }
        .info-section {
          padding: 24px;
        }
        .info-section h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-ivory);
          margin-bottom: 16px;
        }
        .info-section ul {
          margin: 0;
          padding-left: 20px;
        }
        .info-section li {
          font-size: 14px;
          color: var(--color-silver);
          line-height: 1.8;
          margin-bottom: 8px;
        }
        .info-section strong {
          color: var(--color-nexus-cyan);
        }
        @media (max-width: 1100px) {
          .calculator-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    )
}
