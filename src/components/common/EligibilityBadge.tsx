import React from 'react';
import { calculateDonationEligibility, EligibilityResult } from '../../utils/calculators.js';
import { CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react';

export interface EligibilityBadgeProps {
  lastDonationDate?: string | Date | null;
  intervalDays?: number;
  size?: 'sm' | 'md' | 'lg';
  showNextDate?: boolean;
  showDetails?: boolean;
  className?: string;
  customResult?: EligibilityResult;
}

export const EligibilityBadge: React.FC<EligibilityBadgeProps> = ({
  lastDonationDate,
  intervalDays = 90,
  size = 'md',
  showNextDate = true,
  showDetails = false,
  className = '',
  customResult
}) => {
  const result = customResult || calculateDonationEligibility(lastDonationDate, intervalDays);

  const sizeStyles = {
    sm: {
      badge: 'px-2 py-0.5 text-[10px] gap-1',
      icon: 'w-3 h-3',
    },
    md: {
      badge: 'px-2.5 py-1 text-xs gap-1.5',
      icon: 'w-3.5 h-3.5',
    },
    lg: {
      badge: 'px-3.5 py-1.5 text-sm gap-2',
      icon: 'w-4 h-4',
    }
  }[size];

  if (result.isEligible) {
    return (
      <div className={`inline-flex flex-col ${className}`}>
        <span
          role="status"
          aria-label={result.messageBn}
          className={`inline-flex items-center font-extrabold rounded-full border shadow-2xs bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800 ${sizeStyles.badge}`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <CheckCircle2 className={`${sizeStyles.icon} text-emerald-600 dark:text-emerald-400 shrink-0`} />
          <span>রক্তদানে প্রস্তুত</span>
        </span>

        {showDetails && (
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
            {result.messageBn}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <span
        role="status"
        aria-label={result.messageBn}
        className={`inline-flex items-center font-bold rounded-full border shadow-2xs bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800 ${sizeStyles.badge}`}
      >
        <Clock className={`${sizeStyles.icon} text-amber-600 dark:text-amber-400 shrink-0`} />
        <span>
          {result.daysRemaining > 0 ? `আর ${result.daysRemaining.toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)])} দিন বাকি` : 'রক্তদান সীমাবদ্ধ'}
        </span>
      </span>

      {showNextDate && result.nextEligibleDateFormatted && (
        <span className="text-[10px] text-amber-700 dark:text-amber-400 mt-1 font-semibold flex items-center gap-1">
          <Calendar className="w-3 h-3 text-amber-500 shrink-0" />
          <span>প্রস্তুত হবেন: {result.nextEligibleDateFormatted}</span>
        </span>
      )}

      {showDetails && (
        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
          {result.messageBn}
        </span>
      )}
    </div>
  );
};
