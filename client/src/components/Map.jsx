import { useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const Map = () => {
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

      const marker = new Marker({
        map: map,
        position: { lat: -34.397, lng: 150.644 },
      });

      autocomplete.addListener('place_changed', () => {
        marker.setVisible(false);
        const place = autocomplete.getPlace();

        console.log(place);

        if (!place.geometry) {
          alert("Autocomplete's returned place contains no geometry");
          return;
        }

        if (place.geometry.viewport) map.fitBounds(place.geometry.viewport);
        else map.panTo(place.geometry.location);

        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        const request = {
          location: place.geometry.location,
          radius: '500',
        };

        const service = new PlacesService(map);
        service.nearbySearch(request, (results, status) => {
          console.log(results);
          const createMarker = (place) => {
            const marker = new Marker({
              map: map,
              position: place.geometry.location,
            });
            marker.addListener('click', () => {
              infoWindow.setContent(place.name);
              infoWindow.open(map, marker);
            });
          };
          if (status === 'OK') {
            results.forEach((result) => {
              const place = result;
              createMarker(place);
            });
          }
        });

        let infoWindow = new InfoWindow({
          content: place.name,
        });
        infoWindow.open(map, marker);
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
    </div>
  );
};

export default Map;
