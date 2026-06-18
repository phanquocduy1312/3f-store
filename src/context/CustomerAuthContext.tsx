import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import {
  type CustomerData,
  getMe,
  logoutApi,
  setCustomerToken,
  removeCustomerToken,
  getCustomerToken,
} from "@/src/api/customerAuthApi";

interface CustomerAuthContextType {
  customer: CustomerData | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  /** Call after successful login/register to store token and refresh customer. */
  login: (token: string, customer: CustomerData) => void;
  /** Logout: revoke session + clear local state. */
  logout: () => Promise<void>;
  /** Re-fetch /me to refresh customer data. */
  refreshCustomer: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType>({
  customer: null,
  isLoggedIn: false,
  isLoading: true,
  login: () => {},
  logout: async () => {},
  refreshCustomer: async () => {},
});

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCustomer = useCallback(async () => {
    const token = getCustomerToken();
    if (!token) {
      setCustomer(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await getMe();
      if (res.success && res.data) {
        setCustomer(res.data);
      } else {
        removeCustomerToken();
        setCustomer(null);
      }
    } catch {
      removeCustomerToken();
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCustomer();
  }, [refreshCustomer]);

  const login = useCallback((token: string, customerData: CustomerData) => {
    setCustomerToken(token);
    setCustomer(customerData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore network errors during logout
    }
    removeCustomerToken();
    setCustomer(null);
  }, []);

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isLoggedIn: customer !== null,
        isLoading,
        login,
        logout,
        refreshCustomer,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  return useContext(CustomerAuthContext);
}
