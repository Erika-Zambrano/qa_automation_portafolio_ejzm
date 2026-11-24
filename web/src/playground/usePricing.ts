import { useEffect, useState } from 'react';
import { api, ApiFailure } from './api';
import { useCart } from './CartContext';
import type { Pricing, ShippingMethod } from './types';

export function usePricing(shippingMethod: ShippingMethod = 'standard') {
  const { items, coupon, setCoupon } = useCart();
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [error, setError] = useState<ApiFailure | null>(null);
  const [loading, setLoading] = useState(false);
  const signature = JSON.stringify([items.map((e) => [e.product.id, e.quantity]), coupon, shippingMethod]);

  useEffect(() => {
    if (items.length === 0) {
      setPricing(null);
      setError(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    api<Pricing>('/cart/price', {
      method: 'POST',
      body: {
        items: items.map((e) => ({ productId: e.product.id, quantity: e.quantity })),
        ...(coupon ? { coupon } : {}),
        shippingMethod,
      },
      signal: controller.signal,
    })
      .then(({ data }) => {
        setPricing(data);
        setError(null);
      })
      .catch((failure) => {
        if (failure instanceof DOMException) return;
        setPricing(null);
        setError(failure as ApiFailure);
        if (failure instanceof ApiFailure && failure.code.startsWith('COUPON_')) setCoupon(null);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [signature]);

  return { pricing, error, loading };
}
