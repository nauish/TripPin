import { toast } from 'sonner';
import { Button } from './ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Link } from 'lucide-react';

const ShareTrip = ({ tripId }) => {
  return (
    <Tooltip>
      <Dialog>
        <TooltipTrigger asChild>
          <DialogTrigger>
            <Link />
          </DialogTrigger>
        </TooltipTrigger>
        <DialogContent>
          <CardHeader>
            <CardTitle>分享行程</CardTitle>
            <CardDescription>請使用此連結分享給朋友</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                value={`https://trip.rickli.shop/trips/${tripId}`}
                readOnly
              />
              <Button
                className="shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://trip.rickli.shop/trips/${tripId}`,
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
