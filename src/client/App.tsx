import { BrowserRouter } from 'react-router';
import { MantineProvider } from '@mantine/core';

import './App.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ComposeContextProviders } from './platform/ComposeContextProviders';
import { ConfigLoader } from './platform/config';
import { theme } from './platform/theme';
import Router from './routes';

const queryClient = new QueryClient();

export default function App() {
  return (
    <ComposeContextProviders
      providers={[
        [
          MantineProvider,
          {
            theme,
            defaultColorScheme: 'dark',
          },
        ],
        [ConfigLoader, {}],
        [QueryClientProvider, { client: queryClient }],
        [BrowserRouter, {}],
      ]}
    >
      <Router />
    </ComposeContextProviders>
  );
}
