import { useState, useEffect } from 'react';
import Trips from '@/components/Trips';
import LatestTrips from './LatestTrips';

const SavedTrips = () => {
  const [trips, setTrips] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_BACKEND_HOST}api/v1/users/${user.id}/trips/saved`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      },
    )
      .then((res) => res.json())
      .then((data) => setTrips(data.data));
  }, [user.id]);

  return (
    <>
      <Trips trips={trips} showPlayer tripsName="收藏的行程" />
      {trips.length === 0 && <LatestTrips />}
    </>
  );
};

export default SavedTrips;
