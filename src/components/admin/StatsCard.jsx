import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatsCard({ title, value, trend, trendValue, icon: Icon, color }) {
  const isPositive = trend === "up";
  
  return (
    <div className="bg-white/60 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-300 min-w-0">
      <div className="flex justify-between items-start gap-2 mb-4 sm:mb-6">
        <div className={`p-3 sm:p-4 rounded-xl ${color} bg-opacity-50 backdrop-blur-sm border border-white/20 shrink-0`}>
            <Icon size={22} className="text-gray-900 sm:w-6 sm:h-6" />
        </div>
        {trendValue && (
            <span className={`flex items-center text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border shrink-0 ${isPositive ? 'bg-green-100/50 border-green-200 text-green-700' : 'bg-red-100/50 border-red-200 text-red-700'}`}>
                {isPositive ? <ArrowUpRight size={12} className="mr-0.5 sm:mr-1 sm:w-3.5 sm:h-3.5" /> : <ArrowDownRight size={12} className="mr-0.5 sm:mr-1 sm:w-3.5 sm:h-3.5" />}
                {trendValue}
            </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1 tracking-wide uppercase opacity-80 truncate">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 break-words">{value}</h3>
      </div>
    </div>
  );
}
