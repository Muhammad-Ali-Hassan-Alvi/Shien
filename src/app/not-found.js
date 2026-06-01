import Link from "next/link";

export const metadata = {
    title: "Page Not Found | iMART",
};

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">404</p>
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-4">
                Page not found
            </h1>
            <p className="text-gray-500 max-w-md mb-8">
                The page you are looking for does not exist or may have moved. Continue shopping from the home page.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
                <Link
                    href="/"
                    className="bg-black text-white px-8 py-3 font-bold uppercase tracking-wider text-sm hover:bg-gray-800 transition"
                >
                    Back to Shop
                </Link>
                <Link
                    href="/products"
                    className="border border-gray-300 px-8 py-3 font-bold uppercase tracking-wider text-sm hover:border-black transition"
                >
                    Browse Products
                </Link>
            </div>
        </div>
    );
}
