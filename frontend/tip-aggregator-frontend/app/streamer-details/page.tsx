"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, Search, Filter, BarChart3 } from "lucide-react"
import { WalletConnection } from "@/components/wallet-connection"
import { mockContract, type MockContractState } from "@/lib/mock-contract"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

export default function StreamerDetailsPage() {
  const [contractState, setContractState] = useState<MockContractState>(mockContract.getState())
  const [isConnected, setIsConnected] = useState(false)
  const [connectedAddress, setConnectedAddress] = useState("")
  const [searchStreamer, setSearchStreamer] = useState("")
  const [filterToken, setFilterToken] = useState("all")

  useEffect(() => {
    const interval = setInterval(() => {
      setContractState(mockContract.getState())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleWalletConnect = (address: string) => {
    setIsConnected(true)
    setConnectedAddress(address)
    toast({
      title: "Wallet Connected",
      description: `Connected to ${address}`,
    })
  }

  const handleWalletDisconnect = () => {
    setIsConnected(false)
    setConnectedAddress("")
    toast({
      title: "Wallet Disconnected",
      description: "Wallet has been disconnected",
    })
  }

  // Filter tips based on search and filter criteria
  const filteredTips = contractState.tipHistory.filter((tip) => {
    const streamerMatch =
      !searchStreamer ||
      tip.streamerAddress.toLowerCase().includes(searchStreamer.toLowerCase()) ||
      contractState.streamers
        .find((s) => s.address === tip.streamerAddress)
        ?.name.toLowerCase()
        .includes(searchStreamer.toLowerCase())

    const tokenMatch = filterToken === "all" || tip.tokenAddress === filterToken

    return streamerMatch && tokenMatch
  })

  // Calculate analytics
  const analytics = {
    totalTips: filteredTips.length,
    uniqueStreamers: new Set(filteredTips.map((tip) => tip.streamerAddress)).size,
    uniqueTippers: new Set(filteredTips.map((tip) => tip.tipperAddress)).size,
    totalValue: filteredTips.reduce((sum, tip) => sum + tip.amount, 0),
  }

  // Group tips by streamer
  const tipsByStreamer = filteredTips.reduce(
    (acc, tip) => {
      const streamer = contractState.streamers.find((s) => s.address === tip.streamerAddress)
      const streamerName = streamer?.name || "Unknown Streamer"

      if (!acc[tip.streamerAddress]) {
        acc[tip.streamerAddress] = {
          name: streamerName,
          address: tip.streamerAddress,
          tips: [],
          totalAmount: 0,
          tipCount: 0,
        }
      }

      acc[tip.streamerAddress].tips.push(tip)
      acc[tip.streamerAddress].totalAmount += tip.amount
      acc[tip.streamerAddress].tipCount += 1

      return acc
    },
    {} as Record<string, { name: string; address: string; tips: any[]; totalAmount: number; tipCount: number }>,
  )

  // Group tips by token
  const tipsByToken = filteredTips.reduce(
    (acc, tip) => {
      const token = contractState.supportedTokens[tip.tokenAddress]
      if (!acc[tip.tokenAddress]) {
        acc[tip.tokenAddress] = {
          symbol: token?.symbol || "Unknown",
          name: token?.name || "Unknown Token",
          count: 0,
          amount: 0,
        }
      }
      acc[tip.tokenAddress].count += 1
      acc[tip.tokenAddress].amount += tip.amount
      return acc
    },
    {} as Record<string, { symbol: string; name: string; count: number; amount: number }>,
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-purple-200 hover:text-white hover:bg-purple-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white">Tip Analytics</h1>
              <p className="text-purple-200">Detailed analytics and tip history</p>
            </div>
          </div>
          <WalletConnection
            isConnected={isConnected}
            address={connectedAddress}
            onConnect={handleWalletConnect}
            onDisconnect={handleWalletDisconnect}
          />
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Total Tips</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analytics.totalTips}</div>
              <p className="text-xs text-purple-300">Processed tips</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Active Streamers</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analytics.uniqueStreamers}</div>
              <p className="text-xs text-purple-300">Received tips</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Unique Tippers</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analytics.uniqueTippers}</div>
              <p className="text-xs text-purple-300">Different addresses</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Avg Tip Size</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {analytics.totalTips > 0 ? (analytics.totalValue / analytics.totalTips).toFixed(2) : "0"}
              </div>
              <p className="text-xs text-purple-300">Across all tokens</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Filter className="h-5 w-5 text-purple-300" />
              Filter Analytics
            </CardTitle>
            <CardDescription className="text-purple-200">Filter the data by streamer or token</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="streamer-search" className="text-purple-200">
                  Search Streamer
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                  <Input
                    id="streamer-search"
                    placeholder="Search by name or address..."
                    value={searchStreamer}
                    onChange={(e) => setSearchStreamer(e.target.value)}
                    className="pl-10 bg-purple-700/50 border-purple-500 text-white placeholder:text-purple-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token-filter" className="text-purple-200">
                  Filter by Token
                </Label>
                <Select value={filterToken} onValueChange={setFilterToken}>
                  <SelectTrigger className="bg-purple-700/50 border-purple-500 text-white">
                    <SelectValue placeholder="All tokens" />
                  </SelectTrigger>
                  <SelectContent className="bg-purple-800 border-purple-600">
                    <SelectItem value="all" className="text-white hover:bg-purple-700">
                      All Tokens
                    </SelectItem>
                    {Object.entries(contractState.supportedTokens).map(([address, token]) => (
                      <SelectItem key={address} value={address} className="text-white hover:bg-purple-700">
                        {token.symbol} - {token.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tips by Token */}
          <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Tips by Token</CardTitle>
              <CardDescription className="text-purple-200">Breakdown of tips by token type</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(tipsByToken).length === 0 ? (
                <p className="text-center text-purple-300 py-8">No data available</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(tipsByToken).map(([tokenAddress, data]) => (
                    <div key={tokenAddress} className="p-4 bg-purple-700/50 rounded-lg border border-purple-600">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white text-sm">
                          {data.symbol.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{data.symbol}</p>
                          <p className="text-sm text-purple-300">{data.name}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-lg font-bold text-white">{data.count}</p>
                          <p className="text-sm text-purple-300">Tips</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-white">{data.amount.toFixed(2)}</p>
                          <p className="text-sm text-purple-300">Total Amount</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Streamers */}
          <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Streamer Rankings</CardTitle>
              <CardDescription className="text-purple-200">Top streamers by tip volume</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(tipsByStreamer).length === 0 ? (
                <p className="text-center text-purple-300 py-8">No data available</p>
              ) : (
                <div className="space-y-4">
                  {Object.values(tipsByStreamer)
                    .sort((a, b) => b.totalAmount - a.totalAmount)
                    .slice(0, 10)
                    .map((streamer, index) => (
                      <div
                        key={streamer.address}
                        className="flex items-center justify-between p-3 bg-purple-700/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-white">{streamer.name}</p>
                            <p className="text-sm text-purple-300">{streamer.address.slice(0, 10)}...</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">{streamer.tipCount} tips</p>
                          <p className="text-sm text-purple-300">{streamer.totalAmount.toFixed(2)} total</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Tips */}
        <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm mt-8">
          <CardHeader>
            <CardTitle className="text-white">Recent Tips ({filteredTips.length} results)</CardTitle>
            <CardDescription className="text-purple-200">Latest tip transactions matching your filters</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTips.length === 0 ? (
              <p className="text-center text-purple-300 py-8">No tips found matching the current filters</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredTips
                  .slice(-20)
                  .reverse()
                  .map((tip, index) => {
                    const token = contractState.supportedTokens[tip.tokenAddress]
                    const streamer = contractState.streamers.find((s) => s.address === tip.streamerAddress)

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-purple-700/50 rounded-lg hover:bg-purple-700/70 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs">
                            {streamer?.name.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {tip.tipperAddress.slice(0, 8)}... → {streamer?.name || "Unknown Streamer"}
                            </p>
                            <p className="text-sm text-purple-300">{tip.timestamp}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-purple-600 text-purple-100 flex items-center gap-1">
                            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-400 rounded-full" />
                            {tip.amount} {token?.symbol}
                          </Badge>
                          <Badge variant="outline" className="border-green-500 text-green-400">
                            Processed
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
