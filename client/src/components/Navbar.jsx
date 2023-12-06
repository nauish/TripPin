import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav
      className=" bg-white h-16 text-black 
      flex justify-between items-center 
    top-0 left-0 right-0 z-50 fixed border-b"
    >
      <div className="flex items-center">
        <Link to="/" reloadDocument className="ml-4 xl:ml-14">
          <img className="h-12 mt-auto" src="../logo.png" alt="Logo" />
        </Link>
        TripPin
      </div>
      <div className="flex gap-4 font-bold">
        <Link to="/trip/">新增行程</Link>
        <Link to="/user/trips">我建立的行程</Link>
        <Link to="user/saved">收藏的行程</Link>
        <Link to="/user/attended">加入的行程</Link>
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
