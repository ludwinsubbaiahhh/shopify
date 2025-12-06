export default function TopCustomers({ customers }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const getRankColor = (index) => {
    const colors = [
      'bg-gradient-to-br from-yellow-400 to-yellow-600', // Gold
      'bg-gradient-to-br from-gray-300 to-gray-500',    // Silver
      'bg-gradient-to-br from-orange-400 to-orange-600', // Bronze
      'bg-gradient-to-br from-blue-400 to-blue-600',
      'bg-gradient-to-br from-purple-400 to-purple-600',
    ];
    return colors[index] || 'bg-gradient-to-br from-gray-400 to-gray-600';
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-5 sm:p-6 border border-gray-100/50 animate-fade-in">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Top 5 Customers by Spend</h2>
      </div>
      {customers && customers.length > 0 ? (
        <div className="space-y-3">
          {customers.map((customer, index) => {
            const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
            const displayName = fullName || 
              (customer.email ? customer.email.split('@')[0].charAt(0).toUpperCase() + customer.email.split('@')[0].slice(1) : 
              `Customer #${customer.shopifyId?.slice(-6) || customer.id.slice(-6)}`);
            
            return (
              <div
                key={customer.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all group"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className={`${getRankColor(index)} w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-md flex-shrink-0`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {displayName}
                    </p>
                    {customer.email && (
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{customer.email}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {customer.ordersCount} {customer.ordersCount === 1 ? 'order' : 'orders'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-bold text-green-600 text-sm sm:text-base">
                    {formatCurrency(customer.totalSpent)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p>No customer data available</p>
        </div>
      )}
    </div>
  );
}

