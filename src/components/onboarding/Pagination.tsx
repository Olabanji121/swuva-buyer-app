import { View } from 'react-native';
import { cn } from '@/lib/utils';

interface PaginationProps {
  total: number;
  current: number;
}

export function Pagination({ total, current }: PaginationProps) {
  return (
    <View className="flex-row items-center justify-center gap-1 py-2">
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          className={cn(
            'w-3 h-3 rounded-full transition-all',
            index === current ? 'bg-primary' : 'bg-primary/20'
          )}
        />
      ))}
    </View>
  );
}
