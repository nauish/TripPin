import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorHandler from '../components/Error';

export default function ProtectedRoute() {
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { accessToken } = localStorage;
    if (!accessToken) navigate('/auth');

    fetch(`${import.meta.env.VITE_BACKEND_HOST}api/v1/users/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error('請先登入！');
        return response.json();
      })
      .then((json) => {
        if (json.error) setError(json.error);
        setProfileData(json.data);
      })
      .catch((error) => setError(error))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  if (error) return <ErrorHandler message={error.message} />;
  return isLoading ? <Loading /> : <Outlet context={profileData} />;
}
