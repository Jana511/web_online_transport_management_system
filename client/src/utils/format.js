// 5000 -> "LKR 5,000.00"
export const formatMoney = (amount) =>
  new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount || 0);

// "2026-10" -> "October 2026"
export const formatMonth = (month) =>
  month
    ? new Date(`${month}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : '';

// Today's month in Sri Lanka time, e.g. "2026-10"
export const currentMonth = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' }).slice(0, 7);

// Friendly names for payment methods
export const paymentMethodLabels = {
  cash: 'Cash',
  bank_transfer: 'Bank transfer',
  card: 'Card',
};