import type { ComponentProps } from 'react';

type CloseButtonSize = 'compact' | 'regular';

type CloseButtonProps = Omit<ComponentProps<'button'>, 'aria-label' | 'children' | 'type'> & {
  ariaLabel: string;
  size?: CloseButtonSize;
};

const sizeClasses: Record<CloseButtonSize, { button: string; icon: string }> = {
  compact: {
    button:
      'h-[var(--size-icon-button-compact)] w-[var(--size-icon-button-compact)] rounded-[var(--radius-icon-button)]',
    icon: 'text-[length:var(--size-icon-button-symbol-compact)]',
  },
  regular: {
    button:
      'h-[var(--size-icon-button-regular)] w-[var(--size-icon-button-regular)] rounded-[var(--radius-icon-button)]',
    icon: 'text-[length:var(--size-icon-button-symbol-regular)]',
  },
};

export function CloseButton({
  ariaLabel,
  size = 'compact',
  className,
  ...buttonProps
}: CloseButtonProps) {
  const selectedSizeClasses = sizeClasses[size];
  const classes = [
    'inline-flex items-center justify-center text-[var(--color-icon-button-fg)] transition-colors hover:bg-[var(--color-icon-button-hover-bg)] hover:text-[var(--color-icon-button-hover-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
    selectedSizeClasses.button,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" aria-label={ariaLabel} className={classes} {...buttonProps}>
      <span
        className={`material-symbols-outlined leading-none ${selectedSizeClasses.icon}`}
        aria-hidden="true"
      >
        close
      </span>
    </button>
  );
}
