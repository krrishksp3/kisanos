export interface User {
  id: string;
  name: string;
  phone: string;
  language: string;
  location?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface CropHistory {
  id: string;
  farm_id: string;
  crop_name: string;
  season: string;
  area: number;
  yield_quintal: number;
  selling_price: number;
  inputs_used?: string;
  notes?: string;
  data_source: string;
  created_at: string;
}

export interface Farm {
  id: string;
  user_id: string;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  area_acres: number;
  soil_type: string;
  soil_ph?: number;
  irrigation_type: string;
  current_crop?: string;
  current_stage?: string;
  created_at: string;
  updated_at: string;
  histories?: CropHistory[];
}

export interface FarmActionCard {
  category: string;
  title: string;
  description: string;
  badge: string;
  badge_variant: "default" | "success" | "warning" | "info" | "outline" | string;
  source_type: string;
  is_live: boolean;
}

export interface FarmInsightsResponse {
  farm_id: string;
  farm_name: string;
  farm_summary: string;
  historical_context: string[];
  current_crop_context: string;
  insights: string[];
  actions: FarmActionCard[];
}

export interface CropObservation {

  id: string;
  farm_id: string;
  crop: string;
  image_url?: string;
  symptoms: string;
  ai_diagnosis?: string;
  severity: "low" | "medium" | "high" | "critical";
  recommendation?: string;
  data_source: string;
  created_at: string;
}

export interface AdvisorRequest {
  farm_id?: string;
  crop?: string;
  crop_stage?: string;
  message: string;
  image_url?: string;
}

export interface ProductRecommendation {
  name: string;
  category: string;
  dosage: string;
  purpose: string;
  estimated_price?: number;
}

export interface StoreRecommendation {
  store_id: string;
  name: string;
  distance_km: number;
  in_stock: boolean;
  matched_products: string[];
  data_source: string;
  is_live_verified: boolean;
}

export interface AdvisorResponse {
  summary: string;
  possible_issue?: string;
  confidence: number;
  severity: "low" | "medium" | "high" | "critical";
  general_guidance: string[];
  recommended_products: ProductRecommendation[];
  nearby_stores: StoreRecommendation[];
  warnings: string[];
  sources: string[];
  data_source: string;
  disclaimer: string;
}

export interface StoreInventoryItem {
  id: string;
  store_id: string;
  product_name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  available: boolean;
  data_source: string;
  is_live_verified: boolean;
  updated_at: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  verified: boolean;
  data_source: string;
  is_live_verified: boolean;
  created_at: string;
  distance_km?: number;
  inventory_items_count?: number;
}

export interface MarketItem {
  id: string;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  crop: string;
  price_per_quintal: number;
  buyer_name?: string;
  available_quantity: number;
  data_source: string;
  is_live_verified: boolean;
  updated_at: string;
}

export interface HarvestLot {
  id: string;
  farm_id: string;
  crop: string;
  quantity: number;
  quality: string;
  location: string;
  status: "draft" | "ready_for_sale" | "bidding" | "sold";
  moisture_percentage?: number;
  expected_price_per_quintal?: number;
  data_source: string;
  created_at: string;
  updated_at: string;
}

export interface WeatherForecastDay {
  day: string;
  temp_min_c: number;
  temp_max_c: number;
  condition: string;
  precipitation_prob: number;
  farming_advisory: string;
}

export interface WeatherResponse {
  location: string;
  latitude: number;
  longitude: number;
  current_temp_c: number;
  humidity_percent: number;
  precipitation_prob: number;
  wind_speed_kmh: number;
  condition: string;
  condition_hi: string;
  primary_advisory: string;
  postpone_irrigation: boolean;
  forecast_5day: WeatherForecastDay[];
  data_source: string;
  is_live_verified: boolean;
  disclaimer: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data_source: string;
  created_at: string;
}

export interface NotificationListResponse {
  unread_count: number;
  total_count: number;
  notifications: NotificationItem[];
}
