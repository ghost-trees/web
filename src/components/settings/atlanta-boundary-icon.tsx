/**
 * @file atlanta-boundary-icon.tsx
 * @description
 * Atlanta city-limits mark taken from public/atl-boundary-simple.svg.
 * Inlined so the stroke uses currentColor instead of the file's fixed gray.
 */

type AtlantaBoundaryIconProps = {
  className?: string;
};

const ATLANTA_BOUNDARY_PATH =
  'M 90 32 L 139 32 L 139 91 L 164 91 L 164 117 L 142 117 L 142 161 L 114 161 L 111 132 L 81 132 L 81 151 L 54 151 L 54 100 L 69 100 L 67 84 L 93 61 Z';

export function AtlantaBoundaryIcon({ className }: AtlantaBoundaryIconProps) {
  return (
    <svg viewBox="40 18 138 156" fill="none" aria-hidden="true" className={className}>
      <path
        d={ATLANTA_BOUNDARY_PATH}
        stroke="currentColor"
        strokeWidth="6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
