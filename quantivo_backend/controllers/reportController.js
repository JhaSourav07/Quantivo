const Order = require("../models/Order");
const Inventory = require("../models/Inventory");

// @desc    Get total profit, revenue, and inventory value
// @route   GET /api/reports/summary
const getSummaryStats = async (req, res) => {
  try {
    // 1. Fetch all orders and bring in the product prices
    const orders = await Order.find().populate(
      "items.productId",
      "costPrice sellingPrice",
    );

    let totalRevenue = 0;
    let totalCost = 0;

    // 2. Calculate Revenue and Cost
    orders.forEach((order) => {
      totalRevenue += order.totalAmount;

      order.items.forEach((item) => {
        // Check if the product still exists in the database
        if (item.productId) {
          totalCost += item.productId.costPrice * item.qty;
        }
      });
    });

    const totalProfit = totalRevenue - totalCost;

    // 3. Calculate current total value of items sitting in inventory
    const inventory = await Inventory.find();
    const inventoryValue = inventory.reduce(
      (acc, item) => acc + item.costPrice * item.quantity,
      0,
    );

    res.status(200).json({
      totalRevenue,
      totalProfit,
      inventoryValue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get chart data grouped by date for Recharts
// @route   GET /api/reports/chart
const getChartData = async (req, res) => {
  try {
    const orders = await Order.find().populate(
      "items.productId",
      "costPrice sellingPrice",
    );

    // We will use an object to group data by date: { 'YYYY-MM-DD': { revenue: 100, profit: 50 } }
    const groupedData = {};

    orders.forEach((order) => {
      // Format the date to YYYY-MM-DD
      const date = order.createdAt.toISOString().split("T")[0];

      if (!groupedData[date]) {
        groupedData[date] = { date, revenue: 0, profit: 0 };
      }

      // Add revenue
      groupedData[date].revenue += order.totalAmount;

      // Calculate and add profit for this specific order
      let orderCost = 0;
      order.items.forEach((item) => {
        if (item.productId) {
          orderCost += item.productId.costPrice * item.qty;
        }
      });

      groupedData[date].profit += order.totalAmount - orderCost;
    });

    // Convert the object back into an array for Recharts and sort by date
    const chartData = Object.values(groupedData).sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );

    res.status(200).json(chartData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSummaryStats, getChartData };
