import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  color?: 'purple' | 'pink' | 'blue' | 'green' | 'orange';
}

const colorMap = {
  purple: {
    bg: 'bg-primary-500/10',
    icon: 'text-primary-400',
    border: 'border-primary-500/20',
  },
  pink: {
    bg: 'bg-accent-500/10',
    icon: 'text-accent-400',
    border: 'border-accent-500/20',
  },
  blue: {
    bg: 'bg-blue-500/10',
    icon: 'text-blue-400',
    border: 'border-blue-500/20',
  },
  green: {
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  orange: {
    bg: 'bg-orange-500/10',
    icon: 'text-orange-400',
    border: 'border-orange-500/20',
  },
};

export default function StatCard({ icon: Icon, label, value, change, positive, color = 'purple' }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className={cn('glass rounded-2xl p-5 card-hover border', colors.border)}>
      <div className="flex items-start justify-between">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', colors.bg)}>
          <Icon className={cn('w-5 h-5', colors.icon)} />
        </div>
        {change && (
          <span className={cn(
            'text-xs font-semibold px-2 py-1 rounded-full',
            positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          )}>
            {change}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-surface-400 mt-1">{label}</p>
      </div>
    </div>
  );
}
