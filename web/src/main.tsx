import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';
import { LangProvider } from './context/LangContext';
import { system } from './theme';
import './css/tokens.css';

const Router = import.meta.env.MODE === 'file' ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Router>
      <ChakraProvider value={system}>
        <LangProvider>
          <App />
        </LangProvider>
      </ChakraProvider>
    </Router>
  </StrictMode>,
);
