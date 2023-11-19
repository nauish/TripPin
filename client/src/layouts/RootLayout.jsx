import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    <div className="root-layout relative min-h-screen pt-[102px] xl:pt-24 pb-40 xl:pb-28 overflow-hidden">
      <header></header>
      <main className="xl:mt-10">
        <Outlet />
      </main>
      <></>
    </div>
  );
}
