import { cn } from '@/lib/utils';
import React from 'react';

export const Typography = {
  H1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn('scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl', className)}
      {...props}
    />
  ),
  H2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn('scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0', className)}
      {...props}
    />
  ),
  H3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn('scroll-m-20 text-2xl font-semibold tracking-tight', className)} {...props} />
  ),
  H4: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className={cn('scroll-m-20 text-xl font-semibold tracking-tight', className)} {...props} />
  ),
  P: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn('leading-7', className)} {...props} />
  ),
  Blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className={cn('mt-6 border-l-2 pl-6 italic', className)} {...props} />
  ),
  List: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn('my-6 ml-6 list-disc [&>li]:mt-2', className)} {...props} />
  ),
  Lead: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn('text-xl text-muted-foreground', className)} {...props} />
  ),
  Large: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('text-lg font-semibold', className)} {...props} />
  ),
  Small: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <small className={cn('text-sm font-medium leading-none', className)} {...props} />
  ),
  Muted: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn('text-sm text-muted-foreground', className)} {...props} />
  ),
  InlineCode: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn(
        'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
        className
      )}
      {...props}
    />
  )
};
