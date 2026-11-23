// src/ui/theme.ts
// Teal and coral, as in the Chapter 5 prototypes.
export const colors = {
  teal: '#0B7D78',
  tealDark: '#075E5A',
  tealSoft: '#D9F0EE',
  coral: '#FF6F61',
  coralDark: '#C8433A',
  ok: '#2E9E6B',
  warn: '#F2A33A',
  ink: '#14201F',
  muted: '#5B6B69',
  sand: '#F5F8F7',
  card: '#FFFFFF',
  line: '#D5DEDC',
  grey: '#9AA7A5',
} as const;

export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 } as const;

export const type = {
  title: { fontSize: 22, fontWeight: '700', color: colors.ink },
  heading: { fontSize: 17, fontWeight: '700', color: colors.ink },
  body: { fontSize: 15, color: colors.ink, lineHeight: 22 },
  small: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  big: { fontSize: 56, fontWeight: '800', color: colors.ink },
} as const;
