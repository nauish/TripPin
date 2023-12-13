import { useRef, useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { Loader } from '@googlemaps/js-api-loader';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { FaRegCalendarDays } from 'react-icons/fa6';
import { formatDate, formatBudget } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import { Button } from './ui/button';
import useMapApi from '@/hooks/useMapApi';
import Comment from './Comment';
import { Card, CardTitle } from './ui/card';
import AddAttendees from './AddAttendees';
import DownloadPDF from './DownloadPDF';
import Split from 'react-split';
import SaveTrip from './SaveTrip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import CopyTrip from './CopyTrip';
import PlaceItem from './PlaceItem';
import { Player } from '@lottiefiles/react-lottie-player';
import { TooltipProvider } from './ui/tooltip';
import ShareTrip from './ShareTrip';
// import Checklist from './Checklist';

const reorder = (list, startIndex, end) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(end, 0, removed);

  return result;
};

const PlacesMaps = () => {
  const { MarkerLibrary } = useMapApi();
  const { Marker } = MarkerLibrary;
  const [spending, setSpending] = useState(0);
  const mapRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const [data, setData] = useState([]);
  const [trip, setTrip] = useState(null);
  const [map, setMap] = useState(null);
  const [service, setService] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [clickLocation, setClickLocation] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [nearbyResults, setNearbyResults] = useState([]);
  const [lockedPlaces, setLockedPlaces] = useState([]);
  const [dragging, setDragging] = useState(false);
  const { tripId } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  const autocompleteRef = useRef(null);
  const [attendeeRole, SetAttendeeRole] = useState(null);
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
      .then((json) => {
        setTrip(json.data[0]);
      })
      .catch((error) => {
        console.log(error);
      });

    fetchAttendees();
  }, []);

  const fetchAttendees = useCallback(() => {
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
        setAttendees(attendees);
        const attendee = attendees.find((attendee) => +attendee.id === user.id);
        SetAttendeeRole(attendee?.role);
        if (attendee?.role === 'attendee') {
          socket.emit('newUserInRoom', { name: user.name, room: tripId });
          socket.on('editLocks', (payload) => {
            setLockedPlaces(payload.locks);
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });

    return () => {
      socket.off('editLocks');
    };
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
        if (json.error) throw new Error(json.error);

        const maxDayNumber = json.maxDayNumber;

        if (maxDayNumber <= 0) {
          setData([{ dayNumber: 1, places: [] }]);
          return;
        }
        setSpending(json.spending);
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
        loader,
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

      socket.on('addNewPlaceToTrip', () => {
        fetchPlaces();
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
      socket.off('getMarker');
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
    map.panTo({ lat: latitude, lng: longitude });
    map.setZoom(15);
  };

  const addPlaceToTrip = async (place) => {
    const response = await fetch(`${TRIP_API_URL}/places`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

  const onDragUpdate = () => {
    setDragging(true);
  };

  const onDragEnd = (result) => {
    setDragging(false);
    const { destination, source, type, draggableId } = result;
    if (!destination) return;
    if (lockedPlaces.includes(draggableId)) {
      toast.warning('此景點正在被編輯，請稍後再試');
      return;
    }

    if (attendeeRole !== 'attendee') {
      toast.warning('您僅能查看此行程，複製這份行程以編輯');
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      destination.index === source.index
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
        socket.emit('addNewPlaceToTrip', { room: tripId });
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
        updateItemOrders(destList.places);
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
      });
  };

  const updateData = async (data, placeId) => {
    try {
      console.log(data);
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
        return true;
      } else {
        const json = await response.json();
        console.log(json);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const boards = data.map((day) => (
    <Droppable
      droppableId={day.dayNumber.toString()}
      type="card"
      key={day.dayNumber}
    >
      {(provided) => (
        <ul ref={provided.innerRef} {...provided.droppableProps}>
          <Accordion
            type="single"
            collapsible
            className="bg-white border-gray-300 px-16"
            defaultValue={`item-${day.dayNumber}`}
          >
            <AccordionItem value={`item-${day.dayNumber}`}>
              <AccordionTrigger>
                <h2 className="text-xl font-bold mb-2">
                  第 {day.dayNumber} 天
                </h2>
                <span className="text-gray-600 ml-auto">
                  {day.places.length} 個地點
                </span>
              </AccordionTrigger>
              <AccordionContent>
                {day.places.length > 0
                  ? day.places.map((place, index) => (
                      <PlaceItem
                        place={place}
                        index={index}
                        tripId={tripId}
                        user={user}
                        attendeeRole={attendeeRole}
                        setClickLocation={setClickLocation}
                        key={place.id}
                        updateData={updateData}
                        lockedPlace={lockedPlaces}
                        centerToTheMarker={centerToTheMarker}
                      />
                    ))
                  : !dragging &&
                    attendeeRole === 'attendee' && (
                      <div className="flex flex-col justify-center items-center">
                        <Player
                          autoplay
                          loop
                          src="https://lottie.host/91a02969-0942-4a3c-b0c1-8c3dd0070544/mSCAYQ8pDk.json"
                          className="w-1/2 mx-auto"
                        ></Player>
                        <h2 className="text-xl font-bold text-gray-800">
                          請將景點拖到此處
                        </h2>
                      </div>
                    )}
                {provided.placeholder}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ul>
      )}
    </Droppable>
  ));

  const handleAddAttendee = () => {
    fetchAttendees();
  };

  const handleRemoveAttendee = (removedAttendeeId) => {
    setAttendees(
      attendees.filter((attendee) => attendee.id !== removedAttendeeId),
    );
  };

  return (
    <Split
      className="split"
      gutterSize={5}
      minSize={[500, 0]}
      sizes={[40, 60]}
      expandToMin={true}
    >
      <div className="overflow-auto h-[94vh]">
        <div className="flex flex-col">
          {trip && (
            <div>
              <div className="flex flex-col">
                <img
                  src={trip.photo}
                  className="object-cover w-full h-[300px]"
                ></img>
                <Card className="bg-white border-none shadow-xl p-4 mx-16 -mt-32">
                  <CardTitle className="text-3xl">{trip.name}</CardTitle>
                  <p className="text-gray-600 mb-4 italic">
                    {trip.destination}
                  </p>
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
                      <TooltipProvider delayDuration={300}>
                        <SaveTrip
                          tripId={tripId}
                          Authorization={Authorization}
                          user={user}
                        />
                        <CopyTrip TRIP_API_URL={TRIP_API_URL} />
                        <DownloadPDF tripId={tripId} />
                        <AddAttendees
                          tripId={tripId}
                          attendees={attendees}
                          tripCreator={trip.user_id}
                          onAttendeeAdd={handleAddAttendee}
                          onAttendeeRemove={handleRemoveAttendee}
                        />
                        <ShareTrip tripId={tripId} />
                      </TooltipProvider>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-600">
                      預算：{formatBudget(+trip.budget)}
                      {spending && spending > 0 && (
                        <div className="text-gray-600">
                          總開銷：{formatBudget(spending)}
                          <span className="mx-1 text-gray-400">-</span>
                          剩餘：{formatBudget(+trip.budget - spending)}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          <input
            id="autocomplete"
            ref={autocompleteRef}
            type="text"
            placeholder="搜尋"
            className="my-4 mx-16 p-2 border shadow-lg  border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black hover:bg-slate-100"
          />

          <DragDropContext onDragUpdate={onDragUpdate} onDragEnd={onDragEnd}>
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
                          <Draggable
                            draggableId={result.place_id}
                            index={index}
                          >
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
                                  <Button
                                    onClick={() => addPlaceToTrip(result)}
                                  >
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
                          <Draggable
                            draggableId={result.place_id}
                            index={index}
                          >
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
                                  <Button
                                    onClick={() => addPlaceToTrip(result)}
                                  >
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
            {/* <Checklist user={user} /> */}

            <div className="flex justify-between mx-16 mt-10">
              <h2 className="text-3xl font-bold pb-4">目前景點</h2>
            </div>
            <div className="grid">{boards}</div>
          </DragDropContext>

          {attendeeRole === 'attendee' && (
            <Button
              className="bg-orange-200 hover:bg-orange-400 text-black mx-16"
              onClick={addNewDay}
            >
              新增一天
            </Button>
          )}

          <Comment />
        </div>
      </div>

      <div>
        <div className="relative">
          {attendeeRole === 'attendee' && (
            <Button
              onClick={addMarker}
              className="absolute top-[10px] left-[180px] text-lg text-gray-700 rounded-none bg-white shadow-md  hover:bg-gray-200 z-10 py-2 px-4"
            >
              將標記傳給同伴
            </Button>
          )}
        </div>
        <div ref={mapRef} className="h-full" id="map" />
      </div>
    </Split>
  );
};

export default PlacesMaps;
