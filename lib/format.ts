/**
 * INR currency and number formatting utilities.
 * Amounts from API are in integer paise — convert to rupees for display.
 */

/**
 * Format paise to INR string: 23140000 → "₹2,31,400"
 * If value looks like rupees already (< 100_000 threshold), use as-is.
 */
export function formatINR(paise: number | undefined | null): string {
    if (!paise) return '₹0';
    // Heuristic: if > 100_000 assume paise, else assume rupees
    const rupees = paise > 100_000 ? paise / 100 : paise;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(rupees);
}

/**
 * Format a delta number with sign: +3, -2, 0
 */
export function formatDelta(n: number): string {
    if (n > 0) return `+${n}`;
    return String(n);
}
