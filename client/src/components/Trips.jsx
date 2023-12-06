import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import TripCard from './TripCard';

const Trips = ({ trips }) => {
  return (
    <>
      <div className="flex justify-center pb-10">
        <div className="flex flex-col">
          <Link to="/trip">
            <Button className="w-20 my-4">新增行程</Button>
          </Link>
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
