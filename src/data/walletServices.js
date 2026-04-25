/**
 * walletServices.js
 * -----------------------------------------------------------------------------
 * Mobile wallet (branchless banking) service definitions for a Pakistan mobile
 * shop POS demo. The two dominant players — JazzCash (Jazz/Mobilink) and
 * Easypaisa (Telenor) — are included here along with commission logic.
 *
 * Each service supports multiple transaction types, each with its own commission
 * rate. A sensible default of 2% is used when a type-specific rate isn't set.
 *
 * Usage example:
 *
 *   import {
 *     WALLET_SERVICES,
 *     getService,
 *     calculateCommission,
 *   } from './walletServices.js'
 *
 *   const { commission, net } = calculateCommission({
 *     serviceId: 'jazzcash',
 *     type:      'cash_in',
 *     amount:    5000,
 *   })
 *   // commission = 75, net = 4925
 * -----------------------------------------------------------------------------
 */

// ---------- Defaults ----------

/** Default commission applied when a service/type doesn't specify its own. */
export const DEFAULT_COMMISSION_RATE = 0.02 // 2%

/** Standard transaction types offered by mobile wallets in Pakistan. */
export const TRANSACTION_TYPES = Object.freeze({
  CASH_IN:        'cash_in',        // customer deposits cash into their wallet
  CASH_OUT:       'cash_out',       // customer withdraws cash from their wallet
  MONEY_TRANSFER: 'money_transfer', // send money to another wallet / account
  BILL_PAYMENT:   'bill_payment',   // utility bills (K-Electric, SSGC, PTCL, etc.)
  MOBILE_LOAD:    'mobile_load',    // prepaid airtime / easyload
})

// ---------- Service definitions ----------

/**
 * Wallet service configurations.
 *
 * Each entry defines:
 *   - id                   : machine-safe identifier
 *   - name                 : display name
 *   - provider             : underlying telco / bank
 *   - defaultCommission    : fallback rate (0..1) for any type not listed
 *   - minTransaction       : minimum transaction amount in PKR
 *   - maxTransaction       : maximum transaction amount in PKR (agent limit)
 *   - commissionRates      : per-type rates (0..1)
 *   - color                : brand color for UI (hex)
 *   - shortCode            : USSD short code used on feature phones
 */
export const WALLET_SERVICES = [
  {
    id:                'jazzcash',
    name:              'JazzCash',
    provider:          'Jazz (Mobilink)',
    defaultCommission: DEFAULT_COMMISSION_RATE,
    minTransaction:    50,
    maxTransaction:    500000,
    shortCode:         '*786#',
    color:             '#E4002B',
    commissionRates: {
      // Rates below are typical demo-friendly margins. Tweak per your scenario.
      [TRANSACTION_TYPES.CASH_IN]:        0.015, // 1.5%
      [TRANSACTION_TYPES.CASH_OUT]:       0.020, // 2.0%  (default)
      [TRANSACTION_TYPES.MONEY_TRANSFER]: 0.025, // 2.5%
      [TRANSACTION_TYPES.BILL_PAYMENT]:   0.010, // 1.0%
      [TRANSACTION_TYPES.MOBILE_LOAD]:    0.030, // 3.0%
    },
  },
  {
    id:                'easypaisa',
    name:              'Easypaisa',
    provider:          'Telenor Microfinance Bank',
    defaultCommission: DEFAULT_COMMISSION_RATE,
    minTransaction:    50,
    maxTransaction:    500000,
    shortCode:         '*786#',
    color:             '#00A859',
    commissionRates: {
      [TRANSACTION_TYPES.CASH_IN]:        0.015,
      [TRANSACTION_TYPES.CASH_OUT]:       0.020,
      [TRANSACTION_TYPES.MONEY_TRANSFER]: 0.025,
      [TRANSACTION_TYPES.BILL_PAYMENT]:   0.010,
      [TRANSACTION_TYPES.MOBILE_LOAD]:    0.030,
    },
  },
]

// ---------- Helpers ----------

/**
 * Look up a wallet service by id.
 * @param {string} serviceId
 * @returns {object | undefined}
 */
export function getService(serviceId) {
  return WALLET_SERVICES.find((s) => s.id === serviceId)
}

/**
 * Resolve the effective commission rate for a given service + transaction type.
 * Falls back to the service's `defaultCommission`, then to `DEFAULT_COMMISSION_RATE`.
 *
 * @param {string} serviceId
 * @param {string} [type]
 * @returns {number} rate in the range 0..1
 */
export function getCommissionRate(serviceId, type) {
  const service = getService(serviceId)
  if (!service) return DEFAULT_COMMISSION_RATE

  if (type && service.commissionRates?.[type] != null) {
    return service.commissionRates[type]
  }
  return service.defaultCommission ?? DEFAULT_COMMISSION_RATE
}

/**
 * Calculate commission breakdown for a transaction.
 *
 * @param {object}  params
 * @param {string}  params.serviceId  - 'jazzcash' | 'easypaisa' | …
 * @param {string}  [params.type]     - one of TRANSACTION_TYPES
 * @param {number}  params.amount     - transaction amount in PKR
 *
 * @returns {{
 *   amount: number,       // original amount
 *   rate: number,         // commission rate applied (0..1)
 *   commission: number,   // commission in PKR (rounded to nearest rupee)
 *   net: number,          // amount - commission
 *   serviceId: string,
 *   type: string | null,
 *   valid: boolean,       // whether amount is within service limits
 *   error: string | null  // human-readable error, if invalid
 * }}
 */
export function calculateCommission({ serviceId, type = null, amount }) {
  const service = getService(serviceId)
  const n       = Number(amount) || 0
  const rate    = getCommissionRate(serviceId, type)

  let valid = true
  let error = null
  if (!service) {
    valid = false
    error = `Unknown service: ${serviceId}`
  } else if (n <= 0) {
    valid = false
    error = 'Amount must be greater than 0'
  } else if (n < service.minTransaction) {
    valid = false
    error = `Minimum transaction is PKR ${service.minTransaction.toLocaleString()}`
  } else if (n > service.maxTransaction) {
    valid = false
    error = `Maximum transaction is PKR ${service.maxTransaction.toLocaleString()}`
  }

  const commission = Math.round(n * rate)
  const net        = Math.max(0, n - commission)

  return {
    amount:     n,
    rate,
    commission,
    net,
    serviceId,
    type,
    valid,
    error,
  }
}

/**
 * Return a human-readable label for a transaction type.
 * @param {string} type
 */
export function describeTransactionType(type) {
  switch (type) {
    case TRANSACTION_TYPES.CASH_IN:        return 'Cash In'
    case TRANSACTION_TYPES.CASH_OUT:       return 'Cash Out'
    case TRANSACTION_TYPES.MONEY_TRANSFER: return 'Money Transfer'
    case TRANSACTION_TYPES.BILL_PAYMENT:   return 'Bill Payment'
    case TRANSACTION_TYPES.MOBILE_LOAD:    return 'Mobile Load'
    default:                               return 'Transaction'
  }
}

// Default export — the full service list, for consumers that prefer default imports.
export default WALLET_SERVICES

