'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import DashboardStats from '@/components/DashboardStats';
import OrdersChart from '@/components/OrdersChart';
import TopCustomers from '@/components/TopCustomers';
import TenantSelector from '@/components/TenantSelector';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Shopify Insights Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <TenantSelector
                tenants={tenants}
                selectedTenantId={tenantId}
                onSelect={setTenantId}
              />
              <button
                onClick={handleSync}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Sync Data
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Filter */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Date Range Filter</h2>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setDateRange({ startDate: '', endDate: '' })}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {!tenantId ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
            No tenant selected. Please create a tenant first.
          </div>
        ) : insights ? (
          <>
            <DashboardStats stats={insights.totals} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <OrdersChart data={insights.ordersByDate} />
              <TopCustomers customers={insights.topCustomers} />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No data available. Sync data first.</p>
          </div>
        )}
      </main>
    </div>
  );
}

