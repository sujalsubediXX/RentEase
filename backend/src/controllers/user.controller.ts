import type {Request, Response } from "express";
interface RentalItem {
    icon: string;
    cat: string;
    name: string;
    rating: string;
    reviews: number;
    loc: string;
    price: string;
    bg: string;
}


const items: RentalItem[] = [
    { icon: "📷", cat: "Photography", name: "Sony A7 IV Full Frame Camera", rating: "4.9", reviews: 128, loc: "Kathmandu", price: "₨850", bg: "#f5f0e8" },
    { icon: "⛺", cat: "Camping", name: "4-Person Dome Tent — Ultralight", rating: "4.8", reviews: 74, loc: "Pokhara", price: "₨400", bg: "#ede8e0" },
    { icon: "🎸", cat: "Music", name: "Fender Stratocaster Guitar + Amp", rating: "5.0", reviews: 43, loc: "Lalitpur", price: "₨650", bg: "#ede8e0" },
    { icon: "🛶", cat: "Outdoor Sports", name: "Inflatable Kayak — 2 Person", rating: "4.7", reviews: 56, loc: "Chitwan", price: "₨700", bg: "#e8edf0" },
    { icon: "🎥", cat: "Electronics", name: "4K Projector — 3000 Lumens", rating: "4.8", reviews: 91, loc: "Bhaktapur", price: "₨500", bg: "#ede8f0" },
    { icon: "🚲", cat: "Recreation", name: 'Trek Mountain Bike — 29"', rating: "4.9", reviews: 112, loc: "Kathmandu", price: "₨300", bg: "#e8f0ea" },
];

export const itemData = (req: Request, res: Response) => {
    try {
       return res.status(200).json(items);
    } catch (error) {
        return res.json({ message: "Error Occured" });
    }
}

