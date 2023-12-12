import { FaFilePdf } from 'react-icons/fa6';
import { toast } from 'react-toastify';

const DownloadPDF = ({ tripId }) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${tripId}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        },
      );
      if (!response.ok) throw new Error('下載 PDF 時發生錯誤');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'trip.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('您的 PDF 已製作完成');
    } catch (error) {
      toast.error('下載 PDF 時發生錯誤');
    }
  };

  return (
    <div>
      <button onClick={handleDownload}>
        <FaFilePdf className="hover:text-red-500" />
      </button>
    </div>
  );
};

export default DownloadPDF;
