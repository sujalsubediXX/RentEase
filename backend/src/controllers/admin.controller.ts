import type { Request, Response } from "express";
import User from "../models/Users.model.ts";
import Item from "../models/items.model.ts";
import Rentals from "../models/Rentals.model.ts";
import Payments from "../models/Payments.model.ts";
import Category from "../models/category.model.ts";

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    const user = (req as any).user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only."
      });
    }

    // ── 1. Get All Data ──
    const [users, items, rentals, payments, categories] = await Promise.all([
      User.find().lean(),
      Item.find().lean(),
      Rentals.find().lean(),
      Payments.find().lean(),
      Category.find().lean()
    ]);

    // ── 2. Calculate Stats ──
    const totalUsers = users.length;
    const activeListings = items.filter(item => item.availability === 'available' || item.isActive === true).length;
    const totalRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    // Bookings today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const bookingsToday = rentals.filter(r => {
      const createdAt = new Date(r.createdAt);
      return createdAt >= today && createdAt < tomorrow;
    }).length;

    // ── 3. Calculate Changes ──
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 2);

    const thisMonthRevenue = payments
      .filter(p => p.status === 'completed' && new Date(p.createdAt) >= lastMonth)
      .reduce((sum, p) => sum + p.amount, 0);
    
    const lastMonthRevenue = payments
      .filter(p => p.status === 'completed' && new Date(p.createdAt) >= previousMonth && new Date(p.createdAt) < lastMonth)
      .reduce((sum, p) => sum + p.amount, 0);
    
    const revenueChange = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : thisMonthRevenue > 0 ? 100 : 0;

    const thisMonthBookings = rentals.filter(r => new Date(r.createdAt) >= lastMonth).length;
    const lastMonthBookings = rentals.filter(r => 
      new Date(r.createdAt) >= previousMonth && new Date(r.createdAt) < lastMonth
    ).length;
    const bookingsChange = lastMonthBookings > 0 
      ? ((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100 
      : thisMonthBookings > 0 ? 100 : 0;

    const newUsersThisMonth = users.filter(u => new Date(u.createdAt) >= lastMonth).length;
    const newUsersLastMonth = users.filter(u => 
      new Date(u.createdAt) >= previousMonth && new Date(u.createdAt) < lastMonth
    ).length;
    const usersChange = newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 
      : newUsersThisMonth > 0 ? 100 : 0;

    // ── 4. Revenue by Category ──
    const completedPayments = payments.filter(p => p.status === 'completed');
    const rentalIds = completedPayments.flatMap(p => p.rentalIds || []);
    
    let completedRentals :any[]= [];
    if (rentalIds.length > 0) {
      completedRentals = await Rentals.find({ _id: { $in: rentalIds } })
        .populate({
          path: 'itemId',
          model: 'Item'  
        })
        .lean();
    }
    
    const categoryRevenueMap: { [key: string]: number } = {};
    const categoryNameMap: { [key: string]: string } = {};
    
    categories.forEach(cat => {
      categoryNameMap[cat._id.toString()] = cat.name || 'Uncategorized';
    });

    completedRentals.forEach(rental => {
      const item = rental.itemId as any;
      if (item && item.categoryId) {
        const categoryId = item.categoryId.toString();
        const amount = rental.totalPrice || 0;
        categoryRevenueMap[categoryId] = (categoryRevenueMap[categoryId] || 0) + amount;
      }
    });

    const revenueByCategory = Object.entries(categoryRevenueMap)
      .map(([categoryId, revenue]) => ({
        category: categoryNameMap[categoryId] || 'Uncategorized',
        revenue: Math.round(revenue)
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // ── 5. Recent Activity ──
    const recentActivities :any[]= [];

    // Get recent users (last 5)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    recentUsers.forEach(u => {
      recentActivities.push({
        text: `New ${u.role} "${u.fullName}" registered`,
        time: timeAgo(u.createdAt),
        type: 'user'
      });
    });

    // Get recent bookings (last 5) 
    const recentBookingsData = await Rentals.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'userId',
        model: 'User',   
        select: 'fullName'
      })
      .populate({
        path: 'itemId',
        model: 'Item',  
        select: 'title'
      })
      .lean();
    recentBookingsData.forEach(b => {
      const renter = (b.userId as any)?.fullName || 'Unknown';
      const item = (b.itemId as any)?.title || 'Unknown';
      recentActivities.push({
        text: `New booking for "${item}" by ${renter}`,
        time: timeAgo(b.createdAt),
        type: 'booking'
      });
    });

    const recentPayments = await Payments.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'userId',
        model: 'User',  
        select: 'fullName'
      })
      .lean();
    recentPayments.forEach(p => {
      const user = (p.userId as any)?.fullName || 'Unknown';
      recentActivities.push({
        text: `Payment of रू${p.amount.toLocaleString()} from ${user}`,
        time: timeAgo(p.createdAt),
        type: 'payment'
      });
    });

    // Sort activities by time
    const sortedActivities = recentActivities
      .sort((a, b) => {
        const getTimeValue = (timeStr: string) => {
          if (timeStr === 'Just now') return 0;
          const match = timeStr.match(/(\d+)/);
          if (!match) return 999;
          const num = parseInt(match[1] ?? '0', 10);
          if (timeStr.includes('min')) return num;
          if (timeStr.includes('hr')) return num * 60;
          if (timeStr.includes('day')) return num * 1440;
          return num;
        };
        return getTimeValue(a.time) - getTimeValue(b.time);
      })
      .slice(0, 10);

    // ── 6. Recent Bookings ──
    const recentBookingList = await Rentals.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({
        path: 'userId',
        model: 'User', 
        select: 'fullName email'
      })
      .populate({
        path: 'itemId',
        model: 'Item',  
        select: 'title price'
      })
      .lean();

    const recentBookingsFormatted = recentBookingList.map(b => {
      const renter = (b.userId as any)?.fullName || 'Unknown';
      const item = (b.itemId as any)?.title || 'Unknown Item';
      const ownerId = (b.itemId as any)?.ownerId;
      
      return {
        id: b._id.toString().slice(-6).toUpperCase(),
        item: item,
        renter: renter,
        owner: ownerId ? 'Owner' : 'Unknown',
        amount: b.totalPrice || 0,
        status: b.status || 'pending',
        date: formatDate(b.createdAt)
      };
    });

    // ── 7. Return Everything ──
    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalRevenue: Math.round(totalRevenue),
          activeListings,
          totalUsers,
          bookingsToday,
          revenueChange: Math.round(revenueChange * 10) / 10,
          listingsChange: 8.1,
          usersChange: Math.round(usersChange * 10) / 10,
          bookingsChange: Math.round(bookingsChange * 10) / 10
        },
        revenueByCategory,
        recentActivity: sortedActivities,
        recentBookings: recentBookingsFormatted
      }
    });

  } catch (error: any) {
    console.error("Error fetching admin dashboard:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch dashboard data",
      error: error.stack
    });
  }
};

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(date);
}

function formatDate(date: Date): string {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
}