import prisma from '../config/database.js';

/**
 * Get dashboard insights for a tenant
 */
export async function getDashboardInsights(req, res) {
  try {
    const { tenantId } = req;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.orderDate = {};
      if (startDate) dateFilter.orderDate.gte = new Date(startDate);
      if (endDate) dateFilter.orderDate.lte = new Date(endDate);
    }

    // Get total counts
    const [totalCustomers, totalOrders, totalProducts] = await Promise.all([
      prisma.customer.count({ where: { tenantId } }),
      prisma.order.count({ where: { tenantId, ...dateFilter } }),
      prisma.product.count({ where: { tenantId } }),
    ]);

    // Get total revenue
    const revenueResult = await prisma.order.aggregate({
      where: { tenantId, ...dateFilter },
      _sum: { totalPrice: true },
    });
    const totalRevenue = revenueResult._sum.totalPrice || 0;

    // Get orders by date (for chart)
    const ordersByDate = await prisma.order.groupBy({
      by: ['orderDate'],
      where: { tenantId, ...dateFilter },
      _count: { id: true },
      _sum: { totalPrice: true },
      orderBy: { orderDate: 'asc' },
    });

    // Get top 5 customers by spend
    const topCustomers = await prisma.customer.findMany({
      where: { tenantId },
      orderBy: { totalSpent: 'desc' },
      take: 5,
      select: {
        id: true,
        shopifyId: true,
        email: true,
        firstName: true,
        lastName: true,
        totalSpent: true,
        ordersCount: true,
      },
    });

    // Additional metrics
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Revenue trends (last 30 days vs previous 30 days)
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previous30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    const [recentRevenue, previousRevenue] = await Promise.all([
      prisma.order.aggregate({
        where: {
          tenantId,
          orderDate: { gte: last30Days },
        },
        _sum: { totalPrice: true },
      }),
      prisma.order.aggregate({
        where: {
          tenantId,
          orderDate: { gte: previous30Days, lt: last30Days },
        },
        _sum: { totalPrice: true },
      }),
    ]);

    const revenueGrowth = previousRevenue._sum.totalPrice > 0
      ? ((recentRevenue._sum.totalPrice - previousRevenue._sum.totalPrice) / previousRevenue._sum.totalPrice) * 100
      : 0;

    // Order status breakdown
    const orderStatusBreakdown = await prisma.order.groupBy({
      by: ['financialStatus'],
      where: { tenantId, ...dateFilter },
      _count: { id: true },
    });

    // Fulfillment status breakdown
    const fulfillmentStatusBreakdown = await prisma.order.groupBy({
      by: ['fulfillmentStatus'],
      where: { tenantId, ...dateFilter },
      _count: { id: true },
    });

    // Monthly revenue trend - simplified approach using order grouping
    // Group orders by month manually since Prisma doesn't support DATE_TRUNC easily
    const allOrders = await prisma.order.findMany({
      where: { tenantId, ...dateFilter },
      select: {
        orderDate: true,
        totalPrice: true,
      },
    });

    // Group by month
    const monthlyRevenueMap = new Map();
    allOrders.forEach(order => {
      const monthKey = `${order.orderDate.getFullYear()}-${String(order.orderDate.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyRevenueMap.has(monthKey)) {
        monthlyRevenueMap.set(monthKey, { month: `${monthKey}-01`, orderCount: 0, revenue: 0 });
      }
      const monthData = monthlyRevenueMap.get(monthKey);
      monthData.orderCount++;
      monthData.revenue += parseFloat(order.totalPrice);
    });

    const monthlyRevenue = Array.from(monthlyRevenueMap.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(item => ({
        month: item.month,
        order_count: item.orderCount,
        revenue: item.revenue,
      }));

    // Customer lifetime value stats
    const customerStats = await prisma.customer.aggregate({
      where: { tenantId },
      _avg: { totalSpent: true },
      _max: { totalSpent: true },
      _min: { totalSpent: true },
    });

    res.json({
      totals: {
        customers: totalCustomers,
        orders: totalOrders,
        products: totalProducts,
        revenue: totalRevenue,
        averageOrderValue,
        revenueGrowth,
      },
      ordersByDate: ordersByDate.map(item => ({
        date: item.orderDate,
        count: item._count.id,
        revenue: item._sum.totalPrice,
      })),
      topCustomers,
      orderStatusBreakdown: orderStatusBreakdown.map(item => ({
        status: item.financialStatus || 'unknown',
        count: item._count.id,
      })),
      fulfillmentStatusBreakdown: fulfillmentStatusBreakdown.map(item => ({
        status: item.fulfillmentStatus || 'unknown',
        count: item._count.id,
      })),
      monthlyRevenue: Array.isArray(monthlyRevenue) ? monthlyRevenue.map(item => ({
        month: item.month,
        orderCount: Number(item.order_count || 0),
        revenue: Number(item.revenue || 0),
      })) : [],
      customerStats: {
        averageLifetimeValue: customerStats._avg.totalSpent || 0,
        maxLifetimeValue: customerStats._max.totalSpent || 0,
        minLifetimeValue: customerStats._min.totalSpent || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get orders with date range filtering
 */
export async function getOrders(req, res) {
  try {
    const { tenantId } = req;
    const { startDate, endDate, page = 1, limit = 50 } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.orderDate = {};
      if (startDate) dateFilter.orderDate.gte = new Date(startDate);
      if (endDate) dateFilter.orderDate.lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { tenantId, ...dateFilter },
        include: {
          customer: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { orderDate: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.order.count({ where: { tenantId, ...dateFilter } }),
    ]);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

