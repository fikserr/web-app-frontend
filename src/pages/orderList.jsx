import React, { useState } from "react";
import useOrderList from "../hooks/useOrderList";

const OrderList = ({ userId }) => {
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const { orders, loading, error, meta } = useOrderList(339299758, page, pageSize);
  const [expandedOrders, setExpandedOrders] = useState({});

  const toggleProducts = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  if (loading) return <p>Yuklanmoqda...</p>;
  if (error) return <p className="text-red-500">Xatolik: {error}</p>;

  return (
    <div className="my-20">
      {orders.map((order) => (
        <div
          key={order.Id}
          className="border rounded-lg p-4 shadow bg-white space-y-2"
        >
          <div className="flex justify-between items-center">
            <div>
              <p>
                <strong>№ {order.number}</strong> - {order.status}
              </p>
              <p>Summa: {order.totalSum} UZS</p>
              <p>Sana: {new Date(order.date).toLocaleString()}</p>
            </div>
            <button
              onClick={() => toggleProducts(order.Id)}
              className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
            >
              {expandedOrders[order.Id] ? "Yopish" : "Tovarlarni ko‘rish"}
            </button>
          </div>

          {expandedOrders[order.Id] && (
            <div className="mt-3 space-y-2">
              {order.productList.map((product) => (
                <div
                  key={product.productId}
                  className="border rounded p-2 bg-gray-50 flex justify-between"
                >
                  <div>
                    <p className="font-medium">{product.productName}</p>
                    <p className="text-sm text-gray-600">
                      {product.quantity} {product.measurName} × {product.price}{" "}
                      {product.currencyName}
                    </p>
                  </div>
                  <p className="font-semibold">{product.amount} UZS</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          ◀ Oldingi
        </button>

        <p className="text-sm">
          Sahifa {meta.currentPage} / {meta.lastPage} ({meta.total} ta order)
        </p>

        <button
          disabled={page === meta.lastPage}
          onClick={() => setPage((p) => Math.min(meta.lastPage, p + 1))}
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          Keyingi ▶
        </button>
      </div>
    </div>
  );
};

export default OrderList;
