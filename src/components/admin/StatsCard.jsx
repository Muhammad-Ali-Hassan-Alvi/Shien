import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatsCard({ title, value, trend, trendValue, icon: Icon, color }) {
  const isPositive = trend === "up";
  
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon size={22} className="text-black" />
        </div>
        {trendValue && (
            <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                {trendValue}
            </span>
        )}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold tracking-tight text-gray-900">{value}</h3>
      </div>
    </div>
  );
}
