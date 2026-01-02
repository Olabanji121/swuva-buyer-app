---
name: figma-to-code
description: Convert Figma designs to React Native code. Use when implementing screens from Figma, extracting design tokens, or mapping Figma components to code. Requires Figma MCP plugin.
---

# Figma to Code - Design Implementation

## Overview

Converts Figma designs to production-ready React Native components using NativeWind (Tailwind CSS). Works with the Figma MCP plugin for direct design access.

## Workflow

### 1. Get Design Context

```
// Use Figma MCP to get design data
mcp__plugin_figma_figma__get_design_context({
  fileKey: "L1Gb9TjptWnbjalAiiv67Q",
  nodeId: "123:456",
  clientLanguages: "typescript",
  clientFrameworks: "react"
})
```

### 2. Extract Node ID from URL

```
URL: https://figma.com/design/L1Gb9TjptWnbjalAiiv67Q/SWUVA?node-id=123-456

fileKey: L1Gb9TjptWnbjalAiiv67Q
nodeId: 123:456 (convert hyphen to colon)
```

### 3. Get Screenshot for Reference

```
mcp__plugin_figma_figma__get_screenshot({
  fileKey: "L1Gb9TjptWnbjalAiiv67Q",
  nodeId: "123:456"
})
```

## Design Token Extraction

### Colors → theme.ts

```ts
// src/constants/theme.ts
export const colors = {
  primary: {
    DEFAULT: '#10b981',  // emerald-500
    foreground: '#ffffff',
  },
  secondary: {
    DEFAULT: '#f3f4f6',  // gray-100
    foreground: '#1f2937',
  },
  destructive: {
    DEFAULT: '#ef4444',  // red-500
    foreground: '#ffffff',
  },
  muted: {
    DEFAULT: '#f9fafb',
    foreground: '#6b7280',
  },
  accent: {
    DEFAULT: '#f59e0b',  // amber-500
    foreground: '#ffffff',
  },
  background: '#ffffff',
  foreground: '#111827',
  border: '#e5e7eb',
};
```

### Typography → tailwind.config.js

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui'],
        heading: ['Inter', 'system-ui'],
      },
      fontSize: {
        'display': ['36px', { lineHeight: '1.1', fontWeight: '700' }],
        'heading': ['24px', { lineHeight: '1.2', fontWeight: '600' }],
        'subheading': ['18px', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['14px', { lineHeight: '1.4', fontWeight: '400' }],
        'small': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },
    },
  },
};
```

### Spacing → Tailwind Classes

| Figma | Tailwind | Usage |
|-------|----------|-------|
| 4px | p-1, m-1, gap-1 | Tight spacing |
| 8px | p-2, m-2, gap-2 | Small spacing |
| 12px | p-3, m-3, gap-3 | Medium-small |
| 16px | p-4, m-4, gap-4 | Default spacing |
| 24px | p-6, m-6, gap-6 | Large spacing |
| 32px | p-8, m-8, gap-8 | Section spacing |

### Border Radius

| Figma | Tailwind |
|-------|----------|
| 4px | rounded |
| 8px | rounded-lg |
| 12px | rounded-xl |
| 16px | rounded-2xl |
| 9999px | rounded-full |

## Component Mapping

### Figma → React Native

| Figma Element | React Native | NativeWind |
|---------------|--------------|------------|
| Frame | View | flex |
| Auto Layout (horizontal) | View | flex-row |
| Auto Layout (vertical) | View | flex-col |
| Text | Text | text-{size} |
| Rectangle | View | bg-{color} |
| Ellipse/Circle | View | rounded-full |
| Image | expo-image Image | - |
| Button | Pressable + Text | - |
| Input | TextInput | - |
| Icon | expo/vector-icons | - |

### Auto Layout → Flexbox

```
Figma Auto Layout          →  NativeWind Classes
─────────────────────────────────────────────────
Direction: Horizontal      →  flex-row
Direction: Vertical        →  flex-col
Gap: 16                    →  gap-4
Padding: 16                →  p-4
Padding: 16, 24            →  py-4 px-6
Align: Center              →  items-center
Justify: Space Between     →  justify-between
Justify: Center            →  justify-center
Fill Container             →  flex-1
Hug Contents               →  (default, no class)
```

### Shadow Mapping

```
Figma Shadow               →  NativeWind
─────────────────────────────────────────
Blur: 4, Y: 2              →  shadow-sm
Blur: 8, Y: 4              →  shadow
Blur: 16, Y: 8             →  shadow-md
Blur: 24, Y: 12            →  shadow-lg
Blur: 48, Y: 24            →  shadow-xl
```

## Implementation Patterns

### Screen Layout

```tsx
// Figma frame with safe area and scroll
export default function ScreenName() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Content */}
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Card Component

