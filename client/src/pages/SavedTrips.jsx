import { useState, useEffect } from 'react';
import Trips from '@/components/Trips';

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

  return <Trips trips={trips} />;
};

export default SavedTrips;
