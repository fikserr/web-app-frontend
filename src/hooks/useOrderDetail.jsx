import { useCallback, useState } from "react";
import api from "../lib/api";

// the backend requires a real GUID for "ids" (400s otherwise) — some historical orders
// were created with a non-GUID placeholder UUID (e.g. a literal test value that got
// submitted as a real order at some point) and can never have a working detail lookup
const GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

      if (!GUID_RE.test(orderUUID)) {
        setErrorByOrderId((prev) => ({
          ...prev,
          [orderUUID]: "Bu buyurtmaning ID formati eski/noto'g'ri — tafsilotlarini ko'rsatib bo'lmaydi",
        }));
        return;
      }

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
        const backendMessage = Array.isArray(err?.response?.data?.errorMessage)
          ? err.response.data.errorMessage.map((e) => e.message || e).join("; ")
          : err?.response?.data?.errorMessage;
        setErrorByOrderId((prev) => ({
          ...prev,
          [orderUUID]: backendMessage || err?.message || "Mahsulotlarni yuklashda xatolik",
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
