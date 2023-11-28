import { useState } from 'react';
import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Loader } from '@googlemaps/js-api-loader';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
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

function reorder(list, startIndex, end) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(end, 0, removed);

  return result;
}

const PlacesMaps = () => {
  const [data, setData] = useState([]);
  const { PlacesLibrary, MarkerLibrary } = useMapApi();
  const PlacesService = PlacesLibrary?.PlacesService;
  const Marker = MarkerLibrary?.Marker;
  const [map, setMap] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [nearbyResults, setNearbyResults] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const socket = useSocket();
  const params = useParams();
  const { tripId } = params;
  const navigate = useNavigate();
  const [attendeeEmail, setAttendeeEmail] = useState([]);
  const [editLock, setEditLock] = useState([]);

  function handleAttendeeSubmit(event) {
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
          toast(data.data.message);
          setAttendeeEmail('');
        } else {
          // Show error message
          toast('User addition failed: ' + data.error);
        }
      })
      .catch((error) => {
        // Handle network error
        alert('Network error: ' + error);
      });
  }

  const setCenter = (latLng) => {
    map.setCenter(latLng);
  };

  const handleNearbySearch = (map, place) => {
    // to do: setState and render results in another component
    const request = {
      location: place.geometry.location,
      radius: '500',
    };
    const service = new PlacesService(map);

    const callback = (results, status) => {
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
    };

    service.nearbySearch(request, callback);
  };

  const centerToTheMarker = (latitude, longitude) => {
    map.setCenter({ lat: latitude, lng: longitude });
    new Marker({
      map: map,
      position: { lat: latitude, lng: longitude },
    });
  };

  const addPlaceToTrip = async (place) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${tripId}/places`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          name: place.name,
          location: place.geometry.location,
          destination: place.vicinity,
          markerType: 'place',
          type: place.types[0],
          note: '',
          tripId,
        }),
      },
    );

    if (response.status === 200) {
      toast('已新增景點');
      socket.emit('addNewPlaceToTrip', { room: +tripId });
      fetchData();
    }
  };

  const fetchData = () => {
    fetch(`${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${tripId}/places`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
      .then((response) => {
        if (response.status === 401) {
          toast.error('您無權限瀏覽此行程');
          navigate('/auth');
        }

        return response.json();
      })
      .then((json) => {
        console.log(json);
        setData(json.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => fetchData(), []);

  useEffect(() => {
    socket.emit('joinRoom', { name: user.name, room: +tripId });
    socket.on('addNewPlaceToTrip', () => {
      fetchData();
    });
    socket.on('editLock', () => {
      console.log('hello');
    });

    const initMap = async () => {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_MAPS_API,
        version: 'weekly',
      });

      const [mapsLib, markerLib, placesLib] = await Promise.all([
        loader.importLibrary('maps'),
        loader.importLibrary('marker'),
        loader.importLibrary('places'),
      ]);

      const { Map } = mapsLib;
      const { Marker } = markerLib;
      const { Autocomplete } = placesLib;

      socket.on('getMarker', (data) => {
        toast('有人送來地點');
        new Marker({
          position: data.latLng,
          map: map,
        });
        map.setCenter(data?.latLng || data.geometry.location);
      });

      const createMap = () => {
        return new Map(document.getElementById('map'), {
          center: { lat: 25.085, lng: 121.39 },
          zoom: 17,
        });
      };

      const addMarker = (place, map) => {
        new Marker({
          position: place?.latLng || place.geometry.location,
          map: map,
        });

        socket.emit('getMarker', { room: +tripId, latLng: place.latLng });
      };

      const addMapClick = (map) => {
        let clickLocation = null;
        map.addListener('click', (location) => (clickLocation = location));

        document
          .querySelector('.mark-on-map')
          .addEventListener('click', () => addMarker(clickLocation, map));
      };

      const handlePlaceChanged = (autocomplete, map) => {
        const place = autocomplete.getPlace();
        console.log(place);

        if (place.geometry.viewport) map.fitBounds(place.geometry.viewport);
        else map.panTo(place.geometry.location);

        new Marker({
          map: map,
          position: place.geometry.location,
        });

        setSearchResults((prev) => [...prev, place]);
      };

      const createAutocomplete = (map) => {
        const autocomplete = new Autocomplete(
          document.getElementById('autocomplete'),
        );
        autocomplete.addListener('place_changed', () =>
          handlePlaceChanged(autocomplete, map),
        );
      };

      const map = createMap();
      setMap(map);
      addMapClick(map);
      createAutocomplete(map);
    };

    initMap();
  }, []);

  function PlaceItem({ place, updateData, centerToTheMarker, index }) {
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
            className="mb-2 bg-white border border-gray-200 shadow-sm rounded-sm p-2 cursor-move"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => centerToTheMarker(place.latitude, place.longitude)}
          >
            <div>
              <h3 className="text-lg font-medium">{place.name}</h3>
              <p className="text-gray-600 mb-1">{place.type}</p>
            </div>

            <Dialog>
              <DialogTrigger>
                <a
                  className="text-blue-500 hover:text-blue-700"
                  onClick={() => {
                    socket.emit('editLock', {
                      room: +tripId,
                      placeId: place.id,
                    });
                  }}
                >
                  編輯
                </a>
              </DialogTrigger>
              <DialogContent>
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
                    onClick={() => updateData(formData, place.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    儲存
                  </button>
                  <button
                    onClick={() => deletePlace(place.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    刪除
                  </button>
                </div>
              </DialogContent>
            </Dialog>
            <button
              onClick={() => deletePlace(place.id)}
              className="text-red-500 hover:text-red-700"
            >
              刪除
            </button>
          </li>
        )}
      </Draggable>
    );
  }

  function DayPlaces({ day }) {
    return (
      <ul>
        {day.places.map((place, index) => (
          <PlaceItem
            key={place.id}
            place={place}
            updateData={updateData}
            centerToTheMarker={centerToTheMarker}
            index={index}
          />
        ))}
      </ul>
    );
  }

  const addNewDay = () => {
    const maxDay = Math.max(...data.map((day) => day.dayNumber));
    if (maxDay < 0) {
      setData([{ dayNumber: 1, places: [] }]);
      return;
    }
    setData([...data, { dayNumber: maxDay + 1, places: [] }]);
  };

  const boards = data.map((day) => (
    <div
      key={day.dayNumber}
      className="bg-gray-100 border border-gray-300 shadow-lg rounded-lg m-4 p-4 w-80 h-auto"
    >
      <h1 className="text-3xl font-bold mb-4">第 {day.dayNumber} 天</h1>
      <Droppable droppableId={day.dayNumber.toString()} type="card">
        {(provided) => (
          <ul
            ref={provided.innerRef}
            {...provided.droppableProps}
            className=" pl-4 "
          >
            <DayPlaces day={day} />
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </div>
  ));

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
      socket.emit('addNewPlaceToTrip', { room: +tripId });
      toast('景點已刪除');
      fetchData();
    }
  };

  function handleChange(event) {
    setAttendeeEmail(event.target.value);
  }

  const onDragEnd = (result) => {
    console.log(result);
    const { destination, source, type } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      destination.index === source.index
    )
      return;
    if (type === 'card') {
      let newOrderedData = [...data];
      console.log(newOrderedData);
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
      setData(newOrderedData);
    }
  };

  const updateData = async (data, placeId) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_HOST
        }api/v1/trips/${tripId}/places/${placeId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify(data),
        },
      );

      if (response.status === 200) {
        socket.emit('addNewPlaceToTrip', { room: +tripId });
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

  return (
    <div className="container mx-auto p-4">
      <input
        id="autocomplete"
        type="text"
        placeholder="Search"
        className="w-full mb-4 p-2 border border-gray-300 rounded"
      />
      <div
        id="map"
        className="mb-8"
        style={{ height: '400px', width: '100%' }}
      ></div>
      <button className="mark-on-map bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        將目前點選標記起來傳給同伴
      </button>
      <Dialog>
        <DialogTrigger>
          <Button>新增參與者</Button>
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
      <ul>
        {searchResults.map((result, index) => (
          <Dialog
            key={index}
            className="cursor-pointer hover:bg-gray-100 p-2 mb-2 rounded"
          >
            <li>
              <DialogTrigger>
                <h3
                  onClick={() => {
                    setCenter(result.geometry.location);
                  }}
                  className="mark-on-map text-lg font-bold"
                >
                  {result.name}
                </h3>
              </DialogTrigger>

              <DialogContent>
                <h3 className="text-lg font-bold">{result.name}</h3>
                <p className="text-gray-700">地址: {result.vicinity}</p>
                {result.price_level && (
                  <p className="text-gray-700">價位: {result.price_level}</p>
                )}
                {result.rating && (
                  <p className="text-gray-700">評分: {result.rating}</p>
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
                <Button onClick={() => handleNearbySearch(map, result)}>
                  搜尋鄰近景點
                </Button>
              </DialogContent>
            </li>
          </Dialog>
        ))}
      </ul>

      <ul className="list-disc pl-4">
        {nearbyResults.map((result, index) => (
          <Dialog
            key={index}
            className="cursor-pointer hover:bg-gray-100 p-2 mb-2 rounded"
          >
            <li>
              <DialogTrigger>
                <h3 className="text-lg font-bold">{result.name}</h3>
              </DialogTrigger>

              <DialogContent>
                <h3 className="text-lg font-bold">{result.name}</h3>
                <p className="text-gray-700">地址: {result.vicinity}</p>
                {result.price_level && (
                  <p className="text-gray-700">價位: {result.price_level}</p>
                )}
                {result.rating && (
                  <p className="text-gray-700">評分: {result.rating}</p>
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
                <Button onClick={() => handleNearbySearch(map, result)}>
                  搜尋鄰近景點
                </Button>
              </DialogContent>
            </li>
          </Dialog>
        ))}
      </ul>
      <DragDropContext onDragEnd={onDragEnd}>
        <h1 className="text-3xl font-bold mb-4">目前景點</h1>
        <div className="flex">{boards}</div>
        <Button onClick={addNewDay}>新增一天</Button>
      </DragDropContext>
    </div>
  );
};

export default PlacesMaps;