```tsx
// Figma: Rectangle with shadow, rounded corners, padding
function Card({ children }: { children: React.ReactNode }) {
  return (
    <View className="bg-white rounded-xl p-4 shadow-md">
      {children}
    </View>
  );
}
```

### List Item

```tsx
// Figma: Horizontal auto layout with image, text stack, chevron
function ListItem({ title, subtitle, imageUrl, onPress }) {
  return (
    <Pressable
      className="flex-row items-center p-4 bg-white rounded-xl gap-3"
      onPress={onPress}
    >
      <Image
        source={{ uri: imageUrl }}
        className="w-12 h-12 rounded-lg"
      />
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">{title}</Text>
        <Text className="text-sm text-muted-foreground">{subtitle}</Text>
      </View>
      <ChevronRight className="text-muted-foreground" size={20} />
    </Pressable>
  );
}
```

### Tab Bar

```tsx
// Figma: Bottom bar with icons and labels
function TabBar({ tabs, activeTab, onTabPress }) {
  return (
    <View className="flex-row bg-white border-t border-border py-2">
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          className="flex-1 items-center gap-1"
          onPress={() => onTabPress(tab.id)}
        >
          <tab.icon
            size={24}
            className={activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'}
          />
          <Text
            className={`text-xs ${
              activeTab === tab.id ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
```

## Swuva-Specific Components

### Listing Card (from Figma)

```tsx
function ListingCard({ listing, onPress }) {
  const discount = Math.round((1 - listing.price / listing.originalPrice) * 100);

  return (
    <Pressable
      className="bg-white rounded-2xl overflow-hidden shadow-md"
      onPress={() => onPress(listing)}
    >
      {/* Image with badge */}
      <View className="relative">
        <Image
          source={{ uri: listing.imageUrl }}
          className="w-full aspect-square"
          contentFit="cover"
        />
        <View className="absolute top-2 left-2 bg-primary px-2 py-1 rounded-full">
          <Text className="text-xs font-bold text-white">{discount}% OFF</Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-3 gap-1">
        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
          {listing.name}
        </Text>
        <Text className="text-xs text-muted-foreground">{listing.seller.name}</Text>

        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-baseline gap-1">
            <Text className="text-lg font-bold text-primary">
              ${listing.price.toFixed(2)}
            </Text>
            <Text className="text-xs text-muted-foreground line-through">
              ${listing.originalPrice.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <MapPin size={12} className="text-muted-foreground" />
            <Text className="text-xs text-muted-foreground">
              {listing.distance} km
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
```

## Quality Checklist

Before completing implementation:

- [ ] Colors match Figma exactly
- [ ] Typography sizes/weights match
- [ ] Spacing is accurate (check padding, gaps)
- [ ] Border radius matches design
- [ ] Shadows are applied correctly
- [ ] Touch targets are 44px minimum
- [ ] Text is readable (contrast check)
- [ ] Component is responsive
- [ ] Loading/empty states designed
- [ ] Error states handled

## Reference

See `reference/component-mapping.md` for detailed Figma-to-code mappings.
