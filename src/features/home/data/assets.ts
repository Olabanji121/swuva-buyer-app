/**
 * Assets for Home Feature
 *
 * Local SVG icons and images.
 */

// Category Icons (local SVGs as React components)
import AllIcon from '../../../../assets/icons/Frame1171274937.svg';
import BakeryIcon from '../../../../assets/icons/Dough.svg';
import MealsIcon from '../../../../assets/icons/spaghetti.svg';
import GroceryIcon from '../../../../assets/icons/Grocery21Market.svg';
import AddToCartIcon from '../../../../assets/icons/add_to_cart.svg';

export const CATEGORY_ICONS = {
  all: AllIcon,
  bakery: BakeryIcon,
  meals: MealsIcon,
  grocery: GroceryIcon,
} as const;

// Action Icons
export { AddToCartIcon };

// Local Food Images
export const LOCAL_IMAGES = {
  image1: require('../../../../assets/images/39c85126e41e708b95d71bfd9196a1ae470c8cbf.jpg'),
  image2: require('../../../../assets/images/44901ef57e05003654b030d020c4913c4d4c020f.jpg'),
  image3: require('../../../../assets/images/b1a8bc43bd2839e325f1fa4f8717f939bd39f289.jpg'),
  image4: require('../../../../assets/images/e4384145ce2813e11fbd6175132e59bfd82ce46b.jpg'),
  burger: require('../../../../assets/images/ImageBurger.png'),
  image5: require('../../../../assets/images/source_3a60fa908353704afdea217383152dc8c05791cb.jpg'),
} as const;

// Banner Image
export const BANNER_IMAGE = LOCAL_IMAGES.image3;

// Food Images - New Listings
export const FOOD_IMAGES = {
  tacos: LOCAL_IMAGES.image1,
  croissants: LOCAL_IMAGES.image2,
  greenBowl: LOCAL_IMAGES.image4,
} as const;

// Food Images - Favorites
export const FAVORITE_IMAGES = {
  phoNoodles: LOCAL_IMAGES.image5,
  pennePasta: LOCAL_IMAGES.image1,
  burger: LOCAL_IMAGES.burger,
  ramenNoodles: LOCAL_IMAGES.image2,
} as const;
