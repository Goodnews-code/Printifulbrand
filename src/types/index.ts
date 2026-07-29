export type CategorySlug =
  | "apparels"
  | "stationery"
  | "packaging"
  | "gadgets"
  | "gifts"
  | "lifestyle";

export interface ProductImage {
  id?: number;
  image_url: string;
  color_code: string;
  is_primary?: number | boolean;
}

export interface ProductSize {
  id?: number;
  size_name: string;
  price: number;
}

export interface Product {
  id: number;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  is_active: number | boolean;
  created_at?: string;
  images?: ProductImage[];
  sizes?: ProductSize[];
}

export interface CartItem {
  id: string;
  productId: number;
  name: string;
  category: string;
  color: string;
  size: string;
  image: string;
  price: number;
  qty: number;
}

export interface SiteSettings {
  site_title: string;
  site_description: string;
  hero_headline: string;
  hero_subtext: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  contact_email: string;
  contact_phone: string;
  footer_text: string;
  paystack_public_key: string;
  paystack_secret_key: string;
  [key: string]: string | undefined;
}

export type ThemeMode = "light" | "dark";
