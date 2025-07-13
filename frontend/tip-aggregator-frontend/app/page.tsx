"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Users, TrendingUp, Settings } from "lucide-react"
import { WalletConnection } from "@/components/wallet-connection"
import { mockContract, type MockContractState } from "@/lib/mock-contract"
import Link from "next/link"

export default function HomePage() {
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
  }

  const handleWalletDisconnect = () => {
    setIsConnected(false)
    setConnectedAddress("")
  }

  const stats = {
    totalPendingTips: contractState.pendingTips.length,
    totalStreamers: contractState.streamersWithPendingTips.length,
    minBatchSize: contractState.minBatchSize,
    totalProcessed: contractState.tipHistory.length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">StreamFlow</h1>
            <p className="text-purple-200 text-lg">Decentralized Creator Tipping on Radix</p>
          </div>
          <WalletConnection
            isConnected={isConnected}
            address={connectedAddress}
            onConnect={handleWalletConnect}
            onDisconnect={handleWalletDisconnect}
          />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Pending Tips</CardTitle>
              <Zap className="h-4 w-4 text-purple-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalPendingTips}</div>
              <p className="text-xs text-purple-300">
                {stats.minBatchSize - (stats.totalPendingTips % stats.minBatchSize)} more to batch
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Active Streamers</CardTitle>
              <Users className="h-4 w-4 text-purple-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalStreamers}</div>
              <p className="text-xs text-purple-300">With pending tips</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Processed Tips</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalProcessed}</div>
              <p className="text-xs text-purple-300">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Batch Size</CardTitle>
              <Settings className="h-4 w-4 text-purple-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.minBatchSize}</div>
              <p className="text-xs text-purple-300">Auto-execute threshold</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/viewer">
            <Card className="bg-gradient-to-br from-purple-700 to-purple-800 border-purple-500 hover:from-purple-600 hover:to-purple-700 transition-all cursor-pointer group">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-300 group-hover:text-purple-200" />
                  Viewer Portal
                </CardTitle>
                <CardDescription className="text-purple-200">Send tips to your favorite streamers</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white">Start Tipping</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/streamer-status">
            <Card className="bg-gradient-to-br from-indigo-700 to-indigo-800 border-indigo-500 hover:from-indigo-600 hover:to-indigo-700 transition-all cursor-pointer group">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-300 group-hover:text-indigo-200" />
                  Streamer Status
                </CardTitle>
                <CardDescription className="text-indigo-200">View your status and claim payouts</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">View Status</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/streamer-details">
            <Card className="bg-gradient-to-br from-violet-700 to-violet-800 border-violet-500 hover:from-violet-600 hover:to-violet-700 transition-all cursor-pointer group">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-violet-300 group-hover:text-violet-200" />
                  Tip Analytics
                </CardTitle>
                <CardDescription className="text-violet-200">Detailed analytics and tip history</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white">View Analytics</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/demo">
            <Card className="bg-gradient-to-br from-pink-700 to-pink-800 border-pink-500 hover:from-pink-600 hover:to-pink-700 transition-all cursor-pointer group">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-pink-300 group-hover:text-pink-200" />
                  Demo Tools
                </CardTitle>
                <CardDescription className="text-pink-200">Testing and demonstration tools</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-pink-600 hover:bg-pink-500 text-white">Open Tools</Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Info */}
        <Card className="mt-8 bg-purple-800/30 border-purple-600 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">How StreamFlow Works</CardTitle>
          </CardHeader>
          <CardContent className="text-purple-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Send Tips</h3>
                <p className="text-sm">Viewers send XRD or USDT tips to streamers</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Batch Processing</h3>
                <p className="text-sm">Tips are batched for efficient gas optimization</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Auto Payout</h3>
                <p className="text-sm">Streamers receive batched tips automatically</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
