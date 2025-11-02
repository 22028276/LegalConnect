import { paletteLight } from './paletteLight';

export const colors = {
  palette: paletteLight,
  transparent: 'rgba(0, 0, 0, 0)',
  buttonDisabled: 'rgba(27, 27, 34, 0.1)',
  buttonTextDisabled: 'rgba(27, 27, 34, 0.38)',
  indicator: '#4B5C92',

  processStatus: {
    approved: {
      badgeColor: '#DBE1FF', // primaryContainer
      textColor: '#334478', // onPrimaryContainer
    },
    pending: {
      badgeColor: '#FEF3C7',
      textColor: '#D97706',
    },
    rejected: {
      badgeColor: '#FFDAD6', // errorContainer
      textColor: '#93000A', // onErrorContainer
    },
    new: {
      badgeColor: '#FAF8FF', // surface
      textColor: '#4B5C92', // primary
    },
    undefined: {
      badgeColor: '#EEEDF4', // surfaceContainer
      textColor: '#757680', // outline
    },
  },

  primary: '#4B5C92',
  surfaceTint: '#4B5C92',
  onPrimary: '#FFFFFF',
  primaryContainer: '#DBE1FF',
  onPrimaryContainer: '#334478',

  secondary: '#595E72',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#DDE1F9',
  onSecondaryContainer: '#414659',

  tertiary: '#745470',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFD6F8',
  onTertiaryContainer: '#5B3D58',

  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',

  background: '#FAF8FF',
  onBackground: '#1A1B21',
  surface: '#FAF8FF',
  onSurface: '#1A1B21',

  surfaceVariant: '#E2E2EC',
  onSurfaceVariant: '#45464F',
  outline: '#757680',
  outlineVariant: '#C5C6D0',
  shadow: '#000000',
  scrim: '#000000',

  inverseSurface: '#2F3036',
  inverseOnSurface: '#F1F0F7',
  inversePrimary: '#B4C5FF',

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

  surfaceDim: '#DAD9E0',
  surfaceBright: '#FAF8FF',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F4F3FA',
  surfaceContainer: '#EEEDF4',
  surfaceContainerHigh: '#E8E7EF',
  surfaceContainerHighest: '#E3E2E9',
} as const;
