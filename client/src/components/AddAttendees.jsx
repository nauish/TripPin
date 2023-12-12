import { DialogTrigger } from '@radix-ui/react-dialog';
import { Dialog, DialogContent } from './ui/dialog';
import { BsPeopleFill } from 'react-icons/bs';
import { Button } from './ui/button';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { Input } from './ui/input';
import { CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const AddAttendees = ({
  tripId,
  attendees,
  tripCreator,
  onAttendeeAdd,
  onAttendeeRemove,
}) => {
  const [attendeeEmail, setAttendeeEmail] = useState([]);

  const handleChange = (event) => {
    setAttendeeEmail(event.target.value);
  };

  const handleAttendeeSubmit = (event) => {
    event.preventDefault();
    fetch(
      `${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${tripId}/attendees`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ email: attendeeEmail }),
      },
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.data) {
          toast.success('加入參加者成功');
          setAttendeeEmail('');
          onAttendeeAdd();
        } else {
          toast.error('加入參加者失敗：' + data.error);
        }
      })
      .catch((error) => {
        toast('網路錯誤: ' + error);
      });
  };

  const handleAttendeeValueChange = (role, userId) => {
    if (role === 'remove') {
      handleAttendeeRemove(userId);
    } else {
      handleAttendeeEdit(role, userId);
    }
  };

  const handleAttendeeRemove = (userId) => {
    fetch(
      `${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${tripId}/attendees`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ userId }),
      },
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.data) {
          toast.success(data.data.message);
          onAttendeeRemove(userId);
        } else {
          toast.error('移除參加者失敗：' + data.error);
        }
      })
      .catch((error) => {
        toast('網路錯誤: ' + error);
      });
  };

  const handleAttendeeEdit = (role, userId) => {
    fetch(
      `${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${tripId}/attendees`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ userId, role }),
      },
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.data) {
          toast.success(data.data.message);
        } else {
          toast.error('編輯參加者失敗：' + data.error);
        }
      })
      .catch((error) => {
        toast('網路錯誤: ' + error);
      });
  };

  return (
    <Dialog>
      <DialogTrigger>
        <BsPeopleFill className="hover:text-orange-500" />
      </DialogTrigger>
      <DialogContent>
        <CardHeader>
          <CardTitle>新增參加者</CardTitle>
          <CardDescription>
            輸入其他用戶的電子郵件地址即可將他們加入這個行程。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex space-x-2">
            <Input
              type="email"
              name="email"
              id="email"
              placeholder="使用者 e-mail"
              required
              onChange={handleChange}
            />
            <Button onClick={handleAttendeeSubmit} className="shrink-0">
              新增
            </Button>
          </form>
          <hr className="my-4" />
          <div className="space-y-4">
            <h4 className="text-sm font-bold">目前的參加者</h4>
            <div className="grid gap-6">
              {attendees && attendees.length > 0 ? (
                attendees.map((attendee, index) => (
                  <div
                    className="flex items-center justify-between space-x-4"
                    key={index}
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={attendee.photo} />
                        <AvatarFallback>
                          {attendee.name[0]}
                          {attendee.name.length > 1 ? attendee.name[1] : ''}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {attendee.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {attendee.email}
                        </p>
                      </div>
                    </div>
                    {tripCreator === attendee.id ? (
                      <Select defaultValue="creator">
                        <SelectTrigger className="ml-auto w-[110px]">
                          <SelectValue placeholder="選擇" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="creator" disabled>
                            發起人
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select
                        defaultValue={attendee.role}
                        onValueChange={(event) => {
                          handleAttendeeValueChange(event, attendee.id);
                        }}
                      >
                        <SelectTrigger className="ml-auto w-[110px]">
                          <SelectValue placeholder="選擇" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="attendee">可以編輯</SelectItem>
                          <SelectItem value="viewer">僅能檢視</SelectItem>
                          <SelectItem value="remove">移除</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  目前沒有參加者。
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
};

export default AddAttendees;
