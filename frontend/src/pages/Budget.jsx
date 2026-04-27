import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import { formatCurrency } from '../utils/helpers';

const EXPENSE_CATEGORIES = ['food', 'travel', 'bills', 'shopping', 'health', 'others'];

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const fetchBudgets = async () => {
    try {
      const { data } = await api.get('/budget', {
        params: { month: currentMonth, year: currentYear },
      });
      setBudgets(data.data);

      // Fetch expenses for each budget category
      const expensePromises = data.data.map(async (b) => {
        const start = new Date(currentYear, currentMonth - 1, 1).toISOString();
        const end = new Date(currentYear, currentMonth, 0, 23, 59, 59).toISOString();
        const { data: transData } = await api.get('/transactions', {
          params: { type: 'expense', category: b.category, startDate: start, endDate: end },
        });
        return { category: b.category, total: transData.data.reduce((s, t) => s + t.amount, 0) };
      });

      const expenseResults = await Promise.all(expensePromises);
      const expenseMap = {};
      expenseResults.forEach((e) => { expenseMap[e.category] = e.total; });
      setExpenses(expenseMap);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBudget) {
        await api.put(`/budget/${editingBudget._id}`, formData);
      } else {
        await api.post('/budget', formData);
      }
      setModalOpen(false);
      resetForm();
      fetchBudgets();
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      await api.delete(`/budget/${id}`);
      fetchBudgets();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const openEditModal = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      limit: budget.limit,
      month: budget.month,
      year: budget.year,
    });
    setModalOpen(true);
  };

  const openAddModal = () => {
    setEditingBudget(null);
    resetForm();
    setModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      category: '',
      limit: '',
      month: currentMonth,
      year: currentYear,
    });
  };

  const getProgressColor = (spent, limit) => {
    const pct = (spent / limit) * 100;
    if (pct >= 100) return 'bg-red-500';
    if (pct >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Set Budget
        </button>
      </div>

      {/* Alerts */}
      {budgets.some((b) => (expenses[b.category] || 0) >= b.limit * 0.8) && (
        <div className="card border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Budget Alert</span>
          </div>
          <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
            Some categories are nearing or have exceeded their budget limits.
          </p>
        </div>
      )}

      {/* Budget Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => {
            const spent = expenses[budget.category] || 0;
            const percentage = Math.min((spent / budget.limit) * 100, 100);
            const isOver = spent > budget.limit;

            return (
              <div key={budget._id} className={`card ${isOver ? 'border-red-200 dark:border-red-800' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{budget.category}</h3>
                    <p className={`text-sm ${isOver ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {isOver ? 'Over budget!' : `${Math.round(percentage)}% used`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditModal(budget)} className="p-1.5 text-gray-600 hover:text-primary-600 rounded-lg dark:text-gray-400 dark:hover:text-primary-400">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(budget._id)} className="p-1.5 text-gray-600 hover:text-red-600 rounded-lg dark:text-gray-400 dark:hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{formatCurrency(spent)}</span>
                    <span className="text-gray-900 dark:text-gray-200 font-medium">{formatCurrency(budget.limit)}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${getProgressColor(spent, budget.limit)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Remaining: <span className={isOver ? 'text-red-600' : 'text-green-600'}>{formatCurrency(budget.limit - spent)}</span>
                </div>
              </div>
            );
          })}

          {budgets.length === 0 && (
            <div className="card col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No budgets set for this month</p>
              <button onClick={openAddModal} className="mt-4 text-primary-600 hover:text-primary-700 font-medium">
                Set your first budget
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingBudget ? 'Edit Budget' : 'Set Budget'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select name="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field" required disabled={!!editingBudget}>
                    <option value="">Select category...</option>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget Limit</label>
                  <input
                    type="number"
                    value={formData.limit}
                    onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                    required
                    min="0.01"
                    step="0.01"
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-secondary">Cancel</button>
                  <button type="submit" className="flex-1 btn-primary">{editingBudget ? 'Update' : 'Set Budget'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;

