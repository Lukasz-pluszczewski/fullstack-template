import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';

import { ComposeContextProviders } from './platform/ComposeContextProviders';
import { ConfigLoader } from './platform/config';
import { theme } from './platform/layout/theme';
import Router from './routes';

import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

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
        [Notifications, {}],
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
