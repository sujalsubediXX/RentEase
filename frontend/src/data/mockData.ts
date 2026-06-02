import type { StatCard, Rental, Listing, User, Dispute, Payment } from '../types';

export const stats: StatCard[] = [
  { label: "Total Revenue", value: "₹4,82,300", change: "+12.5%", up: true, color: "#10b981" },
  { label: "Active Rentals", value: "1,284", change: "+8.2%", up: true, color: "#3b82f6" },
  { label: "Total Listings", value: "3,741", change: "+5.1%", up: true, color: "#f59e0b" },
  { label: "Pending Disputes", value: "23", change: "-3.4%", up: false, color: "#ef4444" },
];

export const recentRentals: Rental[] = [
  { id: "R-1041", item: "Canon EOS R5 Camera", renter: "Arjun Mehta", owner: "Rahul Sharma", amount: "₹2,400", status: "active", date: "May 28, 2026", days: 3 },
  { id: "R-1040", item: "Mountain Bike Pro X1", renter: "Priya Nair", owner: "Kiran Joshi", amount: "₹800", status: "completed", date: "May 27, 2026", days: 2 },
  { id: "R-1039", item: "DJI Mavic 3 Drone", renter: "Saurabh Das", owner: "Anita Verma", amount: "₹3,200", status: "active", date: "May 27, 2026", days: 4 },
  { id: "R-1038", item: "Apple MacBook Pro 16\"", renter: "Meena Patel", owner: "Suresh Gupta", amount: "₹1,500", status: "pending", date: "May 26, 2026", days: 1 },
  { id: "R-1037", item: "Camping Tent (8-person)", renter: "Vikram Singh", owner: "Deepa Rao", amount: "₹600", status: "completed", date: "May 25, 2026", days: 3 },
  { id: "R-1036", item: "Sony A7 IV Camera", renter: "Neha Jain", owner: "Mohan Lal", amount: "₹1,800", status: "cancelled", date: "May 25, 2026", days: 2 },
];

export const allListings: Listing[] = [
  { id: "L-201", name: "Canon EOS R5 Camera", owner: "Rahul Sharma", category: "Electronics", price: "₹800/day", status: "active", rating: 4.8, rentals: 24, created: "Jan 10, 2026" },
  { id: "L-202", name: "Mountain Bike Pro X1", owner: "Kiran Joshi", category: "Sports", price: "₹400/day", status: "active", rating: 4.6, rentals: 18, created: "Feb 5, 2026" },
  { id: "L-203", name: "DJI Mavic 3 Drone", owner: "Anita Verma", category: "Electronics", price: "₹1,200/day", status: "active", rating: 4.9, rentals: 31, created: "Nov 20, 2025" },
  { id: "L-204", name: "Apple MacBook Pro 16\"", owner: "Suresh Gupta", category: "Electronics", price: "₹1,500/day", status: "inactive", rating: 4.5, rentals: 9, created: "Mar 14, 2026" },
  { id: "L-205", name: "8-Person Camping Tent", owner: "Deepa Rao", category: "Outdoors", price: "₹300/day", status: "active", rating: 4.7, rentals: 42, created: "Dec 1, 2025" },
  { id: "L-206", name: "Sony A7 IV Camera", owner: "Mohan Lal", category: "Electronics", price: "₹900/day", status: "pending", rating: 0, rentals: 0, created: "May 29, 2026" },
  { id: "L-207", name: "Stand-Up Paddle Board", owner: "Ritu Sharma", category: "Sports", price: "₹500/day", status: "active", rating: 4.4, rentals: 15, created: "Apr 2, 2026" },
  { id: "L-208", name: "Party Speaker JBL L8", owner: "Anil Kumar", category: "Electronics", price: "₹350/day", status: "active", rating: 4.3, rentals: 28, created: "Jan 28, 2026" },
];

