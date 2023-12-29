import { Player } from '@lottiefiles/react-lottie-player';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import TripOptionButton from './TripOptionButton';
import { Link } from 'react-router-dom';
import { formatBudget, formatDate } from '@/lib/utils';

const Trips = ({ trips, showPlayer, showOptions, tripsName }) => {
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
              {trips.map((trip, index) => (
                <Card
                  key={index}
                  className=" hover:bg-slate-100 group relative"
                >
                  {showOptions && (
                    <TripOptionButton
                      trip={trip}
                      className="absolute right-2 top-2 bg-gray-200 p-2 rounded-md hover:bg-gray-300"
                    />
                  )}
                  <Link to={`/trips/${trip.id}`}>
                    <img
                      src={trip.photo}
                      className="rounded-t-md object-cover h-48 w-96"
                      alt={trip.name}
                    ></img>
                    <CardHeader>
                      <div className="flex justify-between">
                        <div>
                          {trip.destination}
                          {trip.type ? (
                            <span className="text-gray-500">
                              {' '}
                              | {trip.type}
                            </span>
                          ) : (
                            ''
                          )}
                        </div>

                        {formatBudget(+trip.budget)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle>{trip.name}</CardTitle>

                      <CardDescription>
                        {formatDate(trip.start_date)} -{' '}
                        {formatDate(trip.end_date)}
                      </CardDescription>

                      <CardDescription>筆記：{trip.note}</CardDescription>
                    </CardContent>
                    <CardFooter>
                      <CardDescription>
                        {trip.privacy_setting === 'public'
                          ? '公開行程'
                          : '私人行程'}
                      </CardDescription>
                    </CardFooter>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </>
    )
  );
};

export default Trips;
