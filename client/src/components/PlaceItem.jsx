import { Draggable } from '@hello-pangea/dnd';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'react-toastify';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { tagIconMapping } from '../lib/utils';
import {
  Car,
  FileEdit,
  Footprints,
  Map,
  Navigation2,
  Ruler,
  Trash2,
} from 'lucide-react';

const PlaceItem = ({
  tripId,
  socket,
  user,
  place,
  updateData,
  centerToTheMarker,
  setClickLocation,
  attendeeRole,
  index,
  lockedPlace,
}) => {
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
      if (socket) socket.emit('addNewPlaceToTrip', { room: tripId });
      toast.success('景點已刪除');
    }
  };

  useEffect(() => {
    if (!socket) return;
    socket.on('newEditLock', ({ name, placeId }) => {
      if (placeId === place.id && name === user.name) {
        setOpen(true);
      }
    });

    return () => {
      socket.off('newEditLock');
    };
  }, [socket]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      name === 'start_hour' &&
      formData.end_hour &&
      value > formData.end_hour
    ) {
      toast.warning('開始時間不能晚於結束時間');
      setFormData({
        ...formData,
        [name]: formData.end_hour,
      });
      return;
    }

    if (
      name === 'end_hour' &&
      formData.start_hour &&
      value < formData.start_hour
    ) {
      toast.warning('結束時間不能早於開始時間');
      setFormData({
        ...formData,
        [name]: formData.start_hour,
      });

      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    updateData(formData, place.id);
    socket.emit('newEditUnlock', {
      room: tripId,
      name: user.name,
      placeId: place.id,
    });
    setOpen(false);
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
          <Footprints size={18} />
          {walkingTime}分鐘
        </>
      );
    return (
      <>
        <Car size={18} />
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
                <Ruler size={18} />
                {formatDistance(place.distance_from_previous)}
                <span className="px-2"> | </span>
                <a
                  href={`https://www.google.com/maps/dir/${place.previous_place_name}/${place.name}/@${place.latitude},${place.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className=" text-blue-600 hover:text-blue-800"
                >
                  <span className="flex items-center">
                    <Map size={18} />
                    Maps
                  </span>
                </a>
              </span>
            </div>
          )}
          <div className=" my-2 group">
            <div
              className={`${
                lockedPlace.find((lock) => lock.placeId === place.id)
                  ? 'bg-red-200'
                  : 'bg-gray-100'
              } rounded-t-lg group-hover:rounded-t-lg group-hover:rounded-b-none p-4 cursor-move group-hover:bg-slate-100 w-full flex justify-between items-center`}
            >
              <div className="group">
                <span className="text-sm text-gray-700">
                  {place.start_hour && formatTime(place.start_hour)}
                  {place.start_hour && place.end_hour && ' - '}
                  {place.end_hour && formatTime(place.end_hour)}
                </span>
                <h3 className="text-lg font-semibold flex items-center">
                  <div className="font-sans">{tagIconMapping[place.type]}</div>
                  {place.name}
                </h3>
                {lockedPlace.find((lock) => lock.placeId === place.id) && (
                  <span className="ml-2 text-sm text-red-500">
                    (
                    {lockedPlace.find((lock) => lock.placeId === place.id).name}
                    正在編輯中)
                  </span>
                )}
                <p className="text-gray-600 text-sm mb-1 ">{place.address}</p>
                <div className="">
                  <p className="text-gray-600 text-sm mb-1 ">
                    預算: {place.budget}
                  </p>

                  {place.tag && (
                    <p className="text-gray-600 text-sm mb-1">
                      標籤: {place.tag}
                    </p>
                  )}
                  {place.note && (
                    <p className="text-gray-600 text-sm mb-1">
                      筆記: {place.note}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {attendeeRole === 'attendee' && (
              <div className="flex justify-between bg-gray-100 rounded-b-lg ">
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
                  <Navigation2 size={16} />
                  看地圖
                </Button>

                <Dialog open={open} onOpenChange={setOpen}>
                  <Button
                    variant="ghost"
                    className="text-gray-500 hover:text-gray-700 w-full"
                    onClick={() => {
                      if (
                        lockedPlace.find(
                          (lock) =>
                            lock.placeId === place.id &&
                            lock.name !== user.name,
                        )
                      )
                        return toast.warning(
                          `${
                            lockedPlace.find(
                              (lock) => lock.placeId === place.id,
                            ).name
                          }正在編輯中`,
                        );
                      socket.emit('newEditLock', {
                        room: tripId,
                        name: user.name,
                        placeId: place.id,
                      });
                    }}
                  >
                    <FileEdit size={16} />
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
                          handleSubmit();
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
                    if (
                      lockedPlace.find(
                        (lock) =>
                          lock.placeId === place.id && lock.name !== user.name,
                      )
                    )
                      return toast.warning(
                        `${
                          lockedPlace.find((lock) => lock.placeId === place.id)
                            .name
                        }正在編輯中`,
                      );
                    deletePlace(place.id);
                  }}
                  variant="ghost"
                  className="text-red-500 hover:text-red-700 w-full"
                >
                  <Trash2 size={16} />
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
