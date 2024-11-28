"use client"

import { useState } from 'react'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
]

export default function StylishCurrencyConverter() {
  const [amount, setAmount] = useState('')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('EUR')
  const [convertedAmount, setConvertedAmount] = useState('')

  const handleConvert = () => {
    // Placeholder conversion (replace with actual API call)
    setConvertedAmount((parseFloat(amount) * 1.2).toFixed(2))
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-gray-800 text-white">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Currency Converter
              </h1>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-400 mb-1">
                  Amount
                </label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="from-currency" className="block text-sm font-medium text-gray-400 mb-1">
                    From
                  </label>
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger id="from-currency" className="w-full bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600 text-white">
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <span className="flex items-center">
                            <span className="mr-2">{currency.symbol}</span>
                            {currency.code}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="to-currency" className="block text-sm font-medium text-gray-400 mb-1">
                    To
                  </label>
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger id="to-currency" className="w-full bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600 text-white">
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <span className="flex items-center">
                            <span className="mr-2">{currency.symbol}</span>
                            {currency.code}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={handleConvert}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                size="lg"
              >
                Convert
              </Button>
            </div>
            <div className="flex flex-col justify-center items-center bg-gray-700 rounded-lg p-8">
              <div className="text-6xl font-bold mb-4">
                {convertedAmount || '0.00'}
              </div>
              <div className="text-xl text-gray-400">
                {toCurrency}
              </div>
              <div className="mt-8 flex items-center text-gray-400">
                <ArrowRight className="mr-2 h-4 w-4" />
                <span>1 {fromCurrency} = 1.20 {toCurrency}</span>
              </div>
              <div className="mt-2 flex items-center text-gray-400">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span>1 {toCurrency} = 0.83 {fromCurrency}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

