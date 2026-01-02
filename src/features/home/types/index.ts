/**
 * Home Feature Types
 *
 * Type definitions for the home screen data models.
 */

export interface Listing {
  id: string;
  title: string;
  category: Category;
  seller: Seller;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  distance: number; // in km
  timeLeft: string; // e.g., "2hr Left"
  image: string | number; // URL string or require() asset ID
  isFavorite: boolean;
}

export interface Seller {
  id: string;
  name: string;
  image?: string;
}

export type Category = 'all' | 'bakery' | 'meals' | 'grocery';

export interface CategoryItem {
  id: Category;
  label: string;
  icon?: string; // Icon name from Ionicons (fallback)
  IconComponent?: React.FC<{ width?: number; height?: number }>; // SVG component
}

export interface Location {
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface PromoBanner {
  id: string;
  title: string;
  discount: string;
  buttonText: string;
  image: string | number; // URL string or require() asset ID
  backgroundColor: string;
}
