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

const TripCard = ({ trip }) => {
  return (
    <>
      <Link to={`/trips/${trip.id}`}>
        <Card className=" hover:bg-slate-100 group">
          <img
            src={trip.photo}
            className="rounded-t-md object-cover h-48 w-96"
            alt={trip.name}
          ></img>
          <CardHeader>
            <div className="flex justify-between">
              <div>{trip.destination}</div>
              {formatBudget(+trip.budget)}
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle>{trip.name}</CardTitle>

            <CardDescription>
              {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
            </CardDescription>

            <CardDescription>{trip.note}</CardDescription>
          </CardContent>
          <CardFooter>
            <CardDescription>
              {trip.privacy_setting === 'public' ? '公開行程' : '私人行程'}
            </CardDescription>
          </CardFooter>
        </Card>
      </Link>
    </>
  );
};

export default TripCard;
