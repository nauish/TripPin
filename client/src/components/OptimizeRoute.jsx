import { Button } from './ui/button';
import { toast } from 'react-toastify';

const OptimizeRouteButton = ({ tripId, className, variant, onSuccess }) => {
  const optimizeRoute = () => {
    fetch(
      `${
        import.meta.env.VITE_BACKEND_HOST
      }api/v1/trips/${tripId}/places/orders`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      },
    )
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        if (json.data.message) {
          onSuccess(json.data);
          toast.success(json.data.message, {
            autoClose: 2000,
          });
        }
        if (json.error) toast.error(json.error);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="">
      <Button
        className={className}
        variant={variant}
        onClick={() => {
          optimizeRoute();
        }}
      >
        最佳化路線
      </Button>
    </div>
  );
};

export default OptimizeRouteButton;
