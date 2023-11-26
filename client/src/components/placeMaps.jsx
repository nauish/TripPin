import { useState } from 'react';
import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Loader } from '@googlemaps/js-api-loader';
import { useParams } from 'react-router-dom';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { toast } from 'react-toastify';

function reorder(list, startIndex, end) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(end, 0, removed);

  return result;
}

const PlacesMaps = () => {
  const [data, setData] = useState([]);
  const [map, setMap] = useState(null);
  const [nearbyResults, setNearbyResults] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const socket = useSocket();
  const params = useParams();
  const { tripId } = params;

  socket.on('addNewPlaceToTrip', () => {
    console.log('new place added');
    fetch(`${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${tripId}/places`)
      .then((response) => response.json())
      .then((json) => {
        setData(json.data);
      });
  });

  const centerToTheMarker = (latitude, longitude) => {
    map.setCenter({ lat: latitude, lng: longitude });
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
      socket.emit('addNewPlaceToTrip', { room: +tripId });
    }
  };

  const fetchData = () => {
    fetch(`${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${tripId}/places`)
      .then((response) => response.json())
      .then((json) => {
        setData(json.data);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    socket.emit('joinRoom', { name: user.name, room: +tripId });
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
      const { Autocomplete, PlacesService } = placesLib;

      socket.on('getMarker', (data) => {
        new Marker({
          position: data.latLng,
          map: map,
        });
      });

      const createMap = () => {
        return new Map(document.getElementById('map'), {
          center: { lat: 25.085, lng: 121.39 },
          zoom: 17,
        });
      };

      const addMarkerAndDetail = (place, map) => {
        new Marker({
          position: place.latLng,
          map: map,
        });

        socket.emit('getMarker', { room: +tripId, latLng: place.latLng });

        const service = new PlacesService(map);
        service.getDetails({ placeId: place.placeId }, (result, status) => {
          if (status === 'OK') console.log(result);
        });
      };

      const addMapClick = (map) => {
        let clickLocation = null;
        map.addListener('click', (location) => (clickLocation = location));

        document
          .getElementById('mark-on-map')
          .addEventListener('click', () =>
            addMarkerAndDetail(clickLocation, map),
          );
      };

      const handleNearbySearch = (results, status, map) => {
        // to do: setState and render results in another component
        console.log(results);
        setNearbyResults(results);

        const createMarker = (place) => {
          new Marker({
            map: map,
            position: place.geometry.location,
          });
        };

        if (status === 'OK') {
          results.forEach((result) => {
            createMarker(result);
          });
        }
      };

      const handlePlaceChanged = (autocomplete, map) => {
        const resultMarker = new Marker({
          map: map,
        });

        const place = autocomplete.getPlace();
        console.log(place);

        if (place.geometry.viewport) map.fitBounds(place.geometry.viewport);
        else map.panTo(place.geometry.location);

        resultMarker.setPosition(place.geometry.location);

        const request = {
          location: place.geometry.location,
          radius: '500',
        };
        const service = new PlacesService(map);
        service.nearbySearch(request, (results, status) =>
          handleNearbySearch(results, status, map),
        );
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

  const boards = data.map((day) => (
    <div
      key={day.dayNumber}
      className="bg-gray-100 border border-gray-300 shadow-lg rounded-lg m-4 p-4 w-80 h-auto flex-shrink-0"
    >
      <h1 className="text-3xl font-bold mb-4">第 {day.dayNumber} 天</h1>
      <Droppable droppableId={day.dayNumber.toString()} type="card">
        {(provided) => (
          <ul
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="list-disc pl-4 overflow-y-auto"
          >
            {day.places.map((place, index) => (
              <Draggable key={place.id} draggableId={place.id} index={index}>
                {(provided) => (
                  <li
                    className="mb-2 bg-white border border-gray-200 shadow-sm rounded-sm p-2 cursor-move flex justify-between"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() =>
                      centerToTheMarker(place.latitude, place.longitude)
                    }
                  >
                    <div>
                      <h3 className="text-lg font-medium">{place.name}</h3>
                      <p className="text-gray-600 mb-1">{place.type}</p>
                    </div>
                    <button
                      onClick={() => deletePlace(place.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </li>
                )}
              </Draggable>
            ))}
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
      socket.emit('addPlaceToTrip', { room: +tripId });
      fetchData();
    }
  };

  const onDragEnd = (result) => {
    const { destination, source, type } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      destination.index === source.index
    )
      return;
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
      <button
        id="mark-on-map"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        將目前點選標記起來傳給同伴
      </button>

      <ul className="list-disc pl-4">
        {nearbyResults.map((result, index) => (
          <li
            key={index}
            onClick={() => addPlaceToTrip(result)}
            className="cursor-pointer hover:bg-gray-100 p-2 mb-2 rounded"
          >
            <h3 className="text-lg font-bold">{result.name}</h3>
            <p className="text-gray-700">地址: {result.vicinity}</p>
            {result.rating && (
              <p className="text-gray-700">評分: {result.rating}</p>
            )}
            {result.types && (
              <p className="text-gray-700">類型: {result.types.join(', ')}</p>
            )}
          </li>
        ))}
      </ul>
      <DragDropContext onDragEnd={onDragEnd}>
        <h1 className="text-3xl font-bold mb-4">目前景點</h1>
        <div className="flex">{boards}</div>
      </DragDropContext>
    </div>
  );
};

export default PlacesMaps;
