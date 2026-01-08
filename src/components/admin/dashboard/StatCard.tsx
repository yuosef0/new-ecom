interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
  iconBg?: string;
}

export function StatCard({ title, value, icon, change, iconBg = "bg-brand-primary" }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`mt-2 text-sm ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {change.isPositive ? '↑' : '↓'} {change.value}
            </p>
          )}
        </div>
        <div className={`${iconBg} rounded-full p-3`}>
          <span className="material-icons-outlined text-white text-2xl">
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
}
