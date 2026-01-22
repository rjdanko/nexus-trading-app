'use client'

import { useState, useMemo } from 'react'
import { Calculator, ChevronDown, DollarSign, Percent, Target, AlertTriangle } from 'lucide-react'
import { ASSETS, AssetConfig, calculateLotSize } from '@/lib/riskCalculator'

export default function RiskCalculator() {
    const [accountBalance, setAccountBalance] = useState(10000)
    const [riskPercent, setRiskPercent] = useState(1)
    const [stopLossPips, setStopLossPips] = useState(20)
    const [takeProfitPips, setTakeProfitPips] = useState(40)
    const [selectedAsset, setSelectedAsset] = useState<AssetConfig>(ASSETS['EURUSD'])
    const [showAssetDropdown, setShowAssetDropdown] = useState(false)

    // Calculate lot size whenever inputs change using useMemo
    const calculationResult = useMemo(() => {
        const result = calculateLotSize(accountBalance, riskPercent, stopLossPips, selectedAsset)
        const riskAmount = accountBalance * (riskPercent / 100)
        const potentialProfit = (riskAmount / stopLossPips) * takeProfitPips
        const riskRewardRatio = takeProfitPips / stopLossPips

        return {
            lotSize: result.lotSize,
            riskAmount,
            potentialProfit,
            riskRewardRatio
        }
    }, [accountBalance, riskPercent, stopLossPips, takeProfitPips, selectedAsset])

    const assetCategories = [
        { name: 'Forex', assets: Object.values(ASSETS).filter(a => a.category === 'forex') },
        { name: 'Indices', assets: Object.values(ASSETS).filter(a => a.category === 'indices') },
        { name: 'Commodities', assets: Object.values(ASSETS).filter(a => a.category === 'commodities') },
        { name: 'Crypto', assets: Object.values(ASSETS).filter(a => a.category === 'crypto') },
    ]

    return (
        <div className="calculator-widget glass-card">
            <div className="calculator-header">
                <div className="calculator-title-section">
                    <div className="calculator-icon">
                        <Calculator size={20} />
                    </div>
                    <div>
                        <h3 className="calculator-title">Risk Calculator</h3>
                        <span className="calculator-subtitle">Position sizing tool</span>
                    </div>
                </div>
            </div>

            <div className="calculator-body">
                {/* Asset Selector */}
                <div className="input-group">
                    <label className="input-label">Trading Pair</label>
                    <div className="asset-selector">
                        <button
                            className="asset-selector-btn"
                            onClick={() => setShowAssetDropdown(!showAssetDropdown)}
                        >
                            <span className="asset-name">{selectedAsset.name}</span>
                            <span className="asset-symbol">{selectedAsset.symbol}</span>
                            <ChevronDown size={16} className={showAssetDropdown ? 'rotated' : ''} />
                        </button>

                        {showAssetDropdown && (
                            <div className="asset-dropdown">
                                {assetCategories.map(category => (
                                    <div key={category.name} className="asset-category">
                                        <span className="category-name">{category.name}</span>
                                        <div className="category-assets">
                                            {category.assets.map(asset => (
                                                <button
                                                    key={asset.symbol}
                                                    className={`asset-option ${selectedAsset.symbol === asset.symbol ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setSelectedAsset(asset)
                                                        setShowAssetDropdown(false)
                                                    }}
                                                >
                                                    {asset.symbol}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Grid */}
                <div className="input-grid">
                    <div className="input-group">
                        <label className="input-label">
                            <DollarSign size={12} />
                            Account Balance
                        </label>
                        <div className="input-with-prefix">
                            <span className="input-prefix">$</span>
                            <input
                                type="number"
                                value={accountBalance}
                                onChange={(e) => setAccountBalance(Number(e.target.value))}
                                className="input-field has-prefix"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            <Percent size={12} />
                            Risk Percentage
                        </label>
                        <div className="input-with-suffix">
                            <input
                                type="number"
                                value={riskPercent}
                                onChange={(e) => setRiskPercent(Number(e.target.value))}
                                step="0.5"
                                min="0.1"
                                max="10"
                                className="input-field has-suffix"
                            />
                            <span className="input-suffix">%</span>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            <AlertTriangle size={12} />
                            Stop Loss
                        </label>
                        <div className="input-with-suffix">
                            <input
                                type="number"
                                value={stopLossPips}
                                onChange={(e) => setStopLossPips(Number(e.target.value))}
                                className="input-field has-suffix"
                            />
                            <span className="input-suffix">pips</span>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            <Target size={12} />
                            Take Profit
                        </label>
                        <div className="input-with-suffix">
                            <input
                                type="number"
                                value={takeProfitPips}
                                onChange={(e) => setTakeProfitPips(Number(e.target.value))}
                                className="input-field has-suffix"
                            />
                            <span className="input-suffix">pips</span>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="results-section">
                    <div className="result-main">
                        <span className="result-label">Recommended Lot Size</span>
                        <span className="result-value font-mono">
                            {calculationResult.lotSize.toFixed(2)}
                        </span>
                        <span className="result-unit">lots</span>
                    </div>

                    <div className="results-grid">
                        <div className="result-item">
                            <span className="result-item-label">Risk Amount</span>
                            <span className="result-item-value risk">
                                ${calculationResult.riskAmount.toFixed(2)}
                            </span>
                        </div>
                        <div className="result-item">
                            <span className="result-item-label">Potential Profit</span>
                            <span className="result-item-value profit">
                                ${calculationResult.potentialProfit.toFixed(2)}
                            </span>
                        </div>
                        <div className="result-item full-width">
                            <span className="result-item-label">Risk : Reward</span>
                            <span className="result-item-value rr">
                                1 : {calculationResult.riskRewardRatio.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .calculator-widget {
          padding: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .calculator-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--glass-border);
        }

        .calculator-title-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .calculator-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 212, 255, 0.05));
          border-radius: var(--radius-md);
          color: var(--color-nexus-cyan);
        }

        .calculator-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-ivory);
        }

        .calculator-subtitle {
          font-size: 12px;
          color: var(--color-steel);
        }

        .calculator-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          color: var(--color-silver);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .asset-selector {
          position: relative;
        }

        .asset-selector-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          background: rgba(10, 10, 15, 0.6);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          color: var(--color-ivory);
          font-family: var(--font-display);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .asset-selector-btn:hover {
          border-color: rgba(255, 255, 255, 0.15);
        }

        .asset-name {
          font-size: 14px;
          font-weight: 500;
        }

        .asset-symbol {
          margin-left: auto;
          padding: 2px 8px;
          background: rgba(0, 212, 255, 0.1);
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          color: var(--color-nexus-cyan);
          font-family: var(--font-mono);
        }

        .asset-selector-btn :global(svg) {
          transition: transform var(--transition-fast);
          color: var(--color-steel);
        }

        .asset-selector-btn :global(svg.rotated) {
          transform: rotate(180deg);
        }

        .asset-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          max-height: 300px;
          overflow-y: auto;
          background: var(--color-obsidian);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 12px;
          z-index: 100;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
        }

        .asset-category {
          margin-bottom: 12px;
        }

        .asset-category:last-child {
          margin-bottom: 0;
        }

        .category-name {
          display: block;
          font-size: 10px;
          font-weight: 600;
          color: var(--color-steel);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
        }

        .category-assets {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .asset-option {
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 6px;
          color: var(--color-silver);
          font-family: var(--font-mono);
          font-size: 11px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .asset-option:hover {
          background: rgba(255, 255, 255, 0.06);
          color: var(--color-pearl);
        }

        .asset-option.selected {
          background: rgba(0, 212, 255, 0.15);
          border-color: rgba(0, 212, 255, 0.3);
          color: var(--color-nexus-cyan);
        }

        .input-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .input-with-prefix,
        .input-with-suffix {
          position: relative;
        }

        .input-prefix,
        .input-suffix {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-steel);
          font-size: 13px;
          pointer-events: none;
        }

        .input-prefix {
          left: 14px;
        }

        .input-suffix {
          right: 14px;
          font-family: var(--font-mono);
          font-size: 11px;
        }

        .input-field.has-prefix {
          padding-left: 32px;
        }

        .input-field.has-suffix {
          padding-right: 48px;
        }

        .results-section {
          margin-top: auto;
          padding: 20px;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(168, 85, 247, 0.03));
          border: 1px solid rgba(0, 212, 255, 0.15);
          border-radius: var(--radius-lg);
        }

        .result-main {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--glass-border);
        }

        .result-label {
          font-size: 12px;
          color: var(--color-silver);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .result-value {
          font-size: 48px;
          font-weight: 700;
          color: var(--color-nexus-cyan);
          line-height: 1;
          text-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
        }

        .result-unit {
          font-size: 14px;
          color: var(--color-steel);
          margin-top: 4px;
        }

        .results-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .result-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-sm);
        }

        .result-item.full-width {
          grid-column: span 2;
        }

        .result-item-label {
          font-size: 11px;
          color: var(--color-steel);
          margin-bottom: 4px;
        }

        .result-item-value {
          font-family: var(--font-mono);
          font-size: 16px;
          font-weight: 600;
        }

        .result-item-value.risk {
          color: var(--color-nexus-crimson);
        }

        .result-item-value.profit {
          color: var(--color-nexus-emerald);
        }

        .result-item-value.rr {
          color: var(--color-nexus-amber);
        }
      `}</style>
        </div>
    )
}
