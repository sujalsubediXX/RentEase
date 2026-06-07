import { useState } from "react";
interface CartItem {
  id: number;
  name: string;
  pricePerDay: number;
  days: number;
  image: string;
  startDate: string;
  endDate: string;
}
const mockCart: CartItem[] = [
  { id: 1, name: "Sony A7III Camera", pricePerDay: 850, days: 3, image: "📷", startDate: "Jun 10", endDate: "Jun 13" },
  { id: 3, name: "4-Person Camping Tent", pricePerDay: 400, days: 5, image: "⛺", startDate: "Jun 15", endDate: "Jun 20" },
];

function CartPage() {
  const [cart, setCart] = useState(mockCart);

  const updateDays = (id: number, delta: number) => {
    setCart((c) =>
      c.map((item) =>
        item.id === id ? { ...item, days: Math.max(1, item.days + delta) } : item
      )
    );
  };
  const remove = (id: number) => setCart((c) => c.filter((i) => i.id !== id));

  const subtotal = cart.reduce((acc, i) => acc + i.pricePerDay * i.days, 0);
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 mt-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 font-serif">My Cart</h1>
        <p className="text-stone-500 mt-1 text-sm">{cart.length} item{cart.length !== 1 ? "s" : ""} ready to book</p>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-24 text-stone-400">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-lg font-medium">Your cart is empty</p>
          <button className="mt-6 bg-amber-500 text-stone-900 font-semibold px-6 py-2.5 rounded-xl hover:bg-amber-400 transition-colors text-sm">
            Browse Items
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-amber-300 hover:shadow-md transition-all">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-amber-50 flex items-center justify-center text-3xl shrink-0">
                    {item.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-stone-900 text-sm">{item.name}</h3>
                      <button onClick={() => remove(item.id)} className="text-stone-300 hover:text-red-400 transition-colors ml-2">
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{item.startDate} → {item.endDate}</p>
                    <div className="flex items-center justify-between mt-3">
                      {/* Day counter */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateDays(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 font-bold text-sm flex items-center justify-center transition-colors"
                        >
                          −
                        </button>
                        <span className="font-semibold text-stone-900 text-sm w-12 text-center">
                          {item.days} {item.days === 1 ? "day" : "days"}
                        </span>
                        <button
                          onClick={() => updateDays(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 font-bold text-sm flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-stone-900">
                          Rs. {(item.pricePerDay * item.days).toLocaleString()}
                        </span>
                        <p className="text-xs text-stone-400">Rs. {item.pricePerDay}/day</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-stone-900 rounded-2xl p-6 text-white sticky top-24">
              <h2 className="font-bold text-lg mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-stone-300">
                    <span className="truncate mr-2">{item.name} ×{item.days}d</span>
                    <span className="shrink-0">Rs. {(item.pricePerDay * item.days).toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-stone-700 pt-3 flex justify-between text-stone-300">
                  <span>Service Fee (5%)</span>
                  <span>Rs. {serviceFee.toLocaleString()}</span>
                </div>
                <div className="border-t border-stone-700 pt-3 flex justify-between font-bold text-lg text-white">
                  <span>Total</span>
                  <span className="text-amber-400">Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-5">
                <p className="text-xs text-stone-400 mb-3 font-medium">Pay via</p>
                <div className="grid grid-cols-2 gap-2">
                  {["eSewa", "Khalti", "Cash", "Bank"].map((m) => (
                    <button key={m} className="bg-stone-800 hover:bg-amber-500 hover:text-stone-900 text-stone-300 text-xs font-semibold py-2 rounded-lg transition-colors border border-stone-700 hover:border-amber-500">
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <button className="w-full mt-5 bg-amber-500 text-stone-900 font-bold py-3.5 rounded-xl hover:bg-amber-400 transition-colors text-sm">
                Confirm Booking →
              </button>
              <p className="text-center text-xs text-stone-500 mt-3">KYC verification required to book</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default CartPage;