import { cn } from '@/utils/cn';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ children, className, hover = false, glow = false, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass rounded-2xl p-6',
        hover && 'card-hover cursor-pointer',
        glow && 'glow',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
