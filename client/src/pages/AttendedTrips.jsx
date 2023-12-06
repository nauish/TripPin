import { useState, useEffect } from 'react';
import Trips from '@/components/Trips';
import { useParams } from 'react-router-dom';

const AttendedTrips = () => {
  const { userId } = useParams();
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    fetch(
      `${import.meta.env.VITE_BACKEND_HOST}api/v1/users/${
        userId || user.id
      }/trips/attended`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      },
    )
      .then((res) => res.json())
      .then((data) => setTrips(data.data));
  }, [userId]);

  return <Trips trips={trips} />;
};

export default AttendedTrips;
