import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { FolderHeart } from 'lucide-react';

const SaveTrip = ({ tripId, Authorization, user }) => {
  const [isSaved, setIsSaved] = useState(false);
  useEffect(() => {
    if (!user) return;
    fetch(
      `${import.meta.env.VITE_BACKEND_HOST}api/v1/users/${user.id}/trips/saved`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization,
        },
      },
    )
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        if (json.data && json.data.find((trip) => trip.id === tripId)) {
          setIsSaved(true);
        }
      });
  }, []);

  const savedTrip = () => {
    fetch(
      `${import.meta.env.VITE_BACKEND_HOST}api/v1/users/${user.id}/trips/saved`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization,
        },
        body: JSON.stringify({ tripId, isSaved: !isSaved }),
      },
    )
      .then((response) => response.json())
      .then((json) => {
        if (json.error) {
          toast.error(json.error);
          return;
        }
        toast.success(json.data.message);
        setIsSaved(!isSaved);
      });
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        <div
          onClick={() => {
            {
              savedTrip(tripId);
            }
          }}
          className={
            isSaved
              ? 'text-red-500 hover:text-red-700 cursor-pointer'
              : 'text-gray-500 hover:text-red-700 cursor-pointer'
          }
        >
          <FolderHeart />
        </div>
      </TooltipTrigger>
      <TooltipContent>收藏行程</TooltipContent>
    </Tooltip>
  );
};

export default SaveTrip;
