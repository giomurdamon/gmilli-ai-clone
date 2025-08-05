"use client";

interface DerivAPIConfig {
  apiUrl: string;
  appId: number;
  debug?: boolean;
}

interface TickData {
  ask: number;
  bid: number;
  epoch: number;
  id: string;
  pip_size: number;
  quote: number;
  symbol: string;
}

interface TradeParams {
  contract_type: string;
  currency: string;
  amount: number;
  symbol: string;
  duration: number;
  duration_unit: string;
  basis: string;
  barrier?: string;
}

interface AccountBalance {
  balance: number;
  currency: string;
  display_balance: string;
  loginid: string;
}

interface TradeResult {
  buy: {
    contract_id: number;
    longcode: string;
    payout: number;
    start_time: number;
    transaction_id: number;
  };
}

interface ContractUpdate {
  contract_update: {
    contract_id: number;
    bid_price?: number;
    current_spot?: number;
    current_spot_time?: number;
    date_expiry?: number;
    entry_spot?: number;
    entry_spot_time?: number;
    exit_tick?: number;
    exit_tick_time?: number;
    is_expired?: number;
    is_settleable?: number;
    is_sold?: number;
    is_valid_to_sell?: number;
    payout?: number;
    profit?: number;
    status?: string;
  };
}

interface UserAccount {
  loginid: string;
  currency: string;
  is_demo: number;
  is_virtual: number;
  landing_company_name: string;
}

export class DerivAPI {
  private ws: WebSocket | null = null;
  private config: DerivAPIConfig;
  private isConnected = false;
  private isAuthorized = false;
  private apiToken = '';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers = new Map<string, (data: any) => void>();
  private subscriptions = new Map<string, string>(); // symbol -> subscription_id
  private activeContracts = new Map<string, any>(); // contract_id -> contract_data
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private currentAccount: UserAccount | null = null;
  private reqIdCounter = 1; // Simple incrementing counter for req_id

  // Event callbacks
  public onConnectionChange?: (connected: boolean) => void;
  public onAuthChange?: (authorized: boolean) => void;
  public onTickUpdate?: (tick: TickData) => void;
  public onTradeResult?: (result: any) => void;
  public onContractUpdate?: (update: ContractUpdate) => void;
  public onError?: (error: string) => void;
  public onBalanceUpdate?: (balance: AccountBalance) => void;
  public onAccountChange?: (account: UserAccount) => void;

  constructor(config?: DerivAPIConfig) {
    this.config = config || {
      apiUrl: 'wss://ws.derivws.com/websockets/v3',
      appId: 1089, // Default app ID for testing
      debug: false
    };
  }

  async connect(apiToken: string): Promise<boolean> {
    if (!apiToken || apiToken.trim().length === 0) {
      this.onError?.('API token is required and cannot be empty');
      return false;
    }

    // Remove overly strict validation - let Deriv API validate the token
    // Some valid tokens might be shorter than 20 characters
    if (apiToken.trim().length < 5) {
      this.onError?.('API token appears to be too short');
      return false;
    }

    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.log('Already connected to Deriv API');
      return true;
    }

    this.apiToken = apiToken.trim();
    this.log(`Starting connection to Deriv API with token: ${this.apiToken.substring(0, 10)}...`);

