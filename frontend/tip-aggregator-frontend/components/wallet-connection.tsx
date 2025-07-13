"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, LogOut, Copy, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface WalletConnectionProps {
  isConnected: boolean
  address: string
  onConnect: (address: string) => void
  onDisconnect: () => void
}

export function WalletConnection({ isConnected, address, onConnect, onDisconnect }: WalletConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [copied, setCopied] = useState(false)

  // Simulate Radix Wallet integration
  useEffect(() => {
    // Check if Radix Wallet is available
    if (typeof window !== "undefined" && (window as any).radixToolkit) {
      console.log("Radix Wallet detected")
    }
  }, [])

  const handleConnect = async () => {
    setIsConnecting(true)

    try {
      // Simulate Radix Wallet connection
      // In real implementation, this would use @radixdlt/radix-dapp-toolkit
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate a mock Radix wallet address
      const mockAddress = `account_rdx1${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

      onConnect(mockAddress)

      toast({
        title: "Radix Wallet Connected",
        description: "Successfully connected to your Radix wallet",
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Radix wallet",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      })
    }
  }

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-purple-600 hover:bg-purple-500 text-white border-purple-500"
      >
        <Wallet className="h-4 w-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect Radix Wallet"}
      </Button>
    )
  }

  return (
    <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <div>
              <Badge variant="secondary" className="mb-1 bg-green-700 text-green-100">
                Connected
              </Badge>
              <p className="text-sm font-mono text-purple-200">
                {address.slice(0, 12)}...{address.slice(-8)}
              </p>
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyAddress}
              className="h-8 w-8 p-0 text-purple-200 hover:text-white hover:bg-purple-700"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onDisconnect}
              className="h-8 w-8 p-0 text-purple-200 hover:text-white hover:bg-purple-700"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
