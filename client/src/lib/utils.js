import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString) => {
  if (!dateString) return '尚未定';
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: '2-digit',
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

export const debounce = (callback, delay = 250) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      callback(...args);
    }, delay);
  };
};

export const throttle = (callback, limit = 250) => {
  let wait = false; // Initially, we're not waiting
  return () => {
    if (!wait) {
      callback.call();
      wait = true; //
      setTimeout(() => {
        wait = false;
      }, limit);
    }
  };
};
