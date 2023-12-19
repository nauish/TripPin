import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogClose,
} from './ui/dialog';

import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useState } from 'react';
import { DatePickerWithRange } from './DatePicker';

const TripOptionButton = ({ trip, className }) => {
  const [formData, setFormData] = useState({ ...trip });

  const deleteTrip = (tripId) => {
    fetch(`${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${tripId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        if (json.data.message) {
          toast.success(json.data.message, {
            autoClose: 1000,
          });
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
        if (json.error) toast.error(json.error);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    fetch(`${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${trip.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        if (json.data.message) {
          toast.success(json.data.message, {
            autoClose: 1000,
          });
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
        if (json.error) {
          toast.error(json.error);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      startDate: date.from,
      endDate: date.to,
    });
    console.log(date);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button className={className}>
          <Menu size={24} color="black" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>選項</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="hover:cursor-pointer"
            >
              編輯
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{trip.name}</DialogTitle>
            </DialogHeader>
            <div>
              <Label>名稱</Label>
              <Input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>目的地</Label>
              <Input
                type="text"
                name="destination"
                value={formData.destination || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>日期</Label>
              <DatePickerWithRange
                onDateChange={handleDateChange}
                defaultDate={{
                  from: new Date(formData.start_date),
                  to: new Date(formData.end_date),
                }}
              />
            </div>
            <div>
              <Label>預算</Label>
              <Input
                type="number"
                name="budget"
                value={formData.budget || 0}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>筆記</Label>
              <Textarea
                name="note"
                value={formData.note || ''}
                onChange={handleChange}
              ></Textarea>
            </div>
            <div>
              <Label>類型</Label>
              <Input
                type="text"
                name="type"
                value={formData.type || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>隱私設定</Label>
              <select
                className="block appearance-none w-full border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                name="privacy_setting"
                value={formData.privacy_setting}
                onChange={handleChange}
              >
                <option value="public">公開（他人可以檢視）</option>
                <option value="private">
                  不公開（僅有受邀者可以檢視或編輯）
                </option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <DialogClose asChild className="hover:cursor-pointer">
                <Button variant="secondary">取消</Button>
              </DialogClose>
              <Button
                className=""
                onClick={() => {
                  handleSubmit();
                }}
              >
                儲存
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <DropdownMenuItem
          className="hover:cursor-pointer"
          onSelect={() => deleteTrip(trip.id)}
        >
          刪除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TripOptionButton;
