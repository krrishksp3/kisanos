import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AdvisorRequest } from "@/types";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => api.auth.me(),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFarms() {
  return useQuery({
    queryKey: ["farms"],
    queryFn: () => api.farms.list(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useFarm(farmId?: string) {
  return useQuery({
    queryKey: ["farm", farmId],
    queryFn: () => (farmId ? api.farms.get(farmId) : null),
    enabled: Boolean(farmId),
  });
}

export function useFarmHistory(farmId?: string) {
  return useQuery({
    queryKey: ["farmHistory", farmId],
    queryFn: () => (farmId ? api.farms.getHistory(farmId) : []),
    enabled: Boolean(farmId),
  });
}

export function useFarmInsights(farmId?: string) {
  return useQuery({
    queryKey: ["farmInsights", farmId],
    queryFn: () => (farmId ? api.farms.getInsights(farmId) : null),
    enabled: Boolean(farmId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useObservations(farmId?: string) {

  return useQuery({
    queryKey: ["observations", farmId],
    queryFn: () => api.observations.list(farmId),
  });
}

export function useNearbyStores(latitude?: number, longitude?: number, radiusKm: number = 25) {
  return useQuery({
    queryKey: ["nearbyStores", latitude, longitude, radiusKm],
    queryFn: () =>
      latitude && longitude ? api.stores.getNearby(latitude, longitude, radiusKm) : api.stores.list(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useStore(storeId?: string) {
  return useQuery({
    queryKey: ["store", storeId],
    queryFn: () => (storeId ? api.stores.get(storeId) : null),
    enabled: Boolean(storeId),
  });
}

export function useStoreInventory(storeId?: string) {
  return useQuery({
    queryKey: ["storeInventory", storeId],
    queryFn: () => (storeId ? api.stores.getInventory(storeId) : []),
    enabled: Boolean(storeId),
  });
}

export function useMarkets(crop?: string, location?: string) {
  return useQuery({
    queryKey: ["markets", crop, location],
    queryFn: () => api.markets.list(crop, location),
    staleTime: 3 * 60 * 1000,
  });
}

export function useHarvestLots() {
  return useQuery({
    queryKey: ["harvestLots"],
    queryFn: () => api.harvest.list(),
  });
}

export function useWeather(latitude: number = 23.2033, longitude: number = 77.0844) {
  return useQuery({
    queryKey: ["weather", latitude, longitude],
    queryFn: () => api.weather.get(latitude, longitude),
    staleTime: 10 * 60 * 1000,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.notifications.list(),
    refetchInterval: 30 * 1000,
  });
}

export function useAdvisorMutation() {
  return useMutation({
    mutationFn: (payload: AdvisorRequest) => api.advisor.chat(payload),
  });
}
