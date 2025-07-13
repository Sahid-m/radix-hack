"use client"

export interface PendingTip {
  tipperAddress: string
  streamerAddress: string
  tokenAddress: string
  amount: number
  timestamp: string
}

export interface TipHistory {
  tipperAddress: string
  streamerAddress: string
  tokenAddress: string
  amount: number
  timestamp: string
  transactionHash: string
}

export interface Streamer {
  address: string
  name: string
}

export interface Token {
  symbol: string
  name: string
  balance: number
}

export interface MockContractState {
  pendingTips: PendingTip[]
  tipHistory: TipHistory[]
  streamers: Streamer[]
  streamersWithPendingTips: string[]
  supportedTokens: Record<string, Token>
  minBatchSize: number
}

class MockContract {
  private state: MockContractState

  constructor() {
    this.state = {
      pendingTips: [],
      tipHistory: [],
      streamers: [
        { address: "component_rdx1cxyz123streamer1", name: "Neymar Jr" },
        { address: "component_rdx1cxyz123streamer2", name: "xQc" },
        { address: "component_rdx1cxyz123streamer3", name: "Pokimane" },
        { address: "component_rdx1cxyz123streamer4", name: "Ninja" },
        { address: "component_rdx1cxyz123streamer5", name: "Shroud" },
        { address: "component_rdx1cxyz123streamer6", name: "Amouranth" },
        { address: "component_rdx1cxyz123streamer7", name: "HasanAbi" },
        { address: "component_rdx1cxyz123streamer8", name: "Ludwig" },
      ],
      streamersWithPendingTips: [],
      supportedTokens: {
        resource_rdx1t4xrd: {
          symbol: "XRD",
          name: "Radix",
          balance: 1000.0,
        },
        resource_rdx1t4usdt: {
          symbol: "USDT",
          name: "Tether USD (Radix)",
          balance: 500.0,
        },
      },
      minBatchSize: 5,
    }

    // Add some initial demo data
    this.generateInitialData()
  }

  private generateInitialData() {
    // Add some initial pending tips
    const initialTips = [
      {
        tipperAddress: "account_rdx1tipper1",
        streamerAddress: "component_rdx1cxyz123streamer1",
        tokenAddress: "resource_rdx1t4xrd",
        amount: 10.5,
        timestamp: new Date(Date.now() - 3600000).toLocaleString(),
      },
      {
        tipperAddress: "account_rdx1tipper2",
        streamerAddress: "component_rdx1cxyz123streamer1",
        tokenAddress: "resource_rdx1t4usdt",
        amount: 5.0,
        timestamp: new Date(Date.now() - 1800000).toLocaleString(),
      },
      {
        tipperAddress: "account_rdx1tipper3",
        streamerAddress: "component_rdx1cxyz123streamer2",
        tokenAddress: "resource_rdx1t4xrd",
        amount: 25.0,
        timestamp: new Date(Date.now() - 900000).toLocaleString(),
      },
    ]

    this.state.pendingTips = initialTips
    this.updateStreamersWithPendingTips()

    // Add some tip history
    const historyTips = [
      {
        tipperAddress: "account_rdx1tipper4",
        streamerAddress: "component_rdx1cxyz123streamer3",
        tokenAddress: "resource_rdx1t4usdt",
        amount: 15.0,
        timestamp: new Date(Date.now() - 86400000).toLocaleString(),
        transactionHash: "txn_rdx1abc123",
      },
      {
        tipperAddress: "account_rdx1tipper5",
        streamerAddress: "component_rdx1cxyz123streamer4",
        tokenAddress: "resource_rdx1t4xrd",
        amount: 30.0,
        timestamp: new Date(Date.now() - 172800000).toLocaleString(),
        transactionHash: "txn_rdx1def456",
      },
    ]

    this.state.tipHistory = historyTips
  }

  private updateStreamersWithPendingTips() {
    const streamersSet = new Set(this.state.pendingTips.map((tip) => tip.streamerAddress))
    this.state.streamersWithPendingTips = Array.from(streamersSet)
  }

  getState(): MockContractState {
    return { ...this.state }
  }

  sendTip(tipperAddress: string, streamerAddress: string, tokenAddress: string, amount: number): boolean {
    try {
      // Validate inputs
      if (!tipperAddress || !streamerAddress || !tokenAddress || amount <= 0) {
        return false
      }

      // Check if streamer exists
      const streamerExists = this.state.streamers.some((s) => s.address === streamerAddress)
      if (!streamerExists) {
        return false
      }

      // Check if token is supported
      if (!this.state.supportedTokens[tokenAddress]) {
        return false
      }

      // Check balance (simulate)
      const token = this.state.supportedTokens[tokenAddress]
      if (token.balance < amount) {
        return false
      }

      // Deduct from balance
      token.balance -= amount

      // Add to pending tips
      const newTip: PendingTip = {
        tipperAddress,
        streamerAddress,
        tokenAddress,
        amount,
        timestamp: new Date().toLocaleString(),
      }

      this.state.pendingTips.push(newTip)
      this.updateStreamersWithPendingTips()

      // Check if we should auto-execute batch
      if (this.state.pendingTips.length >= this.state.minBatchSize) {
        setTimeout(() => this.simulateBatchExecution(), 2000)
      }

      return true
    } catch (error) {
      return false
    }
  }

