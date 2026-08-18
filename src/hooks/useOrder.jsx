import { useState } from "react";
import api from "../lib/api";
import { getUserId, decodeJwtPayload } from "../lib/auth";

const safeNumber = (value, fallback = 0) => {
  const num = Number(value ?? fallback);
  return Number.isFinite(num) ? num : fallback;
};

function findNestedValue(source, keys) {
  if (!source) return undefined;

  const seen = new Set();
  const queue = [source];

  while (queue.length) {
    const current = queue.shift();
    if (!current || seen.has(current)) continue;
    seen.add(current);

    if (typeof current === 'string') {
      try {
        const parsed = JSON.parse(current);
        if (parsed && typeof parsed === 'object') {
          queue.push(parsed);
        }
      } catch {
        // ignored: plain string, not JSON
      }
      continue;
    }

    if (typeof current !== 'object') continue;

    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(current, key) && current[key] !== undefined) {
        return current[key];
      }
    }

    for (const value of Object.values(current)) {
      if (value && (typeof value === 'object' || typeof value === 'string')) {
        queue.push(value);
      }
    }
  }

  return undefined;
}

function generateUuidFallback() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.random() * 16 | 0;
    const value = char === 'x' ? random : (random & 0x3 | 0x8);
    return value.toString(16);
  });
}

function normalizeTokenOrderContext() {
  const token = localStorage.getItem('token') || '';
  const payload = decodeJwtPayload(token);

  const customer = findNestedValue(payload, ['customer', 'client', 'contractor']) || {};
  const stock = findNestedValue(payload, ['stock', 'warehouse', 'sklad']) || {};
  const contractor = findNestedValue(payload, ['contractor', 'customer', 'client']) || customer || {};
  const object =
    findNestedValue(payload, ['object', 'pointOfSale', 'salesPoint', 'pointOfsale', 'pointOfSaleInfo', 'tochkaProdaji']) ||
    { id: '', name: '' };
  const priceType = findNestedValue(payload, ['priceType', 'pricingType']) || { id: '', name: '' };
  const rate = safeNumber(findNestedValue(payload, ['rate', 'defaultRate']) ?? 12200, 12200);

  const customerId =
    customer?.id || customer?.Id || customer?.ID || contractor?.id || contractor?.Id || '';

  return {
    userId: String(getUserId() || payload.userId || payload.sub || ''),
    stock: {
      id: stock.id || stock.Id || stock.ID || '',
      name: stock.name || stock.Name || 'Asosiy sklad',
    },
    contractor: {
      id: contractor.id || contractor.Id || contractor.ID || customerId || '',
      name: contractor.name || contractor.fullName || contractor.Name || customer.name || customer.fullName || 'Kundalik',
    },
    object: {
      id: object.id || object.Id || object.ID || '',
      name: object.name || object.Name || object.fullName || '',
    },
    priceType: {
      id: priceType.id || priceType.Id || priceType.ID || '',
      name: priceType.name || priceType.Name || '',
    },
    rate,
  };
}

function resolveMeasureInfo(item) {
  const measureCandidates = [
    item?.measure,
    item?.measures?.[0],
    item?.quantities?.[0]?.measure,
    item?.unit,
    item?.units?.[0],
    item?.measureInfo,
    item?.measurement,
    item?.measureData,
    { id: item?.measureId || item?.measure_id, name: item?.measureName || item?.measure_name || 'шт' },
  ];

  const measure = measureCandidates.find(Boolean) || { id: '', name: 'шт' };
  const measureId =
    measure.Id ||
    measure.id ||
    item?.measureId ||
    item?.measure_id ||
    item?.unitId ||
    item?.unit_id ||
    item?.measurementId ||
    item?.measurement_id ||
    '09fda8fe-6098-11f0-9fee-b48c9d79c2ce';

  return {
    name: measure.name || measure.Name || 'шт',
    id: measureId || '09fda8fe-6098-11f0-9fee-b48c9d79c2ce',
  };
}

