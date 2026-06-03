import { Truck, RotateCcw, FileText } from "lucide-react";

export default function ServiceBar() {
  return (
    <div
        className="w-full py-2 px-3 flex flex-wrap justify-center items-center gap-x-4 gap-y-1 md:gap-x-10"
        style={{ backgroundColor: "#fcf5e6", color: "#4b0303", fontFamily: "system-ui", fontWeight: 700 }}
    >
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
            <Truck size={14} className="shrink-0" />
            <span>Free Shipping</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
            <RotateCcw size={14} className="shrink-0" />
            <span>Free Returns</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
            <FileText size={14} className="shrink-0" />
            <span>No Hidden Fees</span>
        </div>
    </div>
  );
}
