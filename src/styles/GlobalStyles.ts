import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    transform-style: preserve-3d;
    backface-visibility: hidden;
  }

  html, body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    width: 100%;
    overflow-x: hidden;
  }

  body {
    font-family: ${props => props.theme.fonts.primary};
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.white};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    min-height: 100vh;
    width: 100%;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  .wheel {
    transform-origin: center center;
    will-change: transform;
  }

  .ball {
    transform-origin: center center;
    will-change: transform;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(-163.221px); }
    50% { transform: translateY(-100px); }
  }

  @media (max-width: 1024px) {
    .roulette-wheel {
      margin-bottom: 2rem;
    }
  }
`;