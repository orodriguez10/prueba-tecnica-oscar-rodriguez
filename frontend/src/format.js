const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Suma en centavos para evitar errores de coma flotante (0.1 + 0.2).
export const toCents = (amount) => Math.round(amount * 100);

export const formatMoney = (amount) => money.format(amount);
