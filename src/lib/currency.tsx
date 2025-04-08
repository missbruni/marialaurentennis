/**
 * Formats a number value as a currency string in British Pounds (GBP).
 *
 * @param value - The numeric value to format as currency
 * @returns Formatted currency string with GBP symbol (e.g., "£75")
 * The value is rounded to the nearest whole number (no decimal places)
 */
export const formatCurrency = (value: number): string => {
  return Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0
  }).format(value);
};
