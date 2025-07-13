"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Coins, Download, AlertCircle } from "lucide-react"
import { WalletConnection } from "@/components/wallet-connection"
import { mockContract, type MockContractState } from "@/lib/mock-contract"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

export default function StreamerStatusPage() {
  const [contractState, setContractState] = useState<MockContractState>(mockContract.getState())
  const [isConnected, setIsConnected] = useState(false)
  const [connectedAddress, setConnectedAddress] = useState("")

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

  const handleClaimPayout = () => {
    mockContract.forceSendTips()
    toast({
      title: "Payout Claimed",
      description: "All pending tips have been processed and sent to streamers",
    })
  }

  // Get streamer data
  const myPendingTips = isConnected
    ? contractState.pendingTips.filter((tip) => tip.streamerAddress === connectedAddress)
    : []

  const myHistory = isConnected
    ? contractState.tipHistory.filter((tip) => tip.streamerAddress === connectedAddress)
    : []

  // Group pending tips by token
  const pendingByToken = myPendingTips.reduce(
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

  // Calculate total earnings
  const totalEarnings = myHistory.reduce(
    (acc, tip) => {
      if (!acc[tip.tokenAddress]) {
        acc[tip.tokenAddress] = 0
      }
      acc[tip.tokenAddress] += tip.amount
      return acc
    },
    {} as Record<string, number>,
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
              <h1 className="text-4xl font-bold text-white">Streamer Status</h1>
              <p className="text-purple-200">View your status and claim payouts</p>
            </div>
          </div>
          <WalletConnection
            isConnected={isConnected}
            address={connectedAddress}
            onConnect={handleWalletConnect}
            onDisconnect={handleWalletDisconnect}
          />
        </div>

        {!isConnected ? (
          <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
                <p className="text-purple-200">Connect your wallet to view your streamer status and claim payouts</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Streamer Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-100">Pending Tips</CardTitle>
                  <Coins className="h-4 w-4 text-purple-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{myPendingTips.length}</div>
                  <p className="text-xs text-purple-300">Waiting for batch processing</p>
                </CardContent>
              </Card>

              <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-100">Total Received</CardTitle>
                  <Users className="h-4 w-4 text-purple-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{myHistory.length}</div>
                  <p className="text-xs text-purple-300">Tips processed</p>
                </CardContent>
              </Card>

              <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-100">Unique Supporters</CardTitle>
                  <Users className="h-4 w-4 text-purple-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {new Set(myHistory.map((tip) => tip.tipperAddress)).size}
                  </div>
                  <p className="text-xs text-purple-300">Different tippers</p>
                </CardContent>
              </Card>
            </div>

            {/* Pending Tips */}
            <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Pending Tips</CardTitle>
                    <CardDescription className="text-purple-200">
                      Tips waiting to be processed in the next batch
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleClaimPayout}
                    disabled={myPendingTips.length === 0}
                    className="bg-purple-600 hover:bg-purple-500 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Force Claim ({myPendingTips.length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {Object.keys(pendingByToken).length === 0 ? (
                  <div className="text-center py-8">
                    <Coins className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-purple-300">No pending tips</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(pendingByToken).map(([tokenAddress, data]) => {
                      const token = contractState.supportedTokens[tokenAddress]
                      return (
                        <div key={tokenAddress} className="p-4 bg-purple-700/50 rounded-lg border border-purple-600">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white text-sm">
                              {token?.symbol.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-white">{token?.symbol}</p>
                              <p className="text-sm text-purple-300">{token?.name}</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-2xl font-bold text-white">{data.amount.toFixed(2)}</p>
                            <p className="text-sm text-purple-300">{data.count} tips pending</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Total Earnings */}
            <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Total Earnings</CardTitle>
                <CardDescription className="text-purple-200">All-time earnings from tips</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(totalEarnings).length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-purple-300">No earnings yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(totalEarnings).map(([tokenAddress, amount]) => {
                      const token = contractState.supportedTokens[tokenAddress]
                      return (
                        <div key={tokenAddress} className="p-4 bg-green-900/30 rounded-lg border border-green-600">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white text-sm">
                              {token?.symbol.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-white">{token?.symbol}</p>
                              <p className="text-sm text-green-300">{token?.name}</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-2xl font-bold text-white">{amount.toFixed(2)}</p>
                            <Badge variant="secondary" className="bg-green-700 text-green-100">
                              Total Earned
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Tips */}
            <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Recent Tips</CardTitle>
                <CardDescription className="text-purple-200">Your latest received tips</CardDescription>
              </CardHeader>
              <CardContent>
                {myHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-purple-300">No tip history</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {myHistory
                      .slice(-10)
                      .reverse()
                      .map((tip, index) => {
                        const token = contractState.supportedTokens[tip.tokenAddress]
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-purple-700/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs">
                                T
                              </div>
                              <div>
                                <p className="text-sm text-white">From: {tip.tipperAddress.slice(0, 10)}...</p>
                                <p className="text-xs text-purple-300">{tip.timestamp}</p>
                              </div>
                            </div>
                            <Badge variant="default" className="bg-green-600 text-white">
                              +{tip.amount} {token?.symbol}
                            </Badge>
                          </div>
                        )
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
