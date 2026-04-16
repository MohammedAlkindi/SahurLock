import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-muted text-muted-foreground',
        accent:      'bg-accent/15 text-accent',
        success:     'bg-green-500/15 text-green-700',
        warning:     'bg-amber-500/15 text-amber-700',
        destructive: 'bg-red-500/15 text-red-700',
        outline:     'border border-border text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
