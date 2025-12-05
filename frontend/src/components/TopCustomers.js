export default function TopCustomers({ customers }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Top 5 Customers by Spend</h2>
      {customers && customers.length > 0 ? (
        <div className="space-y-4">
          {customers.map((customer, index) => (
            <div
              key={customer.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {customer.firstName} {customer.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                  <p className="text-xs text-gray-400">
                    {customer.ordersCount} orders
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">
                  {formatCurrency(customer.totalSpent)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No customer data available
        </div>
      )}
    </div>
  );
}

