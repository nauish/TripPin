import { formatDate, formatBudget } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Link } from 'react-router-dom';
import TripOptionButton from './TripOptionButton';

const TripCard = ({ trip, showOptions }) => {
  return (
    <>
      <Card className=" hover:bg-slate-100 group relative">
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
                  <span className="text-gray-500"> | {trip.type}</span>
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
              {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
            </CardDescription>

            <CardDescription>筆記：{trip.note}</CardDescription>
          </CardContent>
          <CardFooter>
            <CardDescription>
              {trip.privacy_setting === 'public' ? '公開行程' : '私人行程'}
            </CardDescription>
          </CardFooter>
        </Link>
      </Card>
    </>
  );
};

export default TripCard;
