"use client"

import { useState, useEffect } from "react"
import { ArrowUpDown, Plus, RefreshCw, TrendingUp, Check, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid } from "recharts"
import { fetchExchangeRates, fetchAllCurrencies, fetchHistoricalRates, fetchBTCRates } from "@/lib/api"
import type { ConversionResult } from "@/types/currency"
import { motion, AnimatePresence } from "framer-motion"
import { subDays, format } from 'date-fns'
import WorldCurrencyMap from './world-currency-map'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define the type for saved currencies
interface SavedCurrency {
  code: string
  amount: number
  timestamp: number
  baseAmount: number  // Adding baseAmount to store original amount
  baseCurrency: string // Adding baseCurrency to store original currency
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export default function CurrencyExchange() {
  const [currencies, setCurrencies] = useState<Record<string, { name: string, code: string }>>({})
  const [rates, setRates] = useState<Record<string, number>>({})
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("EUR")
  const [amount, setAmount] = useState("1000")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<{ date: string; rate: number }[]>([])
  const [savedCurrencies, setSavedCurrencies] = useState<SavedCurrency[]>([])
  const [btcRates, setBtcRates] = useState<Record<string, number>>({})
  const [btcAmount, setBtcAmount] = useState("1")
  const [selectedFiat, setSelectedFiat] = useState("USD")
  const [btcLoading, setBtcLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState<string | null>(null);

  // Load saved currencies from localStorage on initial render
  useEffect(() => {
    const saved = localStorage.getItem('savedCurrencies')
    if (saved) {
      setSavedCurrencies(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    const updateTime = () => setCurrentTime(formatTime(new Date()));
    updateTime(); // Set the initial time
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);


  // Save to localStorage whenever savedCurrencies changes
  useEffect(() => {
    localStorage.setItem('savedCurrencies', JSON.stringify(savedCurrencies))
  }, [savedCurrencies])

  useEffect(() => {
    loadCurrencies()
  }, [])

  useEffect(() => {
    if (fromCurrency && toCurrency) {
      loadRates(fromCurrency)
      loadHistoricalData(fromCurrency, toCurrency)
    }
  }, [fromCurrency, toCurrency])

  useEffect(() => {
    loadBTCRates()
  }, [])

  async function loadCurrencies() {
    try {
      const data = await fetchAllCurrencies()
      setCurrencies(data)
    } catch (err) {
      setError("Failed to load currencies")
    }
  }

  async function loadRates(currency: string) {
    try {
      setLoading(true)
      const data = await fetchExchangeRates(currency)
      setRates(data)
      convertAmount(amount, currency, toCurrency, data)
    } catch (err) {
      setError("Failed to load exchange rates")
    } finally {
      setLoading(false)
    }
  }

  async function loadHistoricalData(from: string, to: string) {
    try {
      setLoading(true);

      const dates = Array.from({ length: 7 }, (_, i) =>
        format(subDays(new Date(), i), 'yyyy-MM-dd')
      ).reverse();

      const historicalData = await Promise.all(
        dates.map(async (date) => {
          try {
            const data = await fetchHistoricalRates(date, from);
            return { date, rate: data[to.toLowerCase()] || 0 };
          } catch (error) {
            console.warn(`No data for ${date}:`, error);
            return { date, rate: 0 };
          }
        })
      );

      setChartData(historicalData);
    } catch (err) {
      console.error('Error loading historical data:', err);
      setError('Failed to load historical data');
    } finally {
      setLoading(false);
    }
  }

  async function loadBTCRates() {
    try {
      setBtcLoading(true)
      const data = await fetchBTCRates()
      setBtcRates(data)
    } catch (err) {
      setError("Failed to load BTC rates")
    } finally {
      setBtcLoading(false)
    }
  }

  function convertAmount(
    amount: string,
    from: string,
    to: string,
    currentRates: Record<string, number>
  ) {
    const rate = currentRates[to.toLowerCase()]
    if (!rate || isNaN(Number(amount))) return

    setResult({
      fromAmount: Number(amount),
      toAmount: Number(amount) * rate,
      rate,
      timestamp: Date.now()
    })
  }

  function handleSwapCurrencies() {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  function handleSaveCurrency() {
    if (!result) return

    const newSavedCurrency: SavedCurrency = {
      code: toCurrency,
      amount: result.toAmount,
      timestamp: Date.now(),
      baseAmount: result.fromAmount,
      baseCurrency: fromCurrency
    }

    // Check if currency is already saved
    const existingIndex = savedCurrencies.findIndex(c => c.code === toCurrency)

    if (existingIndex !== -1) {
      // Update existing entry
      const updatedSavedCurrencies = [...savedCurrencies]
      updatedSavedCurrencies[existingIndex] = newSavedCurrency
      setSavedCurrencies(updatedSavedCurrencies)
    } else {
      // Add new entry
      setSavedCurrencies(prev => [...prev, newSavedCurrency])
    }
  }

  function handleRemoveSavedCurrency(code: string) {
    setSavedCurrencies(prev => prev.filter(c => c.code !== code))
  }

  const isCurrencySaved = result && savedCurrencies.some(c =>
    c.code === toCurrency && Math.abs(c.amount - result.toAmount) < 0.01
  )

  // Calculate the current value of a saved currency based on current rates
  function calculateCurrentValue(saved: SavedCurrency) {
    if (!rates) return null

    // First convert the saved base amount to the current fromCurrency if different
    let baseAmountInFromCurrency = saved.baseAmount
    if (saved.baseCurrency !== fromCurrency) {
      const conversionRate = rates[saved.baseCurrency.toLowerCase()]
      if (!conversionRate) return null
      baseAmountInFromCurrency = saved.baseAmount / conversionRate
    }

    // Then convert to the saved currency using current rates
    const currentRate = rates[saved.code.toLowerCase()]
    if (!currentRate) return null

    return baseAmountInFromCurrency * currentRate
  }

  // Calculate BTC value in selected fiat currency
  function calculateBTCValue(amount: string, currency: string): string {
    if (!btcRates[currency.toLowerCase()] || isNaN(Number(amount))) return "0.00"
    return (Number(amount) * btcRates[currency.toLowerCase()]).toFixed(2)
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-grow bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg overflow-hidden">
          <CardContent className="p-8">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-50 text-red-500 p-4 rounded-lg mb-6"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative flex flex-col lg:flex-row items-center justify-center gap-9">
              {/* You Send Section */}
              <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">You Send</h2>
                <div className="flex items-center gap-4">
                  <Select
                    value={fromCurrency}
                    onValueChange={(value) => {
                      setFromCurrency(value);
                      setError(null);
                    }}
                  >
                    <SelectTrigger className="w-40 bg-blue-50 border border-blue-200 rounded-lg">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(currencies).map(([code, currency]) => (
                        <SelectItem key={code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      convertAmount(e.target.value, fromCurrency, toCurrency, rates);
                    }}
                    className="flex-1 text-lg font-medium bg-blue-50 border border-blue-200 rounded-lg"
                    type="number"
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              {/* Exchange Icon */}
              <div className="absolute lg:relative z-10">
                <Button
                  onClick={handleSwapCurrencies}
                  className="w-14 h-14 rounded-full shadow-md bg-gradient-to-br from-blue-100 to-blue-50 border border-gray-200 flex items-center justify-center hover:scale-105 transition-transform"
                  aria-label="Swap currencies"
                >
                  <ArrowUpDown className="w-6 h-6 text-blue-500" />
                </Button>
              </div>

              {/* You Get Section */}
              <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">You Get</h2>
                <div className="flex items-center gap-4">
                  <Select
                    value={toCurrency}
                    onValueChange={(value) => {
                      setToCurrency(value);
                      convertAmount(amount, fromCurrency, value, rates);
                    }}
                  >
                    <SelectTrigger className="w-40 bg-pink-50 border border-pink-200 rounded-lg">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(currencies).map(([code, currency]) => (
                        <SelectItem key={code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={result ? result.toAmount.toFixed(2) : "0.00"}
                    className="flex-1 text-lg font-medium bg-pink-50 border border-pink-200 rounded-lg"
                    readOnly
                    placeholder="Converted amount"
                  />
                </div>
              </div>
            </div>
            <div className="mt-12 bg-white p-6 rounded-2xl shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-700">Exchange Rate History</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    loadRates(fromCurrency)
                    loadHistoricalData(fromCurrency, toCurrency)
                  }}
                  disabled={loading}
                  className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              <div className="h-[300px] mt-4">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        stroke="#718096"
                      />
                      <YAxis stroke="#718096" />
                      <Tooltip
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value: number) => value.toFixed(4)}
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="#F687B3"
                        strokeWidth={3}
                        dot={{ fill: "#F687B3", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, fill: "#D53F8C" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No historical data available
                  </div>
                )}
              </div>

              {result && (
                <div className="mt-4 text-sm text-gray-500 text-center">
                  1 {fromCurrency} = {result.rate.toFixed(4)} {toCurrency}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="w-full lg:w-96 space-y-6">
          <Card className="bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-3xl shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <motion.div
                    className="text-4xl font-bold"
                    key={result?.timestamp}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    {result ? result.toAmount.toFixed(2) : "0.00"}
                  </motion.div>
                  <div className="text-sm opacity-80 mt-1">{toCurrency}</div>
                </div>
                <Button
                  size="icon"
                  className="rounded-xl bg-white/20 hover:bg-white/30 text-white"
                  onClick={handleSaveCurrency}
                  disabled={!result}
                  title={isCurrencySaved ? "Currency saved" : "Save currency"}
                >
                  {isCurrencySaved ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <TrendingUp className="h-5 w-5" />
                <div className="text-sm">
                  Updated: {currentTime || "Loading..."}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-yellow-500 text-white rounded-3xl shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Bitcoin Exchange</h3>
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <label className="block text-sm font-medium mb-2">BTC Amount</label>
                  <div className="flex items-center gap-4">
                    <Input
                      value={btcAmount}
                      onChange={(e) => setBtcAmount(e.target.value)}
                      className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50"
                      type="number"
                      placeholder="Enter BTC amount"
                    />
                    <div className="font-mono text-lg">BTC</div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <label className="block text-sm font-medium mb-2">Select Currency</label>
                  <div className="flex items-center gap-4">
                    <Select value={selectedFiat} onValueChange={setSelectedFiat}>
                      <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <div className="p-2">
                          <Input
                            placeholder="Search currencies..."
                            className="mb-2 currency-search"
                            onChange={(e) => {
                              const searchInput = document.querySelector('.currency-search') as HTMLInputElement;
                              if (searchInput) {
                                searchInput.value = e.target.value;
                                const event = new Event('input', { bubbles: true });
                                searchInput.dispatchEvent(event);
                              }
                            }}
                          />
                        </div>
                        <div className="overflow-y-auto max-h-[200px]">
                          {Object.entries(currencies)
                            .sort(([, a], [, b]) => a.code.localeCompare(b.code))
                            .map(([code, currency]) => (
                              <SelectItem
                                key={code}
                                value={currency.code}
                                className="currency-item"
                              >
                                <span className="flex items-center gap-2">
                                  <span className="font-mono w-12">{currency.code}</span>
                                  <span className="truncate">{currency.name}</span>
                                </span>
                              </SelectItem>
                            ))}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Converted Amount</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadBTCRates}
                      disabled={btcLoading}
                      className="hover:bg-white/10 text-white"
                    >
                      <RefreshCw className={`h-4 w-4 ${btcLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  <div className="mt-2 text-3xl font-bold font-mono">
                    {calculateBTCValue(btcAmount, selectedFiat)}
                    <span className="text-lg ml-2">{selectedFiat}</span>
                  </div>
                  {btcRates[selectedFiat.toLowerCase()] && (
                    <div className="mt-2 text-sm text-white/70">
                      1 BTC = {btcRates[selectedFiat.toLowerCase()].toFixed(2)} {selectedFiat}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-lg overflow-hidden">
            <CardContent className="p-6 bg-gradient-to-br from-blue-500 to-blue-600">
              <Tabs defaultValue="saved" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/10 mb-4">
                  <TabsTrigger
                    value="saved"
                    className="data-[state=active]:bg-white/20 text-white"
                  >
                    Saved
                  </TabsTrigger>
                  <TabsTrigger
                    value="popular"
                    className="data-[state=active]:bg-white/20 text-white"
                  >
                    Popular
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="saved" className="mt-0">
                  <div className="space-y-4">
                    {savedCurrencies.length === 0 ? (
                      <div className="text-center text-white/70 py-4">
                        No saved currencies yet
                      </div>
                    ) : (
                      savedCurrencies.map((saved) => {
                        const currentValue = calculateCurrentValue(saved)
                        const percentageChange = currentValue
                          ? ((currentValue - saved.amount) / saved.amount) * 100
                          : 0

                        return (
                          <div key={saved.code} className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-medium text-white">
                                {saved.code}
                              </div>
                              <div>
                                <div className="font-medium text-white">
                                  {currentValue?.toFixed(2) ?? "N/A"}
                                </div>
                                <div className="text-sm text-blue-100">
                                  {currencies[saved.code.toLowerCase()]?.name}
                                </div>
                                <div className={`text-xs ${percentageChange > 0 ? 'text-green-400' :
                                    percentageChange < 0 ? 'text-red-400' :
                                      'text-blue-100'
                                  }`}>
                                  {percentageChange > 0 ? '↑' : percentageChange < 0 ? '↓' : ''}
                                  {Math.abs(percentageChange).toFixed(2)}%
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="text-sm text-blue-100">
                                {saved.baseAmount.toFixed(2)} {saved.baseCurrency}
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="hover:bg-white/10 text-white"
                                onClick={() => handleRemoveSavedCurrency(saved.code)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="popular" className="mt-0">
                  <div className="space-y-4">
                    {["USD", "EUR", "GBP", "JPY", "AUD"].map((code) => (
                      <div key={code} className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-3 group hover:bg-white/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-medium text-white">
                            {code}
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {currencies[code.toLowerCase()]?.name}
                            </div>
                            <div className="text-sm text-blue-100">
                              {code}
                            </div>
                          </div>
                        </div>
                        {rates[code.toLowerCase()] && (
                          <div className="text-right">
                            <div className="font-medium text-white">
                              {rates[code.toLowerCase()].toFixed(4)}
                            </div>
                            <div className="text-sm text-blue-100">Rate</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      <WorldCurrencyMap />
    </div>
  )
}

