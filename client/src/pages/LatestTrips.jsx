import { useState, useEffect } from 'react';
import Trips from '@/components/Trips';

const LatestTrips = () => {
  const [trips, setTrips] = useState([]);
  const [nextPage, setNextPage] = useState(0);

  useEffect(() => {
    fetch(
      `${
        import.meta.env.VITE_BACKEND_HOST
      }api/v1/trips/latest?page=${nextPage}`,
    )
      .then((res) => res.json())
      .then((json) => {
        setTrips(json.data);
        setNextPage(json.nextPage);
      });
  }, []);

  return <Trips trips={trips} tripsName="最新行程" />;
};

export default LatestTrips;
