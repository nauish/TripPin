import { Player } from '@lottiefiles/react-lottie-player';
import TripCard from './TripCard';

const Trips = ({ trips, showPlayer, tripsName }) => {
  return (
    trips && (
      <>
        <h1 className="pt-20 text-3xl font-bold text-center">
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
            <h2 className="text-xl text-center">您還沒有任何行程喔~</h2>
          </>
        )}
        <div className="flex justify-center pb-10">
          <div className="flex flex-col">
            <div className="grid p-8 md:p:16 gap-4 sm:grid-cols-2 xl:grid-cols-3 max-w-screen-xl">
              {trips.map((trip) => (
                <TripCard trip={trip} key={trip.id} />
              ))}
            </div>
          </div>
        </div>
      </>
    )
  );
};

export default Trips;
