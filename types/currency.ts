export interface ExchangeRate {
  rate: number
  from: string
  to: string
}

export interface Currency {
  code: string
  name: string
  symbol: string
}

export interface CurrencyBalance {
  currency: Currency
  amount: number
}

export interface ConversionResult {
  fromAmount: number
  toAmount: number
  rate: number
  timestamp: number
}

