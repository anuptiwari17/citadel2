// components/dashboard/StatsCard.tsx
export default function StatsCard({ title, value, color = "gray" }: { title: string; value: string | number; color?: string }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    red: "bg-red-50 text-red-700 border-red-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200"
  };

  return (
    <div className={`p-6 rounded-2xl border ${colors[color as keyof typeof colors]} bg-white`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}