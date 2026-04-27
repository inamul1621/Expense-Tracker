import React, { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import api from '../api/axios';

const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState({ csv: false, pdf: false });

  const handleExport = async (format) => {
    setLoading((prev) => ({ ...prev, [format]: true }));
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (filterType) params.type = filterType;

      const response = await api.get(`/export/${format}`, {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setLoading((prev) => ({ ...prev, [format]: false }));
    }
  };

  const exportOptions = [
    {
      format: 'csv',
      title: 'CSV Export',
      description: 'Download all transactions as a CSV file for spreadsheet analysis',
      icon: FileText,
      color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
    },
    {
      format: 'pdf',
      title: 'PDF Report',
      description: 'Generate a formatted PDF report with summary and transaction details',
      icon: FileText,
      color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Export</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Export your transaction data</p>
      </div>

      {/* Filters */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filter Options</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field">
              <option value="">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exportOptions.map((option) => (
          <div key={option.format} className="card">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${option.color}`}>
                <option.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">{option.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{option.description}</p>
              </div>
            </div>
            <button
              onClick={() => handleExport(option.format)}
              disabled={loading[option.format]}
              className="mt-4 w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading[option.format] ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download {option.format.toUpperCase()}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;

