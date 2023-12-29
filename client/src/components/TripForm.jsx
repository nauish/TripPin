import { useState } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { DatePickerWithRange } from './DatePicker';

const TripForm = ({ className }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: 0,
    type: '',
    privacySetting: 'public',
    photo: '',
    note: '',
  });
  const [searchResults, setSearchResults] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      startDate: date.from,
      endDate: date.to,
    });
    console.log(date);
  };

  const handleImageSearch = async (e) => {
    e.preventDefault();
    if (!formData.destination) {
      toast.warning('請輸入搜尋關鍵字！');
      return;
    }

    const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
    const apiUrl = `https://api.unsplash.com/search/photos?query=${formData.destination}&client_id=${accessKey}`;

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  const handleImageSelect = (e, imageUrl) => {
    e.preventDefault();
    setFormData({
      ...formData,
      photo: imageUrl,
    });
    setSelectedImage(imageUrl);
  };

  const validation = () => {
    let tempErrors = {};
    if (!formData.name.trim()) {
      tempErrors.name = '請填寫行程名稱！';
    }
    if (!formData.destination.trim()) {
      tempErrors.destination = '請填寫旅遊地點！';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_HOST}api/v1/trips`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok)
        console.error('Error:', response.status, response.statusText);

      const result = await response.json();
      if (result.error) {
        toast(result.error);
        return;
      }

      toast.success('新增成功！');
      navigate(`/user/trips`);
      console.log(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (currentStep === 1 && validation()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = (e) => {
    e.preventDefault();
    if (currentStep === 2) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div
      className="flex flex-col justify-center"
      style={{ height: 'calc(100vh - 64px)' }}
    >
      <div className="pt-4 text-center font-bold text-3xl">新增行程</div>
      <div className="flex justify-center gap-10 px-10">
        <form
          onSubmit={handleSubmit}
          className={cn('min-w-[400px] max-w-md mt-4 p-6', className)}
        >
          {currentStep === 1 && (
            <>
              <div className="mb-2">
                <Label htmlFor="name">行程名稱</Label>
                <Input
                  type="text"
                  name="name"
                  required
                  maxLength="50"
                  placeholder="e.g. 歡樂美國遊"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && (
                  <p className="text-red-600 text-sm font-bold animate-pulse">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="destination">旅遊地點 (城市、國家)</Label>
                <div className="flex gap-2">
                  <Input
                    id="destination"
                    name="destination"
                    maxLength="45"
                    placeholder="e.g. 美國、紐約"
                    value={formData.destination}
                    onChange={handleChange}
                  />
                  <Button type="button" onClick={handleImageSearch}>
                    搜尋封面
                  </Button>
                </div>
                {errors.destination && (
                  <p className="text-red-600 text-sm font-bold animate-pulse">
                    {errors.destination}
                  </p>
                )}
                <div className="flex flex-wrap mt-2">
                  {searchResults.map((result) => (
                    <div key={result.id} className="relative m-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div>
                              <img
                                src={result.urls.thumb}
                                alt={result.alt_description}
                                className={`w-16 h-16 object-cover cursor-pointer border-4 ${
                                  result.urls.regular === selectedImage
                                    ? 'animate-bounce border-blue-500'
                                    : 'border-transparent'
                                } hover:border-blue-500`}
                                onClick={(e) => {
                                  handleImageSelect(e, result.urls.regular);
                                }}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <img
                              src={result.urls.small}
                              alt={result.alt_description}
                              className="w-52 h-52 object-cover cursor-pointer border border-transparent hover:border-blue-500"
                              onClick={(e) => {
                                handleImageSelect(e, result.urls.regular);
                              }}
                            />
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <Label>期間</Label>
                <DatePickerWithRange onDateChange={handleDateChange} />
              </div>
              <Button type="button" onClick={handleNextStep} className="w-full">
                下一步
              </Button>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div
                className={`transition-all duration-500 ease-in-out transform ${
                  currentStep === 2 ? 'translate-x-0' : 'translate-x-full'
                }`}
              >
                <Label htmlFor="budget">預算</Label>
                <Input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="type">旅行類別</Label>
                <Input
                  type="text"
                  name="type"
                  maxLength="45"
                  placeholder="e.g. 自助旅行"
                  value={formData.type}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="privacySetting">隱私設定</Label>
                <select
                  className="block appearance-none w-full border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  name="privacySetting"
                  value={formData.privacySetting}
                  onChange={handleChange}
                >
                  <option value="public">公開（他人可以檢視）</option>
                  <option value="private">
                    不公開（僅有受邀者可以檢視或編輯）
                  </option>
                </select>
              </div>
              <div className="mb-4">
                <Label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="note"
                >
                  備註
                </Label>
                <Textarea
                  name="note"
                  maxLength="2000"
                  placeholder="e.g. 這次旅行我們要..."
                  value={formData.note}
                  onChange={handleChange}
                />
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-1/2"
                  variant="secondary"
                >
                  上一步
                </Button>
                <Button type="submit" className="w-1/2" disabled={isLoading}>
                  新建行程
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default TripForm;
