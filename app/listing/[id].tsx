/**
 * Product Detail Screen
 *
 * Displays detailed information about a listing including image,
 * pricing, seller info, pickup details, and add to cart functionality.
 * Matches Figma design node 57:63408.
 */

import { useState, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ProductHeader,
  ProductImage,
  ProductInfo,
  PickupInfoCard,
  SellerCard,
  ProductDescription,
  BottomCartBar,
} from '@/features/listing/components';

// Mock data - replace with actual API call
const MOCK_LISTING = {
  id: '1',
  name: 'Hollywood Hill',
  description:
    'This upscale hill in a contemporary high-rise is a 4-minute walk from Surfers Paradise Beach and 5 km from Sea World theme park Beach and 5 km from Sea World theme parkBeach and 5 km from Sea World theme park',
  imageUrl:
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  originalPrice: 350.0,
  currentPrice: 245.0,
  seller: {
    id: 's1',
    name: 'Sam Curver',
    businessName: 'Enricos joint',
    imageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  },
  distance: '0.3km',
  rating: 4.3,
  expiresAt: '8pm',
  timeLeft: '2h left',
  pickupWindow: 'Today 6-8 PM',
  maxQuantity: 5,
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // TODO: Replace with actual API call using the id
  const listing = MOCK_LISTING;

  // totalPrice is now calculated inside BottomCartBar

  const handleFavoritePress = useCallback(() => {
    setIsFavorite((prev) => !prev);
    // TODO: Call API to toggle favorite
  }, []);

  const handleMapPress = useCallback(() => {
    // TODO: Open map view with listing location
  }, []);

  const handleSellerPress = useCallback(() => {
    // TODO: Navigate to seller profile
  }, []);

  const handleCallPress = useCallback(() => {
    // TODO: Initiate phone call
  }, []);

  const handleVideoPress = useCallback(() => {
    // TODO: Initiate video call
  }, []);

  const handleChatPress = useCallback(() => {
    // TODO: Open chat with seller
  }, []);

  const handleAddToCart = useCallback(() => {
    // TODO: Add to cart store
    const totalPrice = listing.currentPrice * quantity;
    console.log('Adding to cart:', { listingId: id, quantity, totalPrice });
  }, [id, quantity, listing.currentPrice]);

  return (
    <View className="flex-1 bg-white">
      {/* Fixed Header */}
      <View
        className="absolute top-0 left-0 right-0 z-10 bg-white pb-3"
        style={{
          paddingTop: insets.top + 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <ProductHeader
          isFavorite={isFavorite}
          onFavoritePress={handleFavoritePress}
          onMapPress={handleMapPress}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 85, // Space for fixed header + breathing room
          paddingBottom: 180, // Space for bottom bar
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6">
          {/* Content */}
          <View className="px-7 gap-[25px]">
            {/* Product Image */}
            <ProductImage
              imageUrl={listing.imageUrl}
              onMapPress={handleMapPress}
            />

            {/* Product Info */}
            <ProductInfo
              name={listing.name}
              sellerName={listing.seller.businessName}
              distance={listing.distance}
              rating={listing.rating}
              originalPrice={listing.originalPrice}
              currentPrice={listing.currentPrice}
              onSellerPress={handleSellerPress}
            />

            {/* Pickup Info Card */}
            <PickupInfoCard
              expiresAt={listing.expiresAt}
              timeLeft={listing.timeLeft}
              pickupWindow={listing.pickupWindow}
            />

            {/* Seller Card */}
            <SellerCard
              name={listing.seller.name}
              imageUrl={listing.seller.imageUrl}
              onCallPress={handleCallPress}
              onVideoPress={handleVideoPress}
              onChatPress={handleChatPress}
            />

            {/* Description */}
            <ProductDescription description={listing.description} />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Cart Bar with Quantity Selector */}
      <BottomCartBar
        unitPrice={listing.currentPrice}
        quantity={quantity}
        onQuantityChange={setQuantity}
        maxQuantity={listing.maxQuantity}
        onAddToCart={handleAddToCart}
      />
    </View>
  );
}
