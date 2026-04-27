export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount || 0);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateInput = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

export const getCategoryColor = (category) => {
  const colors = {
    food: '#ef4444',
    travel: '#f97316',
    bills: '#eab308',
    shopping: '#8b5cf6',
    health: '#06b6d4',
    others: '#6b7280',
    salary: '#22c55e',
    freelance: '#10b981',
    investment: '#3b82f6',
    gift: '#ec4899',
  };
  return colors[category] || '#6b7280';
};

export const categories = [
  { value: 'food', label: 'Food', type: 'expense' },
  { value: 'travel', label: 'Travel', type: 'expense' },
  { value: 'bills', label: 'Bills', type: 'expense' },
  { value: 'shopping', label: 'Shopping', type: 'expense' },
  { value: 'health', label: 'Health', type: 'expense' },
  { value: 'others', label: 'Others', type: 'expense' },
  { value: 'salary', label: 'Salary', type: 'income' },
  { value: 'freelance', label: 'Freelance', type: 'income' },
  { value: 'investment', label: 'Investment', type: 'income' },
  { value: 'gift', label: 'Gift', type: 'income' },
];

export const expenseCategories = categories.filter((c) => c.type === 'expense');
export const incomeCategories = categories.filter((c) => c.type === 'income');

export const getMonthName = (monthIndex) => {
  return new Date(2000, monthIndex).toLocaleString('default', { month: 'long' });
};

