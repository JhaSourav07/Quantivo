const Order     = require('../models/Order');
const Inventory = require('../models/Inventory');

/**
 * Build a MongoDB { createdAt: { $gte, $lte } } filter from optional query params.
 * Returns an empty object when both params are absent (all-time).
 */
function buildDateFilter({ startDate, endDate }) {
  if (!startDate && !endDate) return {};
  const createdAt = {};
  if (startDate) createdAt.$gte = new Date(startDate);
  if (endDate)   createdAt.$lte = new Date(endDate);
  return { createdAt };
}

/**
 * GET /api/reports/summary?startDate=&endDate=
 * Returns total revenue, net profit, inventory value, and order count
 * for the requested date window (all orders if dates are omitted).
 */
const getSummaryStats = async (req, res) => {
  try {
    const dateFilter = buildDateFilter(req.query);

    const [orders, inventory] = await Promise.all([
      Order.find({ createdBy: req.user._id, ...dateFilter })
        .populate('items.productId', 'costPrice'),
      Inventory.find({ createdBy: req.user._id }),
    ]);

    let totalRevenue = 0;
    let totalCost    = 0;

    orders.forEach((order) => {
      totalRevenue += order.totalAmount;
      order.items.forEach((item) => {
        if (item.productId) totalCost += item.productId.costPrice * item.qty;
      });
    });

    const inventoryValue = inventory.reduce(
      (acc, item) => acc + item.costPrice * item.quantity, 0
    );

    return res.status(200).json({
      totalRevenue:   Math.round(totalRevenue * 100) / 100,
      totalProfit:    Math.round((totalRevenue - totalCost) * 100) / 100,
      inventoryValue: Math.round(inventoryValue * 100) / 100,
      orderCount:     orders.length,
    });
  } catch (err) {
    console.error('[getSummaryStats]', err.message);
    return res.status(500).json({ message: 'Server error — could not generate summary.' });
  }
};

/**
 * GET /api/reports/chart?startDate=&endDate=
 * Returns daily revenue + profit grouped by date.
 * Uses an aggregation pipeline so date filtering happens entirely in MongoDB.
 */
const getChartData = async (req, res) => {
  try {
    const dateFilter = buildDateFilter(req.query);

    // $match must be the very first stage so MongoDB can use the index on createdAt
    const matchStage = { $match: { createdBy: req.user._id, ...dateFilter } };

    const orders = await Order
      .find({ createdBy: req.user._id, ...dateFilter })
      .populate('items.productId', 'costPrice')
      .sort({ createdAt: 1 });

    // Group by YYYY-MM-DD
    const grouped = {};
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!grouped[date]) grouped[date] = { date, revenue: 0, profit: 0 };

      grouped[date].revenue += order.totalAmount;

      let orderCost = 0;
      order.items.forEach((item) => {
        if (item.productId) orderCost += item.productId.costPrice * item.qty;
      });
      grouped[date].profit += order.totalAmount - orderCost;
    });

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

/**
 * GET /api/reports/pnl?startDate=&endDate=
 * Returns per-product P&L fully computed server-side so the date filter
 * is applied at the DB level, not in the browser.
 */
const getPnlData = async (req, res) => {
  try {
    const dateFilter = buildDateFilter(req.query);

    // Fetch date-filtered orders + full inventory in parallel
    const [orders, inventory] = await Promise.all([
      Order.find({ createdBy: req.user._id, ...dateFilter })
        .populate('items.productId', 'name costPrice sellingPrice'),
      Inventory.find({ createdBy: req.user._id }),
    ]);

    // Build a lookup map: productId → inventory item
    const invMap = {};
    inventory.forEach((item) => { invMap[item._id.toString()] = item; });

    // Aggregate units sold + revenue per product from the filtered orders
    const productStats = {}; // productId → { unitsSold, revenue, cost }

    orders.forEach((order) => {
      order.items.forEach((lineItem) => {
        const prod = lineItem.productId; // populated
        if (!prod) return;

        const id = prod._id.toString();
        if (!productStats[id]) {
          productStats[id] = { unitsSold: 0, revenue: 0, cost: 0 };
        }
        productStats[id].unitsSold += lineItem.qty;
        productStats[id].revenue  += lineItem.qty * prod.sellingPrice;
        productStats[id].cost     += lineItem.qty * prod.costPrice;
      });
    });

    // Merge with inventory metadata; products with no sales in this window show 0s
    const rows = inventory.map((item) => {
      const stats  = productStats[item._id.toString()] ?? { unitsSold: 0, revenue: 0, cost: 0 };
      const profit = stats.revenue - stats.cost;
      const margin = stats.revenue > 0 ? (profit / stats.revenue) * 100 : 0;
      return {
        _id:      item._id,
        name:     item.name,
        sku:      item.sku,
        category: item.category,
        quantity: item.quantity,
        costPrice:    item.costPrice,
        sellingPrice: item.sellingPrice,
        unitsSold: stats.unitsSold,
        revenue:   Math.round(stats.revenue * 100) / 100,
        cost:      Math.round(stats.cost    * 100) / 100,
        profit:    Math.round(profit        * 100) / 100,
        margin:    Math.round(margin        * 100) / 100,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return res.status(200).json(rows);
  } catch (err) {
    console.error('[getPnlData]', err.message);
    return res.status(500).json({ message: 'Server error — could not generate P&L data.' });
  }
};

module.exports = { getSummaryStats, getChartData, getPnlData };