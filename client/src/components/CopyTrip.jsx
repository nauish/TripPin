import { toast } from 'sonner';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SaveAll } from 'lucide-react';

const CopyTrip = ({ TRIP_API_URL }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const copyTrip = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${TRIP_API_URL}/places`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      const json = await response.json();

      if (json.error) {
        throw new Error(json.error);
      }
      navigate(`/user/trips/`);
      toast.success('複製成功，您可以開始編輯');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        <div
          onClick={copyTrip}
          disabled={isLoading}
          className="hover:text-yellow-700 cursor-pointer"
        >
          <SaveAll />
        </div>
      </TooltipTrigger>
      <TooltipContent>複製一份行程</TooltipContent>
    </Tooltip>
  );
};

export default CopyTrip;
