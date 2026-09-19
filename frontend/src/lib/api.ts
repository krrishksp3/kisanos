import {
  AuthResponse,
  Farm,
  CropHistory,
  CropObservation,
  AdvisorResponse,
  Store,
  StoreInventoryItem,
  MarketItem,
  HarvestLot,
  WeatherResponse,
  NotificationListResponse,
  NotificationItem,
  User,
  FarmInsightsResponse,
} from "@/types";


const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl) return "http://127.0.0.1:8000";
  if (!envUrl.startsWith("http://") && !envUrl.startsWith("https://")) {
    return `https://${envUrl}`;
  }
  return envUrl;
};

const API_BASE_URL = getApiBaseUrl();

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("kisanos_token");
};

export const setAuthToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("kisanos_token", token);
  }
};

export const clearAuth = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("kisanos_token");
    localStorage.removeItem("kisanos_user");
  }
};

export const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("kisanos_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("kisanos_user", JSON.stringify(user));
  }
};

async function fetchClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new ApiError("नेटवर्क कनेक्शन त्रुटि (Network connection failed. Backend might be unreachable).", 0);
  }

  if (res.status === 401) {
    clearAuth();
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
  }

  if (!res.ok) {
    let errDetail = "अनपेक्षित त्रुटि (Unexpected Error)";
    try {
      const errJson = await res.json();
      errDetail = errJson.detail || JSON.stringify(errJson);
    } catch {
      errDetail = await res.text();
    }
    throw new ApiError(errDetail, res.status);
  }

  if (res.status === 204) {
    return null as unknown as T;
  }

  return res.json();
}

export const api = {
  auth: {
    login: async (phone: string, password: string): Promise<AuthResponse> => {
      const data = await fetchClient<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ phone, password }),
      });
      setAuthToken(data.access_token);
      setStoredUser(data.user);
      return data;
    },
    register: async (payload: any): Promise<AuthResponse> => {
      const data = await fetchClient<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setAuthToken(data.access_token);
      setStoredUser(data.user);
      return data;
    },
    me: (): Promise<User> => fetchClient<User>("/api/auth/me"),
    logout: () => {
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    },
  },

  farms: {
    list: (): Promise<Farm[]> => fetchClient<Farm[]>("/api/farms"),
    get: (id: string): Promise<Farm> => fetchClient<Farm>(`/api/farms/${id}`),
    create: (payload: any): Promise<Farm> =>
      fetchClient<Farm>("/api/farms", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: any): Promise<Farm> =>
      fetchClient<Farm>(`/api/farms/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    delete: (id: string): Promise<void> =>
      fetchClient<void>(`/api/farms/${id}`, {
        method: "DELETE",
      }),
    getHistory: (farmId: string): Promise<CropHistory[]> =>
      fetchClient<CropHistory[]>(`/api/farms/${farmId}/history`),
    addHistory: (farmId: string, payload: any): Promise<CropHistory> =>
      fetchClient<CropHistory>(`/api/farms/${farmId}/history`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    getInsights: (farmId: string): Promise<FarmInsightsResponse> =>
      fetchClient<FarmInsightsResponse>(`/api/farms/${farmId}/insights`),
  },


  observations: {
    list: (farmId?: string): Promise<CropObservation[]> =>
      fetchClient<CropObservation[]>(farmId ? `/api/observations?farm_id=${farmId}` : "/api/observations"),
    create: (payload: any): Promise<CropObservation> =>
      fetchClient<CropObservation>("/api/observations", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  advisor: {
    chat: (payload: {
      farm_id?: string;
      crop?: string;
      crop_stage?: string;
      message: string;
      image_url?: string;
    }): Promise<AdvisorResponse> =>
      fetchClient<AdvisorResponse>("/api/advisor/chat", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  stores: {
    list: (): Promise<Store[]> => fetchClient<Store[]>("/api/stores"),
    getNearby: (latitude: number, longitude: number, radius_km: number = 25): Promise<Store[]> =>
      fetchClient<Store[]>(`/api/stores/nearby?latitude=${latitude}&longitude=${longitude}&radius_km=${radius_km}`),
    get: (id: string): Promise<Store> => fetchClient<Store>(`/api/stores/${id}`),
    getInventory: (id: string): Promise<StoreInventoryItem[]> =>
      fetchClient<StoreInventoryItem[]>(`/api/stores/${id}/inventory`),
  },

  markets: {
    list: (crop?: string, location?: string): Promise<MarketItem[]> => {
      const params = new URLSearchParams();
      if (crop) params.append("crop", crop);
      if (location) params.append("location", location);
      const q = params.toString();
      return fetchClient<MarketItem[]>(q ? `/api/markets?${q}` : "/api/markets");
    },
    get: (id: string): Promise<MarketItem> => fetchClient<MarketItem>(`/api/markets/${id}`),
  },

  harvest: {
    list: (): Promise<HarvestLot[]> => fetchClient<HarvestLot[]>("/api/harvest"),
    create: (payload: any): Promise<HarvestLot> =>
      fetchClient<HarvestLot>("/api/harvest", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    get: (id: string): Promise<HarvestLot> => fetchClient<HarvestLot>(`/api/harvest/${id}`),
    update: (id: string, payload: any): Promise<HarvestLot> =>
      fetchClient<HarvestLot>(`/api/harvest/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
  },

  weather: {
    get: (latitude: number = 23.2033, longitude: number = 77.0844): Promise<WeatherResponse> =>
      fetchClient<WeatherResponse>(`/api/weather?latitude=${latitude}&longitude=${longitude}`),
  },

  notifications: {
    list: (): Promise<NotificationListResponse> => fetchClient<NotificationListResponse>("/api/notifications"),
    markRead: (id: string): Promise<NotificationItem> =>
      fetchClient<NotificationItem>(`/api/notifications/${id}/read`, {
        method: "PATCH",
      }),
  },
};
