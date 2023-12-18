import { NavLink } from 'react-router-dom';
import { Menu, UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { debounce, throttle } from '@/lib/utils';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [transparency, setTransparency] = useState(0.0);

  const handleScroll = () => {
    if (window.scrollY > 500) {
      setTransparency(1);
    } else {
      setTransparency(window.scrollY / 500.0);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', throttle(debounce(handleScroll)));
    return () =>
      window.removeEventListener('scroll', throttle(debounce(handleScroll)));
  }, []);

  return (
    <nav
      className={` dark:bg-gray-900 fixed w-full z-20 top-0 start-0 transition-all  duration-300  ${
        transparency < 0.2
          ? 'bg-transparent'
          : 'bg-white dark:bg-gray-900 shadow-md backdrop-filter backdrop-blur-md bg-opacity-60'
      }`}
    >
      <div className="px-8 md:px-16 flex flex-wrap items-center justify-between mx-auto p-2">
        <NavLink to="/">
          <div className="flex items-center">
            <img className="h-12" src="/logo.webp" alt="TripPin Logo" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              TripPin
            </span>
          </div>
        </NavLink>

        <button
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          aria-controls="navbar-default"
          aria-expanded="false"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="sr-only">開啟選單</span>
          <Menu size={24} className="" />
        </button>
        <div
          className={
            isMenuOpen
              ? 'w-full md:block md:w-auto'
              : 'hidden w-full md:block md:w-auto'
          }
        >
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 rounded-lg bg-gray-100  md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-transparent dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <NavLink
                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-gray-700 md:p-0  dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                to="/explore/"
              >
                探索
              </NavLink>
            </li>
            <li>
              <NavLink
                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-gray-700 md:p-0  dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                to="/trips/"
              >
                規劃
              </NavLink>
            </li>
            <li>
              <NavLink
                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-gray-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                to="/user/trips"
              >
                我的行程
              </NavLink>
            </li>
            <li>
              <NavLink
                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-gray-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                to="user/saved"
              >
                收藏的行程
              </NavLink>
            </li>
            <li>
              <NavLink
                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-gray-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                to="/user/attended"
              >
                加入的行程
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/profile"
                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-gray-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
              >
                <UserCircle
                  size={32}
                  strokeWidth={1.4}
                  className="hidden md:block -m-1"
                />
                <span className="md:hidden">使用者資訊</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
