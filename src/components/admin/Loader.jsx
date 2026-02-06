export default function Loader() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
            <div className="relative w-12 h-12">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-black rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400 animate-pulse">Loading Data...</p>
        </div>
    );
}
