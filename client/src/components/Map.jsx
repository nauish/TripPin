import { useState } from 'react';
import { useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { useSocket } from '../context/SocketContext';
import { useParams } from 'react-router-dom';

const Map = () => {
  const params = useParams();
  const socket = useSocket();
  const [nearbyResults, setNearbyResults] = useState([]);

  const { tripId } = params;

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
        }),
      },
    );

    const data = await response.json();
    console.log(data);
  };

  useEffect(() => {
    const initMap = async () => {
      // instantiate a loader from official Google Maps js-api-loader library
      const loader = new Loader({
        apiKey: import.meta.env.VITE_MAPS_API,
        version: 'weekly',
      });

      // import libraries in parallel instead of loading everything using load()
      const [mapsLib, markerLib, placesLib] = await Promise.all([
        loader.importLibrary('maps'),
        loader.importLibrary('marker'),
        loader.importLibrary('places'),
      ]);

      const { Map, InfoWindow } = mapsLib;
      const { Marker } = markerLib;
      const { Autocomplete, PlacesService } = placesLib;

      const map = new Map(document.getElementById('map'), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 17,
      });

      const autocomplete = new Autocomplete(
        document.getElementById('autocomplete'),
      );

      autocomplete.addListener('place_changed', () => {
        const resultMarker = new Marker({
          map: map,
        });
        resultMarker.setVisible(false);

        const place = autocomplete.getPlace();

        console.log(place);

        if (!place.geometry) {
          alert("Autocomplete's returned place contains no geometry");
          return;
        }

        if (place.geometry.viewport) map.fitBounds(place.geometry.viewport);
        else map.panTo(place.geometry.location);

        resultMarker.setPosition(place.geometry.location);
        resultMarker.setVisible(true);

        const request = {
          location: place.geometry.location,
          radius: '500',
        };

        const service = new PlacesService(map);
        service.nearbySearch(request, (results, status) => {
          console.log(results);
          setNearbyResults(results);
          const createMarker = (place) => {
            const nearbyMarker = new Marker({
              map: map,
              position: place.geometry.location,
            });

            let nearbyInfoWindow = new InfoWindow();
            nearbyMarker.addListener('click', () => {
              const nearbyInfoWindowContent = `
                <div>
                  <h2>${place.name}</h3>
                  <p>評分: ${place.rating}</p>
                </div>
              `;

              nearbyInfoWindow.setContent(nearbyInfoWindowContent);
              nearbyInfoWindow.open(map, nearbyMarker);
            });
          };
          if (status === 'OK') {
            results.forEach((result) => createMarker(result));
          }
        });
      });
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
