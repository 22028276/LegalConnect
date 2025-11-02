import { paletteDark } from './paletteDark';

export const colors = {
  palette: paletteDark,
  transparent: 'rgba(0, 0, 0, 0)',
  buttonDisabled: 'rgba(27, 27, 34, 0.1)',
  buttonTextDisabled: 'rgba(27, 27, 34, 0.38)',
  indicator: '#E3E2E9',

  processStatus: {
    approved: {
      badgeColor: '#334478', // primaryContainer
      textColor: '#B4C5FF', // primary
    },
    pending: {
      badgeColor: '#D97706', // secondaryContainer
      textColor: '#FEF3C7', // secondary
    },
    rejected: {
      badgeColor: '#93000A', // errorContainer
      textColor: '#FFB4AB', // error
    },
    new: {
      badgeColor: '#5B3D58', // tertiaryContainer
      textColor: '#E2BBDB', // tertiary
    },
    undefined: {
      badgeColor: '#1E1F25', // surfaceContainer
      textColor: '#8F909A', // outline
    },
  },

  primary: '#B4C5FF',
  surfaceTint: '#B4C5FF',
  onPrimary: '#1A2D60',
  primaryContainer: '#334478',
  onPrimaryContainer: '#DBE1FF',

  secondary: '#C1C5DD',
  onSecondary: '#2B3042',
  secondaryContainer: '#414659',
  onSecondaryContainer: '#DDE1F9',

  tertiary: '#E2BBDB',
  onTertiary: '#422740',
  tertiaryContainer: '#5B3D58',
  onTertiaryContainer: '#FFD6F8',

  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',

  background: '#121318',
  onBackground: '#E3E2E9',
  surface: '#121318',
  onSurface: '#E3E2E9',

  surfaceVariant: '#45464F',
  onSurfaceVariant: '#C5C6D0',
  outline: '#8F909A',
  outlineVariant: '#45464F',
  shadow: '#000000',
  scrim: '#000000',

  inverseSurface: '#E3E2E9',
  inverseOnSurface: '#2F3036',
  inversePrimary: '#4B5C92',

  primaryFixed: '#DBE1FF',
  onPrimaryFixed: '#00174B',
  primaryFixedDim: '#B4C5FF',
  onPrimaryFixedVariant: '#334478',

  secondaryFixed: '#DDE1F9',
  onSecondaryFixed: '#161B2C',
  secondaryFixedDim: '#C1C5DD',
  onSecondaryFixedVariant: '#414659',

  tertiaryFixed: '#FFD6F8',
  onTertiaryFixed: '#2B122B',
  tertiaryFixedDim: '#E2BBDB',
  onTertiaryFixedVariant: '#5B3D58',

  surfaceDim: '#121318',
  surfaceBright: '#38393F',
  surfaceContainerLowest: '#0D0E13',
  surfaceContainerLow: '#1A1B21',
  surfaceContainer: '#1E1F25',
  surfaceContainerHigh: '#292A2F',
  surfaceContainerHighest: '#34343A',
} as const;
