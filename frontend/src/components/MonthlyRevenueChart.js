'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';

export default function MonthlyRevenueChart({ data }) {
  const chartData = data.map((item) => ({
    month: format(parseISO(item.month), 'MMM yyyy'),
    revenue: parseFloat(item.revenue || 0),
    orders: item.orderCount || 0,
  }));

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-5 sm:p-6 border border-gray-100/50 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Monthly Revenue Trend</h2>
      </div>
      {chartData.length > 0 ? (
        <div className="w-full overflow-x-auto">
          <ResponsiveContainer width="100%" height={280} minHeight={250}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                yAxisId="left" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px'
                }}
              />
              <Legend />
              <Bar 
                yAxisId="left" 
                dataKey="revenue" 
                fill="#3b82f6" 
                name="Revenue ($)"
                radius={[8, 8, 0, 0]}
              />
              <Bar 
                yAxisId="right" 
                dataKey="orders" 
                fill="#10b981" 
                name="Orders"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <p>No monthly revenue data available</p>
        </div>
      )}
    </div>
  );
}

