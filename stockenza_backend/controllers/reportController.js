const Order     = require('../models/Order');
const Inventory = require('../models/Inventory');

/**
 * GET /api/reports/summary
 * Returns total revenue, net profit, and inventory value
 * scoped to the authenticated user's data only.
 */
const getSummaryStats = async (req, res) => {
  try {
    const [orders, inventory] = await Promise.all([
      Order.find({ createdBy: req.user._id })
        .populate('items.productId', 'costPrice sellingPrice'),
      Inventory.find({ createdBy: req.user._id }),
    ]);

    let totalRevenue = 0;
    let totalCost    = 0;

    orders.forEach((order) => {
      totalRevenue += order.totalAmount;

      order.items.forEach((item) => {
        if (item.productId) {
          totalCost += item.productId.costPrice * item.qty;
        }
      });
    });

    const inventoryValue = inventory.reduce(
      (acc, item) => acc + item.costPrice * item.quantity,
      0
    );

    return res.status(200).json({
      totalRevenue:   Math.round(totalRevenue * 100) / 100,
      totalProfit:    Math.round((totalRevenue - totalCost) * 100) / 100,
      inventoryValue: Math.round(inventoryValue * 100) / 100,
    });
  } catch (err) {
    console.error('[getSummaryStats]', err.message);
    return res.status(500).json({ message: 'Server error — could not generate summary.' });
  }
};

/**
 * GET /api/reports/chart
 * Returns daily revenue + profit grouped by date,
 * scoped to the authenticated user's orders only.
 */
const getChartData = async (req, res) => {
  try {
    const orders = await Order
      .find({ createdBy: req.user._id })
      .populate('items.productId', 'costPrice sellingPrice')
      .sort({ createdAt: 1 });

    // Group by YYYY-MM-DD
    const grouped = {};

    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];

      if (!grouped[date]) {
        grouped[date] = { date, revenue: 0, profit: 0 };
      }

      grouped[date].revenue += order.totalAmount;

      let orderCost = 0;
      order.items.forEach((item) => {
        if (item.productId) {
          orderCost += item.productId.costPrice * item.qty;
        }
      });

      grouped[date].profit += order.totalAmount - orderCost;
    });

    // Round values and return as sorted array
    const chartData = Object.values(grouped).map((d) => ({
      date:    d.date,
      revenue: Math.round(d.revenue * 100) / 100,
      profit:  Math.round(d.profit  * 100) / 100,
    }));

    return res.status(200).json(chartData);
  } catch (err) {
    console.error('[getChartData]', err.message);
    return res.status(500).json({ message: 'Server error — could not generate chart data.' });
  }
};

module.exports = { getSummaryStats, getChartData };