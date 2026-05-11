import { WebView } from 'react-native-webview';

export interface BillDeskPaymentConfig {
  merchantId: string;
  bdorderid: string;
  token: string;
  amount: string;
  loanId: string;
  loanNo: string;
  returnUrl?: string;
}

export interface BillDeskPaymentState {
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'timeout';
  transactionId?: string;
  responseCode?: string;
  errorMessage?: string;
}

const BILLDEK_TIMEOUT = 300000; // 5 minutes
const PENDING_TRANSACTION_KEY = 'billdesk_pending_transaction';

export class BillDeskPaymentHandler {
  private webViewRef: WebView | null = null;
  private timeoutTimer: NodeJS.Timeout | null = null;
  private currentState: BillDeskPaymentState = { status: 'pending' };
  private stateChangeCallback?: (state: BillDeskPaymentState) => void;

  /**
   * Initialize payment handler
   */
  constructor(onStateChange?: (state: BillDeskPaymentState) => void) {
    this.stateChangeCallback = onStateChange;
  }

  /**
   * Generate the inline HTML payload for the BillDesk JS SDK WebView.
   * Matches the old app's BillDeskWeb component exactly.
   */
  static generatePaymentHtml(config: BillDeskPaymentConfig): string {
    const returnUrl = config.returnUrl || 'https://myloan.slunawat.com/MyLoans/PGResponse';
    // Escape values to prevent HTML injection
    const merchantId = config.merchantId.replace(/"/g, '&quot;');
    const bdorderid  = config.bdorderid.replace(/"/g, '&quot;');
    const token      = config.token.replace(/"/g, '&quot;');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <link href="https://pay.billdesk.com/jssdk/v1/dist/billdesksdk/billdesksdk.css" rel="stylesheet">
</head>
<body>
<div id="bdpaymentgateway" style="width:100%;"></div>

<script>
  // Bridge console to React Native logs
  (function() {
    var _log = console.log.bind(console);
    console.log = function() {
      _log.apply(console, arguments);
      try { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'log', msg: Array.from(arguments).join(' ') })); } catch(e) {}
    };
    console.error = function() {
      _log.apply(console, arguments);
      try { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', msg: Array.from(arguments).join(' ') })); } catch(e) {}
    };
    window.onerror = function(msg, src, line) {
      try { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', msg: 'JS Error: ' + msg + ' @ ' + src + ':' + line })); } catch(e) {}
    };
  })();
</script>

<script src="https://pay.billdesk.com/jssdk/v1/dist/billdesksdk/billdesksdk.esm.js" type="module"></script>
<script src="https://pay.billdesk.com/jssdk/v1/dist/billdesksdk.js" nomodule></script>

<script>
  console.log('BillDesk: page loaded, waiting for SDK...');

  function initiateBillDesk() {
    console.log('BillDesk: initiating payment flow');
    var flow_config = {
      merchantId: "${merchantId}",
      bdOrderId:  "${bdorderid}",
      returnUrl:  "${returnUrl}",
      authToken:  "${token}",
      childWindow: false,
      retryCount: 3
    };
    var sdkConfig = {
      merchantLogo: "",
      flowConfig:   flow_config,
      flowType:     "payments"
    };
    try {
      window.loadBillDeskSdk(sdkConfig);
      console.log('BillDesk: loadBillDeskSdk called');
    } catch(e) {
      console.error('BillDesk: loadBillDeskSdk error: ' + e.message);
    }
  }

  // Poll until the SDK global is ready (ES module loads async)
  var attempts = 0;
  function waitForSdk() {
    attempts++;
    console.log('BillDesk: SDK check attempt ' + attempts);
    if (typeof window.loadBillDeskSdk === 'function') {
      console.log('BillDesk: SDK ready');
      initiateBillDesk();
    } else if (attempts < 40) {
      setTimeout(waitForSdk, 250);
    } else {
      console.error('BillDesk: SDK not available after 10s');
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'sdk_timeout' }));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForSdk);
  } else {
    waitForSdk();
  }
</script>
</body>
</html>`;
  }

  /**
   * Start payment process
   */
  async startPayment(config: BillDeskPaymentConfig): Promise<void> {
    this.currentState = { status: 'pending' };
    this.notifyStateChange();

    // Save pending transaction for recovery
    await this.savePendingTransaction(config);

    // Start timeout timer
    this.startTimeout();

    // Payment will be handled by WebView
    this.currentState = { status: 'processing' };
    this.notifyStateChange();

    return Promise.resolve();
  }

  /**
   * Handle WebView navigation state change.
   * Detects the PGResponse return URL used by the old app.
   */
  handleNavigationStateChange(navState: { url: string }): void {
    const { url } = navState;
    if (url.includes('/MyLoans/PGResponse') || url.includes('myloan.slunawat.com/Login')) {
      this.handleCallback(url);
    }
  }

  /**
   * Handle WebView message
   */
  handleWebViewMessage(event: any): void {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'payment_status') {
        this.handlePaymentStatus(data);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to parse WebView message:', error);
      }
    }
  }

  /**
   * Handle payment callback
   */
  private handleCallback(url: string): void {
    try {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const responseCode = urlParams.get('responsecode') ?? undefined;
      const transactionId = urlParams.get('transactionid') || undefined;

      if (responseCode === '0' || responseCode === 'SUCCESS') {
        this.currentState = {
          status: 'success',
          transactionId: transactionId || undefined,
          responseCode,
        };
      } else if (responseCode === 'CANCELLED') {
        this.currentState = {
          status: 'cancelled',
          transactionId: transactionId || undefined,
          responseCode,
        };
      } else {
        this.currentState = {
          status: 'failed',
          transactionId: transactionId || undefined,
          responseCode,
          errorMessage: urlParams.get('message') || 'Payment failed',
        };
      }

      this.clearPendingTransaction();
      this.stopTimeout();
      this.notifyStateChange();
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to handle callback:', error);
      }
      this.currentState = {
        status: 'failed',
        errorMessage: 'Failed to process payment callback',
      };
      this.notifyStateChange();
    }
  }

  /**
   * Handle payment status from WebView
   */
  private handlePaymentStatus(data: any): void {
    if (data.status === 'success') {
      this.currentState = {
        status: 'success',
        transactionId: data.transactionId,
        responseCode: data.responseCode,
      };
    } else if (data.status === 'cancelled') {
      this.currentState = {
        status: 'cancelled',
        transactionId: data.transactionId,
        responseCode: data.responseCode,
      };
    } else if (data.status === 'failed') {
      this.currentState = {
        status: 'failed',
        transactionId: data.transactionId,
        responseCode: data.responseCode,
        errorMessage: data.message,
      };
    }

    this.clearPendingTransaction();
    this.stopTimeout();
    this.notifyStateChange();
  }

  /**
   * Handle Android back button press
   */
  handleBackPress(): boolean {
    if (this.currentState.status === 'processing') {
      // Show confirmation dialog before cancelling
      return false; // Let the screen handle the dialog
    }
    return true; // Allow back navigation
  }

  /**
   * Cancel payment
   */
  cancelPayment(): void {
    if (this.currentState.status === 'processing') {
      this.currentState = {
        status: 'cancelled',
        errorMessage: 'Payment cancelled by user',
      };
      this.clearPendingTransaction();
      this.stopTimeout();
      this.notifyStateChange();
    }
  }

  /**
   * Start timeout timer
   */
  private startTimeout(): void {
    this.stopTimeout();
    this.timeoutTimer = setTimeout(() => {
      this.currentState = {
        status: 'timeout',
        errorMessage: 'Payment timed out',
      };
      this.clearPendingTransaction();
      this.notifyStateChange();
    }, BILLDEK_TIMEOUT);
  }

  /**
   * Stop timeout timer
   */
  private stopTimeout(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }

  /**
   * Save pending transaction for recovery
   */
  private async savePendingTransaction(config: BillDeskPaymentConfig): Promise<void> {
    try {
      const { secureStorage } = await import('./storage.utils');
      const pendingTransaction = {
        config,
        timestamp: Date.now(),
      };
      await secureStorage.setItem(
        PENDING_TRANSACTION_KEY,
        JSON.stringify(pendingTransaction)
      );
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to save pending transaction:', error);
      }
    }
  }

  /**
   * Clear pending transaction
   */
  private async clearPendingTransaction(): Promise<void> {
    try {
      const { secureStorage } = await import('./storage.utils');
      await secureStorage.deleteItem(PENDING_TRANSACTION_KEY);
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to clear pending transaction:', error);
      }
    }
  }

  /**
   * Check for and recover pending transaction
   */
  static async checkPendingTransaction(): Promise<BillDeskPaymentConfig | null> {
    try {
      const { secureStorage } = await import('./storage.utils');
      const pendingData = await secureStorage.getItem(PENDING_TRANSACTION_KEY);
      if (pendingData) {
        const { config, timestamp } = JSON.parse(pendingData);
        
        // Check if transaction is too old (more than 1 hour)
        const hourAgo = Date.now() - 3600000;
        if (timestamp < hourAgo) {
          await secureStorage.deleteItem(PENDING_TRANSACTION_KEY);
          return null;
        }
        
        return config;
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to check pending transaction:', error);
      }
    }
    return null;
  }

  /**
   * Get current payment state
   */
  getState(): BillDeskPaymentState {
    return this.currentState;
  }

  /**
   * Set WebView reference
   */
  setWebViewRef(ref: WebView | null): void {
    this.webViewRef = ref;
  }

  /**
   * Inject JavaScript into WebView
   */
  injectJavaScript(script: string): void {
    if (this.webViewRef) {
      this.webViewRef.injectJavaScript(script);
    }
  }

  /**
   * Notify state change
   */
  private notifyStateChange(): void {
    if (this.stateChangeCallback) {
      this.stateChangeCallback(this.currentState);
    }
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.stopTimeout();
    this.webViewRef = null;
    this.stateChangeCallback = undefined;
  }
}

export const billDeskPaymentHandler = BillDeskPaymentHandler;
