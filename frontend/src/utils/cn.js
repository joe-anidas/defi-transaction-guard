import { clsx } from 'clsx'

/**
 * Utility function for combining class names
 * Combines clsx with conditional logic for better class name management
 */
export function cn(...inputs) {
  return clsx(inputs)
}

// Re-export clsx for direct use
export { clsx }