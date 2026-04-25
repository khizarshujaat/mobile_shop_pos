/**
 * products.js
 * -----------------------------------------------------------------------------
 * Mock product catalog for a Pakistan-based mobile shop POS demo.
 *
 * Each product has:
 *   - id       : string, stable unique identifier
 *   - name     : string, display name
 *   - barcode  : string, 13-digit EAN-style barcode (scannable)
 *   - price    : number, retail price in PKR (Pakistani Rupees)
 *   - category : 'mobile' | 'accessory'
 *
 * Prices reflect typical retail rates in Pakistani mobile markets
 * (e.g. Hafeez Center Lahore, Saddar Rawalpindi, Abdullah Haroon Road Karachi)
 * at the time of writing. Adjust freely for your demo.
 * -----------------------------------------------------------------------------
 */

// ---------- Category constants ----------
export const CATEGORY = Object.freeze({
  MOBILE:    'mobile',
  ACCESSORY: 'accessory',
})

// UI-friendly category list (used by POS filters).
export const CATEGORIES = [
  { id: CATEGORY.MOBILE,    label: 'Mobiles' },
  { id: CATEGORY.ACCESSORY, label: 'Accessories' },
]

// ---------- Product catalog ----------
export const PRODUCTS = [
  // ============================================================
  // MOBILES — popular brands in the Pakistani market
  // ============================================================

  // --- Apple ---
  { id: 'MOB-001', name: 'iPhone 15 128GB',            barcode: '4901234567001', price: 289000, category: 'mobile' },
  { id: 'MOB-002', name: 'iPhone 15 Pro 256GB',        barcode: '4901234567002', price: 389000, category: 'mobile' },
  { id: 'MOB-003', name: 'iPhone 14 128GB',            barcode: '4901234567003', price: 235000, category: 'mobile' },
  { id: 'MOB-004', name: 'iPhone 13 128GB',            barcode: '4901234567004', price: 195000, category: 'mobile' },

  // --- Samsung ---
  { id: 'MOB-010', name: 'Samsung Galaxy S24 256GB',   barcode: '8801234567010', price: 259000, category: 'mobile' },
  { id: 'MOB-011', name: 'Samsung Galaxy A55 128GB',   barcode: '8801234567011', price:  99000, category: 'mobile' },
  { id: 'MOB-012', name: 'Samsung Galaxy A35 128GB',   barcode: '8801234567012', price:  74000, category: 'mobile' },
  { id: 'MOB-013', name: 'Samsung Galaxy A15 128GB',   barcode: '8801234567013', price:  49000, category: 'mobile' },
  { id: 'MOB-014', name: 'Samsung Galaxy M14 128GB',   barcode: '8801234567014', price:  38000, category: 'mobile' },

  // --- Xiaomi / Redmi / POCO ---
  { id: 'MOB-020', name: 'Xiaomi 14 256GB',            barcode: '6901234567020', price: 189000, category: 'mobile' },
  { id: 'MOB-021', name: 'Redmi Note 13 Pro 256GB',    barcode: '6901234567021', price:  79000, category: 'mobile' },
  { id: 'MOB-022', name: 'Redmi Note 13 128GB',        barcode: '6901234567022', price:  54000, category: 'mobile' },
  { id: 'MOB-023', name: 'Redmi 13C 128GB',            barcode: '6901234567023', price:  32000, category: 'mobile' },
  { id: 'MOB-024', name: 'POCO X6 Pro 256GB',          barcode: '6901234567024', price:  89000, category: 'mobile' },

  // --- Infinix / Tecno / Itel (very popular in entry/mid tier) ---
  { id: 'MOB-030', name: 'Infinix Note 40 Pro 256GB',  barcode: '6001234567030', price:  59000, category: 'mobile' },
  { id: 'MOB-031', name: 'Infinix Hot 40 128GB',       barcode: '6001234567031', price:  34000, category: 'mobile' },
  { id: 'MOB-032', name: 'Infinix Smart 8 64GB',       barcode: '6001234567032', price:  22000, category: 'mobile' },
  { id: 'MOB-033', name: 'Tecno Spark 20 Pro 256GB',   barcode: '6001234567033', price:  42000, category: 'mobile' },
  { id: 'MOB-034', name: 'Tecno Camon 20 Pro 256GB',   barcode: '6001234567034', price:  64000, category: 'mobile' },
  { id: 'MOB-035', name: 'itel A70 128GB',             barcode: '6001234567035', price:  19500, category: 'mobile' },

  // --- Vivo / Oppo / OnePlus / Realme ---
  { id: 'MOB-040', name: 'Vivo Y27 128GB',             barcode: '6951234567040', price:  42000, category: 'mobile' },
  { id: 'MOB-041', name: 'Vivo V30 256GB',             barcode: '6951234567041', price: 124000, category: 'mobile' },
  { id: 'MOB-042', name: 'Oppo A78 128GB',             barcode: '6941234567042', price:  55000, category: 'mobile' },
  { id: 'MOB-043', name: 'Oppo Reno 11 256GB',         barcode: '6941234567043', price: 129000, category: 'mobile' },
  { id: 'MOB-044', name: 'OnePlus 12 256GB',           barcode: '6921234567044', price: 229000, category: 'mobile' },
  { id: 'MOB-045', name: 'Realme C67 128GB',           barcode: '6911234567045', price:  44000, category: 'mobile' },

  // --- Nokia (feature phones still widely sold) ---
  { id: 'MOB-050', name: 'Nokia 105 (2023)',           barcode: '6401234567050', price:   3200, category: 'mobile' },
  { id: 'MOB-051', name: 'Nokia 106 (2023)',           barcode: '6401234567051', price:   3800, category: 'mobile' },
  { id: 'MOB-052', name: 'Nokia 225 4G',               barcode: '6401234567052', price:   8500, category: 'mobile' },

  // ============================================================
  // ACCESSORIES
  // ============================================================

  // --- Charging & cables ---
  { id: 'ACC-001', name: 'USB-C 20W Charger',          barcode: '7501234567001', price:  3500,  category: 'accessory' },
  { id: 'ACC-002', name: 'USB-C 65W Fast Charger',     barcode: '7501234567002', price:  6500,  category: 'accessory' },
  { id: 'ACC-003', name: 'Lightning Cable 1m',         barcode: '7501234567003', price:  1800,  category: 'accessory' },
  { id: 'ACC-004', name: 'USB-C to USB-C Cable 1m',    barcode: '7501234567004', price:  1500,  category: 'accessory' },
  { id: 'ACC-005', name: 'Micro-USB Cable 1m',         barcode: '7501234567005', price:   600,  category: 'accessory' },
  { id: 'ACC-006', name: 'Car Charger Dual USB',       barcode: '7501234567006', price:  1200,  category: 'accessory' },

  // --- Power banks ---
  { id: 'ACC-010', name: 'Power Bank 10,000mAh',       barcode: '7501234567010', price:  5500,  category: 'accessory' },
  { id: 'ACC-011', name: 'Power Bank 20,000mAh',       barcode: '7501234567011', price:  8500,  category: 'accessory' },
  { id: 'ACC-012', name: 'Power Bank 30,000mAh',       barcode: '7501234567012', price: 12000,  category: 'accessory' },

  // --- Cases & screen protection ---
  { id: 'ACC-020', name: 'iPhone 15 Silicone Case',    barcode: '7501234567020', price:  4500,  category: 'accessory' },
  { id: 'ACC-021', name: 'Samsung A55 Back Cover',     barcode: '7501234567021', price:   800,  category: 'accessory' },
  { id: 'ACC-022', name: 'Redmi Note 13 Back Cover',   barcode: '7501234567022', price:   600,  category: 'accessory' },
  { id: 'ACC-023', name: 'Tempered Glass (Universal)', barcode: '7501234567023', price:   500,  category: 'accessory' },
  { id: 'ACC-024', name: 'Tempered Glass iPhone 15',   barcode: '7501234567024', price:  1200,  category: 'accessory' },
  { id: 'ACC-025', name: 'Privacy Screen Protector',   barcode: '7501234567025', price:  1800,  category: 'accessory' },

  // --- Audio ---
  { id: 'ACC-030', name: 'Wired Earphones (3.5mm)',    barcode: '7501234567030', price:   450,  category: 'accessory' },
  { id: 'ACC-031', name: 'Wired Earphones (USB-C)',    barcode: '7501234567031', price:   950,  category: 'accessory' },
  { id: 'ACC-032', name: 'Bluetooth Earbuds (Basic)',  barcode: '7501234567032', price:  2500,  category: 'accessory' },
  { id: 'ACC-033', name: 'AirPods Pro (2nd Gen)',      barcode: '7501234567033', price: 72000,  category: 'accessory' },
  { id: 'ACC-034', name: 'Samsung Galaxy Buds FE',     barcode: '7501234567034', price: 24000,  category: 'accessory' },
  { id: 'ACC-035', name: 'Redmi Buds 5',               barcode: '7501234567035', price:  7500,  category: 'accessory' },

  // --- Memory & storage ---
  { id: 'ACC-040', name: 'Memory Card 32GB',           barcode: '7501234567040', price:  1500,  category: 'accessory' },
  { id: 'ACC-041', name: 'Memory Card 64GB',           barcode: '7501234567041', price:  2200,  category: 'accessory' },
  { id: 'ACC-042', name: 'Memory Card 128GB',          barcode: '7501234567042', price:  3800,  category: 'accessory' },
  { id: 'ACC-043', name: 'OTG Adapter (USB-C)',        barcode: '7501234567043', price:   400,  category: 'accessory' },

  // --- SIM & mobile tools ---
  { id: 'ACC-050', name: 'SIM Ejector Tool',           barcode: '7501234567050', price:   100,  category: 'accessory' },
  { id: 'ACC-051', name: 'Mobile Stand / Holder',      barcode: '7501234567051', price:   800,  category: 'accessory' },
  { id: 'ACC-052', name: 'Pop Socket Grip',            barcode: '7501234567052', price:   350,  category: 'accessory' },
  { id: 'ACC-053', name: 'Selfie Stick with Tripod',   barcode: '7501234567053', price:  1800,  category: 'accessory' },
]

// ---------- Convenience selectors ----------
export const MOBILES     = PRODUCTS.filter((p) => p.category === CATEGORY.MOBILE)
export const ACCESSORIES = PRODUCTS.filter((p) => p.category === CATEGORY.ACCESSORY)

/**
 * Find a product by id.
 * @param {string} id
 */
export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id)
}

/**
 * Find a product by scanned barcode.
 * @param {string} barcode
 */
export function getProductByBarcode(barcode) {
  return PRODUCTS.find((p) => p.barcode === barcode)
}

/**
 * Filter products by category.
 * @param {'mobile' | 'accessory'} category
 */
export function getProductsByCategory(category) {
  return PRODUCTS.filter((p) => p.category === category)
}

// Default export — the full catalog, for consumers that prefer default imports.
export default PRODUCTS