import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Checklist = () => {
  const { tripId } = useParams();
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${tripId}/checklists`,
    )
      .then((response) => response.json())
      .then((json) => setItems(json.data));
  }, []);

  const handleCheck = (index) => {
    const updatedItems = [...items];
    updatedItems[index].checked = !updatedItems[index].checked;
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    const newItem = { text: '', checked: false };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const handleInputChange = (index, value) => {
    const updatedItems = [...items];
    updatedItems[index].text = value;
    setItems(updatedItems);
  };

  return (
    <div>
      <button onClick={handleAddItem}>Add Item</button>
      {items.map((item, index) => (
        <div key={index}>
          <input
            type="checkbox"
            checked={item.checked}
            onChange={() => handleCheck(index)}
          />
          <input
            type="text"
            value={item.text}
            onChange={(e) => handleInputChange(index, e.target.value)}
          />
          <button onClick={() => handleRemoveItem(index)}>Remove</button>
        </div>
      ))}
    </div>
  );
};

export default Checklist;
