import { FaCopy } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

const CopyTrip = ({ TRIP_API_URL }) => {
  const copyTrip = async () => {
    try {
      const response = await fetch(`${TRIP_API_URL}/places`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (response.status === 200) {
        toast('已複製行程');
      } else {
        const json = await response.json();
        console.log(json);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        <div
          onClick={copyTrip}
          className="hover:text-yellow-700 cursor-pointer"
        >
          <FaCopy />
        </div>
      </TooltipTrigger>
      <TooltipContent>複製一份行程</TooltipContent>
    </Tooltip>
  );
};

export default CopyTrip;
