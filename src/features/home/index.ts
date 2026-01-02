/**
 * Home Feature
 *
 * Main export for the home feature module.
 */

// Components
export {
  ProductCard,
  FavoriteCard,
  SectionHeader,
  HomeHeader,
  SearchBar,
  Categories,
  PromoBanner,
  FilterModal,
  type FilterValues,
} from './components';

// Types (rename PromoBanner type to avoid conflict with component)
export type {
  Listing,
  Seller,
  Category,
  CategoryItem,
  Location,
  PromoBanner as PromoBannerData,
} from './types';

// Data
export {
  CATEGORIES,
  PROMO_BANNER,
  CURRENT_LOCATION,
  NEW_LISTINGS,
  FAVORITE_LISTINGS,
  TOP_LISTINGS,
} from './data/mockData';
