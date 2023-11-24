import { useState, useEffect, useRef, useMemo } from 'react';
import useMapApi from '@/hooks/useMapApi';

const Autocomplete = ({ id, style, value, onChange, name, className }) => {
  const [autocomplete, setAutocomplete] = useState(null);
  const inputRef = useRef(null);
  const documentElement = inputRef?.current ?? document.getElementById(id);
  const { PlacesLibrary } = useMapApi();
  const Autocomplete = PlacesLibrary?.Autocomplete;

  useEffect(() => {
    if (Autocomplete && documentElement) {
      console.log('autocomplete loaded');
      setAutocomplete(new Autocomplete(documentElement, {}));
    }
  }, [Autocomplete, setAutocomplete, documentElement]);

  return (
    <input
      id={id}
      ref={inputRef}
      style={style}
      value={value}
      name={name}
      onChange={onChange}
      className={className}
    ></input>
  );
};

export default Autocomplete;
