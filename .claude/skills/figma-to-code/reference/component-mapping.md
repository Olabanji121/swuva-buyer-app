# Figma to React Native Component Mapping

## Swuva Design System

### Core Colors

| Figma Token | Hex | Tailwind |
|-------------|-----|----------|
| Primary | #10b981 | primary / emerald-500 |
| Primary Dark | #059669 | emerald-600 |
| Secondary | #f3f4f6 | secondary / gray-100 |
| Destructive | #ef4444 | destructive / red-500 |
| Warning | #f59e0b | warning / amber-500 |
| Success | #22c55e | success / green-500 |
| Background | #ffffff | background / white |
| Foreground | #111827 | foreground / gray-900 |
| Muted | #6b7280 | muted-foreground / gray-500 |
| Border | #e5e7eb | border / gray-200 |

### Typography Scale

| Figma Style | Size/Weight | Tailwind |
|-------------|-------------|----------|
| Display | 36px/Bold | text-4xl font-bold |
| Heading 1 | 24px/Semibold | text-2xl font-semibold |
| Heading 2 | 20px/Semibold | text-xl font-semibold |
| Subheading | 18px/Medium | text-lg font-medium |
| Body | 16px/Regular | text-base |
| Body Small | 14px/Regular | text-sm |
| Caption | 12px/Regular | text-xs |

### Spacing System

| Figma | Pixels | Tailwind |
|-------|--------|----------|
| XS | 4px | 1 |
| S | 8px | 2 |
| M | 12px | 3 |
| Base | 16px | 4 |
| L | 24px | 6 |
| XL | 32px | 8 |
| 2XL | 48px | 12 |

### Border Radius

| Figma | Pixels | Tailwind |
|-------|--------|----------|
| Small | 4px | rounded |
| Medium | 8px | rounded-lg |
| Large | 12px | rounded-xl |
| XL | 16px | rounded-2xl |
| Full | 9999px | rounded-full |

## Component Library

### Buttons

```
Figma: Button/Primary/Medium
→ <Button variant="default" size="md">Label</Button>

Figma: Button/Secondary/Large
→ <Button variant="secondary" size="lg">Label</Button>

Figma: Button/Outline/Small
→ <Button variant="outline" size="sm">Label</Button>
```

### Cards

```
Figma: Card/Listing
→ <ListingCard listing={data} onPress={handler} />

Figma: Card/Order
→ <OrderCard order={data} onPress={handler} />

Figma: Card/Seller
→ <SellerCard seller={data} onPress={handler} />
```

### Inputs

```
Figma: Input/Default
→ <Input placeholder="Enter text" />

Figma: Input/With Icon
→ <Input placeholder="Search" leftIcon={<Search />} />

Figma: Input/Error
→ <Input error="This field is required" />
```

### Navigation

```
Figma: TabBar
→ <TabBar tabs={tabs} activeTab={active} onChange={setActive} />

Figma: Header/Simple
→ <Header title="Screen Title" />

Figma: Header/With Back
→ <Header title="Details" showBack onBack={goBack} />
```

### Lists

```
Figma: List/Horizontal
→ <FlashList horizontal data={items} renderItem={...} />

Figma: List/Grid 2-col
→ <FlashList numColumns={2} data={items} renderItem={...} />
```

### Badges

```
Figma: Badge/Discount
→ <Badge variant="primary">44% OFF</Badge>

Figma: Badge/New
→ <Badge variant="success">NEW</Badge>

Figma: Badge/Sold Out
→ <Badge variant="destructive">SOLD OUT</Badge>
```

## Screen Templates

### List Screen

```tsx
// Figma: Screen/Listings
export default function ListingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header title="Nearby" rightAction={<FilterButton />} />
      <FlashList
        data={listings}
        renderItem={({ item }) => <ListingCard listing={item} />}
        estimatedItemSize={200}
        numColumns={2}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}
```

### Detail Screen

```tsx
// Figma: Screen/Listing Detail
export default function ListingDetailScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView>
        {/* Hero Image */}
        <Image source={{ uri }} className="w-full aspect-video" />

        {/* Content */}
        <View className="p-4 gap-4">
          <Text className="text-2xl font-bold">{name}</Text>
          <Text className="text-muted-foreground">{description}</Text>

          {/* Price */}
          <View className="flex-row items-baseline gap-2">
            <Text className="text-3xl font-bold text-primary">${price}</Text>
            <Text className="text-lg text-muted-foreground line-through">
              ${originalPrice}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View className="p-4 border-t border-border">
        <Button size="lg" className="w-full">Add to Cart</Button>
      </View>
    </SafeAreaView>
  );
}
```

### Form Screen

```tsx
// Figma: Screen/Sign In
export default function SignInScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 p-6 justify-center gap-6">
            {/* Logo */}
            <View className="items-center mb-8">
              <Logo />
              <Text className="text-2xl font-bold mt-4">Welcome back</Text>
            </View>

            {/* Form */}
            <View className="gap-4">
              <Input
                label="Email"
                placeholder="you@example.com"
                keyboardType="email-address"
              />
              <Input
                label="Password"
                placeholder="••••••••"
                secureTextEntry
              />
            </View>

            {/* Actions */}
            <Button size="lg">Sign In</Button>

            <Text className="text-center text-muted-foreground">
              Don't have an account?{' '}
              <Text className="text-primary font-medium">Sign Up</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

## Animation Patterns

### Press Feedback

```tsx
// Figma: Interactive/Press State
const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

const handlePressIn = () => {
  scale.value = withSpring(0.95);
};

const handlePressOut = () => {
  scale.value = withSpring(1);
};
```

### Fade In

```tsx
// Figma: Animation/Fade In
const opacity = useSharedValue(0);

useEffect(() => {
  opacity.value = withTiming(1, { duration: 300 });
}, []);
```

### Slide Up

```tsx
// Figma: Animation/Slide Up
const translateY = useSharedValue(50);
const opacity = useSharedValue(0);

useEffect(() => {
  translateY.value = withSpring(0);
  opacity.value = withTiming(1, { duration: 300 });
}, []);
```
