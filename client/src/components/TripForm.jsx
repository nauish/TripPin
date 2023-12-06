import { useState } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

const TripForm = ({ className }) => {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(e.target);
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) {
      toast('請輸入搜尋關鍵字！');
      return;
    }

    const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
    const apiUrl = `https://api.unsplash.com/search/photos?query=${searchQuery}&client_id=${accessKey}`;

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
    console.log(imageUrl);
    setFormData({
      ...formData,
      photo: imageUrl,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      toast('新增成功！');
      navigate(`/user/trips`);
      console.log(result);
    } catch (error) {
      console.error('Error:', error);
    }
    console.log('Form data submitted:', formData);
  };

  return (
    <>
      <div className="pt-4 px-10 font-bold text-3xl">新增行程</div>
      <div className="flex justify-center gap-10 px-10">
        <form
          onSubmit={handleSubmit}
          className={cn(
            'min-w-[400px] max-w-md mt-4 p-6 bg-white rounded-md shadow-md',
            className,
          )}
        >
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="name"
            >
              行程名稱
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="destination"
            >
              旅遊地點 (城市、國家)
            </label>
            <input
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="photo"
            >
              選擇圖片
            </label>
            <div className="flex">
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="搜尋圖片"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="ml-2 bg-blue-500 text-white font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={handleImageSearch}
              >
                搜尋
              </button>
            </div>
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
                            className="w-16 h-16 object-cover cursor-pointer border border-transparent hover:border-blue-500"
                            onClick={(e) => {
                              handleImageSelect(e, result.urls.small);
                            }}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <img
                          src={result.urls.regular}
                          alt={result.alt_description}
                          className="w-52 h-52 object-cover cursor-pointer border border-transparent hover:border-blue-500"
                          onClick={(e) => {
                            handleImageSelect(e, result.urls.small);
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
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="startDate"
            >
              開始時間
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="endDate"
            >
              結束時間
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="budget"
            >
              預算
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
              />
            </label>
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="type"
            >
              旅行類別
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="privacySetting"
            >
              隱私設定
            </label>
            <select
              className="block appearance-none w-full border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="privacySetting"
              value={formData.privacySetting}
              onChange={handleChange}
            >
              <option value="public">公開</option>
              <option value="private">不公開</option>
            </select>
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="note"
            >
              備註
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="note"
              value={formData.note}
              onChange={handleChange}
            />
          </div>
          <Button type="submit">新建行程</Button>
        </form>
      </div>
    </>
  );
};

export default TripForm;
