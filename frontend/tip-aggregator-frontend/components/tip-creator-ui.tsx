"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Zap, Send, AlertCircle } from "lucide-react"
import { mockContract, type MockContractState } from "@/lib/mock-contract"
import { toast } from "@/hooks/use-toast"

interface TipCreatorUIProps {
  contractState: MockContractState
  isConnected: boolean
  connectedAddress: string
}

export function TipCreatorUI({ contractState, isConnected, connectedAddress }: TipCreatorUIProps) {
  const [selectedStreamer, setSelectedStreamer] = useState("")
  const [selectedToken, setSelectedToken] = useState("")
  const [tipAmount, setTipAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
      // Simulate transaction delay
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

  const selectedStreamerData = contractState.streamers.find((c) => c.address === selectedStreamer)
  const selectedTokenData = contractState.supportedTokens[selectedToken]
  const pendingForStreamer = contractState.pendingTips.filter((tip) => tip.streamerAddress === selectedStreamer)
  const batchProgress =
    ((contractState.pendingTips.length % contractState.minBatchSize) / contractState.minBatchSize) * 100

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Send Tip Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Send Tip to Streamer
          </CardTitle>
          <CardDescription>Support your favorite streamers with cryptocurrency tips</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">Connect your wallet to send tips</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="creator">Select Streamer</Label>
            <Select value={selectedStreamer} onValueChange={setSelectedStreamer}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a streamer to tip" />
              </SelectTrigger>
              <SelectContent>
                {contractState.streamers.map((streamer) => (
                  <SelectItem key={streamer.address} value={streamer.address}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xs">
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
            <Label htmlFor="token">Select Token</Label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger>
                <SelectValue placeholder="Choose token to tip with" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(contractState.supportedTokens).map(([address, token]) => (
                  <SelectItem key={address} value={address}>
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
            <Label htmlFor="amount">Tip Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              min="0"
              step="0.01"
            />
            {selectedTokenData && (
              <p className="text-sm text-muted-foreground">
                Balance: {selectedTokenData.balance} {selectedTokenData.symbol}
              </p>
            )}
          </div>

          <Button
            onClick={handleSendTip}
            disabled={!isConnected || isLoading || !selectedStreamer || !selectedToken || !tipAmount}
            className="w-full"
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

      {/* Tip Status & Info */}
      <div className="space-y-6">
        {/* Batch Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Batch Progress</CardTitle>
            <CardDescription>Tips are batched together for efficient processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Current batch</span>
                <span>
                  {contractState.pendingTips.length % contractState.minBatchSize} / {contractState.minBatchSize}
                </span>
              </div>
              <Progress value={batchProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {contractState.minBatchSize - (contractState.pendingTips.length % contractState.minBatchSize)} more tips
                needed for auto-execution
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Selected Creator Info */}
        {selectedStreamerData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Streamer Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white">
                    {selectedStreamerData.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{selectedStreamerData.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {selectedStreamerData.address.slice(0, 20)}...
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Pending Tips:</p>
                  <div className="space-y-1">
                    {pendingForStreamer.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No pending tips</p>
                    ) : (
                      pendingForStreamer.map((tip, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{contractState.supportedTokens[tip.tokenAddress]?.symbol}</span>
                          <Badge variant="secondary">{tip.amount}</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Force Batch Execution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Manual Batch Execution</CardTitle>
            <CardDescription>Force send pending tips without waiting for batch to fill</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => {
                mockContract.forceSendTips()
                toast({
                  title: "Batch Executed",
                  description: "All pending tips have been sent to streamers",
                })
              }}
              disabled={contractState.pendingTips.length === 0}
              className="w-full"
            >
              Force Send All Tips ({contractState.pendingTips.length})
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
