import { useState, useEffect } from 'react';
import Trips from '@/components/Trips';
import { useParams } from 'react-router-dom';

const MyTrips = () => {
  const { userId } = useParams();
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    fetch(
      `${import.meta.env.VITE_BACKEND_HOST}api/v1/users/${
        userId || user.id
      }/trips`,
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

  return (
    <div>
      <Trips trips={trips} showPlayer tripsName="我的行程" />
    </div>
  );
};

export default MyTrips;
