'use client';

import { useEffect } from 'react';
import { useTheme } from '@/app/components/theme-provider';

export default function AppearanceHydrator({ settings }) {
  const { hydrateAppearance } = useTheme();

  useEffect(() => {
    if (settings && hydrateAppearance) {
      hydrateAppearance(settings);
    }
  }, [settings, hydrateAppearance]);

  return null;
}
