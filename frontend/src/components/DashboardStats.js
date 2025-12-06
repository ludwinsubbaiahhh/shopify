export default function DashboardStats({ stats }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const statsCards = [
    {
      title: 'Total Customers',
      value: stats.customers || 0,
      icon: '👥',
      color: 'bg-blue-500',
    },
    {
      title: 'Total Orders',
      value: stats.orders || 0,
      icon: '📦',
      color: 'bg-green-500',
    },
    {
      title: 'Total Products',
      value: stats.products || 0,
      icon: '🛍️',
      color: 'bg-purple-500',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.revenue),
      icon: '💰',
      color: 'bg-yellow-500',
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(stats.averageOrderValue || 0),
      icon: '💵',
      color: 'bg-indigo-500',
    },
    {
      title: 'Revenue Growth',
      value: stats.revenueGrowth !== undefined 
        ? `${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth.toFixed(1)}%`
        : 'N/A',
      icon: '📈',
      color: stats.revenueGrowth >= 0 ? 'bg-green-500' : 'bg-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
      {statsCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-5 sm:p-6 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100/50 animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">{stat.title}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
            </div>
            <div className={`${stat.color} w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-lg`}>
              {stat.icon}
            </div>
          </div>
          {stat.title === 'Revenue Growth' && stat.value !== 'N/A' && (
            <div className={`text-xs font-medium ${parseFloat(stat.value) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {parseFloat(stat.value) >= 0 ? '↑' : '↓'} vs previous period
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

