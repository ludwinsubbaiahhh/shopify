export default function TenantSelector({ tenants, selectedTenantId, onSelect }) {
  if (tenants.length === 0) {
    return (
      <span className="text-sm text-gray-500">No tenants available</span>
    );
  }

  return (
    <div className="relative">
      <select
        value={selectedTenantId}
        onChange={(e) => onSelect(e.target.value)}
        className="appearance-none px-4 py-2 pr-8 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm font-medium text-gray-700 hover:border-gray-300 cursor-pointer"
      >
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

