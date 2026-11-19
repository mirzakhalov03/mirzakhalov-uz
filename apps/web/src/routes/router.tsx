import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import { RootLayout } from '../components/RootLayout.js';
import { ErrorPage } from '../pages/ErrorPage.js';
import { HomePage } from '../pages/HomePage.js';

/**
 * The admin tree is lazy so its bundle never reaches a public visitor
 * (Technical PRD §5.1). Everything under /admin lands behind this one import.
 */
const AdminApp = lazy(() =>
  import('../features/admin/AdminApp.js').then((m) => ({ default: m.AdminApp })),
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'admin/*', element: <AdminApp /> },
      { path: '*', element: <ErrorPage /> },
    ],
  },
]);
