export default function TenantSelector({ tenants, selectedTenantId, onSelect }) {
  if (tenants.length === 0) {
    return (
      <span className="text-sm text-gray-500">No tenants available</span>
    );
  }

  return (
    <select
      value={selectedTenantId}
      onChange={(e) => onSelect(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
    >
      {tenants.map((tenant) => (
        <option key={tenant.id} value={tenant.id}>
          {tenant.name} ({tenant.shopifyDomain})
        </option>
      ))}
    </select>
  );
}

