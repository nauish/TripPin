import { useState } from 'react';
import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Loader } from '@googlemaps/js-api-loader';
import { useParams } from 'react-router-dom';

const Map = () => {
  const params = useParams();
  const [nearbyResults, setNearbyResults] = useState([]);
  const { tripId } = params;
  const socket = useSocket();
  const user = JSON.parse(localStorage.getItem('user'));

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
    if (!response.ok) console.error('Network response was not ok');
  };

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

      const { Map, InfoWindow } = mapsLib;
      const { Marker } = markerLib;
      const { Autocomplete, PlacesService } = placesLib;

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

        socket.on('getMarker', (data) => {
          console.log(data);
          const { latLng } = data;
          new Marker({
            position: latLng,
            map: map,
          });
        });

        const service = new PlacesService(map);
        service.getDetails({ placeId: place.placeId }, (result, status) => {
          if (status === 'OK') console.log(result);
        });
        socket.emit('getMarker', { room: +tripId, latLng: place.latLng });
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

      const handleMarkerClick = (
        place,
        nearbyInfoWindow,
        map,
        nearbyMarker,
      ) => {
        const nearbyInfoWindowContent = `
          <div>
            <h2>${place.name}</h3>
            <p>評分: ${place.rating}</p>
          </div>
        `;

        nearbyInfoWindow.setContent(nearbyInfoWindowContent);
        nearbyInfoWindow.open(map, nearbyMarker);
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

      const handleNearbySearch = (results, status, map) => {
        // to do: setState and render results in another component
        console.log(results);
        setNearbyResults(results);

        const createMarker = (place) => {
          const nearbyMarker = new Marker({
            map: map,
            position: place.geometry.location,
          });

          let nearbyInfoWindow = new InfoWindow();
          nearbyMarker.addListener('click', () =>
            handleMarkerClick(place, nearbyInfoWindow, map, nearbyMarker),
          );
        };

        if (status === 'OK') {
          results.forEach((result) => createMarker(result));
        }
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
      addMapClick(map);
      createAutocomplete(map);
    };

    initMap();
  }, []);

  return (
    <div>
      <input
        id="autocomplete"
        type="text"
        placeholder="Search"
        style={{ width: '100%' }}
      />
      <div id="map" style={{ height: '400px', width: '100%' }}></div>
      <button id="mark-on-map">將目前點擊處設標記</button>
      <ul>
        {nearbyResults.map((result, index) => (
          <li key={index} onClick={() => addPlaceToTrip(result)}>
            {result.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Map;