export const allUsers: User[] = [
  { id: "U-101", name: "Arjun Mehta", email: "arjun@email.com", role: "renter", joined: "Jan 15, 2026", rentals: 12, spent: "₹18,400", status: "active", avatar: "AM" },
  { id: "U-102", name: "Rahul Sharma", email: "rahul@email.com", role: "owner", joined: "Dec 3, 2025", listings: 5, earned: "₹62,000", status: "active", avatar: "RS" },
  { id: "U-103", name: "Priya Nair", email: "priya@email.com", role: "both", joined: "Feb 20, 2026", rentals: 8, spent: "₹9,200", status: "active", avatar: "PN" },
  { id: "U-104", name: "Saurabh Das", email: "saurabh@email.com", role: "renter", joined: "Mar 5, 2026", rentals: 3, spent: "₹7,800", status: "active", avatar: "SD" },
  { id: "U-105", name: "Meena Patel", email: "meena@email.com", role: "renter", joined: "Apr 11, 2026", rentals: 5, spent: "₹4,100", status: "suspended", avatar: "MP" },
  { id: "U-106", name: "Kiran Joshi", email: "kiran@email.com", role: "owner", joined: "Oct 19, 2025", listings: 3, earned: "₹31,500", status: "active", avatar: "KJ" },
  { id: "U-107", name: "Anita Verma", email: "anita@email.com", role: "owner", joined: "Sep 7, 2025", listings: 2, earned: "₹88,000", status: "active", avatar: "AV" },
  { id: "U-108", name: "Vikram Singh", email: "vikram@email.com", role: "both", joined: "May 1, 2026", rentals: 2, spent: "₹1,200", status: "active", avatar: "VS" },
];

export const allDisputes: Dispute[] = [
  { id: "D-301", rental: "R-1020", item: "Canon EOS R5", renter: "Arjun Mehta", owner: "Rahul Sharma", issue: "Item returned with scratch damage", status: "open", priority: "high", date: "May 24, 2026" },
  { id: "D-302", rental: "R-1015", item: "Mountain Bike Pro", renter: "Priya Nair", owner: "Kiran Joshi", issue: "Rental period ended but item not collected", status: "investigating", priority: "medium", date: "May 22, 2026" },
  { id: "D-303", rental: "R-1009", item: "JBL Party Speaker", renter: "Meena Patel", owner: "Anil Kumar", issue: "Refund requested after cancellation", status: "resolved", priority: "low", date: "May 18, 2026" },
  { id: "D-304", rental: "R-1031", item: "DJI Mavic 3 Drone", renter: "Saurabh Das", owner: "Anita Verma", issue: "Drone not functioning as described", status: "open", priority: "high", date: "May 28, 2026" },
  { id: "D-305", rental: "R-998", item: "Camping Tent 8P", renter: "Vikram Singh", owner: "Deepa Rao", issue: "Missing tent pegs and poles", status: "resolved", priority: "low", date: "May 10, 2026" },
];

export const payments: Payment[] = [
  { id: "P-501", rental: "R-1041", user: "Arjun Mehta", amount: "₹2,400", type: "rental", method: "UPI", status: "completed", date: "May 28, 2026" },
  { id: "P-502", rental: "R-1040", user: "Rahul Sharma (payout)", amount: "₹720", type: "payout", method: "Bank Transfer", status: "completed", date: "May 29, 2026" },
  { id: "P-503", rental: "R-1039", user: "Saurabh Das", amount: "₹3,200", type: "rental", method: "Card", status: "completed", date: "May 27, 2026" },
  { id: "P-504", rental: "R-1038", user: "Meena Patel", amount: "₹1,500", type: "rental", method: "UPI", status: "pending", date: "May 26, 2026" },
  { id: "P-505", rental: "R-1036", user: "Neha Jain", amount: "₹1,800", type: "refund", method: "Card", status: "processing", date: "May 26, 2026" },
  { id: "P-506", rental: "R-1035", user: "Kiran Joshi (payout)", amount: "₹320", type: "payout", method: "Bank Transfer", status: "completed", date: "May 25, 2026" },
];