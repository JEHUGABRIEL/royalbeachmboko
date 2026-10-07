// Icônes du back-office (traits, 24×24, héritent de la couleur du texte).
const paths = {
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  trash: <path d="M4.5 7h15M10 11v6M14 11v6M6 7l1 12.5a1.5 1.5 0 001.5 1.5h7a1.5 1.5 0 001.5-1.5L18 7M9 7V4.5A1 1 0 0110 3.5h4a1 1 0 011 1V7" />,
  edit: <path d="M4 20h4L19 9a2.1 2.1 0 00-3-3L5 17v3zM14 8l3 3" />,
  eye: (
    <>
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <path d="M3 3l18 18M10.6 6A9.9 9.9 0 0112 5.5c6.5 0 10 6.5 10 6.5a17 17 0 01-3.2 3.9M6.6 6.6A17 17 0 002 12s3.5 6.5 10 6.5a9.6 9.6 0 004.5-1.1M9.9 9.9a3 3 0 004.2 4.2" />
  ),
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
  down: <path d="M12 5v14M6 13l6 6 6-6" />,
  left: <path d="M19 12H5M11 6l-6 6 6 6" />,
  right: <path d="M5 12h14M13 6l6 6-6 6" />,
  refresh: <path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7" />,
  note: <path d="M5 4h10l4 4v12H5zM14 4v5h5M8 13h8M8 17h5" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5L12 13l8.5-6.5" />
    </>
  ),
  mailOpen: <path d="M3 10l9-6 9 6v9a1 1 0 01-1 1H4a1 1 0 01-1-1v-9zM3.5 10.5L12 16l8.5-5.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  logout: <path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 17l5-5-5-5M15 12H4" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.8-4 4-6 8-6s7.2 2 8 6" />
    </>
  ),
  home: <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a1 1 0 01-1 1A16 16 0 014 5a1 1 0 011-1z" />,
  userMinus: (
    <>
      <circle cx="10" cy="8" r="4" />
      <path d="M3 21c.8-4 3.5-6 7-6s6.2 2 7 6M16 11h6" />
    </>
  ),
  more: (
    <>
      <circle cx="12" cy="5" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="19" r="1.6" fill="currentColor" />
    </>
  ),
  bell: <path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15zM10 20.5a2 2 0 004 0" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  key: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l9-9M17 6l3 3M15 8l2 2" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3l10 18H2z" />
      <path d="M12 10v4M12 17.5v.5" />
    </>
  ),
};

export type IconName = keyof typeof paths;

export default function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
