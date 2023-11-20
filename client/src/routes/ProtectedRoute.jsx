import { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorHandler from '../components/Error';

export default function ProtectedRoute() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_HOST}api/v1/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.accessToken}`,
            },
          },
        );

        if (!response.ok) {
          localStorage.setItem('intendedPath', location.pathname);
          navigate('/auth');
        } else {
          setLoading(false);
        }
      } catch (error) {
        setError(error);
      }
    };

    checkAuthentication();
  }, [navigate, location]);

  if (error) return <ErrorHandler message={error.message} />;

  return loading ? <Loading /> : <Outlet />;
}
