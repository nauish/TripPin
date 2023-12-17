import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { SocketProvider } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import 'react-toastify/dist/ReactToastify.min.css';

export default function RootLayout() {
  return (
    <SocketProvider>
      <Navbar />
      <Outlet />
      <ToastContainer position="bottom-right" />
    </SocketProvider>
  );
}
