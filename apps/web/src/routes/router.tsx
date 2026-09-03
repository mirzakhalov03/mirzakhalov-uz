import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import { RootLayout } from '../components/RootLayout.js';
import { ErrorPage } from '../pages/ErrorPage.js';
import { HomePage } from '../pages/HomePage.js';
import { PendingPage } from '../pages/PendingPage.js';
import { WorkIndexPage } from '../pages/WorkIndexPage.js';

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
      { path: 'work', element: <WorkIndexPage /> },
      {
        path: 'writing',
        element: (
          <PendingPage
            title="Writing"
            note="The notes index and the bilingual reading surface are the next thing to be built. Three of them are previewed on the home page in the meantime."
            next="Read the previews"
          />
        ),
      },
      {
        path: 'laugh',
        element: (
          <PendingPage
            title="Laugh challenge"
            note="Three flavours of joke and a tear-off card, being rebuilt in this design system. The old one still runs, in Arial, with no error state."
            next="Back to the start"
          />
        ),
      },
      { path: 'admin/*', element: <AdminApp /> },
      { path: '*', element: <ErrorPage /> },
    ],
  },
]);
