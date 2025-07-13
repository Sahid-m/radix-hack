"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Wallet, LogOut, Copy, Check, CheckCircle, X, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface WalletConnectionProps {
  isConnected: boolean
  address: string
  onConnect: (address: string) => void
  onDisconnect: () => void
}

type ConnectionState = "idle" | "pending" | "rejected" | "connected"

export function WalletConnection({ isConnected, address, onConnect, onDisconnect }: WalletConnectionProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle")
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [progress, setProgress] = useState(0)
  const [pendingTime, setPendingTime] = useState("")
  const [rejectedTime, setRejectedTime] = useState("")

  // Update timestamps
  useEffect(() => {
    const now = new Date()
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })

    if (connectionState === "pending") {
      setPendingTime(`Today ${timeString}`)
    } else if (connectionState === "rejected") {
      setRejectedTime(`Today ${timeString}`)
    }
  }, [connectionState])

  // Progress bar animation
  useEffect(() => {
    if (connectionState === "pending") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0
          return prev + 2
        })
      }, 100)
      return () => clearInterval(interval)
    }
  }, [connectionState])

  const handleConnect = async () => {
    setShowModal(true)
    setConnectionState("pending")
    setProgress(0)

    // Simulate wallet connection process
    try {
      // Wait for simulated user interaction (5-10 seconds)
      const waitTime = Math.random() * 5000 + 5000 // 5-10 seconds

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          // 80% chance of success, 20% chance of rejection
          if (Math.random() > 0.2) {
            resolve(true)
          } else {
            reject(new Error("User rejected"))
          }
        }, waitTime)

        // Store timeout ID for potential cancellation
        ;(window as any).connectionTimeout = timeout
      })

      // Success - generate mock address and connect
      const mockAddress = `account_rdx1${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

      setConnectionState("connected")
      setProgress(100)

      setTimeout(() => {
        setShowModal(false)
        onConnect(mockAddress)
        toast({
          title: "Radix Wallet Connected",
          description: "Successfully connected to your Radix wallet",
        })
      }, 1000)
    } catch (error) {
      // Rejection
      setConnectionState("rejected")
      setProgress(0)

      setTimeout(() => {
        setConnectionState("idle")
        setShowModal(false)
      }, 3000)

      toast({
        title: "Connection Rejected",
        description: "Wallet connection was rejected or cancelled",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    if ((window as any).connectionTimeout) {
      clearTimeout((window as any).connectionTimeout)
    }
    setConnectionState("rejected")
    setProgress(0)

    setTimeout(() => {
      setConnectionState("idle")
      setShowModal(false)
    }, 2000)
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
      <>
        <Button
          onClick={handleConnect}
          disabled={connectionState === "pending"}
          className="bg-purple-600 hover:bg-purple-500 text-white border-purple-500"
        >
          <Wallet className="h-4 w-4 mr-2" />
          {connectionState === "pending" ? "Connecting..." : "Connect Radix Wallet"}
        </Button>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-md bg-gray-100 border-gray-300">
            {/* Progress Bar */}
            <div className="w-full bg-blue-600 h-2 rounded-t-lg">
              <Progress value={progress} className="h-full bg-blue-600" />
            </div>

            <DialogHeader className="text-center pt-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <DialogTitle className="text-gray-800 font-semibold">Connect Your Radix Wallet</DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-4 pb-4">
              {/* Pending State */}
              {connectionState === "pending" && (
                <div className="bg-teal-800 text-white p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Loader2 className="h-5 w-5 animate-spin mt-0.5 text-white" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Login Request Pending</h3>
                      <p className="text-sm text-teal-100 mb-2">Open Your Radix Wallet App to complete the request</p>
                      <div className="flex justify-between items-center">
                        <Button
                          variant="link"
                          className="text-teal-200 hover:text-white p-0 h-auto underline"
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                        <span className="text-xs text-teal-300">{pendingTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejected State */}
              {connectionState === "rejected" && (
                <div className="flex items-center gap-3 p-3 bg-gray-200 rounded-lg">
                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                    <X className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-gray-600 font-medium">Login Request Rejected</span>
                  </div>
                  <span className="text-xs text-gray-500">{rejectedTime}</span>
                </div>
              )}

              {/* Success State */}
              {connectionState === "connected" && (
                <div className="bg-green-800 text-white p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <div>
                      <h3 className="font-semibold">Connection Successful!</h3>
                      <p className="text-sm text-green-100">Wallet connected successfully</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
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
