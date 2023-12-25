import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useState } from 'react';
import { HardDriveDownload } from 'lucide-react';

const DownloadPDF = ({ tripId }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    toast.promise(
      fetch(`${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${tripId}/pdf`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('無法產生 PDF');
          }
          return response.blob();
        })
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'trip.pdf';
          document.body.appendChild(a);
          a.click();
          a.remove();
          toast.success('您的 PDF 已製作完成');
        })
        .catch((error) => {
          toast.error(error.message);
        })
        .finally(() => {
          setIsLoading(false);
        }),
      {
        loading: '製作 PDF 中...',
      },
    );
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button onClick={handleDownload} disabled={isLoading}>
          <HardDriveDownload
            className={isLoading ? 'text-gray-500' : 'hover:text-red-500'}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent>下載 PDF</TooltipContent>
    </Tooltip>
  );
};

export default DownloadPDF;
