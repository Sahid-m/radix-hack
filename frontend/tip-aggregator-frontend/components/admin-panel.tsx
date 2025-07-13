"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Database, Zap, Plus, Trash2 } from "lucide-react"
import { mockContract, type MockContractState } from "@/lib/mock-contract"
import { toast } from "@/hooks/use-toast"

interface AdminPanelProps {
  contractState: MockContractState
  isConnected: boolean
}

export function AdminPanel({ contractState, isConnected }: AdminPanelProps) {
  const [newStreamerName, setNewStreamerName] = useState("")
  const [newStreamerAddress, setNewStreamerAddress] = useState("")
  const [newTokenSymbol, setNewTokenSymbol] = useState("")
  const [newTokenName, setNewTokenName] = useState("")
  const [newTokenAddress, setNewTokenAddress] = useState("")
  const [newMinBatchSize, setNewMinBatchSize] = useState(contractState.minBatchSize.toString())

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

  const handleAddToken = () => {
    if (!newTokenSymbol || !newTokenName || !newTokenAddress) {
      toast({
        title: "Missing Information",
        description: "Please provide symbol, name, and address",
        variant: "destructive",
      })
      return
    }

    mockContract.addToken(newTokenAddress, newTokenSymbol, newTokenName)
    setNewTokenSymbol("")
    setNewTokenName("")
    setNewTokenAddress("")
    toast({
      title: "Token Added",
      description: `${newTokenSymbol} has been added to supported tokens`,
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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="contract" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contract">Contract Settings</TabsTrigger>
          <TabsTrigger value="creators">Manage Streamers</TabsTrigger>
          <TabsTrigger value="tokens">Manage Tokens</TabsTrigger>
          <TabsTrigger value="data">Contract Data</TabsTrigger>
        </TabsList>

        <TabsContent value="contract" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Contract Configuration
              </CardTitle>
              <CardDescription>Modify core contract parameters and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batch-size">Minimum Batch Size</Label>
                  <div className="flex gap-2">
                    <Input
                      id="batch-size"
                      type="number"
                      value={newMinBatchSize}
                      onChange={(e) => setNewMinBatchSize(e.target.value)}
                      min="1"
                    />
                    <Button onClick={handleUpdateBatchSize}>Update</Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Current: {contractState.minBatchSize}</p>
                </div>

                <div className="space-y-2">
                  <Label>Contract Status</Label>
                  <div className="space-y-1">
                    <Badge variant="outline">Active</Badge>
                    <p className="text-sm text-muted-foreground">Contract is operational and accepting tips</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Quick Actions</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      mockContract.forceSendTips()
                      toast({
                        title: "Batch Executed",
                        description: "All pending tips have been processed",
                      })
                    }}
                    disabled={contractState.pendingTips.length === 0}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Force Execute Batch
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="creators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Streamer
              </CardTitle>
              <CardDescription>Register new streamers in the tipping system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creator-name">Streamer Name</Label>
                  <Input
                    id="creator-name"
                    placeholder="Enter streamer name"
                    value={newStreamerName}
                    onChange={(e) => setNewStreamerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creator-address">Streamer Address</Label>
                  <Input
                    id="creator-address"
                    placeholder="component_rdx1c..."
                    value={newStreamerAddress}
                    onChange={(e) => setNewStreamerAddress(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleAddStreamer}>
                <Plus className="h-4 w-4 mr-2" />
                Add Streamer
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registered Streamers</CardTitle>
              <CardDescription>All streamers currently registered in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {contractState.streamers.map((streamer) => (
                  <div key={streamer.address} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-sm">
                        {streamer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{streamer.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">{streamer.address.slice(0, 20)}...</p>
                      </div>
                    </div>
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
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Token
              </CardTitle>
              <CardDescription>Add support for new tokens in the tipping system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="token-symbol">Token Symbol</Label>
                  <Input
                    id="token-symbol"
                    placeholder="XRD"
                    value={newTokenSymbol}
                    onChange={(e) => setNewTokenSymbol(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token-name">Token Name</Label>
                  <Input
                    id="token-name"
                    placeholder="Radix"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token-address">Token Address</Label>
                  <Input
                    id="token-address"
                    placeholder="resource_rdx1t..."
                    value={newTokenAddress}
                    onChange={(e) => setNewTokenAddress(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleAddToken}>
                <Plus className="h-4 w-4 mr-2" />
                Add Token
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported Tokens</CardTitle>
              <CardDescription>All tokens currently supported for tipping</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(contractState.supportedTokens).map(([address, token]) => (
                  <div key={address} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white text-sm">
                        {token.symbol.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">
                          {token.symbol} - {token.name}
                        </p>
                        <p className="text-sm text-muted-foreground font-mono">{address.slice(0, 20)}...</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Balance: {token.balance}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          mockContract.removeToken(address)
                          toast({
                            title: "Token Removed",
                            description: `${token.symbol} has been removed`,
                          })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Contract Data Overview
              </CardTitle>
              <CardDescription>View current state and statistics of the contract</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Pending Tips</h4>
                  <p className="text-2xl font-bold">{contractState.pendingTips.length}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Total Streamers</h4>
                  <p className="text-2xl font-bold">{contractState.streamers.length}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Supported Tokens</h4>
                  <p className="text-2xl font-bold">{Object.keys(contractState.supportedTokens).length}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Tip History</h4>
                  <p className="text-2xl font-bold">{contractState.tipHistory.length}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <h4 className="font-medium">Recent Activity</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {contractState.tipHistory
                    .slice(-10)
                    .reverse()
                    .map((tip, index) => {
                      const token = contractState.supportedTokens[tip.tokenAddress]
                      const creator = contractState.streamers.find((c) => c.address === tip.creatorAddress)
                      return (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                          <span>
                            {tip.tipperAddress.slice(0, 8)}... → {creator?.name || "Unknown"}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {tip.amount} {token?.symbol}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{tip.timestamp}</span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
