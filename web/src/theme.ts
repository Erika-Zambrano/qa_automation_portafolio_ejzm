import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

export const system = createSystem(
  defaultConfig,
  defineConfig({
    preflight: { scope: '.chakra-scope' },
    theme: {
      semanticTokens: {
        colors: {
          teal: {
            solid: { value: '#fb631b' },
            contrast: { value: '#181818' },
            fg: { value: '#c2410c' },
            focusRing: { value: '#fb631b' },
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
