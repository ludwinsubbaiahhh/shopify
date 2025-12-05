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
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stat.value}
              </p>
            </div>
            <div className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

