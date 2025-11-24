// components/dashboard/StatsCard.tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  color?: 'blue' | 'purple' | 'red' | 'green';
}

export default function StatsCard({ title, value, color = 'blue' }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    green: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <div className={`rounded-2xl border p-6 ${colorClasses[color]}`}>
      <p className="text-sm font-medium opacity-80 mb-2">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}