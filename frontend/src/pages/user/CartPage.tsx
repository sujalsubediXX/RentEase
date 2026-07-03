import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config/api";
import { ImageSlider } from "./ImageSlider";
import { useAuth } from "../../hooks/useAuth";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
const BASE_URL = "http://localhost:3000";
interface CartItem {
  _id: string;
  itemId: {
    _id: string;
    title: string;
    price: number;
    images: string[];
  };
  quantity: number;
  rentalDays: number;
  startDate: string;
  endDate: string;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [blockedRangesMap, setBlockedRangesMap] = useState<
    Record<string, { start: Date; end: Date }[]>
  >({});
  const token = localStorage.getItem("accessToken") || "";
  const fetchAllAvailability = async (items: CartItem[]) => {
    const entries = await Promise.all(
      items.map(async (item) => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/rentals/availability/${item.itemId._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }
          );
          const ranges = (res.data?.data?.fullyBookedRanges || []).map((r: any) => ({
            start: new Date(r.start),
            end: new Date(r.end),
          }));
          return [item.itemId._id, ranges] as const;
        } catch (err) {
          console.log('Failed to fetch availability for', item.itemId._id, err);
          return [item.itemId._id, []] as const;
        }
      })
    );
    setBlockedRangesMap(Object.fromEntries(entries));
  };

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/cart/${user?.id}`);
      const items = res.data.cart.items || [];
      setCart(items);
      fetchAllAvailability(items);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);


  const calcDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  };


  const removeItem = async (cartItemId: string) => {

    try {
      await axios.delete(
        `${API_BASE_URL}/cart/remove/${user?.id}/${cartItemId}`
      );

      fetchCart();
    } catch (err) {
      console.log(err);
    }
  };


  const subtotal = useMemo(() => {
    return cart.reduce(
      (acc, item) => acc + item.itemId.price * item.rentalDays,
      0
    );
  }, [cart]);

  const serviceFee = subtotal * 0.05;
  const total = subtotal + serviceFee;

  const updateDates = async (
    cartItemId: string,
    startDate: string,
    endDate: string
  ) => {
    try {
      await axios.put(
        `${API_BASE_URL}/cart/update-dates/${user?.id}/${cartItemId}`,
        {
          startDate,
          endDate,
        }
      );

      fetchCart();
    } catch (err) {
      console.log(err);
    }
  };
  const handleStartDateChange = (item: CartItem, date: Date | null) => {
    if (!date) return;
    const newStart = date.toISOString().split('T')[0];

    const currentEnd = item.endDate ? item.endDate.split('T')[0] : '';
    // If there's no end date yet, or the new start would land on/after it,
    // bump the end date up to match the new start so the range stays valid.
    const newEnd =
      !currentEnd || new Date(currentEnd) < date ? newStart : currentEnd;

    updateDates(item._id, newStart, newEnd);
  };

  const handleEndDateChange = (item: CartItem, date: Date | null) => {
    if (!date) return;
    const newEnd = date.toISOString().split('T')[0];

    const currentStart = item.startDate ? item.startDate.split('T')[0] : newEnd;
    updateDates(item._id, currentStart, newEnd);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 mt-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 font-serif">
          My Cart
        </h1>
        <p className="text-stone-500 mt-1 text-sm">
          {cart.length} item{cart.length !== 1 ? "s" : ""} ready to book
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-24 text-stone-400">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-lg font-medium">Your cart is empty</p>
          <button onClick={() => navigate("/categories")} className="mt-6 bg-amber-500 text-stone-900 font-semibold px-6 py-2.5 rounded-xl hover:bg-amber-400 transition-colors text-sm">
            Browse Items
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-amber-300 hover:shadow-md transition-all"
              >
                <div className="flex gap-4">
                  <div className="w-28 h-28 rounded-xl  flex items-center justify-center text-3xl shrink-0">
                    <ImageSlider images={(item.itemId.images).map((img) => `${BASE_URL}${img}`)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-stone-900 text-sm">
                        {item.itemId.title}
                      </h3>

                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-stone-300 hover:text-red-500 ml-2"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <DatePicker
                        selected={item.startDate ? new Date(item.startDate) : null}
                        onChange={(date: Date | null) => handleStartDateChange(item, date)}
                        excludeDateIntervals={blockedRangesMap[item.itemId._id] || []}
                        minDate={new Date()}
                        className="text-xs border border-stone-200 rounded-lg px-2 py-1 w-28"
                        dateFormat="yyyy-MM-dd"
                      />

                      <span className="text-stone-400 text-xs">→</span>

                      <DatePicker
                        selected={item.endDate ? new Date(item.endDate) : null}
                        onChange={(date: Date | null) => handleEndDateChange(item, date)}
                        excludeDateIntervals={blockedRangesMap[item.itemId._id] || []}
                        minDate={item.startDate ? new Date(item.startDate) : new Date()}
                        className="text-xs border border-stone-200 rounded-lg px-2 py-1 w-28"
                        dateFormat="yyyy-MM-dd"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      {/* DAYS CONTROL */}
                      <div className="flex items-center gap-3">

                        <span className="text-sm font-semibold">
                          {calcDays(item.startDate, item.endDate)} days
                        </span>

                      </div>

                      <div className="text-right">
                        <div className="font-bold">
                          Rs.{" "}
                          {(
                            item.itemId.price * item.rentalDays
                          ).toLocaleString()}
                        </div>
                        <p className="text-xs text-stone-400">
                          Rs. {item.itemId.price}/day
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-stone-900 text-white rounded-2xl p-6 sticky top-24">
              <h2 className="font-bold text-lg mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between text-stone-300"
                  >
                    <span className="truncate">
                      {item.itemId.title} × {item.rentalDays}
                    </span>
                    <span>
                      Rs.{" "}
                      {(
                        item.itemId.price * item.rentalDays
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}

                <div className="border-t border-stone-700 pt-3 flex justify-between">
                  <span>Service Fee (5%)</span>
                  <span>Rs. {serviceFee.toLocaleString()}</span>
                </div>

                <div className="border-t border-stone-700 pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-amber-400">
                    Rs. {total.toLocaleString()}
                  </span>
                </div>
              </div>

              <button onClick={() => navigate("/checkout", {
                state: {
                  type: "cart",
                  items: cart
                }
              })}
                className="w-full mt-5 bg-amber-500 text-stone-900 font-bold py-3 rounded-xl">
                Confirm Booking →
              </button>
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
}