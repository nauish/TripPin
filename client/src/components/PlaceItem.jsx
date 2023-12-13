import { Draggable } from '@hello-pangea/dnd';
import { useState } from 'react';
import { BsPersonWalking } from 'react-icons/bs';
import { FaCarAlt } from 'react-icons/fa';
import { TbMapSearch } from 'react-icons/tb';
import { RiPinDistanceFill } from 'react-icons/ri';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'react-toastify';
import { useSocket } from '@/context/SocketContext';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { SiGooglemaps } from 'react-icons/si';
import { FaRegEdit } from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';

const PlaceItem = ({
  tripId,
  user,
  place,
  updateData,
  centerToTheMarker,
  setClickLocation,
  attendeeRole,
  index,
  lockedPlace,
}) => {
  const socket = useSocket();
  const [formData, setFormData] = useState({ ...place });
  const [open, setOpen] = useState(false);

  const deletePlace = async (placeId) => {
    const response = await fetch(
      `${
        import.meta.env.VITE_BACKEND_HOST
      }api/v1/trips/${tripId}/places/${placeId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      },
    );

    if (response.status === 200) {
      socket.emit('addNewPlaceToTrip', { room: tripId });
      toast('景點已刪除');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const formatDistance = (distance) => {
    const distanceInM = distance * 100000;
    if (distanceInM === 0) return;
    if (distanceInM < 1000) return `${distanceInM.toFixed(0)} 公尺`;
    return `${(distanceInM / 1000).toFixed(2)} 公里`;
  };

  const calculateSuggestTransportation = (distance) => {
    const distanceInM = distance * 100000;
    if (distanceInM === 0) return;
    const walkingTime = (distanceInM / 80).toFixed(0);
    const drivingTime = (distanceInM / 400).toFixed(0);
    if (distanceInM < 1000)
      return (
        <>
          <BsPersonWalking />
          {walkingTime}分鐘
        </>
      );
    return (
      <>
        <FaCarAlt />
        {drivingTime}分鐘
      </>
    );
  };

  const formatTime = (time) => {
    return new Date('1970-01-01T' + time + 'Z').toLocaleTimeString([], {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Draggable key={place.id} draggableId={place.id} index={index}>
      {(provided) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {formatDistance(place.distance_from_previous) && (
            <div className="flex justify-center">
              <span className="text-md text-gray-600 flex items-center">
                {calculateSuggestTransportation(place.distance_from_previous)}

                <span className="px-2"> | </span>
                <RiPinDistanceFill />
                {formatDistance(place.distance_from_previous)}
                <span className="px-2"> | </span>
                <a
                  href={`https://www.google.com/maps/dir/${place.previous_place_name}/${place.name}/@${place.latitude},${place.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className=" text-blue-600 hover:text-blue-800"
                >
                  <span className="flex items-center">
                    <TbMapSearch />
                    Google Maps
                  </span>
                </a>
              </span>
            </div>
          )}
          <div className=" my-2 group">
            <div
              className={`${
                lockedPlace.includes(place.id) ? 'bg-red-200' : 'bg-gray-100'
              } rounded-lg group-hover:rounded-t-lg group-hover:rounded-b-none p-4 cursor-move group-hover:bg-slate-100 w-full flex justify-between items-center`}
            >
              <div>
                <span className="text-sm text-gray-700">
                  {place.start_hour && formatTime(place.start_hour)}
                  {place.start_hour && place.end_hour && ' - '}
                  {place.end_hour && formatTime(place.end_hour)}
                </span>
                <h3 className="text-md font-semibold">{place.name}</h3>
                <p className="text-gray-600 text-sm mb-1">{place.address}</p>
              </div>
            </div>

            {attendeeRole === 'attendee' && (
              <div className="flex justify-between bg-gray-100 rounded-b-lg opacity-0 group-hover:bg-slate-100 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setClickLocation({
                      lat: place.latitude,
                      lng: place.longitude,
                    });
                    centerToTheMarker(place.latitude, place.longitude);
                  }}
                >
                  <SiGooglemaps />
                  看地圖
                </Button>

                <Dialog open={open}>
                  <Button
                    variant="ghost"
                    className="text-gray-500 hover:text-gray-700 w-full"
                    onClick={() => {
                      if (lockedPlace.includes(place.id))
                        return toast.warning('協作者正在編輯中');
                      socket.emit('newEditLock', {
                        room: tripId,
                        name: user.name,
                        placeId: place.id,
                      });
                      setOpen(true);
                    }}
                  >
                    <FaRegEdit />
                    編輯
                  </Button>

                  <DialogContent
                    onClose={() => {
                      socket.emit('newEditUnlock', {
                        room: tripId,
                        name: user.name,
                        placeId: place.id,
                      });
                      setOpen(false);
                    }}
                  >
                    <DialogHeader>
                      <DialogTitle>{place.name}</DialogTitle>
                    </DialogHeader>
                    <div>
                      <Label>標籤</Label>
                      <Input
                        type="text"
                        name="tag"
                        value={formData.tag || undefined}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label>種類</Label>
                      <Input
                        type="text"
                        name="type"
                        value={formData.type || undefined}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="w-1/2">
                        <Label>開始時間</Label>
                        <Input
                          type="time"
                          name="start_hour"
                          value={formData.start_hour || undefined}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="w-1/2">
                        <Label>結束時間</Label>
                        <Input
                          type="time"
                          name="end_hour"
                          value={formData.end_hour || undefined}
                          onChange={handleChange}
                        />
                      </div>
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
                        value={formData.note || undefined}
                        onChange={handleChange}
                      ></Textarea>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        className="bg-green-700 hover:bg-green-500"
                        onClick={() => {
                          updateData(formData, place.id);
                          socket.emit('newEditUnlock', {
                            room: tripId,
                            name: user.name,
                            placeId: place.id,
                          });
                          setOpen(false);
                        }}
                      >
                        儲存
                      </Button>
                      <Button
                        onClick={() => {
                          deletePlace(place.id);
                          socket.emit('newEditUnlock', {
                            room: tripId,
                            name: user.name,
                            placeId: place.id,
                          });
                        }}
                        variant="destructive"
                      >
                        刪除
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  onClick={() => {
                    if (lockedPlace.includes(place.id))
                      return toast.warning('編輯中');
                    deletePlace(place.id);
                  }}
                  variant="ghost"
                  className="text-red-500 hover:text-red-700 w-full"
                >
                  <RiDeleteBin6Line />
                  刪除
                </Button>
              </div>
            )}
          </div>
        </li>
      )}
    </Draggable>
  );
};

export default PlaceItem;
