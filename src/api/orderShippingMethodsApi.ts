import { apiJson } from "./productsApi";

export type OrderShippingMethod = {
  id: number;
  methodKey: string;
  method_key?: string;
  name: string;
  description?: string | null;
  fee: number;
  isActive: boolean;
  is_active?: number;
  sortOrder: number;
  sort_order?: number;
};

export type OrderShippingMethodPayload = {
  id?: number;
  methodKey: string;
  name: string;
  description?: string | null;
  fee: number;
  isActive: boolean;
  sortOrder: number;
};

export function listPublicOrderShippingMethods() {
  return apiJson<{ success: boolean; data: OrderShippingMethod[] }>("/api/order-shipping-methods");
}

export function listAdminOrderShippingMethods() {
  return apiJson<{ success: boolean; data: OrderShippingMethod[] }>("/api/admin/order-shipping-methods");
}

export function saveAdminOrderShippingMethod(payload: OrderShippingMethodPayload) {
  return apiJson<{ success: boolean; message: string; data: OrderShippingMethod }>("/api/admin/order-shipping-methods/save", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function toggleAdminOrderShippingMethod(id: number, isActive: boolean) {
  return apiJson<{ success: boolean; message: string; data: OrderShippingMethod }>("/api/admin/order-shipping-methods/toggle", {
    method: "POST",
    body: JSON.stringify({ id, isActive }),
  });
}

export function deleteAdminOrderShippingMethod(id: number) {
  return apiJson<{ success: boolean; message: string }>(`/api/admin/order-shipping-methods/${id}`, {
    method: "DELETE",
  });
}
