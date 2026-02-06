import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatsCard({ title, value, trend, trendValue, icon: Icon, color }) {
  const isPositive = trend === "up";
  
  return (
    <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-xl ${color} bg-opacity-50 backdrop-blur-sm border border-white/20`}>
            <Icon size={24} className="text-gray-900" />
        </div>
        {trendValue && (
            <span className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full border ${isPositive ? 'bg-green-100/50 border-green-200 text-green-700' : 'bg-red-100/50 border-red-200 text-red-700'}`}>
                {isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                {trendValue}
            </span>
        )}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1 tracking-wide uppercase opacity-80">{title}</p>
        <h3 className="text-3xl font-black tracking-tight text-gray-900 drop-shadow-sm">{value}</h3>
      </div>
    </div>
  );
}
