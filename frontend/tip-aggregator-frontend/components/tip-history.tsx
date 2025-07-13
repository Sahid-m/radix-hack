"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { History, Filter, TrendingUp, Users } from "lucide-react"
import type { MockContractState } from "@/lib/mock-contract"

interface TipHistoryProps {
  contractState: MockContractState
}

export function TipHistory({ contractState }: TipHistoryProps) {
  const [filterToken, setFilterToken] = useState("all")
  const [filterStreamer, setFilterStreamer] = useState("all")
  const [searchTipper, setSearchTipper] = useState("")

  const filteredHistory = contractState.tipHistory.filter((tip) => {
    const tokenMatch = filterToken === "all" || tip.tokenAddress === filterToken
    const streamerMatch = filterStreamer === "all" || tip.streamerAddress === filterStreamer
    const tipperMatch = !searchTipper || tip.tipperAddress.toLowerCase().includes(searchTipper.toLowerCase())

    return tokenMatch && streamerMatch && tipperMatch
  })

  // Calculate statistics
  const totalTips = filteredHistory.length
  const totalValue = filteredHistory.reduce((sum, tip) => sum + tip.amount, 0)
  const uniqueTippers = new Set(filteredHistory.map((tip) => tip.tipperAddress)).size
  const uniqueStreamers = new Set(filteredHistory.map((tip) => tip.streamerAddress)).size

  // Group by token for statistics
  const tipsByToken = filteredHistory.reduce(
    (acc, tip) => {
      if (!acc[tip.tokenAddress]) {
        acc[tip.tokenAddress] = { count: 0, amount: 0 }
      }
      acc[tip.tokenAddress].count += 1
      acc[tip.tokenAddress].amount += tip.amount
      return acc
    },
    {} as Record<string, { count: number; amount: number }>,
  )

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tips</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTips}</div>
            <p className="text-xs text-muted-foreground">All processed tips</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Tippers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueTippers}</div>
            <p className="text-xs text-muted-foreground">Different addresses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streamers Tipped</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueStreamers}</div>
            <p className="text-xs text-muted-foreground">Received tips</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Tip Size</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTips > 0 ? (totalValue / totalTips).toFixed(2) : "0"}</div>
            <p className="text-xs text-muted-foreground">Across all tokens</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Tips
          </CardTitle>
          <CardDescription>Filter the tip history by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="token-filter">Filter by Token</Label>
              <Select value={filterToken} onValueChange={setFilterToken}>
                <SelectTrigger>
                  <SelectValue placeholder="All tokens" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tokens</SelectItem>
                  {Object.entries(contractState.supportedTokens).map(([address, token]) => (
                    <SelectItem key={address} value={address}>
                      {token.symbol} - {token.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creator-filter">Filter by Streamer</Label>
              <Select value={filterStreamer} onValueChange={setFilterStreamer}>
                <SelectTrigger>
                  <SelectValue placeholder="All streamers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Streamers</SelectItem>
                  {contractState.streamers.map((streamer) => (
                    <SelectItem key={streamer.address} value={streamer.address}>
                      {streamer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipper-search">Search Tipper</Label>
              <Input
                id="tipper-search"
                placeholder="Enter tipper address..."
                value={searchTipper}
                onChange={(e) => setSearchTipper(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Statistics */}
      {Object.keys(tipsByToken).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tips by Token</CardTitle>
            <CardDescription>Breakdown of tips by token type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(tipsByToken).map(([tokenAddress, data]) => {
                const token = contractState.supportedTokens[tokenAddress]
                return (
                  <div key={tokenAddress} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xs">
                        {token?.symbol.charAt(0)}
                      </div>
                      <span className="font-medium">{token?.symbol}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{data.count} tips</p>
                      <p className="text-lg font-bold">
                        {data.amount.toFixed(2)} {token?.symbol}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tip History List */}
      <Card>
        <CardHeader>
          <CardTitle>Tip History</CardTitle>
          <CardDescription>Complete history of all processed tips ({filteredHistory.length} results)</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No tips found matching the current filters</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredHistory.reverse().map((tip, index) => {
                const token = contractState.supportedTokens[tip.tokenAddress]
                const streamer = contractState.streamers.find((c) => c.address === tip.streamerAddress)

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xs">
                        {streamer?.name.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium">
                          {tip.tipperAddress.slice(0, 8)}... → {streamer?.name || "Unknown Creator"}
                        </p>
                        <p className="text-sm text-muted-foreground">{tip.timestamp}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-400 rounded-full" />
                        {tip.amount} {token?.symbol}
                      </Badge>
                      <Badge variant="outline">Processed</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