    try {
      await this.establishConnection();
      return true;
    } catch (error) {
      this.logError('Failed to connect to Deriv API:', error);
      this.onError?.(`Failed to connect to Deriv API: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  private async establishConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Clear existing timeouts
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
        }

        // Close existing connection if any
        if (this.ws) {
          this.ws.close();
        }

        const wsUrl = `${this.config.apiUrl}?app_id=${this.config.appId}`;
        this.log(`Connecting to: ${wsUrl}`);
        this.ws = new WebSocket(wsUrl);

        // Connection timeout
        this.connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            this.logError('Connection timeout');
            this.ws?.close();
            reject(new Error('Connection timeout'));
          }
        }, 15000);

        this.ws.onopen = () => {
          this.log('✅ Connected to Deriv API WebSocket');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.onConnectionChange?.(true);

          // Clear connection timeout
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }

          // Start heartbeat
          this.startHeartbeat();

          // Authorize with API token
          this.authorize();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data);
            this.handleMessage(response);
          } catch (error) {
            this.logError('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          this.log(`❌ Disconnected from Deriv API (Code: ${event.code}, Reason: ${event.reason})`);
          this.isConnected = false;
          this.isAuthorized = false;
          this.onConnectionChange?.(false);
          this.onAuthChange?.(false);

          // Clear heartbeat
          this.stopHeartbeat();

          // Clear connection timeout
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }

          // Attempt to reconnect if not a clean close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            setTimeout(() => {
              this.establishConnection().catch(console.error);
            }, this.reconnectDelay * this.reconnectAttempts);
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.onError?.('Maximum reconnection attempts reached. Please try connecting again.');
          }
        };

        this.ws.onerror = (error) => {
          this.logError('WebSocket error:', error);
          this.onError?.('WebSocket connection error');

          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }

          reject(error);
        };

      } catch (error) {
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        reject(error);
      }
    });
  }

  private startHeartbeat(): void {
    // Send ping every 30 seconds to keep connection alive
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        const reqId = this.generateReqId();
        this.sendMessage({
          ping: 1,
          req_id: reqId
        });
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private authorize(): void {
    if (!this.apiToken) {
      this.onError?.('API token is required');
      return;
    }

    this.log('🔐 Sending authorization request...');

    // Follow the exact Deriv API specification for authorize
    const authRequest = {
      authorize: this.apiToken,
      req_id: this.generateReqId()
    };

    this.log('📤 Authorization request:', authRequest);
    this.sendMessage(authRequest);

    // Set a timeout for authorization - but don't fail connection if auth fails
    // Some API functions work without full authorization
    setTimeout(() => {
      if (!this.isAuthorized && this.isConnected) {
        this.log('⚠️ Authorization timeout - but connection established for public data');
      }
    }, 10000);
  }

  private sendMessage(message: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.logError('WebSocket is not connected');
      return;
    }

    try {
      const messageString = JSON.stringify(message);
      this.log('Sending message:', messageString);
      this.ws.send(messageString);
    } catch (error) {
      this.logError('Failed to send message:', error);
    }
  }

  private handleMessage(response: any): void {
    const { msg_type, req_id } = response;

    this.log(`📨 Received message: ${msg_type}`, response);

    // Handle error responses first
    if (response.error) {
      this.handleErrorResponse(response);
      return;
    }

    // Handle specific message types
    switch (msg_type) {
      case 'authorize':
        this.handleAuthorizeResponse(response);
        break;
      case 'balance':
        this.handleBalanceResponse(response);
        break;
      case 'tick':
        this.handleTickResponse(response);
        break;
      case 'buy':
        this.handleTradeResponse(response);
        break;
      case 'proposal':
        this.handleProposalResponse(response);
        break;
      case 'proposal_open_contract':
        this.handleContractUpdateResponse(response);
        break;
      case 'pong':
        this.log('💓 Received pong - connection alive');
        break;
      default:
        // Handle custom handlers
        if (req_id && this.messageHandlers.has(req_id.toString())) {
          const handler = this.messageHandlers.get(req_id.toString());
          if (handler) {
            handler(response);
            this.messageHandlers.delete(req_id.toString());
          }
        }
        break;
    }
  }

  private handleAuthorizeResponse(response: any): void {
    // Debug: Log the full authorization response
    this.log('🔍 Full authorization response:', response);

    if (response.error) {
      this.logError('❌ Authorization failed:', response.error);

      // More specific error handling
      if (response.error.code === 'InvalidToken') {
        this.onError?.('Invalid API token. Please check your token and try again.');
      } else if (response.error.code === 'AuthorizationRequired') {
        this.onError?.('Authorization required. Please provide a valid API token.');
      } else {
        this.onError?.(`Authorization error: ${response.error.message || response.error.code || 'Unknown error'}`);
      }
      return;
    }

    // Check if we have authorization data
    if (!response.authorize) {
      this.logError('❌ No authorization data in response');
      this.onError?.('Authorization response missing data');
      return;
    }

    this.log('✅ Successfully authorized with Deriv API');
    this.isAuthorized = true;
    this.onAuthChange?.(true);

    // Store account information
    this.currentAccount = {
      loginid: response.authorize.loginid,
      currency: response.authorize.currency,
      is_demo: response.authorize.is_virtual,
      is_virtual: response.authorize.is_virtual,
      landing_company_name: response.authorize.landing_company_name || 'virtual'
    };

    this.log('👤 Account info:', this.currentAccount);
    this.onAccountChange?.(this.currentAccount);

    // Get account balance immediately after authorization
    this.log('💰 Requesting account balance...');
    setTimeout(() => {
      this.getBalance();
    }, 1000);

    // Subscribe to balance updates
    this.log('📡 Subscribing to balance updates...');
    setTimeout(() => {
      this.subscribeToBalance();
    }, 2000);
  }

  private handleErrorResponse(response: any): void {
    const error = response.error;
    this.logError(`🚨 API Error [${error.code}]:`, error.message);

    // Handle specific error types
    if (error.code === 'InvalidToken') {
      this.onError?.('Invalid API token. Please check your token and try again.');
    } else if (error.code === 'AuthorizationRequired') {
      this.onError?.('Authorization required. Please provide a valid API token.');
    } else {
      this.onError?.(`API Error: ${error.message || 'Unknown error'}`);
    }
  }

  // Public API methods
  async getBalance(): Promise<void> {
    if (!this.isAuthorized) {
      this.logError('❌ Cannot get balance - not authorized');
      return;
    }

    const reqId = this.generateReqId();
    this.log('📤 Requesting balance with req_id:', reqId);
    this.sendMessage({
      balance: 1,
      req_id: reqId
    });
  }

  async subscribeToBalance(): Promise<void> {
    if (!this.isAuthorized) {
      this.logError('❌ Cannot subscribe to balance - not authorized');
      return;
    }

    const reqId = this.generateReqId();
    this.log('📤 Subscribing to balance updates with req_id:', reqId);
    this.sendMessage({
      balance: 1,
      subscribe: 1,
      req_id: reqId
    });
  }

  async subscribeTicks(symbol: string): Promise<void> {
    const reqId = this.generateReqId();
    this.log(`Subscribing to ticks for: ${symbol}`);

    this.sendMessage({
      ticks: symbol,
      subscribe: 1,
      req_id: reqId
    });

    this.subscriptions.set(symbol, reqId.toString());
  }

  async unsubscribeTicks(symbol: string): Promise<void> {
    const subscriptionId = this.subscriptions.get(symbol);
    if (subscriptionId) {
      this.log(`Unsubscribing from ticks for: ${symbol}`);
      const reqId = this.generateReqId();
      this.sendMessage({
        forget: subscriptionId,
        req_id: reqId
      });
      this.subscriptions.delete(symbol);
    }
  }

  async subscribeToContract(contractId: number): Promise<void> {
    this.log(`Subscribing to contract updates: ${contractId}`);
    const reqId = this.generateReqId();
    this.sendMessage({
      proposal_open_contract: 1,
      contract_id: contractId,
      subscribe: 1,
      req_id: reqId
    });
  }

  async getProposal(params: TradeParams): Promise<any> {
    return new Promise((resolve, reject) => {
      const reqId = this.generateReqId();

      this.messageHandlers.set(reqId.toString(), (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.proposal);
        }
      });

      this.sendMessage({
        proposal: 1,
        amount: params.amount,
        basis: params.basis,
        contract_type: params.contract_type,
        currency: params.currency,
        duration: params.duration,
        duration_unit: params.duration_unit,
        symbol: params.symbol,
        barrier: params.barrier,
        req_id: reqId
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.messageHandlers.has(reqId.toString())) {
          this.messageHandlers.delete(reqId.toString());
          reject(new Error('Proposal request timeout'));
        }
      }, 10000);
    });
  }

  async buyContract(params: TradeParams): Promise<TradeResult> {
    if (!this.isAuthorized) {
      throw new Error('Not authorized. Please connect with a valid API token.');
    }

    try {
      // First get a proposal
      this.log('Getting proposal for trade:', params);
      const proposal = await this.getProposal(params);

      return new Promise((resolve, reject) => {
        const reqId = this.generateReqId();

        this.messageHandlers.set(reqId.toString(), (response) => {
          if (response.error) {
            reject(response.error);
          } else {
            resolve(response);
          }
        });

        this.log('Buying contract with proposal ID:', proposal.id);
        this.sendMessage({
          buy: proposal.id,
          price: params.amount,
          req_id: reqId
        });

        // Timeout after 15 seconds
        setTimeout(() => {
          if (this.messageHandlers.has(reqId.toString())) {
            this.messageHandlers.delete(reqId.toString());
            reject(new Error('Buy contract timeout'));
          }
        }, 15000);
      });
    } catch (error) {
      this.logError('Buy contract error:', error);
      throw error;
    }
  }

  private handleBalanceResponse(response: any): void {
    this.log('📊 Raw balance response:', response);

    if (response.error) {
      this.logError('❌ Balance error:', response.error);
      return;
    }

    // Check if we have balance data
    if (!response.balance) {
      this.logError('⚠️ No balance data in response:', response);
      return;
    }

    const balance: AccountBalance = {
      balance: response.balance.balance || 0,
      currency: response.balance.currency || 'USD',
      display_balance: response.balance.display_balance || response.balance.balance?.toString() || '0.00',
      loginid: response.balance.loginid || this.currentAccount?.loginid || ''
    };

    this.log('✅ Balance updated successfully:', balance);
    this.onBalanceUpdate?.(balance);
  }

  private handleTickResponse(response: any): void {
    if (response.error) {
      this.logError('Tick error:', response.error);
      return;
    }

    const tick: TickData = {
      ask: response.tick?.ask || 0,
      bid: response.tick?.bid || 0,
      epoch: response.tick?.epoch || 0,
      id: response.tick?.id || '',
      pip_size: response.tick?.pip_size || 0,
      quote: response.tick?.quote || 0,
      symbol: response.tick?.symbol || ''
    };

    this.onTickUpdate?.(tick);
  }

  private handleTradeResponse(response: any): void {
    if (response.error) {
      this.logError('Trade failed:', response.error);
      this.onError?.(`Trade failed: ${response.error.message}`);
      return;
    }

    this.log('✅ Trade executed successfully:', response.buy);

    // Store contract for monitoring
    if (response.buy?.contract_id) {
      this.activeContracts.set(response.buy.contract_id.toString(), response.buy);
      // Subscribe to contract updates
      this.subscribeToContract(response.buy.contract_id);
    }

    this.onTradeResult?.(response);
  }

  private handleProposalResponse(response: any): void {
    if (response.error) {
      this.logError('Proposal error:', response.error);
      return;
    }

    this.log('Proposal update:', response.proposal);
  }

  private handleContractUpdateResponse(response: any): void {
    if (response.error) {
      this.logError('Contract update error:', response.error);
      return;
    }

    this.log('Contract update:', response.proposal_open_contract);
    this.onContractUpdate?.(response);
  }

  // Account type helpers
  isDemoAccount(): boolean {
    return this.currentAccount?.is_virtual === 1;
  }

  isRealAccount(): boolean {
    return this.currentAccount?.is_virtual === 0;
  }

  getCurrentAccount(): UserAccount | null {
    return this.currentAccount;
  }

  // Get available symbols for trading
  async getAvailableSymbols(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const reqId = this.generateReqId();

      this.messageHandlers.set(reqId.toString(), (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          const symbols = response.active_symbols?.map((s: any) => s.symbol) || [];
          resolve(symbols);
        }
      });

      this.sendMessage({
        active_symbols: 'brief',
        product_type: 'basic',
        req_id: reqId
      });

      setTimeout(() => {
        if (this.messageHandlers.has(reqId.toString())) {
          this.messageHandlers.delete(reqId.toString());
          reject(new Error('Get symbols timeout'));
        }
      }, 10000);
    });
  }

  // Utility methods
  private generateReqId(): number {
    // Use simple incrementing counter for reliable req_id
    return this.reqIdCounter++;
  }

  private log(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`[DerivAPI] ${message}`, data || '');
    }
  }

  private logError(message: string, error?: any): void {
    console.error(`[DerivAPI] ${message}`, error || '');
  }

  // Connection management
  disconnect(): void {
    this.log('Disconnecting from Deriv API');

    // Stop heartbeat
    this.stopHeartbeat();

    // Clear connection timeout
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    // Close WebSocket
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }

    // Reset state
    this.isConnected = false;
    this.isAuthorized = false;
    this.currentAccount = null;
    this.subscriptions.clear();
    this.activeContracts.clear();
    this.messageHandlers.clear();

    // Notify callbacks
    this.onConnectionChange?.(false);
    this.onAuthChange?.(false);
  }

  isConnectedToAPI(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  isAuthorizedToAPI(): boolean {
    return this.isConnected && this.isAuthorized;
  }

  // Force reconnection
  async forceReconnect(): Promise<boolean> {
    this.log('Force reconnecting...');
    this.disconnect();

    if (this.apiToken) {
      return await this.connect(this.apiToken);
    }

    return false;
  }

  // Get connection status info
  getConnectionStatus(): {
    connected: boolean;
    authorized: boolean;
    account: UserAccount | null;
    activeSubscriptions: number;
    activeContracts: number;
  } {
    return {
      connected: this.isConnected,
      authorized: this.isAuthorized,
      account: this.currentAccount,
      activeSubscriptions: this.subscriptions.size,
      activeContracts: this.activeContracts.size
    };
  }
}
