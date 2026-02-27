"use client";
import { useState, useEffect } from "react";
import api from "../../lib/api";
import AppLayout from "../../components/layout/AppLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function OrdersPage() {
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State for Point of Sale
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch inventory and orders on page load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // We can run both requests at the same time for speed
      const [inventoryRes, ordersRes] = await Promise.all([
        api.get("/inventory"),
        api.get("/orders"),
      ]);
      setInventory(inventoryRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total amount dynamically as the user types
  const selectedProduct = inventory.find(
    (item) => item._id === selectedProductId,
  );
  const totalAmount =
    selectedProduct && quantity
      ? selectedProduct.sellingPrice * Number(quantity)
      : 0;

  const handleCompleteSale = async (e) => {
    e.preventDefault();
    if (!selectedProductId || !quantity || quantity <= 0) return;

    setIsSubmitting(true);
    try {
      const orderData = {
        items: [{ productId: selectedProductId, qty: Number(quantity) }],
        totalAmount: totalAmount,
      };

      // Send the order to the backend
      await api.post("/orders", orderData);

      // Refresh the data to show the new order in the history
      // (This also gets the updated inventory with the decreased stock!)
      await fetchData();

      // Reset the form
      setSelectedProductId("");
      setQuantity("");
      alert("Sale completed successfully!");
    } catch (error) {
      console.error("Failed to complete sale", error);
      alert("Error completing sale. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to format dates cleanly
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AppLayout>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-800">Orders & Sales</h1>
        <p className="text-slate-500 mt-1">
          Process new sales and view order history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
        {/* Left Side: Place New Order Form */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-lg font-bold text-slate-800 mb-4">New Sale</h2>
            <form onSubmit={handleCompleteSale} className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-slate-600">
                  Select Product
                </label>
                <select
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Item --</option>
                  {inventory.map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                      disabled={item.quantity === 0}
                    >
                      {item.name} (${item.sellingPrice}){" "}
                      {item.quantity === 0 ? "- OUT OF STOCK" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Quantity"
                type="number"
                placeholder="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                min="1"
                max={selectedProduct?.quantity || ""} // Prevent ordering more than in stock natively!
              />

              <div className="pt-4 border-t border-slate-100 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium text-slate-600">
                    Total Amount:
                  </span>
                  <span className="text-xl font-bold text-primary-600">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !selectedProductId || !quantity}
                >
                  {isSubmitting ? "Processing..." : "Complete Sale"}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Side: Order History */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Recent Transactions
            </h2>

            {isLoading ? (
              <div className="py-8 text-center text-slate-500">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                No sales yet. Make your first sale!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-sm text-slate-500">
                      <th className="pb-3 font-medium">Order ID</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Item Sold</th>
                      <th className="pb-3 font-medium text-right">
                        Total Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 font-medium text-slate-800 text-xs">
                          {order._id.substring(18)}
                        </td>
                        <td className="py-4 text-slate-600">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-4 text-slate-600">
                          {/* Since we populate productId on backend, we can access the name! */}
                          {order.items[0]?.productId?.name || "Deleted Product"}{" "}
                          (x{order.items[0]?.qty})
                        </td>
                        <td className="py-4 text-right font-bold text-slate-800">
                          ${order.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
