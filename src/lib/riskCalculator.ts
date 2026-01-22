export interface AssetConfig {
    name: string
    symbol: string
    pipValue: number // Value of 1 pip per standard lot
    pipSize: number // Decimal places for pip calculation
    category: 'forex' | 'indices' | 'commodities' | 'crypto'
    contractSize: number
}

export const ASSETS: Record<string, AssetConfig> = {
    // Major Forex Pairs
    'EURUSD': { name: 'EUR/USD', symbol: 'EURUSD', pipValue: 10, pipSize: 0.0001, category: 'forex', contractSize: 100000 },
    'GBPUSD': { name: 'GBP/USD', symbol: 'GBPUSD', pipValue: 10, pipSize: 0.0001, category: 'forex', contractSize: 100000 },
    'USDJPY': { name: 'USD/JPY', symbol: 'USDJPY', pipValue: 9.1, pipSize: 0.01, category: 'forex', contractSize: 100000 },
    'USDCHF': { name: 'USD/CHF', symbol: 'USDCHF', pipValue: 10.2, pipSize: 0.0001, category: 'forex', contractSize: 100000 },
    'AUDUSD': { name: 'AUD/USD', symbol: 'AUDUSD', pipValue: 10, pipSize: 0.0001, category: 'forex', contractSize: 100000 },
    'USDCAD': { name: 'USD/CAD', symbol: 'USDCAD', pipValue: 7.6, pipSize: 0.0001, category: 'forex', contractSize: 100000 },
    'NZDUSD': { name: 'NZD/USD', symbol: 'NZDUSD', pipValue: 10, pipSize: 0.0001, category: 'forex', contractSize: 100000 },

    // Cross Pairs
    'EURGBP': { name: 'EUR/GBP', symbol: 'EURGBP', pipValue: 12.7, pipSize: 0.0001, category: 'forex', contractSize: 100000 },
    'EURJPY': { name: 'EUR/JPY', symbol: 'EURJPY', pipValue: 9.1, pipSize: 0.01, category: 'forex', contractSize: 100000 },
    'GBPJPY': { name: 'GBP/JPY', symbol: 'GBPJPY', pipValue: 9.1, pipSize: 0.01, category: 'forex', contractSize: 100000 },

    // Indices
    'NAS100': { name: 'NASDAQ 100', symbol: 'NAS100', pipValue: 1, pipSize: 0.1, category: 'indices', contractSize: 1 },
    'US30': { name: 'Dow Jones 30', symbol: 'US30', pipValue: 1, pipSize: 0.1, category: 'indices', contractSize: 1 },
    'SPX500': { name: 'S&P 500', symbol: 'SPX500', pipValue: 1, pipSize: 0.1, category: 'indices', contractSize: 1 },
    'GER40': { name: 'DAX 40', symbol: 'GER40', pipValue: 1, pipSize: 0.1, category: 'indices', contractSize: 1 },
    'UK100': { name: 'FTSE 100', symbol: 'UK100', pipValue: 1, pipSize: 0.1, category: 'indices', contractSize: 1 },

    // Commodities
    'XAUUSD': { name: 'Gold', symbol: 'XAUUSD', pipValue: 1, pipSize: 0.01, category: 'commodities', contractSize: 100 },
    'XAGUSD': { name: 'Silver', symbol: 'XAGUSD', pipValue: 50, pipSize: 0.001, category: 'commodities', contractSize: 5000 },
    'USOIL': { name: 'WTI Crude Oil', symbol: 'USOIL', pipValue: 1, pipSize: 0.01, category: 'commodities', contractSize: 1000 },

    // Crypto
    'BTCUSD': { name: 'Bitcoin', symbol: 'BTCUSD', pipValue: 1, pipSize: 0.01, category: 'crypto', contractSize: 1 },
    'ETHUSD': { name: 'Ethereum', symbol: 'ETHUSD', pipValue: 1, pipSize: 0.01, category: 'crypto', contractSize: 1 },
}

export interface RiskCalculation {
    lotSize: number
    positionSize: number
    riskAmount: number
    potentialProfit: number
    riskRewardRatio: number
    pipValue: number
    pipsAtRisk: number
    pipsToTarget: number
}

export function calculateLotSize(
    accountBalance: number,
    riskPercent: number,
    stopLossPips: number,
    asset: AssetConfig
): RiskCalculation {
    const riskAmount = accountBalance * (riskPercent / 100)

    // Calculate lot size based on asset type
    let lotSize: number
    const pipValuePerLot = asset.pipValue

    if (asset.category === 'forex') {
        lotSize = riskAmount / (stopLossPips * pipValuePerLot)
    } else if (asset.category === 'indices') {
        // For indices, use point value calculation
        lotSize = riskAmount / stopLossPips
    } else if (asset.category === 'commodities') {
        if (asset.symbol === 'XAUUSD') {
            // Gold: 0.01 movement = $1 per lot
            lotSize = riskAmount / (stopLossPips * 100) // Convert to dollars per pip movement
        } else {
            lotSize = riskAmount / (stopLossPips * pipValuePerLot)
        }
    } else {
        // Crypto
        lotSize = riskAmount / (stopLossPips * pipValuePerLot)
    }

    // Round to appropriate decimal places
    lotSize = Math.floor(lotSize * 100) / 100 // Round down to 2 decimals

    const positionSize = lotSize * asset.contractSize
    const actualPipValue = lotSize * pipValuePerLot

    return {
        lotSize: Math.max(0.01, lotSize), // Minimum lot size
        positionSize,
        riskAmount,
        potentialProfit: 0, // Will be calculated with TP
        riskRewardRatio: 0, // Will be calculated with TP
        pipValue: actualPipValue,
        pipsAtRisk: stopLossPips,
        pipsToTarget: 0
    }
}

export function calculateRiskReward(
    entryPrice: number,
    stopLoss: number,
    takeProfit: number,
    asset: AssetConfig
): { riskPips: number; rewardPips: number; ratio: number } {
    const pipMultiplier = 1 / asset.pipSize

    const riskPips = Math.abs(entryPrice - stopLoss) * pipMultiplier
    const rewardPips = Math.abs(takeProfit - entryPrice) * pipMultiplier
    const ratio = riskPips > 0 ? rewardPips / riskPips : 0

    return {
        riskPips: Math.round(riskPips * 10) / 10,
        rewardPips: Math.round(rewardPips * 10) / 10,
        ratio: Math.round(ratio * 100) / 100
    }
}

export function getAssetsByCategory(category: AssetConfig['category']): AssetConfig[] {
    return Object.values(ASSETS).filter(asset => asset.category === category)
}

export function getAllAssets(): AssetConfig[] {
    return Object.values(ASSETS)
}
