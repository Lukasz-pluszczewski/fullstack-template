import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import { ComposeContextProviders } from './platform/ComposeContextProviders';
import { ConfigLoader } from './platform/config';
import { theme } from './platform/layout/theme';
import Router from './routes';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './App.css';

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
        [ModalsProvider, {}],
        [ConfigLoader, {}],
        [QueryClientProvider, { client: queryClient }],
        [BrowserRouter, {}],
      ]}
    >
      <Router />
    </ComposeContextProviders>
  );
}
