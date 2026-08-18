import { useCallback, useState } from "react";
import api from "../lib/api";

// The orders list ("/documents/orders") only returns header-level data — products are
// just a count. The actual line items live behind "/documents/orders/detail", filtered by
// a single order's UUID via the "ids" param, and fetched lazily (only when the user
// expands that specific order) rather than for every order up front.
function useOrderDetail() {
  const [detailsByOrderId, setDetailsByOrderId] = useState({});
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [errorByOrderId, setErrorByOrderId] = useState({});

  const fetchOrderDetail = useCallback(
    async (orderUUID, userId) => {
      if (!orderUUID || detailsByOrderId[orderUUID]) return;

      setLoadingOrderId(orderUUID);
      setErrorByOrderId((prev) => {
        const next = { ...prev };
        delete next[orderUUID];
        return next;
      });

      try {
        const res = await api.get("/documents/orders/detail", {
          params: {
            page: 1,
            pageSize: 1000,
            sortBy: "date",
            sortOrder: "asc",
            ids: orderUUID,
            customerIds: "",
            staffIds: "",
            statusIds: "",
            userId,
          },
        });

        const body = res.data?.data ?? res.data ?? {};
        const rows = Array.isArray(body?.content)
          ? body.content
          : Array.isArray(body)
            ? body
            : [];

        console.log("[OrderDetail] raw rows for", orderUUID, rows);
        setDetailsByOrderId((prev) => ({ ...prev, [orderUUID]: rows }));
      } catch (err) {
        console.error("[OrderDetail] fetch error:", err);
        setErrorByOrderId((prev) => ({
          ...prev,
          [orderUUID]: err?.message || "Mahsulotlarni yuklashda xatolik",
        }));
      } finally {
        setLoadingOrderId((current) => (current === orderUUID ? null : current));
      }
    },
    [detailsByOrderId],
  );

  return { detailsByOrderId, loadingOrderId, errorByOrderId, fetchOrderDetail };
}

export default useOrderDetail;
