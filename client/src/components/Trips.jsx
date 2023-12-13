import { Link } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player';
import TripCard from './TripCard';

const Trips = ({ trips, showPlayer, tripsName }) => {
  return (
    <>
      <h1 className="py-10 text-3xl font-bold text-center">
        {tripsName || '行程列表'}
      </h1>
      {trips.length === 0 && showPlayer && (
        <>
          <Player
            autoplay
            loop
            src="https://lottie.host/2673a739-ef57-45e6-bfde-cd212854bd8d/C0WkuiADG2.json"
            className="w-1/3 mx-auto"
          ></Player>
          <h2 className="text-xl text-center">
            您還沒有任何行程，快來新增吧！
          </h2>
        </>
      )}
      <div className="flex justify-center pb-10">
        <div className="flex flex-col">
          <div className="grid grid-cols-3 gap-4 max-w-5xl">
            {trips.map((trip) => (
              <Link to={`/trips/${trip.id}`} key={trip.id}>
                <TripCard trip={trip} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Trips;
