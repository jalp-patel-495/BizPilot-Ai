export const CURRENCY_SYMBOL = 'Rs.';
export const TIMEZONE = 'Asia/Kolkata';
export const TIMEZONE_LABEL = 'UTC+05:30 (IST - Indian Standard Time)';

export const formatCurrency = (amount, includeSymbol = true) => {
  if (amount === undefined || amount === null || amount === '') {
    return includeSymbol ? 'Rs. 0' : '0';
  }
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) {
    return includeSymbol ? `Rs. ${amount}` : `${amount}`;
  }
  const formatted = num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  return includeSymbol ? `Rs. ${formatted}` : formatted;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString('en-IN', { timeZone: TIMEZONE });
};

export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleTimeString('en-IN', { timeZone: TIMEZONE, hour: '2-digit', minute: '2-digit' });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleString('en-IN', { timeZone: TIMEZONE, hour: '2-digit', minute: '2-digit' });
};
