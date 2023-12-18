import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { ChevronDown } from 'lucide-react';

const Hero = () => {
  return (
    <>
      <div className="relative top-0 w-full h-screen">
        <video
          autoPlay
          poster="/placeholder.webp"
          muted
          loop
          className=" w-full h-full object-cover"
        >
          <source src="/hero.mp4" type="video/mp4"></source>
        </video>
        <div className="absolute top-28 left-0 w-full h-full flex flex-col justify-start items-center pt-12">
          <h1 className=" font-bold text-6xl mb-3">想去哪？</h1>
          <p className=" text-xl mb-4">在 TripPin 上探索你的旅程</p>
          <div className="flex space-x-4 mt-8">
            <Link to="/trips">
              <Button>開始規劃</Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="flex justify-center -mt-20">
        <ChevronDown
          strokeWidth={4}
          size={48}
          className="text-white text-3xl animate-bounce cursor-pointer"
          onClick={() =>
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
          }
        />
      </div>
    </>
  );
};

export default Hero;
