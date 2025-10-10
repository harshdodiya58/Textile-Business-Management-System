export function formatINR(value) {
  if (value === null || value === undefined) return '₹0.00';
  const num = Number(value) || 0;
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
