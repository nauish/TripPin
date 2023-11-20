import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Places = () => {
  const [places, setPlaces] = useState([]);
  const { tripId } = useParams();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${tripId}/places`)
      .then((response) => response.json())
      .then((json) => setPlaces(json.data));
  }, []);

  return (
    <div>
      <h1>目前景點</h1>
      {places.map((place, index) => (
        <div key={index}>
          {place.name},類型:{place.type},第{place.day_number}天
        </div>
      ))}
    </div>
  );
};

export default Places;
