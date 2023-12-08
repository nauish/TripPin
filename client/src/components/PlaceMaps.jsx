import { useRef, useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Loader } from '@googlemaps/js-api-loader';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { MdPeopleAlt } from 'react-icons/md';
import { FaHeart } from 'react-icons/fa';
import { FaRegCalendarDays } from 'react-icons/fa6';
import { formatDate, formatBudget } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import { Button } from './ui/button';
import useMapApi from '@/hooks/useMapApi';
import Comment from './Comment';
import { Card, CardTitle } from './ui/card';

const reorder = (list, startIndex, end) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(end, 0, removed);

  return result;
};

const PlacesMaps = () => {
  const { MarkerLibrary } = useMapApi();
  const { Marker } = MarkerLibrary;
  const mapRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const [data, setData] = useState([]);
  const [trip, setTrip] = useState(null);
  const [map, setMap] = useState(null);
  const [service, setService] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [clickLocation, setClickLocation] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [nearbyResults, setNearbyResults] = useState([]);
  const [attendeeEmail, setAttendeeEmail] = useState([]);
  const [lockedPlaces, setLockedPlaces] = useState([]);
  const { tripId } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  const autocompleteRef = useRef(null);
  const [isAttendee, setIsAttendee] = useState(false);
  const TRIP_API_URL = `${
    import.meta.env.VITE_BACKEND_HOST
  }api/v1/trips/${tripId}`;
  const Authorization = `Bearer ${localStorage.getItem('accessToken')}`;

  useEffect(() => {
    // Fetch trip information, redirect if private trip
    fetch(TRIP_API_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
      .then((response) => {
        if (response.status === 400) {
          toast.error('您無權限瀏覽此行程，請登入或聯繫行程發起人');
          navigate(`/user/trips`);
          return;
        }
        return response.json();
      })
      .then((json) => setTrip(json.data[0]))
      .catch((error) => {
        console.log(error);
      });

    // Check if user is attendee
    if (!user) return;
    fetch(`${TRIP_API_URL}/attendees`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        const { attendees } = json;
        const isAttendee = attendees.some((attendee) => {
          return +attendee.user_id === user.id;
        });
        setIsAttendee(isAttendee);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const fetchPlaces = () => {
    fetch(`${TRIP_API_URL}/places`, {
      headers: {
        Authorization,
      },
    })
      .then((response) => {
        if (response.status === 401) {
          toast.error('您無權限瀏覽此行程');
          navigate(`/users/${user.id}/trips`);
        }
        return response.json();
      })
      .then((json) => {
        setData(json.data);
        return json.data;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  useEffect(() => {
    if (!Marker) return;
    const initMap = async () => {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_MAPS_API,
        version: 'weekly',
      });
      const [mapsLib, placesLib] = await Promise.all([
        loader.importLibrary('maps'),
        loader.importLibrary('places'),
      ]);
      const map = await new mapsLib.Map(mapRef.current, {
        center: { lat: 25.085, lng: 121.39 },
        zoom: 13,
      });
      const autocomplete = new placesLib.Autocomplete(autocompleteRef.current);
      const service = new placesLib.PlacesService(map);

      map.addListener('click', (location) => {
        setClickLocation(location.latLng.toJSON());
      });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        console.log(place);

        if (place.geometry.viewport) map.fitBounds(place.geometry.viewport);
        else map.setCenter(place.geometry.location);

        new Marker({
          map: map,
          position: place.geometry.location,
        });

        setSearchResults((prev) => [...prev, place]);
      });

      setMap(map);
      setService(service);
      setAutocomplete(autocomplete);

      // Socket.io
      if (user) socket.emit('newUserInRoom', { name: user.name, room: tripId });
      socket.on('addNewPlaceToTrip', () => {
        fetchPlaces();
      });
      socket.on('newEditLock', (payload) => {
        setLockedPlaces((prev) => [...prev, payload.placeId]);
      });
      socket.on('newEditUnlock', (payload) => {
        setLockedPlaces((prev) => prev.filter((id) => id !== payload.placeId));
      });
      socket.on('getMarker', (data) => {
        toast('有人送來地點');
        new Marker({
          position: data.latLng,
          map: map,
        });
        map.setCenter(data?.latLng || data.geometry.location);
      });
    };

    initMap();

    return () => {
      socket.off('addNewPlaceToTrip');
      socket.off('newEditLock');
      socket.off('getMarker');
      socket.off('joinRoom');
      socket.off('newUserInRoom');
      socket.off('newEditUnlock');
    };
  }, [Marker]);

  // Mark the places on the map
  useEffect(() => {
    if (!data.length || !map || !Marker) return;

    const initLocation = {
      lat: data[0]?.places[0]?.latitude,
      lng: data[0]?.places[0]?.longitude,
    };

    map.setCenter(initLocation);
    data.forEach((day) => {
      day.places.forEach((place) => {
        new Marker({
          position: { lat: place.latitude, lng: place.longitude },
          map: map,
        });
      });
    });
  }, [data, Marker, map]);

  const addMarker = () => {
    new Marker({
      position: { lat: clickLocation.lat, lng: clickLocation.lng },
      map: map,
    });
    console.log(clickLocation);
    socket.emit('getMarker', {
      room: tripId,
      latLng: { lat: clickLocation.lat, lng: clickLocation.lng },
    });
  };

  const savedTrip = () => {
    fetch(
      `${import.meta.env.VITE_BACKEND_HOST}api/v1/users/${user.id}/trips/saved`,
      {
        method: 'POST',
        headers: {
          Authorization,
        },
        body: JSON.stringify({ tripId, isSaved: !isSaved }),
      },
    )
      .then((response) => response.json())
      .then((json) => {
        if (json.error) {
          toast.error(json.error);
          return;
        }
        toast(json.data.message);
        setIsSaved(!isSaved);
      });
  };

  const handleAttendeeSubmit = (event) => {
    event.preventDefault();
    fetch(`${TRIP_API_URL}/attendees`, {
      method: 'POST',
      headers: {
        Authorization,
      },
      body: JSON.stringify({ email: attendeeEmail }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.data) {
          toast(data.data.message);
          setAttendeeEmail('');
        } else {
          toast('User addition failed: ' + data.error);
        }
      })
      .catch((error) => {
        toast('Network error: ' + error);
      });
  };

  const setCenter = (latLng) => {
    map.setCenter(latLng);
  };

  const handleNearbySearch = (map, place) => {
    const request = {
      location: place.geometry.location,
      radius: '500',
    };

    service.nearbySearch(request, (results, status) => {
      if (status === 'OK') {
        console.log(results);
        setNearbyResults(results);
        results.forEach((result) => {
          new Marker({
            map: map,
            position: result.geometry.location,
          });
        });
      }
    });
  };

  const centerToTheMarker = (latitude, longitude) => {
    new Marker({
      map: map,
      position: { lat: latitude, lng: longitude },
    });
    map.setCenter({ lat: latitude, lng: longitude });
    map.setZoom(15);
  };

  const addPlaceToTrip = async (place) => {
    const response = await fetch(`${TRIP_API_URL}/places`, {
      method: 'POST',
      headers: {
        Authorization,
      },
      body: JSON.stringify({
        name: place.name,
        location: place.geometry?.location,
        address: place.vicinity || place.formatted_address,
        dayNumber: place.dayNumber || 1,
        markerType: 'place',
        type: place.types[0],
        note: '',
        tripId,
      }),
    });

    if (response.status === 200) {
      toast('已新增景點');
      socket.emit('addNewPlaceToTrip', { room: tripId });
      fetchPlaces();
    }

    const json = await response.json();
    console.log(json);
  };

  const addNewDay = () => {
    const maxDay = Math.max(...data.map((day) => day.dayNumber));
    if (maxDay <= 0) {
      setData([{ dayNumber: 1, places: [] }]);
      return;
    }
    setData([...data, { dayNumber: maxDay + 1, places: [] }]);
  };

  const deletePlace = async (placeId) => {
    const response = await fetch(`${TRIP_API_URL}/places/${placeId}`, {
      method: 'DELETE',
      headers: {
        Authorization,
      },
    });

    if (response.status === 200) {
      socket.emit('addNewPlaceToTrip', { room: tripId });
      toast('景點已刪除');
      fetchPlaces();
    }
  };

  function handleChange(event) {
    setAttendeeEmail(event.target.value);
  }

  const onDragEnd = (result) => {
    const { destination, source, type } = result;
    if (!destination) return;
    if (lockedPlaces.includes(source.droppableId)) {
      toast('此景點正在被編輯');
      return;
    }
    if (
      (source.droppableId === destination.droppableId &&
        destination.index === source.index) ||
      !isAttendee
    )
      return;

    // If user drag the place from the search results
    if (source.droppableId === 'searchResults') {
      if (destination.droppableId === 'searchResults') return;
      addPlaceToTrip({
        ...searchResults[source.index],
        dayNumber: destination.droppableId,
      });
      return;
    }

    if (source.droppableId === 'nearbyResults') {
      if (destination.droppableId === 'nearbyResults') return;
      addPlaceToTrip({
        ...nearbyResults[source.index],
        dayNumber: destination.droppableId,
      });
      return;
    }

    socket.emit('newEditLock', {
      room: tripId,
      name: user.name,
      placeId: source.droppableId,
    });

    if (type === 'card') {
      let newOrderedData = [...data];
      const sourceList = newOrderedData.find(
        (list) => list.dayNumber?.toString() === source.droppableId,
      );
      const destList = newOrderedData.find(
        (list) => list.dayNumber?.toString() === destination.droppableId,
      );

      if (!sourceList || !destList) return;
      if (!sourceList.dayNumber) sourceList.dayNumber = [];
      if (!destList.dayNumber) destList.dayNumber = [];

      // Moving place in the same day
      if (source.droppableId === destination.droppableId) {
        const reorderedList = reorder(
          sourceList.places,
          source.index,
          destination.index,
        );

        reorderedList.forEach((place, idx) => {
          place.order = idx;
        });
        sourceList.places = reorderedList;
        updateItemOrders(sourceList.places);
      } else {
        // Move the card between lists
        const [movedPlace] = sourceList.places.splice(source.index, 1);

        // Assign the place to the moved day
        movedPlace.day_number = +destination.droppableId;

        updateData(movedPlace, movedPlace.id);
        // Add the moved card to the destination list
        destList.places.splice(destination.index, 0, movedPlace);

        sourceList.places.forEach((place, idx) => (place.order = idx));
        destList.places.forEach((place, idx) => (place.order = idx));
      }
      socket.emit('newEditUnlock', {
        room: tripId,
        name: user.name,
        placeId: source.droppableId,
      });
      setData(newOrderedData);
    }
  };

  const updateItemOrders = (list) => {
    const newOrder = list.map((place) => ({
      order: place.order,
      id: place.id,
    }));

    fetch(`${TRIP_API_URL}/places/orders`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization,
      },
      body: JSON.stringify(newOrder),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.error) {
          toast(json.error);
          return;
        }
        socket.emit('addNewPlaceToTrip', { room: tripId });
        console.log(json);
      });
  };

  const copyTrip = async () => {
    try {
      const response = await fetch(`${TRIP_API_URL}/places`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (response.status === 200) {
        toast('已複製行程');
      } else {
        const json = await response.json();
        console.log(json);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateData = async (data, placeId) => {
    try {
      const response = await fetch(`${TRIP_API_URL}/places/${placeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(data),
      });

      if (response.status === 200) {
        socket.emit('addNewPlaceToTrip', { room: tripId });
        console.log(data);
        toast('景點更新成功');
        return true;
      } else {
        const json = await response.json();
        console.log(json);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const DayPlaces = ({ day }) => {
    return (
      <ul>
        {day.places.map((place, index) => (
          <div key={place.id}>
            <div className="flex items-center space-x-2">
              {place.distance_from_previous}
            </div>
            <PlaceItem
              place={place}
              updateData={updateData}
              centerToTheMarker={centerToTheMarker}
              index={index}
            />
          </div>
        ))}
      </ul>
    );
  };

  const PlaceItem = ({ place, updateData, centerToTheMarker, index }) => {
    const [formData, setFormData] = useState({ ...place });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
      console.log(formData);
    };

    return (
      <Draggable key={place.id} draggableId={place.id} index={index}>
        {(provided) => (
          <li
            className={` ${
              lockedPlaces.includes(place.id) ? 'bg-red-200' : ''
            } bg-gray-50 border border-gray-200 shadow-md 
            rounded-lg p-2 mb-2 
            cursor-move hover:bg-slate-100`}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div>
              <h3 className="text-lg font-medium">{place.name}</h3>
              <p className="text-gray-600 mb-1">{place.address}</p>
              {lockedPlaces.includes(place.id) && (
                <p className="text-red-500">此景點正在被編輯</p>
              )}
            </div>

            {isAttendee && (
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

                <Dialog>
                  <DialogTrigger>
                    {!lockedPlaces.includes(place.id) && (
                      <div
                        className="text-blue-500 hover:text-blue-700 mr-2"
                        onClick={() => {
                          if (lockedPlaces.includes(place.id)) {
                            toast('此景點正在被編輯');
                            return;
                          }
                          socket.emit('newEditLock', {
                            room: tripId,
                            name: user.name,
                            placeId: place.id,
                          });
                        }}
                      >
                        編輯
                      </div>
                    )}
                  </DialogTrigger>

                  <DialogContent
                    onClose={() => {
                      socket.emit('newEditUnlock', {
                        room: tripId,
                        name: user.name,
                        placeId: place.id,
                      });
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
                {!lockedPlaces.includes(place.id) && (
                  <button
                    onClick={() => deletePlace(place.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    刪除
                  </button>
                )}
              </div>
            )}
          </li>
        )}
      </Draggable>
    );
  };

  const boards = data.map((day) => (
    <div key={day.dayNumber} className="bg-white border-gray-300 px-16">
      <h1 className="text-xl mb-2">Day {day.dayNumber}</h1>
      <Droppable droppableId={day.dayNumber.toString()} type="card">
        {(provided) => (
          <ul
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="min-h-[120px]"
          >
            <DayPlaces day={day} />
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </div>
  ));

  return (
    <div className="flex">
      <div className="flex-1 overflow-y-auto h-[94vh]">
        <Button
          onClick={() => {
            addMarker();
          }}
          className="mark-on-map absolute bg-white text-black hover:bg-gray-300 z-10 top-[75px] right-16 py-2 px-4"
        >
          將標記傳給同伴
        </Button>

        <Button
          onClick={copyTrip}
          className="absolute bg-white text-black hover:bg-gray-300 z-10 top-[75px] right-[200px] py-2 px-4"
        >
          複製行程
        </Button>

        {trip && (
          <div className="flex flex-col items-center">
            <img
              src={trip.photo}
              className="object-cover w-full h-[300px]"
            ></img>
            <Card className="bg-white border-none shadow-xl p-4 w-4/5 -mt-32">
              <CardTitle className="text-3xl">{trip.name}</CardTitle>
              <p className="text-gray-600 mb-4 italic">{trip.destination}</p>
              <div className="text-gray-600 mb-4 flex justify-between">
                <div className="flex items-center gap-1">
                  <FaRegCalendarDays />
                  <span className="font-semibold text-sm">
                    {formatDate(trip.start_date)}
                  </span>{' '}
                  ~{' '}
                  <span className="font-semibold text-sm">
                    {formatDate(trip.end_date)}
                  </span>
                </div>
                <div className="flex py-2 gap-4">
                  <div
                    onClick={savedTrip}
                    className={
                      isSaved
                        ? 'text-red-500 hover:text-red-700 cursor-pointer'
                        : 'text-gray-500 hover:text-red-700 cursor-pointer'
                    }
                  >
                    <FaHeart />
                  </div>
                  <Dialog>
                    <DialogTrigger>
                      <MdPeopleAlt />
                    </DialogTrigger>
                    <DialogContent>
                      <form onSubmit={handleAttendeeSubmit}>
                        <label htmlFor="email">E-mail</label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          onChange={handleChange}
                        />
                        <Button type="submit">新增</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <p className="text-gray-600 text-xs">
                <span>預算：</span>
                {formatBudget(+trip.budget)}
              </p>
            </Card>
          </div>
        )}
        <input
          id="autocomplete"
          ref={autocompleteRef}
          type="text"
          placeholder="搜尋"
          className="my-4 w-[80%] p-2 border shadow-lg mx-8 xl:mx-12 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black hover:bg-slate-100"
        />

        <DragDropContext onDragEnd={onDragEnd}>
          {searchResults.length > 0 && (
            <Droppable droppableId="searchResults" type="card">
              {(provided) => (
                <div>
                  <div className="flex justify-between mx-16">
                    <h2 className="font-bold text-xl">搜尋結果</h2>
                    <div
                      className="text-blue-500 hover:text-blue-700 cursor-pointer"
                      onClick={() => {
                        setSearchResults([]);
                      }}
                    >
                      清除搜尋結果
                    </div>
                  </div>
                  <ul
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[120px]  p-2"
                  >
                    {searchResults.map((result, index) => (
                      <Dialog
                        key={index}
                        className="cursor-pointer hover:bg-gray-100 p-2 mb-2 rounded"
                      >
                        <Draggable draggableId={result.place_id} index={index}>
                          {(provided) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white border border-gray-200 mx-14 shadow-xl 
                            rounded-lg p-2 mb-2 
                            cursor-move hover:bg-slate-100"
                              onClick={() => {
                                setCenter(result.geometry.location);
                              }}
                            >
                              <DialogTrigger>
                                <h3 className="text-lg font-bold">
                                  {result.name}
                                </h3>
                              </DialogTrigger>

                              <DialogContent>
                                <h3 className="text-lg font-bold">
                                  {result.name}
                                </h3>
                                <p className="text-gray-700">
                                  地址: {result.formatted_address}
                                </p>
                                {result.price_level && (
                                  <p className="text-gray-700">
                                    價位: {result.price_level}
                                  </p>
                                )}
                                {result.types && (
                                  <p className="text-gray-700">
                                    類型: {result.types.join(', ')}
                                  </p>
                                )}
                                {result.url && (
                                  <p className="text-gray-700">
                                    <a
                                      href={result.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-500 hover:text-blue-700"
                                    >
                                      詳細資訊
                                    </a>
                                  </p>
                                )}
                                <Button onClick={() => addPlaceToTrip(result)}>
                                  新增到行程
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleNearbySearch(map, result)
                                  }
                                >
                                  搜尋鄰近景點
                                </Button>
                              </DialogContent>
                            </li>
                          )}
                        </Draggable>
                      </Dialog>
                    ))}
                    {provided.placeholder}
                  </ul>
                </div>
              )}
            </Droppable>
          )}

          {nearbyResults.length > 0 && (
            <Droppable droppableId="nearbyResults" type="card">
              {(provided) => (
                <div>
                  <div className="flex justify-between mx-16">
                    <h2 className="font-bold text-xl">附近地點</h2>
                    <div
                      className="text-blue-500 hover:text-blue-700 cursor-pointer"
                      onClick={() => {
                        setNearbyResults([]);
                      }}
                    >
                      清除附近地點
                    </div>
                  </div>
                  <ul
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[120px] grid grid-cols-2 gap-x-2 mx-16"
                  >
                    {nearbyResults.map((result, index) => (
                      <Dialog
                        key={index}
                        className="cursor-pointer hover:bg-gray-100 p-2 mb-2 rounded"
                      >
                        <Draggable draggableId={result.place_id} index={index}>
                          {(provided) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white border border-gray-200 shadow-xl 
                              rounded-lg p-2 mb-2 
                              cursor-move hover:bg-slate-100"
                              onClick={() => {
                                setCenter(result.geometry.location);
                              }}
                            >
                              <DialogTrigger>
                                <h3 className="mark-on-map font-bold text-left">
                                  {result.name}
                                </h3>
                              </DialogTrigger>

                              <DialogContent>
                                <h3 className="text-lg font-bold">
                                  {result.name}
                                </h3>
                                <p className="text-gray-700">
                                  地址: {result.vicinity}
                                </p>
                                {result.price_level && (
                                  <p className="text-gray-700">
                                    價位: {result.price_level}
                                  </p>
                                )}
                                {result.rating && (
                                  <p className="text-gray-700">
                                    評分: {result.rating}
                                  </p>
                                )}
                                {result.user_ratings_total && (
                                  <p className="text-gray-700">
                                    評論數: {result.user_ratings_total}
                                  </p>
                                )}
                                {result.types && (
                                  <p className="text-gray-700">
                                    類型: {result.types.join(', ')}
                                  </p>
                                )}
                                <Button onClick={() => addPlaceToTrip(result)}>
                                  新增到行程
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleNearbySearch(map, result)
                                  }
                                >
                                  搜尋鄰近景點
                                </Button>
                              </DialogContent>
                            </li>
                          )}
                        </Draggable>
                      </Dialog>
                    ))}
                    {provided.placeholder}
                  </ul>
                </div>
              )}
            </Droppable>
          )}
          <div className="flex justify-between mx-16 mt-10">
            <h2 className="text-xl font-bold">目前景點</h2>
            {isAttendee && (
              <Button className="bg-orange-200 text-black" onClick={addNewDay}>
                新增一天
              </Button>
            )}
          </div>
          <div className="grid">{boards}</div>
        </DragDropContext>
        <Comment />
      </div>

      <div
        ref={mapRef}
        id="map"
        className="w-1/2 xl:w-2/3 border-gray-300 fixed bottom-0 right-0"
      />
    </div>
  );
};

export default PlacesMaps;