function normalizeProduct(item, counts = {}, fallbackStock = { id: '', name: 'Asosiy sklad' }) {
  const productId = item.productId || item.Id || item.id || item.product?.id || '';
  const quantity = safeNumber(
    counts[productId]?.count ?? item.quantity ?? item.qty ?? item.quantities?.[0]?.quantity ?? 0,
    0,
  );
  const price = safeNumber(
    item.price ?? item.prices?.[0]?.price ?? item.product?.price ?? 0,
    0,
  );
  const oldPrice = safeNumber(
    item.oldPrice ?? item.prices?.[0]?.oldPrice ?? price,
    price,
  );
  const productName = item.name || item.productName || item.product?.name || 'Mahsulot';
  const quantityStock = item.quantities?.[0]?.stock || item.stock || fallbackStock || { id: '', name: 'Asosiy sklad' };
  const measure = resolveMeasureInfo(item);

  return {
    product: {
      id: productId,
      name: productName,
    },
    bundleItems: [],
    quantities: [
      {
        stock: {
          id: quantityStock.id || quantityStock.Id || quantityStock.ID || fallbackStock.id || '',
          name: quantityStock.name || quantityStock.Name || fallbackStock.name || 'Asosiy sklad',
        },
        quantity,
        measure: {
          name: measure.name,
          id: measure.id,
        },
        remainder: item.quantities?.[0]?.remainder ?? 0,
        amount: Number((quantity * price).toFixed(4)),
      },
    ],
    price: Number(price.toFixed(4)),
    oldPrice: Number(oldPrice.toFixed(4)),
    currency: {
      name: item.currencyName || item.currency?.name || item.prices?.[0]?.currency?.name || 'USD',
      id: item.currencyId || item.currency?.id || item.prices?.[0]?.currency?.id || '',
    },
  };
}

function normalizeRefEntity(entity, fallback = { id: '', name: '' }) {
  if (!entity || (typeof entity === 'object' && !Object.keys(entity).length)) {
    return fallback;
  }

  const id = entity.id || entity.Id || entity.ID || fallback.id || '';
  const name = entity.name || entity.Name || entity.fullName || fallback.name || '';

  if (!id && !name) {
    return fallback;
  }

  return { id, name };
}

export default function useOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createOrder = async (orderData) => {
    setLoading(true);
    setError(null);

    try {
      const context = normalizeTokenOrderContext();
      const baseProducts = (Array.isArray(orderData?.products) ? orderData.products : [])
        .map(item => normalizeProduct(item, orderData?.counts || {}, context.stock))
        .filter(Boolean);

      const validProducts = baseProducts.filter((item) => {
        const productId = item?.product?.id || item?.id || '';
        const quantity = Number(item?.quantities?.[0]?.quantity ?? 0);
        const price = Number(item?.price ?? 0);
        return Boolean(productId) && quantity > 0 && price > 0;
      });

      if (!validProducts.length) {
        throw new Error('Savatda yaroqli mahsulotlar yo\'q');
      }

      const normalizedObject = normalizeRefEntity(orderData?.object || context.object, { id: '', name: '' });
      const normalizedStock = normalizeRefEntity(orderData?.stock || context.stock, { id: '', name: 'Asosiy sklad' });
      const normalizedContractor = normalizeRefEntity(orderData?.contractor || context.contractor, { id: '', name: 'Kundalik' });
      const normalizedPriceType = normalizeRefEntity(orderData?.priceType || context.priceType, { id: '', name: '' });

      const payload = {
        userId: String(orderData?.userId || context.userId || ''),
        UUID: orderData?.UUID || generateUuidFallback(),
        stock: normalizedStock,
        contractor: normalizedContractor,
        object: normalizedObject,
        rate: safeNumber(orderData?.rate ?? context.rate, 12200),
        priceType: normalizedPriceType,
        status: orderData?.status || { id: 'inCart', name: 'Korzinkada' },
        paymentSum: safeNumber(orderData?.paymentSum ?? 0, 0),
        paymentVal: safeNumber(orderData?.paymentVal ?? 0, 0),
        paymentTerminal: safeNumber(orderData?.paymentTerminal ?? 0, 0),
        paymentUzcardTerminal: safeNumber(orderData?.paymentUzcardTerminal ?? 0, 0),
        paymentClick: safeNumber(orderData?.paymentClick ?? 0, 0),
        changeAmountSum: safeNumber(orderData?.changeAmountSum ?? 0, 0),
        changeAmountVal: safeNumber(orderData?.changeAmountVal ?? 0, 0),
        discountSum: safeNumber(orderData?.discountSum ?? 0, 0),
        discountVal: safeNumber(orderData?.discountVal ?? 0, 0),
        saleType: orderData?.saleType || 'sum',
        comment: orderData?.comment || '',
        products: validProducts.length ? validProducts : (orderData?.products || []),
      };

      console.log('[Order] POST payload to /documents/orders:', JSON.stringify(payload, null, 2));

      const res = await api.post('/documents/orders', payload);
      return res.data;
    } catch (err) {
      console.error('❌ useOrder error:', err);
      console.error('[Order] backend response data:', JSON.stringify(err?.response?.data, null, 2));
      const backendMessage = Array.isArray(err?.response?.data?.errorMessage)
        ? err.response.data.errorMessage.join('; ')
        : err?.response?.data?.errorMessage;
      setError(backendMessage || err.message || 'Buyurtma yuborishda xatolik yuz berdi');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createOrder, loading, error };
}
