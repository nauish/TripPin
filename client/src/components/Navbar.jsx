import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav
      className=" bg-white h-16 text-black 
      flex justify-between items-center 
    top-0 left-0 right-0 z-50 fixed border-b"
    >
      <Link to="/" reloadDocument className="ml-4 xl:ml-14">
        <div className="flex items-center">
          <img className="h-12 mt-auto" src="../logo.png" alt="Logo" />
          <div className="font-bold">TripPin</div>
        </div>
      </Link>
      <div className="flex gap-10 font-bold ">
        <Link className="hover:text-gray-600" to="/trip/">
          建立新行程
        </Link>
        <Link className="hover:text-gray-600" to="/user/trips">
          建立的行程
        </Link>
        <Link className="hover:text-gray-600" to="user/saved">
          收藏的行程
        </Link>
        <Link className="hover:text-gray-600" to="/user/attended">
          參加的行程
        </Link>
      </div>
      <div className="flex justify-center items-center">
        <div className="navbar-icons flex justify-around">
          <Link to="/profile">
            <div className="w-11 h-11 bg-[url('/member.png')] hover:bg-[url('/member-hover.png')] xl:mr-16 mr-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
