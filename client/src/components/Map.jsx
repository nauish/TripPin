import { useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const Map = () => {
  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_MAPS_API,
      version: 'weekly',
    });

    const initMap = async () => {
      const { Map } = await loader.importLibrary('maps');
      const { Marker } = await loader.importLibrary('marker');

      let map = new Map(document.getElementById('map'), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
      });

      new Marker({ position: map.getCenter(), map });
    };

    initMap();
  }, []);

  return (
    <div>
      <div id="map" style={{ height: '400px', width: '100%' }}></div>
    </div>
  );
};

export default Map;
