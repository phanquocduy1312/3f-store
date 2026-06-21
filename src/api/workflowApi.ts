import { apiJson } from "./productsApi";

export type WorkflowStatusSetting = {
  id?: number;
  group_key: string;
  status_key: string;
  label: string;
  description?: string;
  color?: string;
  sort_order: number;
  is_active: number;
  is_default: number;
  is_terminal: number;
};

export async function getWorkflowStatuses(): Promise<{ success: boolean; data: WorkflowStatusSetting[] }> {
  return apiJson<{ success: boolean; data: WorkflowStatusSetting[] }>("/api/admin/workflows/statuses");
}

export async function saveWorkflowStatus(payload: WorkflowStatusSetting): Promise<{ success: boolean; message: string }> {
  return apiJson<{ success: boolean; message: string }>("/api/admin/workflows/statuses/save", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteWorkflowStatus(id: number): Promise<{ success: boolean; message: string }> {
  return apiJson<{ success: boolean; message: string }>("/api/admin/workflows/statuses/delete", {
    method: "POST",
    body: JSON.stringify({ id }),
  });
}

export type WorkflowTransitionSetting = {
  id?: number;
  group_key: string;
  from_status: string;
  to_status: string;
  label: string;
  requires_reason: number;
  requires_permission?: string | null;
  is_active: number;
  sort_order: number;
};

export async function getWorkflowTransitions(): Promise<{ success: boolean; data: WorkflowTransitionSetting[] }> {
  return apiJson<{ success: boolean; data: WorkflowTransitionSetting[] }>("/api/admin/workflows/transitions");
}

export async function saveWorkflowTransition(payload: WorkflowTransitionSetting): Promise<{ success: boolean; message: string }> {
  return apiJson<{ success: boolean; message: string }>("/api/admin/workflows/transitions/save", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteWorkflowTransition(id: number): Promise<{ success: boolean; message: string }> {
  return apiJson<{ success: boolean; message: string }>("/api/admin/workflows/transitions/delete", {
    method: "POST",
    body: JSON.stringify({ id }),
  });
}

export type AutomationRuleSetting = {
  id?: number;
  name: string;
  trigger_type: string;
  trigger_group?: string | null;
  from_status?: string | null;
  to_status?: string | null;
  conditions?: any;
  actions?: any;
  is_active: number;
};

export async function getAutomationRules(): Promise<{ success: boolean; data: AutomationRuleSetting[] }> {
  return apiJson<{ success: boolean; data: AutomationRuleSetting[] }>("/api/admin/workflows/automation-rules");
}

export async function saveAutomationRule(payload: AutomationRuleSetting): Promise<{ success: boolean; message: string }> {
  return apiJson<{ success: boolean; message: string }>("/api/admin/workflows/automation-rules/save", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteAutomationRule(id: number): Promise<{ success: boolean; message: string }> {
  return apiJson<{ success: boolean; message: string }>("/api/admin/workflows/automation-rules/delete", {
    method: "POST",
    body: JSON.stringify({ id }),
  });
}

export type ShippingProviderSetting = {
  id?: number;
  provider_key: string;
  label: string;
  type: string;
  config?: any;
  is_active: number;
  sort_order: number;
};

export async function getShippingProviders(): Promise<{ success: boolean; data: ShippingProviderSetting[] }> {
  return apiJson<{ success: boolean; data: ShippingProviderSetting[] }>("/api/admin/workflows/shipping-providers");
}

export async function saveShippingProvider(payload: ShippingProviderSetting): Promise<{ success: boolean; message: string }> {
  return apiJson<{ success: boolean; message: string }>("/api/admin/workflows/shipping-providers/save", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteShippingProvider(id: number): Promise<{ success: boolean; message: string }> {
  return apiJson<{ success: boolean; message: string }>("/api/admin/workflows/shipping-providers/delete", {
    method: "POST",
    body: JSON.stringify({ id }),
  });
}

export type NotificationChannelSetting = {
  id?: number;
  channel_key: string;
  label: string;
  provider?: string | null;
  config?: any;
  is_active: number;
};

export async function getNotificationChannels(): Promise<{ success: boolean; data: NotificationChannelSetting[] }> {
  return apiJson<{ success: boolean; data: NotificationChannelSetting[] }>("/api/admin/workflows/notification-channels");
}

export async function saveNotificationChannel(payload: NotificationChannelSetting): Promise<{ success: boolean; message: string }> {
  return apiJson<{ success: boolean; message: string }>("/api/admin/workflows/notification-channels/save", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteNotificationChannel(id: number): Promise<{ success: boolean; message: string }> {
  return apiJson<{ success: boolean; message: string }>("/api/admin/workflows/notification-channels/delete", {
    method: "POST",
    body: JSON.stringify({ id }),
  });
}
