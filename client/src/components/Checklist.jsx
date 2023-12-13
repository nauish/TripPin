import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

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
    <div className="mx-16">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <h1 className="text-2xl font-bold mb-4">清單</h1>
          </AccordionTrigger>
          <AccordionContent>
            <form onSubmit={addChecklist} className="mb-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="新增清單"
                  name="checklist"
                  onChange={handleInputChange}
                  className="border p-2 mb-2"
                />
                <Button>新增清單</Button>
              </div>
            </form>

            <Droppable droppableId="checklists">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {checklists &&
                    checklists.map((checklist, index) => (
                      <Draggable
                        key={checklist.id}
                        draggableId={checklist.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <li
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            className="border p-4 rounded shadow"
                          >
                            {checklist.name}
                            <Button
                              onClick={() => removeChecklist(checklist.id)}
                              className="bg-red-500 text-white p-2 ml-2"
                            >
                              Delete
                            </Button>
                            <ul className="mt-4 space-y-2">
                              <Droppable
                                droppableId={`checklist-${checklist.id}`}
                              >
                                {(provided) => (
                                  <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                  >
                                    <Input
                                      type="text"
                                      placeholder="Add Checklist Item"
                                      name="checklistItem"
                                      onChange={(event) =>
                                        setItemInput(event.target.value)
                                      }
                                      className="border p-2 w-full mb-2"
                                    />
                                    <Button
                                      onClick={() =>
                                        addChecklistItem(checklist.id)
                                      }
                                      className="bg-green-500 text-white p-2 w-full"
                                    >
                                      新增項目
                                    </Button>
                                    {checklist.items.map((item, itemIndex) => (
                                      <Draggable
                                        key={item.id}
                                        draggableId={item.id.toString()}
                                        index={itemIndex}
                                      >
                                        {(provided) => (
                                          <div
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            ref={provided.innerRef}
                                            className="border p-2 rounded shadow flex justify-between items-center"
                                          >
                                            <li>{item.name}</li>
                                            <Button
                                              onClick={() =>
                                                removeChecklistItem(
                                                  checklist.id,
                                                  item.id,
                                                )
                                              }
                                              className="bg-red-500 text-white p-2"
                                            >
                                              Delete
                                            </Button>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </ul>
                          </li>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Checklist;
