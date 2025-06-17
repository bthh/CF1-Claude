export function formatAmount(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatAddress(address: string, length = 6): string {
  if (!address) return '';
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

export function formatDate(timestamp: number | string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(timestamp: number | string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeAgo(timestamp: number | string): string {
  const now = Date.now();
  const time = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
  const diff = now - time;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

export function parseAmount(amount: string): string {
  // Convert human-readable amount to micro units (6 decimal places for NTRN)
  const num = parseFloat(amount);
  return Math.floor(num * 1_000_000).toString();
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatTokenAmount(amount: string | number, decimals = 6): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const divisor = Math.pow(10, decimals);
  const formatted = num / divisor;
  
  return formatted.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
}

export function parseTokenAmount(amount: string | number, decimals = 6): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const multiplier = Math.pow(10, decimals);
  return Math.floor(num * multiplier).toString();
}