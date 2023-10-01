
import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

export const defaultThemeObject : ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: true,
};

export const defaultTheme = extendTheme(defaultThemeObject);
