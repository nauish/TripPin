import { useState, useEffect, useCallback, useRef } from 'react';
import Trips from '@/components/Trips';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LatestTrips = () => {
  const [trips, setTrips] = useState([]);
  const [sort, setSort] = useState('hottest'); // ['latest', 'top-rated', 'hottest']
  const [nextPage, setNextPage] = useState(1);
  const loaderRef = useRef(null);

  const tripNames = {
    latest: '最新行程',
    'top-rated': '最高評價',
    hottest: '最熱門',
  };

  const fetchTrip = useCallback(() => {
    fetch(
      `${
        import.meta.env.VITE_BACKEND_HOST
      }api/v1/trips?sort=${sort}&page=${nextPage}`,
    )
      .then((res) => res.json())
      .then((json) => {
        setNextPage(json.nextPage);
        setTrips((prevTrips) => [...prevTrips, ...json.data]);
      });
  }, [sort, nextPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextPage) {
          fetchTrip();
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
      },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [fetchTrip, nextPage]);

  useEffect(() => {
    setTrips([]);
    setNextPage(1);
  }, [sort]);

  return (
    <>
      <div className="flex w-full flex-col items-center justify-center">
        <div className="pt-36 -mb-8 z-10 max-w-xl">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="請選擇" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">{tripNames.latest}</SelectItem>
              <SelectItem value="top-rated">
                {tripNames['top-rated']}
              </SelectItem>
              <SelectItem value="hottest">{tripNames.hottest}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Trips trips={trips} tripsName={tripNames[sort]} />
        <div ref={loaderRef} className="w-full h-1 bg-transparent" />
      </div>
    </>
  );
};

export default LatestTrips;
