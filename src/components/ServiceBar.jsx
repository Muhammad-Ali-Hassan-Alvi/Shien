import { Truck, RotateCcw, FileText } from "lucide-react";

export default function ServiceBar() {
  return (
    <div className="w-full py-2 flex justify-center items-center gap-4 md:gap-12" style={{ backgroundColor: "#fcf5e6", color: "#4b0303", fontFamily: "system-ui", fontWeight: 700 }}>
        <div className="flex items-center gap-2 text-[10px] md:text-sm">
            <Truck size={16} />
            <span>Free Shipping</span>
        </div>
        <div className="hidden md:block h-4 w-px bg-[#4b0303]/20"></div>
        <div className="flex items-center gap-2 text-[10px] md:text-sm">
            <RotateCcw size={16} />
            <span>Free Returns</span>
        </div>
        <div className="hidden md:block h-4 w-px bg-[#4b0303]/20"></div>
        <div className="flex items-center gap-2 text-[10px] md:text-sm">
            <FileText size={16} />
            <span>No Hidden Fees</span>
        </div>
    </div>
  );
}
