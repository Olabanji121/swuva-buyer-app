import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-xl',
  {
    variants: {
      variant: {
        primary: 'bg-primary',
        secondary: 'bg-secondary',
        outline: 'border-2 border-primary bg-transparent',
        ghost: 'bg-transparent',
      },
      size: {
        sm: 'h-10 px-4',
        md: 'h-12 px-6',
        lg: 'h-[62px] px-8',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

const textVariants = cva('font-semibold text-center', {
  variants: {
    variant: {
      primary: 'text-white',
      secondary: 'text-primary',
      outline: 'text-primary',
      ghost: 'text-primary',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  textClassName?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant,
  size,
  onPress,
  disabled,
  loading,
  className,
  textClassName,
  leftIcon,
  rightIcon,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        buttonVariants({ variant, size }),
        disabled && 'opacity-50',
        className
      )}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? 'white' : '#60d394'}
          size="small"
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {leftIcon}
          <Text className={cn(textVariants({ variant, size }), textClassName)}>
            {children}
          </Text>
          {rightIcon}
        </View>
      )}
    </Pressable>
  );
}
