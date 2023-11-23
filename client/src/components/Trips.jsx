import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const MyTrips = () => {
  const { userId } = useParams();
  const [trips, setTrips] = useState([]);

  const formatDate = (dateString) => {
    if (!dateString) return '尚未定';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };

  const formatBudget = (budget) => {
    if (budget == null) return '還沒評估預算';

    return budget.toLocaleString('en-US', {
      style: 'currency',
      currency: 'TWD',
      maximumFractionDigits: 0,
    });
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_HOST}api/v1/users/${userId}/trips`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setTrips(data.data));
  }, [userId]);

  return (
    <>
      <div className="flex justify-center">
        <div className="flex flex-col">
          <h1 className="text-4xl my-4 font-bold">我的旅程</h1>
          <Link to={'/trip'}>
            <Button className="w-20 my-4">新增行程</Button>
          </Link>
          <div className="grid grid-cols-3 gap-4 max-w-5xl">
            {trips.map((trip) => (
              <Link to={`/trips/${trip.id}`} key={trip.id}>
                <Card className=" hover:bg-slate-100">
                  <CardHeader>
                    <CardDescription>{trip.destination}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CardTitle>{trip.name}</CardTitle>
                    <CardDescription>
                      {formatDate(trip.start_date)} -{' '}
                      {formatDate(trip.end_date)}
                      <div>預算: {formatBudget(+trip.budget)}</div>
                    </CardDescription>
                  </CardContent>
                  <CardFooter>
                    <CardDescription>
                      {trip.note}
                      {trip.privacy_setting}
                    </CardDescription>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyTrips;
