import { useRef, useState, useEffect, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { formatDate, formatBudget, debounce } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from './ui/button';
import useMapApi from '@/hooks/useMapApi';
import Comment from './Comment';
import { Card, CardTitle } from './ui/card';
import AddAttendees from './AddAttendees';
import DownloadPDF from './DownloadPDF';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { CalendarRange, List, Map } from 'lucide-react';
import SplitPane from '@rexxars/react-split-pane';
import SearchResults from './SearchResults';
import NearbySearchResults from './NearbySearchResults';
import TripOptionButton from './TripOptionButton';
import Checklist from './Checklist';
import OptimizeRouteButton from './OptimizeRoute';
import Chat from './Chat';
import { io } from 'socket.io-client';

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
  const [isMapVisible, setIsMapVisible] = useState(true);
  const [geometry, setGeometry] = useState(null);
  const [polylineInstance, setPolylineInstance] = useState(null);
  const [, setAutocomplete] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [clickLocation, setClickLocation] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [nearbyResults, setNearbyResults] = useState([]);
  const [lockedPlaces, setLockedPlaces] = useState([]);
  const [distance, setDistance] = useState(0);
  const [size, setSize] = useState(390);
  const [dragging, setDragging] = useState(false);
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const autocompleteRef = useRef(null);
  const [attendeeRole, setAttendeeRole] = useState(null);
  const TRIP_API_URL = `${
    import.meta.env.VITE_BACKEND_HOST
  }api/v1/trips/${tripId}`;
  const Authorization = `Bearer ${localStorage.getItem('accessToken')}`;

  useEffect(() => {
    const fetchTripInfo = async () => {
      try {
        const response = await fetch(TRIP_API_URL, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (response.status === 400) {
          toast.error('您無權限瀏覽此行程，請登入或聯繫行程發起人');
          navigate(`/user/trips`);
          return;
        }

        const json = await response.json();
        setTrip(json.data[0]);

        await fetch(`${TRIP_API_URL}/clicks`, {
          method: 'POST',
        });
      } catch (error) {
        console.log(error);
      }
    };

    fetchTripInfo();
    fetchAttendees();

    return () => {
      if (!socket) return;
      socket.off('newEditLock');
      socket.off('newEditUnlock');
      socket.disconnect();
    };
  }, []);

  const fetchAttendees = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`${TRIP_API_URL}/attendees`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      const json = await response.json();
      const { attendees } = json;
      setAttendees(attendees);
      const attendee = attendees.find((attendee) => +attendee.id === user.id);
      setAttendeeRole(attendee?.role);

      if (attendee?.role !== 'attendee') return;

      const socket = io(import.meta.env.VITE_BACKEND_HOST, {
        auth: {
          token: localStorage.getItem('accessToken'),
        },
      });

      if (!socket) return;

      setSocket(socket);
      socket.emit('newUserInRoom', { name: user.name, room: tripId });
      socket.on('getRoomLocks', (payload) => {
        setLockedPlaces(
          payload.locks.map((lock) => ({
            name: lock.name,
            placeId: lock.placeId,
          })),
        );
      });
      socket.emit('getRoomLocks', { room: tripId });
      socket.on('newEditLock', ({ name, userId, placeId }) => {
        setLockedPlaces((prev) => [...prev, { name, userId, placeId }]);
      });
      socket.on('newEditUnlock', ({ placeId }) => {
        setLockedPlaces((prev) =>
          prev.filter((lock) => lock.placeId !== placeId),
        );
      });
      socket.on('userDisconnected', (payload) => {
        setLockedPlaces((prev) =>
          prev.filter((lock) => lock.userId !== payload.userId),
        );
      });
      socket.on('addNewPlaceToTrip', () => fetchPlaces());
    } catch (error) {
      console.log(error);
    }
  }, []);

  const fetchPlaces = async () => {
    try {
      const response = await fetch(`${TRIP_API_URL}/places`, {
        headers: {
          Authorization,
        },
      });

      if (response.status === 401) {
        toast.error('您無權限瀏覽此行程');
        navigate(`/users/${user.id}/trips`);
        return;
      }

      const json = await response.json();
      if (json.error) throw new Error(json.error);

      const maxDayNumber = json.maxDayNumber;
      if (maxDayNumber <= 0) {
        setData([{ dayNumber: 1, places: [] }]);
        return;
      }

      setSpending(json.spending);
      setData(json.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSize('100%');
      setIsMapVisible(false);
    } else {
      setSize(550);
    }

    const handleResize = debounce(() => {
      if (window.innerWidth <= 768) {
        setSize('100%');
        setIsMapVisible(false);
      } else setSize(550);
    }, 150);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const loader = new Loader({
    apiKey: import.meta.env.VITE_MAPS_API,
    version: 'weekly',
  });

  useEffect(() => {
    if (!Marker) return;
    const initMap = async () => {
      const [mapsLib, placesLib, geometryLib] = await Promise.all([
        loader.importLibrary('maps'),
        loader.importLibrary('places'),
        loader.importLibrary('geometry'),
      ]);

      const map = await new mapsLib.Map(mapRef.current, {
        center: { lat: 25.085, lng: 121.39 },
        zoom: 13,
      });

      const polyline = new mapsLib.Polyline({
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 3,
      });

      polyline.setMap(map);

      const autocomplete = new placesLib.Autocomplete(autocompleteRef.current, {
        types: ['establishment'],
      });

      map.addListener('bounds_changed', () => {
        autocomplete.setBounds(map.getBounds());
      });

      const service = new placesLib.PlacesService(map);

      map.addListener('click', (location) => {
        const { placeId, latLng } = location;
        setClickLocation(latLng.toJSON());

        if (!placeId) return;
        service.getDetails({ placeId }, (place, status) => {
          if (status === 'OK') setSearchResults((prev) => [...prev, place]);
        });
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        const { viewport, location } = place.geometry;

        viewport
          ? map.fitBounds(place.geometry.viewport)
          : map.setCenter(location);

        new Marker({
          map: map,
          position: place.geometry.location,
        });

        setSearchResults((prev) => [...prev, place]);
      });

      setMap(map);
      setPolylineInstance(polyline);
      setService(service);
      setAutocomplete(autocomplete);
      setGeometry(geometryLib);

      if (!socket) return;
      socket.on('getMarker', (data) => {
        toast.info('有人送來地點');
        new Marker({
          position: data.latLng,
          map: map,
        });
        map.setCenter(data?.latLng || data.geometry.location);
      });
    };

    initMap();

    return () => {
      if (!socket) return;
      socket.off('getMarker');
      socket.off('addNewPlaceToTrip');
    };
  }, [Marker]);

  const fetchRoute = async () => {
    const requestBody = {
      origin: {
        location: {
          latLng: {
            latitude: data[0]?.places[0]?.latitude,
            longitude: data[0]?.places[0]?.longitude,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: data.slice(-1)[0]?.places.slice(-1)[0]?.latitude,
            longitude: data.slice(-1)[0]?.places.slice(-1)[0]?.longitude,
          },
        },
      },
      intermediates: [
        data
          .flatMap((day) => day.places)
          .slice(1, -1)
          .map((place) => ({
            location: {
              latLng: {
                latitude: place.latitude,
                longitude: place.longitude,
              },
            },
          })),
      ],
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_UNAWARE',
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls: false,
        avoidHighways: false,
        avoidFerries: false,
      },
      languageCode: 'zh-TW',
      units: 'METRIC',
    };

    fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': import.meta.env.VITE_MAPS_API,
        'X-Goog-FieldMask':
          'routes.distanceMeters,routes.polyline.encodedPolyline',
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) throw new Error(data.error.message);
        console.log(data);
        const route = data.routes[0];
        const { distanceMeters, polyline } = route;
        setDistance(distanceMeters);
        polylineInstance.setPath(
          geometry.encoding.decodePath(polyline.encodedPolyline),
        );
      })
      .catch((error) => console.error('Error:', error));
  };

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

    socket &&
      socket.emit('getMarker', {
        room: tripId,
        latLng: { lat: clickLocation.lat, lng: clickLocation.lng },
      });
  };

  const setCenter = (latLng) => map.setCenter(latLng);
  const handleNearbySearch = (map, place) => {
    const request = {
      location: place.geometry.location,
      radius: '3000',
      types: ['restaurant', 'establishment'],
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
      fetchPlaces();
      toast.success('已新增景點');
      socket && socket.emit('addNewPlaceToTrip', { room: tripId });
    }
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
    if (lockedPlaces.find((lock) => lock.placeId === draggableId)) {
      toast.warning(
        `此景點正在被${
          lockedPlaces.find((lock) => lock.placeId === draggableId).name
        }編輯中`,
      );
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

    socket &&
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
        updateItemOrders(destList.places);
      }

      socket &&
        socket.emit('newEditUnlock', {
          room: tripId,
          placeId: source.droppableId,
        });
    }
  };

  const updateItemOrders = async (list) => {
    try {
      const newOrder = list.map((place) => ({
        order: place.order,
        id: place.id,
      }));

      const response = await fetch(`${TRIP_API_URL}/places/orders`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization,
        },
        body: JSON.stringify(newOrder),
      });

      const json = await response.json();

      if (json.error) {
        toast(json.error);
        return;
      }

      await fetchPlaces();

      if (socket) socket.emit('addNewPlaceToTrip', { room: tripId });
    } catch (error) {
      console.error('Error updating item orders:', error);
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
      if (!response.ok) {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemoveAttendee = (removedAttendeeId) => {
    setAttendees(
      attendees.filter((attendee) => attendee.id !== removedAttendeeId),
    );
  };

  return (
    <SplitPane
      size={size}
      onChange={(size) => {
        setSize(size);
      }}
      className="split pt-16"
      minSize={390}
      maxSize={-1}
    >
      <div className="overflow-auto h-full">
        <div className="flex flex-col">
          {trip && (
            <div className="flex flex-col">
              <img
                src={trip.photo}
                className="object-cover w-full h-[300px]"
              ></img>
              <Card className="bg-white border-none shadow-xl p-4 mx-16 -mt-32">
                <CardTitle className="text-3xl">{trip.name}</CardTitle>
                <p className="text-gray-600 mb-4 italic">{trip.destination}</p>
                <div className="text-gray-600 mb-4 flex justify-between">
                  <div className="flex items-center gap-1">
                    <CalendarRange />
                    <span className="font-semibold text-sm">
                      {formatDate(trip.start_date)}
                    </span>{' '}
                    ~{' '}
                    <span className="font-semibold text-sm">
                      {formatDate(trip.end_date)}
                    </span>
                  </div>
                </div>
                <div className="flex py-2 justify-between">
                  <div className="flex gap-4">
                    <TooltipProvider delayDuration={300}>
                      <SaveTrip
                        tripId={tripId}
                        Authorization={Authorization}
                        user={user}
                      />

                      <CopyTrip TRIP_API_URL={TRIP_API_URL} />
                      <DownloadPDF tripId={tripId} />
                      {attendees && attendeeRole === 'attendee' && (
                        <AddAttendees
                          tripId={tripId}
                          attendees={attendees}
                          tripCreator={trip.user_id}
                          onAttendeeAdd={fetchAttendees}
                          onAttendeeRemove={handleRemoveAttendee}
                        />
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className="hover:text-blue-500"
                            onClick={() => {
                              setIsMapVisible(!isMapVisible);
                              if (!isMapVisible && window.innerWidth <= 768) {
                                setSize(0);
                                return;
                              }

                              if (!isMapVisible) {
                                setSize(550);
                                return;
                              }

                              setSize(window.innerWidth);
                            }}
                          >
                            <Map />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>放大地圖</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {attendees && attendeeRole === 'attendee' && (
                    <TripOptionButton
                      trip={trip}
                      className="bg-white hover:bg-slate-50 p-2"
                    />
                  )}
                </div>
                <div className="text-sm">
                  <div className="text-gray-600">
                    預算：{formatBudget(trip.budget)}
                  </div>

                  {spending > 0 && (
                    <div className="text-gray-600">
                      總開銷：{formatBudget(spending)}
                    </div>
                  )}
                  {spending > 0 && (
                    <div className="text-gray-600">
                      剩餘：{formatBudget(+trip.budget - spending)}
                    </div>
                  )}
                </div>
              </Card>
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
            <SearchResults
              map={map}
              searchResults={searchResults}
              setSearchResults={setSearchResults}
              setCenter={setCenter}
              handleNearbySearch={handleNearbySearch}
              addPlaceToTrip={addPlaceToTrip}
              setClickLocation={setClickLocation}
            />
            <NearbySearchResults
              map={map}
              nearbyResults={nearbyResults}
              setNearbyResults={setNearbyResults}
              setCenter={setCenter}
              handleNearbySearch={handleNearbySearch}
              addPlaceToTrip={addPlaceToTrip}
              setClickLocation={setClickLocation}
              size={size}
            />
            {<Checklist user={user} attendeeRole={attendeeRole} />}

            <div className="flex justify-between mx-16 mt-10">
              <h2 className="text-2xl font-bold pb-2">目前景點</h2>
              {attendeeRole === 'attendee' && (
                <OptimizeRouteButton
                  tripId={tripId}
                  variant="secondary"
                  onSuccess={() => {
                    fetchPlaces();
                    socket &&
                      socket.emit('addNewPlaceToTrip', { room: tripId });
                  }}
                />
              )}
            </div>
            {distance > 0 && (
              <div className="mx-16 mb-4">
                <div className="flex gap-2">
                  <div className="text-gray-600">總距離：</div>
                  <div className="text-gray-600">{distance / 1000} 公里</div>
                </div>
              </div>
            )}

            <div
              className={`grid ${
                size >= 1200
                  ? 'grid-cols-3'
                  : size >= 800
                  ? 'grid-cols-2'
                  : 'grid-cols-1'
              }`}
            >
              {data.map((day) => (
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
                            <div>
                              <h2 className="text-xl font-bold">
                                第 {day.dayNumber} 天
                              </h2>
                              <span className="text-gray-600">
                                {day.places.length} 個地點
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            {day.places.length > 0
                              ? day.places.map((place, index) => (
                                  <PlaceItem
                                    place={place}
                                    socket={socket}
                                    index={index}
                                    tripId={tripId}
                                    user={user}
                                    attendeeRole={attendeeRole}
                                    setClickLocation={setClickLocation}
                                    key={place.id}
                                    updateData={updateData}
                                    lockedPlace={lockedPlaces}
                                    centerToTheMarker={centerToTheMarker}
                                    fetchPlaces={fetchPlaces}
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
                                    <div className="text-lg font-bold text-gray-800">
                                      點地圖後或搜尋後
                                    </div>
                                    <div className="text-lg font-bold text-gray-800">
                                      請將景點拖到此處
                                    </div>
                                  </div>
                                )}
                            {provided.placeholder}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </ul>
                  )}
                </Droppable>
              ))}
            </div>
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

      <div className="h-full">
        <div className="relative">
          <button
            className="absolute top-[10px] left-[185px] text-lg text-gray-700 rounded-none bg-white shadow-md  hover:bg-gray-200 z-10 py-2 px-4"
            onClick={() => {
              setIsMapVisible(!isMapVisible);
              setSize(window.innerWidth);
            }}
          >
            <List />
          </button>
          {attendeeRole === 'attendee' && (
            <Button
              onClick={addMarker}
              className="absolute top-[10px] left-[240px] text-lg text-gray-700 rounded-none bg-white shadow-md  hover:bg-gray-200 z-10 py-2 px-4"
            >
              傳給同伴
            </Button>
          )}
          {attendeeRole === 'attendee' && (
            <Button
              className="absolute top-[10px] left-[340px] text-lg text-gray-700 rounded-none bg-white shadow-md  hover:bg-gray-200 z-10 py-2 px-4"
              onClick={fetchRoute}
            >
              路線
            </Button>
          )}

          <Chat attendeeRole={attendeeRole} socket={socket} />
        </div>
        <div ref={mapRef} style={{ height: '100vh' }} id="map" />
      </div>
    </SplitPane>
  );
};

export default PlacesMaps;
