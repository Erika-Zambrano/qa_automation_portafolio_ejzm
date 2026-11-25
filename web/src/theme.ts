import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

export const system = createSystem(
  defaultConfig,
  defineConfig({
    preflight: { scope: '.chakra-scope' },
    theme: {
      semanticTokens: {
        colors: {
          teal: {
            solid: { value: '#01696f' },
            contrast: { value: '#ffffff' },
            fg: { value: '#01696f' },
            focusRing: { value: '#01696f' },
          },
        },
      },
      tokens: {
        fonts: {
          body: { value: 'var(--font-body)' },
          heading: { value: 'var(--font-display)' },
        },
      },
    },
  }),
);
