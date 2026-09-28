import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixText?: string;
  suffixText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      prefixText,
      suffixText,
      leftIcon,
      rightIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            {label} {props.required && <span className="text-rose-500">*</span>}
          </label>
        )}

        <div className="relative flex items-center rounded-xl border border-slate-200 bg-white transition-all duration-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 hover:border-slate-300">
          {leftIcon && <div className="pl-3.5 text-slate-400 shrink-0">{leftIcon}</div>}
          {prefixText && (
            <span className="pl-3.5 pr-1 text-sm font-semibold text-slate-500 select-none">
              {prefixText}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`w-full bg-transparent px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 ${className}`}
            {...props}
          />

          {suffixText && (
            <span className="pr-3.5 pl-1 text-xs font-medium text-slate-500 select-none">
              {suffixText}
            </span>
          )}
          {rightIcon && <div className="pr-3.5 text-slate-400 shrink-0">{rightIcon}</div>}
        </div>

        {error ? (
          <p className="mt-1 text-xs font-medium text-rose-600 animate-slide-up">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
