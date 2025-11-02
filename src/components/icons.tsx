import type { JSX, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

const baseProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function createIcon(
  name: string,
  paths: JSX.Element | JSX.Element[],
  defaultProps?: Partial<SVGProps<SVGSVGElement>>
) {
  const IconComponent = ({ size = 20, className, ...rest }: IconProps) => (
    <svg
      {...baseProps}
      width={size}
      height={size}
      className={className}
      {...defaultProps}
      {...rest}
    >
      {paths}
    </svg>
  );

  IconComponent.displayName = name;

  return IconComponent;
}

export const LocationIcon = createIcon(
  'LocationIcon',
  <>
    <path d="M12 22s7-7.27 7-12a7 7 0 1 0-14 0c0 4.73 7 12 7 12Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </>
);

export const HeartIcon = ({ filled = false, size = 20, className, ...rest }: IconProps & { filled?: boolean }) => (
  <svg
    {...baseProps}
    width={size}
    height={size}
    className={className}
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={filled ? 0 : 1.8}
    {...rest}
  >
    <path d="M19.5 4.75a4.75 4.75 0 0 0-6.7-.23L12 5.27l-.8-.75a4.75 4.75 0 0 0-6.7.23 5 5 0 0 0 .18 6.93l6.84 6.64a1 1 0 0 0 1.36 0l6.84-6.64a5 5 0 0 0 .18-6.93Z" />
  </svg>
);

export const PanelLeftIcon = createIcon(
  'PanelLeftIcon',
  <>
    <path d="M3.5 5.5h17" />
    <path d="M3.5 18.5h17" />
    <path d="M8 5.5v13" />
    <path d="M12 15.5l-3-3 3-3" />
  </>,
  { strokeWidth: 1.6 }
);

export const PanelRightIcon = createIcon(
  'PanelRightIcon',
  <>
    <path d="M3.5 5.5h17" />
    <path d="M3.5 18.5h17" />
    <path d="M16 5.5v13" />
    <path d="M12 9.5l3 3-3 3" />
  </>,
  { strokeWidth: 1.6 }
);

export const AlertTriangleIcon = createIcon(
  'AlertTriangleIcon',
  <>
    <path d="M12 3 2.5 20.5h19L12 3Z" />
    <path d="M12 9.5v4" />
    <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
  </>
);

export const TrashIcon = createIcon(
  'TrashIcon',
  <>
    <path d="M5 7h14" />
    <path d="M10 3h4" />
    <path d="M8 7v11a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7" />
  </>
);

export const CheckCircleIcon = createIcon(
  'CheckCircleIcon',
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 12 2 2 4.5-4.5" />
  </>
);

export const SunIcon = createIcon(
  'SunIcon',
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2.5M12 19.5V22" />
    <path d="M4.22 4.22l1.77 1.77M17.99 17.99l1.77 1.77" />
    <path d="M2 12h2.5M19.5 12H22" />
    <path d="M6 18l-1.78 1.78M19.78 4.22 18 6" />
  </>
);

export const CloudIcon = createIcon(
  'CloudIcon',
  <>
    <path d="M7.5 18a4.5 4.5 0 0 1 0-9 5 5 0 0 1 9.7-1.5 4 4 0 0 1 2.3 7.5H7.5Z" />
  </>
);

export const CloudSunIcon = createIcon(
  'CloudSunIcon',
  <>
    <path d="M7 15a3.5 3.5 0 1 1 0-7 4 4 0 0 1 7.7-1.2 3.5 3.5 0 0 1 2 6.6H7Z" />
    <path d="M5 4.5 4 3.5M9 2.5V1M13 4.5l1-1" strokeWidth={1.4} />
  </>
);

export const WaveIcon = createIcon(
  'WaveIcon',
  <>
    <path d="M3 16c1.5 0 2.5-1 3.5-1s2 1 3.5 1 2.5-1 3.5-1 2 1 3.5 1 2.5-1 3.5-1" />
    <path d="M3 12c1.5 0 2.5-1 3.5-1s2 1 3.5 1 2.5-1 3.5-1 2 1 3.5 1 2.5-1 3.5-1" />
  </>
);

export const InfoIcon = createIcon(
  'InfoIcon',
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 9.5v6" />
    <circle cx="12" cy="7" r="0.8" fill="currentColor" stroke="none" />
  </>
);

export const LifebuoyIcon = createIcon(
  'LifebuoyIcon',
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
    <path d="m5.6 5.6 2.3 2.3" />
    <path d="m16.1 5.6-2.3 2.3" />
    <path d="m5.6 16.4 2.3-2.3" />
    <path d="m16.1 16.4-2.3-2.3" />
  </>
);

export const SmileIcon = createIcon(
  'SmileIcon',
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 14c.6 1.3 2 2 3.5 2s2.9-.7 3.5-2" />
    <path d="M9 10h.01M15 10h.01" strokeLinecap="round" strokeWidth={2} />
  </>
);

export const RunnerIcon = createIcon(
  'RunnerIcon',
  <>
    <circle cx="13.5" cy="6.5" r="2.5" />
    <path d="M5.5 19.5 9 12l3 1.5 1.5 6" />
    <path d="M10 11 13 9.5l4 2" />
    <path d="m4.5 11.5 4 .5" />
  </>
);

export const SpeedometerIcon = createIcon(
  'SpeedometerIcon',
  <>
    <path d="M5 18a7 7 0 1 1 14 0" />
    <path d="M4 18h16" />
    <path d="M12 12l3-3" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <path d="M7.5 14h1.5" strokeLinecap="round" />
    <path d="M15 14h1.5" strokeLinecap="round" />
  </>
);

export const CameraIcon = createIcon(
  'CameraIcon',
  <>
    <path d="M4 7h3l1-2h8l1 2h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
    <circle cx="12" cy="13" r="3.5" />
  </>
);

export const SignalIcon = createIcon(
  'SignalIcon',
  <>
    <path d="M5 18a7 7 0 0 1 14 0" />
    <path d="M8 18a4 4 0 0 1 8 0" />
    <path d="M11.5 18a0.5 0.5 0 0 1 1 0" />
  </>
);

export const ChartIcon = createIcon(
  'ChartIcon',
  <>
    <path d="M4 19h16" />
    <path d="M7 19V7.5" />
    <path d="M12 19V5" />
    <path d="M17 19v-8" />
  </>
);

export const RefreshIcon = createIcon(
  'RefreshIcon',
  <>
    <path d="M4.5 10.5A7.5 7.5 0 0 1 20 9.5l1.5-2" />
    <path d="M19.5 13.5A7.5 7.5 0 0 1 4 14.5l-1.5 2" />
    <path d="M21.5 7.5V4h-3.5" />
    <path d="M2.5 16.5V20h3.5" />
  </>
);

export const SwimmerIcon = createIcon(
  'SwimmerIcon',
  <>
    <circle cx="18" cy="7" r="2.5" />
    <path d="M2.5 17.5c1.2 0 2-.8 3-0.8s1.8.8 3 .8 2-.8 3-.8 1.8.8 3 .8 2-.8 3-.8 1.8.8 3 .8" />
    <path d="m8 13 3-2 3 2" />
    <path d="m6 15 4-5 3 .5" />
  </>
);

export const HourglassIcon = createIcon(
  'HourglassIcon',
  <>
    <path d="M7 3h10" />
    <path d="M7 21h10" />
    <path d="M16 3c0 3-3.5 5.5-3.5 5.5S9 6 9 3" />
    <path d="M8 21c0-3 3.5-5.5 3.5-5.5S15 18 15 21" />
  </>
);

export const CloseIcon = createIcon(
  'CloseIcon',
  <>
    <path d="m6 6 12 12" />
    <path d="m18 6-12 12" />
  </>
);

export const ErrorIcon = createIcon(
  'ErrorIcon',
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4" />
    <circle cx="12" cy="16" r="0.8" fill="currentColor" stroke="none" />
  </>
);

export const TargetIcon = createIcon(
  'TargetIcon',
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    <path d="M12 3v2" />
    <path d="M21 12h-2" />
    <path d="M12 21v-2" />
    <path d="M5 12H3" />
  </>
);
