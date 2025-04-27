/**
 * Capitalizes the first letter of each word in a string
 * @param str The input string to capitalize
 * @returns A new string with each word capitalized
 */
export function capitalizeWords(str: string): string {
  if (!str) return str;

  return str
    .split(' ')
    .map((word) => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}