  forceSendTips(): boolean {
    try {
      if (this.state.pendingTips.length === 0) {
        return false
      }

      // Move all pending tips to history
      const processedTips = this.state.pendingTips.map((tip) => ({
        ...tip,
        transactionHash: `txn_rdx1${Math.random().toString(36).substring(2, 15)}`,
      }))

      this.state.tipHistory.push(...processedTips)
      this.state.pendingTips = []
      this.updateStreamersWithPendingTips()

      return true
    } catch (error) {
      return false
    }
  }

  simulateBatchExecution(): boolean {
    return this.forceSendTips()
  }

  addStreamer(address: string, name: string): boolean {
    try {
      // Check if streamer already exists
      const exists = this.state.streamers.some((s) => s.address === address)
      if (exists) {
        return false
      }

      this.state.streamers.push({ address, name })
      return true
    } catch (error) {
      return false
    }
  }

  removeStreamer(address: string): boolean {
    try {
      const index = this.state.streamers.findIndex((s) => s.address === address)
      if (index === -1) {
        return false
      }

      this.state.streamers.splice(index, 1)

      // Remove any pending tips for this streamer
      this.state.pendingTips = this.state.pendingTips.filter((tip) => tip.streamerAddress !== address)
      this.updateStreamersWithPendingTips()

      return true
    } catch (error) {
      return false
    }
  }

  updateMinBatchSize(newSize: number): boolean {
    try {
      if (newSize < 1) {
        return false
      }

      this.state.minBatchSize = newSize
      return true
    } catch (error) {
      return false
    }
  }

  generateRandomTips(count: number): void {
    const tippers = [
      "account_rdx1tipper1",
      "account_rdx1tipper2",
      "account_rdx1tipper3",
      "account_rdx1tipper4",
      "account_rdx1tipper5",
    ]

    const tokenAddresses = Object.keys(this.state.supportedTokens)

    for (let i = 0; i < count; i++) {
      const randomTipper = tippers[Math.floor(Math.random() * tippers.length)]
      const randomStreamer = this.state.streamers[Math.floor(Math.random() * this.state.streamers.length)]
      const randomToken = tokenAddresses[Math.floor(Math.random() * tokenAddresses.length)]
      const randomAmount = Math.round((Math.random() * 50 + 1) * 100) / 100

      this.sendTip(randomTipper, randomStreamer.address, randomToken, randomAmount)
    }
  }

  addTestStreamers(): void {
    const testStreamers = [
      { address: "component_rdx1test1", name: "Valkyrae" },
      { address: "component_rdx1test2", name: "TimTheTatman" },
      { address: "component_rdx1test3", name: "DrDisrespect" },
    ]

    testStreamers.forEach((streamer) => {
      this.addStreamer(streamer.address, streamer.name)
    })
  }

  resetContract(): void {
    this.state = {
      pendingTips: [],
      tipHistory: [],
      streamers: [
        { address: "component_rdx1cxyz123streamer1", name: "Neymar Jr" },
        { address: "component_rdx1cxyz123streamer2", name: "xQc" },
        { address: "component_rdx1cxyz123streamer3", name: "Pokimane" },
        { address: "component_rdx1cxyz123streamer4", name: "Ninja" },
        { address: "component_rdx1cxyz123streamer5", name: "Shroud" },
        { address: "component_rdx1cxyz123streamer6", name: "Amouranth" },
        { address: "component_rdx1cxyz123streamer7", name: "HasanAbi" },
        { address: "component_rdx1cxyz123streamer8", name: "Ludwig" },
      ],
      streamersWithPendingTips: [],
      supportedTokens: {
        resource_rdx1t4xrd: {
          symbol: "XRD",
          name: "Radix",
          balance: 1000.0,
        },
        resource_rdx1t4usdt: {
          symbol: "USDT",
          name: "Tether USD (Radix)",
          balance: 500.0,
        },
      },
      minBatchSize: 5,
    }
  }

  // Getter methods for specific contract functions
  getPendingCount(): number {
    return this.state.pendingTips.length
  }

  getPendingAmountForStreamer(streamerAddress: string, tokenAddress: string): number {
    return this.state.pendingTips
      .filter((tip) => tip.streamerAddress === streamerAddress && tip.tokenAddress === tokenAddress)
      .reduce((sum, tip) => sum + tip.amount, 0)
  }

  getStreamersWithPendingTips(): string[] {
    return this.state.streamersWithPendingTips
  }
}

export const mockContract = new MockContract()
