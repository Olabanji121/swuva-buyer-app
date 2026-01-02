/**
 * Tabs Layout - Native Tabs with Liquid Glass Effect
 *
 * Uses expo-router's NativeTabs for native iOS tab bar with liquid glass effect.
 * On iOS 26+, this automatically renders Apple's native UITabBarController
 * with the translucent glass material.
 *
 * Based on Figma design: node 169:2690
 */

import { DynamicColorIOS, Platform } from 'react-native';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

// Dynamic colors that adapt to liquid glass background
const activeColor = Platform.OS === 'ios'
  ? DynamicColorIOS({ dark: '#60D394', light: '#60D394' })
  : '#60D394';

const inactiveColor = Platform.OS === 'ios'
  ? DynamicColorIOS({ dark: '#AEAEB2', light: '#AEAEB2' })
  : '#AEAEB2';

export default function TabLayout() {
  return (
    <NativeTabs
      tintColor={activeColor}
      iconColor={{
        default: inactiveColor,
        selected: activeColor,
      }}
    >
      {/* Home Tab */}
      <NativeTabs.Trigger name="index">
        <Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          drawable="ic_home"
        />
        <Label hidden />
      </NativeTabs.Trigger>

      {/* Favorites Tab */}
      <NativeTabs.Trigger name="favorites">
        <Icon
          sf={{ default: 'heart', selected: 'heart.fill' }}
          drawable="ic_heart"
        />
        <Label hidden />
      </NativeTabs.Trigger>

      {/* Cart Tab */}
      <NativeTabs.Trigger name="cart">
        <Icon
          sf={{ default: 'cart', selected: 'cart.fill' }}
          drawable="ic_cart"
        />
        <Label hidden />
      </NativeTabs.Trigger>

      {/* Profile Tab */}
      <NativeTabs.Trigger name="profile">
        <Icon
          sf={{ default: 'person', selected: 'person.fill' }}
          drawable="ic_person"
        />
        <Label hidden />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
