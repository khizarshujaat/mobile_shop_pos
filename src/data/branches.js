/**
 * branches.js
 * -----------------------------------------------------------------------------
 * Branch directory for the Pakistan mobile shop POS demo.
 *
 * Two branches in well-known mobile retail hubs:
 *   1. Hafeez Center, Lahore — the country's largest electronics/mobile market
 *   2. Saddar, Rawalpindi    — long-established mobile market in the twin cities
 *
 * Each branch carries:
 *   - id        : stable unique identifier
 *   - name      : display name
 *   - code      : short internal code shown on receipts
 *   - city      : city name
 *   - address   : street address
 *   - phone     : landline / mobile contact
 *   - manager   : branch manager name
 *   - openingHours : weekday opening hours
 *   - isMain    : whether this is the headquarters branch
 * -----------------------------------------------------------------------------
 */

export const BRANCHES = [
  {
    id:           'br_lhr_01',
    name:         'SA Mobiles',
    code:         'LHR-HC',
    city:         'Ground Floor, Barkat Market',
    address:      'Ground Floor, Barkat Market, Lahore',
    phone:        '042-35777001',
    manager:      'Usman Tariq',
    openingHours: '11:00 AM – 10:00 PM (Closed Friday 1:00–2:30 PM)',
    isMain:       true,
  },
  {
    id:           'br_rwp_01',
    name:         'Al-Karim Mobiles — Saddar',
    code:         'RWP-SD',
    city:         'Rawalpindi',
    address:      'Shop 42, Bank Road, Saddar, Rawalpindi',
    phone:        '051-5512345',
    manager:      'Bilal Ahmed',
    openingHours: '10:30 AM – 9:30 PM (Closed Friday 1:00–2:30 PM)',
    isMain:       false,
  },
]

// ---------- Helpers ----------

/**
 * Look up a branch by id.
 * @param {string} id
 */
export function getBranchById(id) {
  return BRANCHES.find((b) => b.id === id)
}

/**
 * Return the main (headquarters) branch, or the first branch as a fallback.
 */
export function getMainBranch() {
  return BRANCHES.find((b) => b.isMain) || BRANCHES[0]
}

// Default export — the full branch list, for consumers that prefer default imports.
export default BRANCHES