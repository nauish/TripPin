import { useState, useEffect } from 'react';
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
  const [sort, setSort] = useState('latest'); // ['latest', 'top-rated', 'hottest']

  const tripNames = {
    latest: '最新行程',
    'top-rated': '最高評價',
    hottest: '最熱門',
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_HOST}api/v1/trips?sort=${sort}`)
      .then((res) => res.json())
      .then((json) => {
        setTrips(json.data);
      });
  }, [sort]);

  return (
    <>
      <div className="flex w-full flex-col items-center justify-center">
        <div className="pt-28 -mb-16 max-w-xl">
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
      </div>
    </>
  );
};

export default LatestTrips;
