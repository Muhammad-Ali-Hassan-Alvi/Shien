"use client";

import { useCartStore } from "@/store/useCartStore";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const CITIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", 
  "Multan", "Peshawar", "Quetta", "Gujranwala", "Sialkot", 
  "Hyderabad", "Abbottabad", "Bahawalpur", "Sargodha", "Other"
];

export default function CheckoutForm({ onSuccess }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, getCartTotal } = useCartStore();
  
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [formData, setFormData] = useState({
      fullName: "",
      phone: "",
      address: "",
      city: "Karachi", 
      nearestLandmark: ""
  });
  const [loading, setLoading] = useState(false);

  // Pre-fill data if available
  useEffect(() => {
    if (session?.user) {
        setFormData(prev => ({
            ...prev,
            fullName: session.user.name || "",
            phone: session.user.phone || "", // Assuming phone might be in session
            // email: session.user.email // If needed
        }));
    }
  }, [session]);

  if (status === "loading") return <div className="p-8 text-center">Loading checkout...</div>;

  if (status === "unauthenticated") {
      return (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Sign in to Checkout</h3>
              <p className="text-gray-500">You must be logged in to complete your purchase.</p>
              <button 
                onClick={() => signIn()} // Params can be added to redirect back
                className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition"
              >
                  Sign In Now
              </button>
          </div>
      );
  }

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      if (!/^03\d{9}$/.test(formData.phone)) {
          toast.error("Invalid Phone Format. Example: 03001234567");
          setLoading(false);
          return;
      }

      const orderData = {
          items: items.map(item => ({
              product: item._id, // Ensure this matches DB ID
              quantity: item.quantity,
              variant: item.variant
          })),
          shippingInfo: formData,
          paymentMethod: 'COD'
      };

      try {
           const res = await fetch('/api/orders', { 
               method: 'POST', 
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify(orderData) 
           });
           
           const data = await res.json();

           if (!res.ok) throw new Error(data.error || "Order Failed");

           toast.success("Order Placed!");
           if (onSuccess) onSuccess(data.orderId);

      } catch (error) {
          console.error(error);
          toast.error(error.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <div className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">Shipping Details</h2>
            
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input 
                        name="fullName"
                        required 
                        className="w-full border p-3 rounded mt-1 focus:ring-1 focus:ring-black outline-none"
                        onChange={handleChange}
                    />
                </div>
                
                <div>
                    <label className="text-sm font-medium text-gray-700">Phone Number (03...)</label>
                    <input 
                        name="phone"
                        type="tel"
                        maxLength={11}
                        placeholder="03XXXXXXXXX"
                        required 
                        className="w-full border p-3 rounded mt-1 focus:ring-1 focus:ring-black outline-none"
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <textarea 
                        name="address"
                        rows={2}
                        required 
                        className="w-full border p-3 rounded mt-1 focus:ring-1 focus:ring-black outline-none"
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-sm font-medium text-gray-700">City</label>
                        <select 
                            name="city" 
                            className="w-full border p-3 rounded mt-1 bg-white focus:ring-1 focus:ring-black outline-none"
                            onChange={handleChange}
                            value={formData.city}
                        >
                            {CITIES.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                     </div>
                     
                     <div>
                        <label className="text-sm font-medium text-gray-700">Landmark</label>
                        <input 
                            name="nearestLandmark"
                            className="w-full border p-3 rounded mt-1 focus:ring-1 focus:ring-black outline-none"
                            onChange={handleChange}
                        />
                     </div>
                </div>
            </div>
       </div>

       <div className="pt-4 border-t border-gray-100">
           <h2 className="text-xl font-bold mb-4">Payment</h2>
           <div className="space-y-3">
               <label className="flex items-center gap-3 p-4 border border-black bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition">
                   <input 
                    type="radio" 
                    name="payment" 
                    value="COD"
                    checked={paymentMethod === 'COD'} 
                    onChange={() => setPaymentMethod('COD')}
                    className="w-5 h-5 accent-black" 
                   />
                   <span className="font-bold">Cash on Delivery (COD)</span>
               </label>

               <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition">
                   <input 
                    type="radio" 
                    name="payment" 
                    value="GOPAYFAST"
                    checked={paymentMethod === 'GOPAYFAST'}
                    onChange={() => setPaymentMethod('GOPAYFAST')}
                    className="w-5 h-5 accent-orange-500" 
                   />
                   <div className="flex flex-col">
                        <span className="font-bold text-gray-800">GoPayFast</span>
                        <span className="text-xs text-gray-500">Pay via Bank Account / Wallet (Pakistan)</span>
                   </div>
               </label>
           </div>
       </div>

       <button 
         type="submit" 
         disabled={loading || items.length === 0}
         className="w-full bg-black text-white py-4 font-bold text-lg uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:bg-gray-400 rounded-md"
       >
           {loading ? "Processing..." : `Place Order (Rs. ${getCartTotal()})`}
       </button>
    </form>
  );
}
