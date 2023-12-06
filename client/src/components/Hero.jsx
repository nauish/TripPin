import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const Hero = () => {
  return (
    <div>
      <img
        src="https://images.unsplash.com/photo-1682685796467-89a6f149f07a?q=80&w=2340&auto=format&fit=crop&ixid=M3w1MzE4NzB8MHwxfHNlYXJjaHw0fHx0cmlwfGVufDB8fHx8MTcwMTg1NDk2N3ww"
        alt="Woman looking at the valley"
        className="absolute w-full h-[94vh] object-cover -z-10"
      />
      <div className="flex flex-col justify-center items-center pt-20">
        <h1 className="font-bold text-5xl mb-3 line-height-1 mb-md-3 col-12 col-md-10 col-xl-9">
          想去什麼地方？
        </h1>
        <p className="text-lg mb-4">
          在 TripPin 上快速建立、規劃及探索你的行程
        </p>
        <div className="flex space-x-4 mt-8">
          <Button>
            <Link to="/user/trips">開始規劃</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
