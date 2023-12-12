import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaHeart } from 'react-icons/fa6';

const SaveTrip = ({ tripId, Authorization, user }) => {
  const [isSaved, setIsSaved] = useState(false);
  useEffect(() => {
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
        console.log(json);
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
      <FaHeart />
    </div>
  );
};

export default SaveTrip;
