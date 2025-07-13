"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Coins, TrendingUp, Search } from "lucide-react"
import type { MockContractState } from "@/lib/mock-contract"

interface CreatorDashboardProps {
  contractState: MockContractState
  connectedAddress: string
}

export function CreatorDashboard({ contractState, connectedAddress }: CreatorDashboardProps) {
  const [searchAddress, setSearchAddress] = useState("")

  const streamersWithTips = contractState.streamersWithPendingTips.map((streamerAddress) => {
    const streamer = contractState.streamers.find((c) => c.address === streamerAddress)
    const pendingTips = contractState.pendingTips.filter((tip) => tip.streamerAddress === streamerAddress)

    // Group tips by token
    const tipsByToken = pendingTips.reduce(
      (acc, tip) => {
        if (!acc[tip.tokenAddress]) {
          acc[tip.tokenAddress] = { amount: 0, count: 0 }
        }
        acc[tip.tokenAddress].amount += tip.amount
        acc[tip.tokenAddress].count += 1
        return acc
      },
      {} as Record<string, { amount: number; count: number }>,
    )

    return {
      creator: streamer,
      pendingTips,
      tipsByToken,
    }
  })

  const searchedStreamer = searchAddress
    ? contractState.streamers.find((c) => c.address.toLowerCase().includes(searchAddress.toLowerCase()))
    : null

  const searchedStreamerTips = searchedStreamer
    ? contractState.pendingTips.filter((tip) => tip.streamerAddress === searchedStreamer.address)
    : []

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Streamers</TabsTrigger>
          <TabsTrigger value="search">Search Streamer</TabsTrigger>
          <TabsTrigger value="my-tips">My Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Streamers with Pending Tips
              </CardTitle>
              <CardDescription>View all streamers who have pending tips waiting to be processed</CardDescription>
            </CardHeader>
            <CardContent>
              {streamersWithTips.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No streamers have pending tips at the moment</p>
              ) : (
                <div className="grid gap-4">
                  {streamersWithTips.map(({ creator, pendingTips, tipsByToken }) => (
                    <Card key={creator?.address} className="border-l-4 border-l-purple-500">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white">
                                {creator?.name.charAt(0) || "?"}
                              </div>
                              <div>
                                <h3 className="font-semibold">{creator?.name || "Unknown Creator"}</h3>
                                <p className="text-sm text-muted-foreground font-mono">
                                  {creator?.address.slice(0, 20)}...
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-sm font-medium">Pending Tips by Token:</p>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(tipsByToken).map(([tokenAddress, data]) => {
                                  const token = contractState.supportedTokens[tokenAddress]
                                  return (
                                    <Badge key={tokenAddress} variant="secondary" className="flex items-center gap-1">
                                      <Coins className="h-3 w-3" />
                                      {data.amount} {token?.symbol} ({data.count} tips)
                                    </Badge>
                                  )
                                })}
                              </div>
                            </div>
                          </div>

                          <Badge variant="outline">{pendingTips.length} pending</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Streamer Tips
              </CardTitle>
              <CardDescription>Enter a streamer address to view their pending tips</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Streamer Address</Label>
                <Input
                  id="search"
                  placeholder="Enter streamer address..."
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                />
              </div>

              {searchedStreamer && (
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white">
                          {searchedStreamer.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{searchedStreamer.name}</h3>
                          <p className="text-sm text-muted-foreground font-mono">{searchedStreamer.address}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Pending Tips:</p>
                        {searchedStreamerTips.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No pending tips</p>
                        ) : (
                          <div className="space-y-2">
                            {searchedStreamerTips.map((tip, index) => {
                              const token = contractState.supportedTokens[tip.tokenAddress]
                              return (
                                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                                  <span className="text-sm">From: {tip.tipperAddress.slice(0, 10)}...</span>
                                  <Badge variant="secondary">
                                    {tip.amount} {token?.symbol}
                                  </Badge>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-tips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                My Creator Dashboard
              </CardTitle>
              <CardDescription>View tips sent to your creator address</CardDescription>
            </CardHeader>
            <CardContent>
              {!connectedAddress ? (
                <p className="text-center text-muted-foreground py-8">
                  Connect your wallet to view your creator dashboard
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Your Address:</p>
                    <p className="font-mono text-sm">{connectedAddress}</p>
                  </div>

                  {(() => {
                    const myTips = contractState.pendingTips.filter((tip) => tip.streamerAddress === connectedAddress)
                    const myHistory = contractState.tipHistory.filter((tip) => tip.streamerAddress === connectedAddress)

                    return (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Pending Tips ({myTips.length})</h4>
                          {myTips.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No pending tips</p>
                          ) : (
                            <div className="space-y-2">
                              {myTips.map((tip, index) => {
                                const token = contractState.supportedTokens[tip.tokenAddress]
                                return (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center p-2 bg-background border rounded"
                                  >
                                    <span className="text-sm">From: {tip.tipperAddress.slice(0, 10)}...</span>
                                    <Badge variant="secondary">
                                      {tip.amount} {token?.symbol}
                                    </Badge>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Recent Received Tips ({myHistory.length})</h4>
                          {myHistory.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No tip history</p>
                          ) : (
                            <div className="space-y-2">
                              {myHistory.slice(0, 5).map((tip, index) => {
                                const token = contractState.supportedTokens[tip.tokenAddress]
                                return (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center p-2 bg-green-50 border border-green-200 rounded"
                                  >
                                    <div>
                                      <span className="text-sm">From: {tip.tipperAddress.slice(0, 10)}...</span>
                                      <p className="text-xs text-muted-foreground">{tip.timestamp}</p>
                                    </div>
                                    <Badge variant="default" className="bg-green-600">
                                      {tip.amount} {token?.symbol}
                                    </Badge>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
