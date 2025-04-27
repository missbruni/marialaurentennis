import React from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '../lib/currency';

type PriceTagProps = {
  price: number;
  className?: string;
};

const PriceTag: React.FC<PriceTagProps> = ({ price, className }) => {
  return (
    <div
      className={cn(
        "relative before:absolute before:left-0 before:bottom-[-8px] before:w-0 before:h-0 before:border-[4px] before:border-solid before:border-lime-800 before:border-b-transparent before:border-l-transparent before:z-[-1] before:content-['']",
        "after:absolute after:right-0 after:top-0 after:w-0 after:h-0 after:border-t-[13px] after:border-b-[13px] after:border-r-0 after:border-l-[12px] after:border-transparent after:border-l-lime-600 after:z-[1] after:content-['']",
        'absolute top-2 left-[-9px] w-auto h-auto bg-lime-600 shadow-md z-[5] text-center text-xs leading-[18px] font-bold p-[4px_12px] rounded-tr-sm rounded-br-sm',
        className
      )}
    >
      <span className="text-white font-bold uppercase text-xs leading-4 whitespace-nowrap">
        {formatCurrency(price)}
      </span>
    </div>
  );
};

export default PriceTag;
