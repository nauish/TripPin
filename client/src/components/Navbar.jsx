import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function CollapsibleSearchButton() {
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const handleSearchClick = () => {
    setIsSearchVisible(true);
  };

  return (
    <div>
      {isSearchVisible ? (
        <SearchBox />
      ) : (
        <button
          className="fixed top-1 right-5 h-10 w-10 
          bg-[url('/search.png')] hover:bg-[url('/search-hover.png')]"
          onClick={handleSearchClick}
        ></button>
      )}
    </div>
  );
}

function SearchBox() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = () => {
    navigate(`/?search=${searchQuery}`);
  };

  return (
    <div className="fixed top-1 right-0 border-2  w-full xl:static px-4 rounded-full flex items-center bg-white">
      <input
        className="!outline-none h-10"
        type="text"
        placeholder="搜尋..."
        value={searchQuery}
        onChange={handleSearchInputChange}
      />
      <button
        className="fixed right-5 h-10 w-10 xl:static
        bg-center bg-[url('/search.png')] hover:bg-[url('/search-hover.png')]"
        onClick={handleSearchSubmit}
      ></button>
    </div>
  );
}

export function Navbar() {
  return (
    <nav
      className=" bg-white  h-[102px] text-black 
      xl:flex xl:justify-between items-center 
    top-0 left-0 right-0 z-50 fixed xl:h-[140px] border-black border-b-[50px] xl:border-b-[40px]"
    >
      <div className="flex items-center justify-center">
        <Link to="/" reloadDocument className="xl:ml-14">
          <img
            className="h-6 xl:h-12 mt-3 xl:mt-auto"
            src="../logo.png"
            alt="Logo"
          />
        </Link>
      </div>

      <div className="flex justify-center items-center">
        <span className="xl:hidden">
          {' '}
          <CollapsibleSearchButton />
        </span>
        <span className="hidden xl:block">
          <SearchBox />
        </span>
        <div
          className="navbar-icons flex fixed bottom-0 w-screen justify-around bg-black z-50 
        xl:mr-10 xl:static xl:gap-12 xl:ml-12 xl:bg-transparent xl:justify-normal xl:w-auto"
        >
          <Link to="/profile">
            <div
              className="w-11 h-11 
          bg-[url('/member-mobile.png')] xl:bg-[url('/member.png')] xl:hover:bg-[url('/member-hover.png')]"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
}
