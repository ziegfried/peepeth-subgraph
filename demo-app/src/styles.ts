import { createGlobalStyle } from 'styled-components';

export const theme = {
  fontSizes: [13.5, 16, 18, 24, 27, 36, 48, 54, 72, 96],
  font: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`,
  mono: 'SFMono-Regular,"Roboto Mono",Menlo,monospace',
  colors: {
    background: '#fff',
    text: '#222',
  },
};

export type Theme = typeof theme;

export const GlobalStyles = createGlobalStyle`
    * {
      box-sizing: border-box;
      font-weight: inherit;
      -webkit-appearance: none;
      -moz-appearance: none;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    html,
    body {
      min-height: 100%;
      min-width: 100%;
    }
    body {
      padding: 0;
      margin: 0;
      font-size: ${theme.fontSizes[2]}px;
      font-family: ${theme.font};
      color: ${theme.colors.text};
      line-height: 1.375;
      position: relative;
      height: 100%;
      max-height: 100%;
      width: 100%;
      background: ${theme.colors.background};
    }
    a {
      color: currentColor;
      text-decoration: none;
    }
    textarea {
      resize: none;
    }
    strong {
      font-weight: bold;
    }
    pre,
    code,
    kbd {
      font-family: ${theme.mono};
    }
`;
