import { useState } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import Map from './Map';
import Autocomplete from './Autocomplete';

const TripForm = ({ className }) => {
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    type: '',
    privacySetting: 'public',
    note: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setFormData({
      ...formData,
      [name]: value,
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
            <Autocomplete
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
        <Map
          className="w-full h-[100vh]"
          latitude={23.553118}
          longitude={121.0211024}
          zoom={8}
        />
      </div>
    </>
  );
};

export default TripForm;
