import { Outlet } from 'react-router';

export function RootLayout() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <main id="main">
        <Outlet />
      </main>
    </>
  );
}
