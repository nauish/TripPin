import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import 'tailwindcss/tailwind.css'; // Import Tailwind CSS styles

const MyTrips = () => {
  const { userId } = useParams();
  const [trips, setTrips] = useState([]);

  const formatDate = (dateString) => {
    if (!dateString) return '尚未定';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };

  const formatBudget = (budget) => {
    if (budget == null) return '還沒評估預算';

    return budget.toLocaleString('en-US', {
      style: 'currency',
      currency: 'TWD',
    });
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_HOST}api/v1/users/${userId}/trips`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setTrips(data.data));
  }, [userId]);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">My Trips</h1>
      {trips.map((trip) => (
        <Link to={`/trips/${trip.id}`} key={trip.id}>
          <div
            key={trip.id}
            className="bg-gray-100 p-4 mb-4 rounded-lg shadow-md"
          >
            <div className="font-bold">行程名稱: {trip.name}</div>
            <div>地點: {trip.destination}</div>
            <div>開始日期: {formatDate(trip.start_date)}</div>
            <div>結束日期: {formatDate(trip.end_date)}</div>
            <div>預算: {formatBudget(+trip.budget)}</div>
            <div>預算: {formatBudget(+trip.budget)}</div>
            <div>隱私: {trip.privacy_setting}</div>
            <div>註記: {trip.note}</div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MyTrips;
