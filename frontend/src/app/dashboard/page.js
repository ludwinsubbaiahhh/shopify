'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import DashboardStats from '@/components/DashboardStats';
import OrdersChart from '@/components/OrdersChart';
import TopCustomers from '@/components/TopCustomers';
import TenantSelector from '@/components/TenantSelector';
import MonthlyRevenueChart from '@/components/MonthlyRevenueChart';
import OrderStatusChart from '@/components/OrderStatusChart';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Dashboard() {
  const router = useRouter();
  const [tenantId, setTenantId] = useState('');
  const [tenants, setTenants] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    fetchTenants();
  }, [router]);

  useEffect(() => {
    if (tenantId) {
      fetchInsights();
    }
  }, [tenantId, dateRange]);

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/tenants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTenants(response.data);
      if (response.data.length > 0) {
        setTenantId(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    if (!tenantId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ tenantId });
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await axios.get(
        `${API_URL}/api/insights/dashboard?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInsights(response.data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const handleSync = async () => {
    if (!tenantId) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/tenants/${tenantId}/sync`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('Sync started! Data will be updated shortly.');
      setTimeout(fetchInsights, 2000);
    } catch (error) {
      alert('Error syncing: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading && !insights) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Insights Dashboard
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Multi-tenant Analytics</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <TenantSelector
                tenants={tenants}
                selectedTenantId={tenantId}
                onSelect={setTenantId}
              />
              <button
                onClick={handleSync}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform hover:scale-105 active:scale-95 transition-all shadow-md hover:shadow-lg text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Sync Data</span>
                <span className="sm:hidden">Sync</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform hover:scale-105 active:scale-95 transition-all shadow-md hover:shadow-lg text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Date Range Filter */}
        <div className="mb-6 bg-white/80 backdrop-blur-sm p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-200/50 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-lg font-bold text-gray-800">Date Range Filter</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setDateRange({ startDate: '', endDate: '' })}
                className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {!tenantId ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg shadow-md animate-fade-in">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">No tenant selected. Please create a tenant first.</span>
            </div>
          </div>
        ) : insights ? (
          <>
            <DashboardStats stats={insights.totals} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
              <OrdersChart data={insights.ordersByDate} />
              <TopCustomers customers={insights.topCustomers} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
              <MonthlyRevenueChart data={insights.monthlyRevenue || []} />
              <OrderStatusChart 
                data={insights.orderStatusBreakdown || []} 
                title="Order Financial Status"
              />
            </div>
            {insights.fulfillmentStatusBreakdown && insights.fulfillmentStatusBreakdown.length > 0 && (
              <div className="mt-4 sm:mt-6">
                <OrderStatusChart 
                  data={insights.fulfillmentStatusBreakdown} 
                  title="Order Fulfillment Status"
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50">
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-600 font-medium mb-2">No data available</p>
            <p className="text-sm text-gray-500">Click "Sync Data" to fetch data from Shopify</p>
          </div>
        )}
      </main>
    </div>
  );
}

