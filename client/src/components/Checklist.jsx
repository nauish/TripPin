import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';

const Checklist = () => {
  const { tripId } = useParams();
  const [checklists, setChecklists] = useState([]);
  const [input, setInput] = useState('');
  const [itemInput, setItemInput] = useState('');

  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${tripId}/checklists`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      },
    )
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        setChecklists(json.data);
      });
  }, []);

  const addChecklist = (event) => {
    event.preventDefault();
    fetch(
      `${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${tripId}/checklists`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ name: input }),
      },
    )
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        setChecklists([...checklists, json.data]);
        setInput('');
      });
  };

  const removeChecklist = (checklistId) => {
    fetch(
      `${
        import.meta.env.VITE_BACKEND_HOST
      }api/v1/trips/${tripId}/checklists/${checklistId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      },
    )
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        setChecklists(
          checklists.filter((checklist) => checklist.id !== checklistId),
        );
      });
  };

  const addChecklistItem = (checklistId) => {
    fetch(
      `${
        import.meta.env.VITE_BACKEND_HOST
      }api/v1/trips/${tripId}/checklists/${checklistId}/items`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          name: itemInput,
          order: checklists.find((checklist) => +checklist.id === +checklistId)
            .items.length,
        }),
      },
    )
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        setChecklists(
          checklists.map((checklist) => {
            if (checklist.id === checklistId) {
              return {
                ...checklist,
                items: [...checklist.items, json.data],
              };
            }
            return checklist;
          }),
        );
        setInput('');
      });
  };

  const removeChecklistItem = (checklistId, itemId) => {
    fetch(
      `${
        import.meta.env.VITE_BACKEND_HOST
      }api/v1/trips/${tripId}/checklists/${checklistId}/items/${itemId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      },
    )
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        setChecklists(
          checklists.map((checklist) => {
            if (checklist.id === checklistId) {
              return {
                ...checklist,
                items: checklist.items.filter((item) => item.id !== itemId),
              };
            }
            return checklist;
          }),
        );
      });
  };

  const updateItem = (checklistId, itemId, name, isComplete) => {
    fetch(
      `${
        import.meta.env.VITE_BACKEND_HOST
      }api/v1/trips/${tripId}/checklists/${checklistId}/items/${itemId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ name, isComplete }),
      },
    )
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        setChecklists(
          checklists.map((checklist) => {
            if (checklist.id === checklistId) {
              return {
                ...checklist,
                items: checklist.items.map((item) => {
                  if (item.id === itemId) {
                    return { ...item, checked: true };
                  }
                  return item;
                }),
              };
            }
            return checklist;
          }),
        );
      });
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  return (
    <div>
      <h1>Checklist</h1>
      <form onSubmit={addChecklist}>
        <Input
          type="text"
          placeholder="Add Checklist"
          name="checklist"
          onChange={handleInputChange}
        />
        <Button>Add Checklist</Button>
      </form>
      <ul>
        {checklists &&
          checklists.map((checklist, index) => (
            <li key={index}>
              {checklist.name}
              <Button onClick={() => removeChecklist(checklist.id)}>
                Delete
              </Button>
              <ul>
                <Input
                  type="text"
                  placeholder="Add Checklist Item"
                  name="checklistItem"
                  onChange={(event) => setItemInput(event.target.value)}
                />
                <Button onClick={() => addChecklistItem(checklist.id)}>
                  新增項目
                </Button>
                {checklist.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <li>{item.name}</li>
                    <Button
                      onClick={() => removeChecklistItem(checklist.id, item.id)}
                    ></Button>
                  </div>
                ))}
              </ul>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Checklist;
