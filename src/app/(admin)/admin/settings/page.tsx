export default function AdminSettingsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your store settings and configuration
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-12">
          <span className="material-icons-outlined text-6xl text-gray-300 mb-4">
            settings
          </span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Settings Coming Soon
          </h3>
          <p className="text-gray-600 mb-4">
            Store settings management will be implemented in the next phase.
          </p>
          <p className="text-sm text-gray-500">
            For now, you can manage settings directly via Supabase dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
