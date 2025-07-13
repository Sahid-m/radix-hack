"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Settings, Zap, Users, Trash2, Plus, RotateCcw } from "lucide-react"
import { mockContract, type MockContractState } from "@/lib/mock-contract"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

export default function DemoPage() {
  const [contractState, setContractState] = useState<MockContractState>(mockContract.getState())
  const [newStreamerName, setNewStreamerName] = useState("")
  const [newStreamerAddress, setNewStreamerAddress] = useState("")
  const [newMinBatchSize, setNewMinBatchSize] = useState(contractState.minBatchSize.toString())

  useEffect(() => {
    const interval = setInterval(() => {
      setContractState(mockContract.getState())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleAddStreamer = () => {
    if (!newStreamerName || !newStreamerAddress) {
      toast({
        title: "Missing Information",
        description: "Please provide both name and address",
        variant: "destructive",
      })
      return
    }

    mockContract.addStreamer(newStreamerAddress, newStreamerName)
    setNewStreamerName("")
    setNewStreamerAddress("")
    toast({
      title: "Streamer Added",
      description: `${newStreamerName} has been added to the system`,
    })
  }

  const handleUpdateBatchSize = () => {
    const newSize = Number.parseInt(newMinBatchSize)
    if (isNaN(newSize) || newSize < 1) {
      toast({
        title: "Invalid Batch Size",
        description: "Batch size must be a positive number",
        variant: "destructive",
      })
      return
    }

    mockContract.updateMinBatchSize(newSize)
    toast({
      title: "Batch Size Updated",
      description: `Minimum batch size set to ${newSize}`,
    })
  }

  const generateRandomAddress = () => {
    const randomSuffix = Math.random().toString(36).substring(2, 15)
    return `component_rdx1c${randomSuffix}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-purple-200 hover:text-white hover:bg-purple-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white">Demo Tools</h1>
            <p className="text-purple-200">Testing and demonstration tools</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="h-5 w-5 text-purple-300" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-purple-200">
                Generate test data and simulate contract interactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={() => {
                    mockContract.generateRandomTips(5)
                    toast({
                      title: "Random Tips Generated",
                      description: "5 random tips have been added to the system",
                    })
                  }}
                  className="bg-purple-600 hover:bg-purple-500 text-white"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Generate 5 Random Tips
                </Button>

                <Button
                  onClick={() => {
                    mockContract.addTestStreamers()
                    toast({
                      title: "Test Streamers Added",
                      description: "Demo streamers have been added to the system",
                    })
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Add Test Streamers
                </Button>

                <Button
                  onClick={() => {
                    mockContract.simulateBatchExecution()
                    toast({
                      title: "Batch Executed",
                      description: "Simulated automatic batch execution",
                    })
                  }}
                  className="bg-violet-600 hover:bg-violet-500 text-white"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Simulate Auto-Batch
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => {
                    mockContract.resetContract()
                    toast({
                      title: "Contract Reset",
                      description: "All data has been cleared",
                    })
                  }}
                  className="bg-red-600 hover:bg-red-500 text-white"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Contract
                </Button>
              </div>

              <div className="pt-4 border-t border-purple-600">
                <h4 className="font-medium mb-3 text-purple-200">Contract Status</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-purple-200">Contract Address:</span>
                    <p className="font-mono text-xs text-purple-300">component_rdx1c...</p>
                  </div>
                  <div>
                    <span className="font-medium text-purple-200">Network:</span>
                    <p className="text-purple-300">Radix Testnet</p>
                  </div>
                  <div>
                    <span className="font-medium text-purple-200">Pending Tips:</span>
                    <p className="text-purple-300">{contractState.pendingTips.length}</p>
                  </div>
                  <div>
                    <span className="font-medium text-purple-200">Batch Size:</span>
                    <p className="text-purple-300">{contractState.minBatchSize}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <div className="space-y-6">
            {/* Add Streamer */}
            <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Plus className="h-5 w-5 text-purple-300" />
                  Add New Streamer
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Register new streamers in the tipping system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="streamer-name" className="text-purple-200">
                    Streamer Name
                  </Label>
                  <Input
                    id="streamer-name"
                    placeholder="Enter streamer name"
                    value={newStreamerName}
                    onChange={(e) => setNewStreamerName(e.target.value)}
                    className="bg-purple-700/50 border-purple-500 text-white placeholder:text-purple-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="streamer-address" className="text-purple-200">
                    Streamer Address
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="streamer-address"
                      placeholder="component_rdx1c..."
                      value={newStreamerAddress}
                      onChange={(e) => setNewStreamerAddress(e.target.value)}
                      className="bg-purple-700/50 border-purple-500 text-white placeholder:text-purple-300"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setNewStreamerAddress(generateRandomAddress())}
                      className="border-purple-500 text-purple-200 hover:bg-purple-700"
                    >
                      Random
                    </Button>
                  </div>
                </div>
                <Button onClick={handleAddStreamer} className="w-full bg-purple-600 hover:bg-purple-500 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Streamer
                </Button>
              </CardContent>
            </Card>

            {/* Batch Size Configuration */}
            <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Settings className="h-5 w-5 text-purple-300" />
                  Batch Configuration
                </CardTitle>
                <CardDescription className="text-purple-200">Modify contract batch processing settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="batch-size" className="text-purple-200">
                    Minimum Batch Size
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="batch-size"
                      type="number"
                      value={newMinBatchSize}
                      onChange={(e) => setNewMinBatchSize(e.target.value)}
                      min="1"
                      className="bg-purple-700/50 border-purple-500 text-white"
                    />
                    <Button onClick={handleUpdateBatchSize} className="bg-purple-600 hover:bg-purple-500 text-white">
                      Update
                    </Button>
                  </div>
                  <p className="text-sm text-purple-300">Current: {contractState.minBatchSize}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Registered Streamers */}
        <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm mt-8">
          <CardHeader>
            <CardTitle className="text-white">Registered Streamers</CardTitle>
            <CardDescription className="text-purple-200">
              All streamers currently registered in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contractState.streamers.map((streamer) => (
                <div
                  key={streamer.address}
                  className="flex items-center justify-between p-4 bg-purple-700/50 rounded-lg border border-purple-600"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white">
                      {streamer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-white">{streamer.name}</p>
                      <p className="text-sm text-purple-300 font-mono">{streamer.address.slice(0, 20)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-purple-600 text-purple-100">
                      {contractState.pendingTips.filter((tip) => tip.streamerAddress === streamer.address).length}{" "}
                      pending
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        mockContract.removeStreamer(streamer.address)
                        toast({
                          title: "Streamer Removed",
                          description: `${streamer.name} has been removed`,
                        })
                      }}
                      className="border-red-500 text-red-400 hover:bg-red-900/50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Supported Tokens */}
        <Card className="bg-purple-800/50 border-purple-600 backdrop-blur-sm mt-8">
          <CardHeader>
            <CardTitle className="text-white">Supported Tokens</CardTitle>
            <CardDescription className="text-purple-200">Radix tokens available for tipping</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(contractState.supportedTokens).map(([address, token]) => (
                <div key={address} className="p-4 bg-purple-700/50 rounded-lg border border-purple-600">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white">
                      {token.symbol.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {token.symbol} - {token.name}
                      </p>
                      <p className="text-sm text-purple-300 font-mono">{address.slice(0, 20)}...</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-700 text-green-100">
                    Balance: {token.balance}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
