import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Places = () => {
  const [places, setPlaces] = useState([]);
  const { tripId } = useParams();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${tripId}/places`)
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        setPlaces(json.data);
      });
  }, []);

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-md shadow-md">
      <h1 className="text-3xl font-bold mb-4">目前景點</h1>
      {places.map((day) => (
        <div key={day.dayNumber} className="mb-4">
          <h2 className="text-xl font-semibold mb-2">第 {day.dayNumber} 天</h2>
          {day.places.map((place, index) => (
            <div key={index} className="mb-2">
              <h3 className="text-lg font-medium">{place.name}</h3>
              <p className="text-gray-600 mb-1">{place.type}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Places;
