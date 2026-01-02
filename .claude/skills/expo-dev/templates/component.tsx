/**
 * UI Component Template
 *
 * Usage: Copy and adapt for new UI components
 * Location: src/components/ui/
 */

import { forwardRef } from 'react';
import { Pressable, Text, View, type PressableProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';

// Define variants using CVA
const componentVariants = cva(
  // Base styles (always applied)
  'flex-row items-center justify-center rounded-xl',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        secondary: 'bg-secondary',
        outline: 'border-2 border-primary bg-transparent',
        ghost: 'bg-transparent',
      },
      size: {
        sm: 'h-10 px-4',
        md: 'h-12 px-6',
        lg: 'h-14 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Text variants (matching component variants)
const textVariants = cva('font-semibold', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      outline: 'text-primary',
      ghost: 'text-foreground',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

// Props interface
interface ComponentNameProps
  extends PressableProps,
    VariantProps<typeof componentVariants> {
  children: React.ReactNode;
  loading?: boolean;
  haptic?: boolean;
}

// Component with forwardRef for ref support
export const ComponentName = forwardRef<View, ComponentNameProps>(
  (
    {
      className,
      variant,
      size,
      children,
      loading = false,
      haptic = true,
      onPress,
      disabled,
      ...props
    },
    ref
  ) => {
    // Handle press with optional haptic feedback
    const handlePress = (e: any) => {
      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress?.(e);
    };

    return (
      <Pressable
        ref={ref}
        className={cn(
          componentVariants({ variant, size }),
          disabled && 'opacity-50',
          className
        )}
        onPress={handlePress}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading }}
        {...props}
      >
        {typeof children === 'string' ? (
          <Text className={cn(textVariants({ variant, size }))}>{children}</Text>
        ) : (
          children
        )}
      </Pressable>
    );
  }
);

ComponentName.displayName = 'ComponentName';
