import { Loader as ApiLoader } from '@googlemaps/js-api-loader';
import { useEffect, useState } from 'react';

const Loader = new ApiLoader({
  apiKey: import.meta.env.VITE_MAPS_API,
  version: 'weekly',
});

const useLibraryLoader = (libraryName) => {
  const [library, setLibrary] = useState(undefined);

  useEffect(() => {
    let configured = false;
    async function setLib() {
      let lib;
      if (!configured) lib = await Loader.importLibrary(libraryName);

      if (lib) {
        setLibrary(lib);
        configured = true;
      }
    }
    if (!library) {
      setLib();
    }
  }, [library, libraryName]);

  return library ?? {};
};

function useMapApi() {
  const mapsLibrary = useLibraryLoader('maps');
  const placesLibrary = useLibraryLoader('places');
  const markerLibrary = useLibraryLoader('marker');

  return {
    MapsLibrary: mapsLibrary,
    PlacesLibrary: placesLibrary,
    MarkerLibrary: markerLibrary,
  };
}

export default useMapApi;
