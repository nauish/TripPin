import { Draggable } from '@hello-pangea/dnd';
import { useState } from 'react';
import { BsPersonWalking } from 'react-icons/bs';
import { FaCarAlt } from 'react-icons/fa';
import { TbMapSearch } from 'react-icons/tb';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { toast } from 'react-toastify';
import { useSocket } from '@/context/SocketContext';

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
    console.log(formData);
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
                {' - '}
                {formatDistance(place.distance_from_previous)}

                <a
                  href={`https://www.google.com/maps/dir/${place.previous_place_name}/${place.name}/@${place.latitude},${place.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="pl-2 text-blue-600 hover:text-blue-800"
                >
                  <span className="flex items-center">
                    <TbMapSearch />
                    查看路線
                  </span>
                </a>
              </span>
            </div>
          )}
          <div
            className={`${
              lockedPlace.includes(place.id) ? 'bg-red-200' : 'bg-gray-100'
            } rounded-lg p-4 mb-2 cursor-move hover:bg-slate-100 flex justify-between items-center`}
          >
            <div>
              <span className="text-sm text-gray-700">
                {place.start_hour && formatTime(place.start_hour)}
                {place.start_hour && place.end_hour && ' - '}
                {place.end_hour && formatTime(place.end_hour)}
              </span>
              <h3 className="text-md font-semibold">{place.name}</h3>
              <p className="text-gray-600 text-[15px] mb-1">{place.address}</p>
            </div>
          </div>

          {attendeeRole === 'attendee' && (
            <div>
              <a
                className="z-10 cursor-pointer mr-2"
                onClick={() => {
                  setClickLocation({
                    lat: place.latitude,
                    lng: place.longitude,
                  });
                  centerToTheMarker(place.latitude, place.longitude);
                }}
              >
                看地圖
              </a>

              <Dialog open={open}>
                <DialogTrigger asChild>
                  <span
                    className="text-blue-500 hover:text-blue-700 mr-2"
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
                    編輯
                  </span>
                </DialogTrigger>

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
                  <div className="flex items-center space-x-2">
                    <label className="text-gray-600">標籤：</label>
                    <input
                      type="text"
                      name="tag"
                      className="border border-gray-300 px-2 py-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={formData.tag || undefined}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-gray-600">種類：</label>
                    <input
                      type="text"
                      name="type"
                      className="border border-gray-300 px-2 py-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={formData.type || undefined}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <label className="text-gray-600 mt-2">筆記：</label>
                    <textarea
                      type="text"
                      name="note"
                      className="border border-gray-300 px-2 py-1 rounded w-full h-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={formData.note || undefined}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        updateData(formData, place.id);
                        socket.emit('newEditUnlock', {
                          room: tripId,
                          name: user.name,
                          placeId: place.id,
                        });
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      儲存
                    </button>
                    <button
                      onClick={() => {
                        deletePlace(place.id);
                        socket.emit('newEditUnlock', {
                          room: tripId,
                          name: user.name,
                          placeId: place.id,
                        });
                      }}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      刪除
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
              <button
                onClick={() => {
                  if (lockedPlace.includes(place.id))
                    return toast.warning('編輯中');
                  deletePlace(place.id);
                }}
                className="text-red-500 hover:text-red-700"
              >
                刪除
              </button>
            </div>
          )}
        </li>
      )}
    </Draggable>
  );
};

export default PlaceItem;
