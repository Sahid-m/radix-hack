"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Zap, Send, AlertCircle } from "lucide-react"
import { WalletConnection } from "@/components/wallet-connection"
import { mockContract, type MockContractState } from "@/lib/mock-contract"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

export default function ViewerPage() {
  const [contractState, setContractState] = useState<MockContractState>(mockContract.getState())
  const [isConnected, setIsConnected] = useState(false)
  const [connectedAddress, setConnectedAddress] = useState("")
  const [selectedStreamer, setSelectedStreamer] = useState("")
  const [selectedToken, setSelectedToken] = useState("")
  const [tipAmount, setTipAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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

  const handleSendTip = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to send tips",
        variant: "destructive",
      })
      return
    }

    if (!selectedStreamer || !selectedToken || !tipAmount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const success = mockContract.sendTip(
        connectedAddress,
        selectedStreamer,
        selectedToken,
        Number.parseFloat(tipAmount),
      )

      if (success) {
        toast({
          title: "Tip Sent Successfully!",
          description: `Sent ${tipAmount} ${contractState.supportedTokens[selectedToken]?.symbol} to streamer`,
        })
        setTipAmount("")
      } else {
        throw new Error("Transaction failed")
      }
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to send tip. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedStreamerData = contractState.streamers.find((s) => s.address === selectedStreamer)
  const selectedTokenData = contractState.supportedTokens[selectedToken]
  const batchProgress =
    ((contractState.pendingTips.length % contractState.minBatchSize) / contractState.minBatchSize) * 100

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
              <h1 className="text-4xl font-bold text-white">Viewer Portal</h1>
              <p className="text-purple-200">Send tips to your favorite streamers</p>
            </div>
          </div>
          <WalletConnection
            isConnected={isConnected}
            address={connectedAddress}
            onConnect={handleWalletConnect}
            onDisconnect={handleWalletDisconnect}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send Tip Form */}
          <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="h-5 w-5 text-purple-300" />
                Send Tip
              </CardTitle>
              <CardDescription className="text-purple-200">Support streamers with XRD or USDT tips</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isConnected && (
                <div className="flex items-center gap-2 p-4 bg-yellow-900/50 border border-yellow-600 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-yellow-200">Connect your wallet to send tips</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="streamer" className="text-purple-200">
                  Select Streamer
                </Label>
                <Select value={selectedStreamer} onValueChange={setSelectedStreamer}>
                  <SelectTrigger className="bg-purple-700/50 border-purple-500 text-white">
                    <SelectValue placeholder="Choose a streamer to tip" />
                  </SelectTrigger>
                  <SelectContent className="bg-purple-800 border-purple-600">
                    {contractState.streamers.map((streamer) => (
                      <SelectItem
                        key={streamer.address}
                        value={streamer.address}
                        className="text-white hover:bg-purple-700"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs">
                            {streamer.name.charAt(0)}
                          </div>
                          {streamer.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token" className="text-purple-200">
                  Select Token
                </Label>
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger className="bg-purple-700/50 border-purple-500 text-white">
                    <SelectValue placeholder="Choose token to tip with" />
                  </SelectTrigger>
                  <SelectContent className="bg-purple-800 border-purple-600">
                    {Object.entries(contractState.supportedTokens).map(([address, token]) => (
                      <SelectItem key={address} value={address} className="text-white hover:bg-purple-700">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xs">
                            {token.symbol.charAt(0)}
                          </div>
                          {token.symbol} - {token.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-purple-200">
                  Tip Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="bg-purple-700/50 border-purple-500 text-white placeholder:text-purple-300"
                />
                {selectedTokenData && (
                  <p className="text-sm text-purple-300">
                    Balance: {selectedTokenData.balance} {selectedTokenData.symbol}
                  </p>
                )}
              </div>

              <Button
                onClick={handleSendTip}
                disabled={!isConnected || isLoading || !selectedStreamer || !selectedToken || !tipAmount}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white"
                size="lg"
              >
                {isLoading ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Tip
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Status & Info */}
          <div className="space-y-6">
            {/* Batch Progress */}
            <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Batch Progress</CardTitle>
                <CardDescription className="text-purple-200">Tips are batched for efficient processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-purple-200">
                    <span>Current batch</span>
                    <span>
                      {contractState.pendingTips.length % contractState.minBatchSize} / {contractState.minBatchSize}
                    </span>
                  </div>
                  <Progress value={batchProgress} className="h-3 bg-purple-700" />
                  <p className="text-xs text-purple-300">
                    {contractState.minBatchSize - (contractState.pendingTips.length % contractState.minBatchSize)} more
                    tips needed for auto-execution
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Selected Streamer Info */}
            {selectedStreamerData && (
              <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Streamer Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-lg">
                        {selectedStreamerData.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{selectedStreamerData.name}</p>
                        <p className="text-sm text-purple-300 font-mono">
                          {selectedStreamerData.address.slice(0, 20)}...
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2 text-purple-200">Pending Tips:</p>
                      <div className="space-y-2">
                        {contractState.pendingTips
                          .filter((tip) => tip.streamerAddress === selectedStreamer)
                          .reduce(
                            (acc, tip) => {
                              const existing = acc.find((item) => item.tokenAddress === tip.tokenAddress)
                              if (existing) {
                                existing.amount += tip.amount
                                existing.count += 1
                              } else {
                                acc.push({ tokenAddress: tip.tokenAddress, amount: tip.amount, count: 1 })
                              }
                              return acc
                            },
                            [] as Array<{ tokenAddress: string; amount: number; count: number }>,
                          )
                          .map((summary, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm text-purple-200">
                                {contractState.supportedTokens[summary.tokenAddress]?.symbol}
                              </span>
                              <Badge variant="secondary" className="bg-purple-700 text-purple-100">
                                {summary.amount} ({summary.count} tips)
                              </Badge>
                            </div>
                          ))}
                        {contractState.pendingTips.filter((tip) => tip.streamerAddress === selectedStreamer).length ===
                          0 && <p className="text-sm text-purple-400">No pending tips</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Platform Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{contractState.pendingTips.length}</div>
                    <p className="text-sm text-purple-300">Pending Tips</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{contractState.tipHistory.length}</div>
                    <p className="text-sm text-purple-300">Processed Tips</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
