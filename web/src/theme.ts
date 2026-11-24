import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

export const system = createSystem(
  defaultConfig,
  defineConfig({
    preflight: { scope: '.chakra-scope' },
    theme: {
      tokens: {
        fonts: {
          body: { value: 'var(--font-body)' },
          heading: { value: 'var(--font-display)' },
        },
      },
    },
  }),
);
