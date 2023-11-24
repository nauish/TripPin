import { Outlet } from 'react-router-dom';
import { SocketProvider } from '../context/SocketContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

export default function RootLayout() {
  return (
    <SocketProvider>
      <div className="root-layout relative min-h-screen pt-[102px] xl:pt-24 pb-40 xl:pb-28 overflow-hidden">
        <header>
          <Navbar />
        </header>
        <main className="xl:mt-10">
          <Outlet />
        </main>
        <>
          <Footer />
          <ToastContainer />
        </>
      </div>
    </SocketProvider>
  );
}
