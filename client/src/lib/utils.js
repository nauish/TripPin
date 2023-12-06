import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString) => {
  if (!dateString) return '尚未定';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
};

export const formatBudget = (budget) => {
  if (budget == null) return '還沒評估預算';

  return budget.toLocaleString('en-US', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  });
};
