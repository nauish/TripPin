import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { FaChevronDown } from 'react-icons/fa';

const Hero = () => {
  return (
    <>
      <div className="relative w-full h-[78vh]">
        <img
          src="https://images.unsplash.com/photo-1682685796467-89a6f149f07a?q=80&w=2340&auto=format&fit=crop&ixid=M3w1MzE4NzB8MHwxfHNlYXJjaHw0fHx0cmlwfGVufDB8fHx8MTcwMTg1NDk2N3ww"
          alt="Woman looking at the valley"
          className="absolute w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-start items-center pt-12">
          <h1 className="font-bold text-5xl mb-3 line-height-1 mb-md-3 col-12 col-md-10 col-xl-9">
            想去哪？
          </h1>
          <p className="text-lg mb-4">在 TripPin 上探索你的旅程</p>
          <div className="flex space-x-4 mt-8">
            <Button>
              <Link to="/user/trips">開始規劃</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="flex justify-center -mt-10">
        <FaChevronDown className="text-white text-3xl animate-bounce" />
      </div>
    </>
  );
};

export default Hero;
