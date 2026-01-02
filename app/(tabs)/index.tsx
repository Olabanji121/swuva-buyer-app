/**
 * Home Screen
 *
 * Main landing screen for authenticated buyers.
 * Displays location, search, promo banner, categories,
 * new listings, favorites, and top listings.
 *
 * Based on Figma design: node 3:343
 */

import { useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import {
  HomeHeader,
  SearchBar,
  PromoBanner,
  Categories,
  SectionHeader,
  ProductCard,
  FavoriteCard,
  FilterModal,
  CATEGORIES,
  PROMO_BANNER,
  CURRENT_LOCATION,
  NEW_LISTINGS,
  FAVORITE_LISTINGS,
  TOP_LISTINGS,
  type Category,
  type Listing,
  type FilterValues,
} from '@/features/home';

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterValues | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Fetch fresh data from API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleListingPress = (listing: Listing) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/listing/${listing.id}`);
  };

  const handleFavoritePress = (listing: Listing) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Toggle favorite state
  };

  const handleSearchPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to search screen
    // router.push('/search');
  };

  const handleSeeAllPress = (section: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to section list
    // router.push(`/${section}`);
  };

  const handleFilterPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilterModalVisible(true);
  };

  const handleApplyFilters = (newFilters: FilterValues) => {
    setFilters(newFilters);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // TODO: Apply filters to listings
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar style="dark" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#60d394"
          />
        }
      >
        {/* Header */}
        <HomeHeader
          location={CURRENT_LOCATION}
          hasNotifications={true}
          onLocationPress={() => {}}
          onNotificationPress={() => {}}
          className="pt-2"
        />

        {/* Search Bar */}
        <SearchBar
          onPress={handleSearchPress}
          onSettingsPress={handleFilterPress}
          className="mt-5"
        />

        {/* Promo Banner */}
        <PromoBanner
          banner={PROMO_BANNER}
          onPress={() => {}}
          className="mt-5"
        />

        {/* Categories */}
        <Categories
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          className="mt-5"
        />

        {/* New Listings Section */}
        <View className="mt-6">
          <SectionHeader
            title="New Listings"
            onSeeAllPress={() => handleSeeAllPress('new-listings')}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 28, paddingVertical: 8, gap: 16 }}
            style={{ overflow: 'visible' }}
            className="mt-4"
          >
            {NEW_LISTINGS.map((listing) => (
              <ProductCard
                key={listing.id}
                listing={listing}
                variant="horizontal"
                onPress={() => handleListingPress(listing)}
                onFavoritePress={() => handleFavoritePress(listing)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Favorites Section */}
        <View className="mt-6">
          <SectionHeader
            title="Favorite"
            rightIcon={<Ionicons name="star" size={16} color="#F2C71C" />}
            onSeeAllPress={() => handleSeeAllPress('favorites')}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 28, gap: 10 }}
            className="mt-4"
          >
            {FAVORITE_LISTINGS.map((listing) => (
              <FavoriteCard
                key={listing.id}
                listing={listing}
                onPress={() => handleListingPress(listing)}
                onFavoritePress={() => handleFavoritePress(listing)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Top Listings Section */}
        <View className="mt-6 mb-8">
          <SectionHeader
            title="Top Listings"
            onSeeAllPress={() => handleSeeAllPress('top-listings')}
          />

          <View className="px-4 mt-4 gap-5" style={{ overflow: 'visible' }}>
            {TOP_LISTINGS.map((listing) => (
              <ProductCard
                key={listing.id}
                listing={listing}
                variant="vertical"
                onPress={() => handleListingPress(listing)}
                onFavoritePress={() => handleFavoritePress(listing)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        initialValues={filters || undefined}
      />
    </SafeAreaView>
  );
}
