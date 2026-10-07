import { Platform, useWindowDimensions } from 'react-native';

export const colors = {
  bg: '#000000',
  text: '#ffffff',
  meta: '#f2f2f2',
  muted: '#9a9a9a',
  line: '#3b3b3c',
  panel: '#101011',
  panelAlt: '#18181a',
  border: '#2a2a2c',
  gold: '#ffdb70',
  danger: '#ff7b7b',
  ok: '#7ee2a8',
};

export const fonts = {
  main: Platform.select({
    web: 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif',
    default: undefined,
  }),
  resume: Platform.select({
    web: 'Poppins, Inter, "Helvetica Neue", Arial, sans-serif',
    default: undefined,
  }),
};

export const BREAKPOINTS = { tablet: 768, desktop: 1100 };

/**
 * Satu sumber kebenaran untuk responsif: iPhone X (375) → tablet → desktop.
 * `s` adalah faktor skala tipografi/jarak (1 = ukuran referensi 487px).
 */
export function useLayout() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.desktop;
  const s = isDesktop ? 1.16 : isTablet ? 1.1 : Math.min(1.05, Math.max(0.88, width / 487));
  const px = (n) => Math.round(n * s * 10) / 10;
  return {
    width,
    height,
    isTablet,
    isDesktop,
    s,
    px,
    pad: width < 400 ? 24 : isTablet ? 40 : 31,
    maxWidth: isDesktop ? 720 : isTablet ? 640 : 560,
  };
}
