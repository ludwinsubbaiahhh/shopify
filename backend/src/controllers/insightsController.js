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
        email: true,
        firstName: true,
        lastName: true,
        totalSpent: true,
        ordersCount: true,
      },
    });

    res.json({
      totals: {
        customers: totalCustomers,
        orders: totalOrders,
        products: totalProducts,
        revenue: totalRevenue,
      },
      ordersByDate: ordersByDate.map(item => ({
        date: item.orderDate,
        count: item._count.id,
        revenue: item._sum.totalPrice,
      })),
      topCustomers,
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

