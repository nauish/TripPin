import { Outlet } from 'react-router-dom';
import { SocketProvider } from '../context/SocketContext';
import { Navbar } from '../components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

export default function RootLayout() {
  return (
    <SocketProvider>
      <div className="root-layout min-h-screen relative pt-[64px]  overflow-hidden">
        <header>
          <Navbar />
        </header>
        <main className="">
          <Outlet />
        </main>
        <>
          <ToastContainer position="bottom-right" />
        </>
      </div>
    </SocketProvider>
  );
}
