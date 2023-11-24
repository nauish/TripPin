import { useState, useEffect, useRef, useMemo } from 'react';
import useMapApi from '@/hooks/useMapApi';

const convertLatLon = ({ latitude, longitude }) => {
  return {
    lat: parseFloat(latitude),
    lng: parseFloat(longitude),
  };
};

const Map = ({ id, style, className, children, latitude, longitude, zoom }) => {
  const [map, setMap] = useState(null);
  const mapRef = useRef(null);
  const documentElement = mapRef?.current ?? document.getElementById(id);
  const { MapsLibrary } = useMapApi();
  const Map = MapsLibrary?.Map;

  const memoizedOptions = useMemo(() => {
    const mapOptions = {
      center: convertLatLon({
        latitude,
        longitude,
      }),
      zoom,
      id,
      minZoom: 1,
      maxZoom: 18,
    };

    return mapOptions;
  }, [id, latitude, longitude, zoom]);

  useEffect(() => {
    const validated =
      !isNaN(memoizedOptions.center.lat) && !isNaN(memoizedOptions.center.lng);
    if (Map && documentElement && validated) {
      console.log('Map is loaded');
      setMap(new Map(documentElement, memoizedOptions));
    }
  }, [Map, documentElement, memoizedOptions, setMap]);

  let cls = 'google-maps ';
  if (className) cls += ' ' + className;

  return (
    <div ref={mapRef} id={id} style={style} className={cls}>
      {children}
    </div>
  );
};

Map.defaultProps = {
  highlight: 1,
  zoom: 5,
};

export default Map;
