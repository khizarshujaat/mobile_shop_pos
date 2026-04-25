/**
 * Lightweight classnames combiner — filters falsy values and joins with a space.
 * Avoids bringing in the `clsx` dependency for a single use case.
 *
 * @param  {...(string | false | null | undefined)} parts
 * @returns {string}
 */
export function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}
