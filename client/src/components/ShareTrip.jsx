import { toast } from 'react-toastify';
import { Button } from './ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { FaShareAlt } from 'react-icons/fa';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

const ShareTrip = ({ tripId }) => {
  return (
    <Tooltip>
      <Dialog>
        <TooltipTrigger asChild>
          <DialogTrigger>
            <FaShareAlt />
          </DialogTrigger>
        </TooltipTrigger>
        <DialogContent>
          <CardHeader>
            <CardTitle>分享行程</CardTitle>
            <CardDescription>
              此為公開行程，任何人都可以透過連結查看
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                value={`${import.meta.env.VITE_FRONTEND_HOST}trips/${tripId}`}
                readOnly
              />
              <Button
                className="shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${import.meta.env.VITE_FRONTEND_HOST}trips/${tripId}`,
                  );
                  toast.success('已複製連結');
                }}
              >
                複製連結
              </Button>
            </div>
          </CardContent>
        </DialogContent>
      </Dialog>
      <TooltipContent>分享行程</TooltipContent>
    </Tooltip>
  );
};

export default ShareTrip;
