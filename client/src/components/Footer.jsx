export function Footer() {
  return (
    <footer className=" bg-black p-4 flex justify-around absolute bottom-10 xl:bottom-0 left-0 right-0 z-10 h-28">
      <div className="flex flex-col lg:flex-row items-center">
        <div className="flex items-center mb-3">
          <div className="text-white text-xs lg:text-sm grid grid-cols-2 lg:flex lg:gap-8 flex-shrink-0">
            <a className="" href="/">
              關於 TripPin
            </a>
            <span className="hidden xl:block text-gray-500">|</span>
            <a className="" href="/">
              服務條款
            </a>
            <span className="hidden xl:block text-gray-500">|</span>
            <a className="" href="/">
              隱私政策
            </a>
            <span className="hidden xl:block text-gray-500">|</span>
            <a className="" href="/">
              聯絡我們
            </a>
            <span className="hidden xl:block text-gray-500">|</span>
            <a className="mr-16" href="/">
              FAQ
            </a>
          </div>
          <div className="footer-icons flex">
            <img
              src="/line.png"
              alt="Line"
              className="mr-6 ml-16 h-5 xl:h-auto"
            />
            <img
              src="/twitter.png"
              alt="Twitter"
              className="mr-6 h-5 xl:h-auto"
            />
            <img
              src="/facebook.png"
              alt="Facebook"
              className="mr-6 h-5 xl:h-auto"
            />
          </div>
        </div>
        <div className="text-xs text-gray-500">
          © 2023. Made by Rick Li.
          <br /> All rights reserved.
        </div>
      </div>
    </footer>
  );
}
