import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      darkRed: string;
      white: string;
      lightGray: string;
      overlay: string;
      border: string;
      primaryDark: string;
      backgroundAlt: string;
    };
    fonts: {
      primary: string;
    };
  }
} 