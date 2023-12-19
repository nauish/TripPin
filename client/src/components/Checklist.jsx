import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Plus, X } from 'lucide-react';

const Checklist = () => {
  const { tripId } = useParams();
  const [checklists, setChecklists] = useState([]);
  const [input, setInput] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [itemInput, setItemInput] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemValue, setEditingItemValue] = useState();
  const checklistInputRef = useRef(null);

  useEffect(() => {
    if (editingIndex !== -1) {
      checklistInputRef.current.focus();
    }
  }, [editingIndex]);

  const fetchChecklists = () => {
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
  };

  useEffect(() => {
    fetchChecklists();
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
        if (json.data) {
          fetchChecklists();
          setInput('');
        }
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
      .then(() => {
        setChecklists(
          checklists.filter((checklist) => checklist.id !== checklistId),
        );
      });
  };

  const editChecklist = (checklistId, name) => {
    fetch(
      `${
        import.meta.env.VITE_BACKEND_HOST
      }api/v1/trips/${tripId}/checklists/${checklistId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ name }),
      },
    )
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        setChecklists(
          checklists.map((checklist) => {
            if (checklist.id === checklistId) {
              return { ...checklist, name };
            }
            return checklist;
          }),
        );
      });
  };

  const handleChecklistNameChange = (event, checklistId) => {
    if (event.key === 'Enter') {
      editChecklist(checklistId, event.target.value);
      setEditingIndex(-1);
    }
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
        if (json.data) {
          console.log(json);
          setChecklists(
            checklists.map((checklist) => {
              if (checklist.id === checklistId) {
                return {
                  ...checklist,
                  items: [...checklist.items, json.data[0]],
                };
              }
              return checklist;
            }),
          );
          setInput('');
        }
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
      .then(() => {
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

  const updateItem = (checklistId, itemId, name, isChecked) => {
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
        body: JSON.stringify({ name, isChecked }),
      },
    )
      .then((response) => response.json())
      .then((json) => {
        setChecklists(
          checklists.map((checklist) => {
            if (checklist.id === checklistId) {
              return {
                ...checklist,
                items: checklist.items.map((item) => {
                  if (item.id === itemId) {
                    return {
                      ...item,
                      isChecked: json.data[0].is_checked,
                      name: json.data[0].name,
                    };
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
            <h1 className="text-xl font-bold">清單</h1>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2 ">
              {checklists &&
                checklists.map((checklist, index) => (
                  <li className="border p-2 rounded group" key={index}>
                    <div className="flex justify-between items-center gap-2">
                      {editingIndex === index ? (
                        <Input
                          ref={checklistInputRef}
                          type="text"
                          className="font-bold"
                          defaultValue={checklist.name}
                          onBlur={() => setEditingIndex(-1)}
                          onKeyDown={(event) =>
                            handleChecklistNameChange(event, checklist.id)
                          }
                        />
                      ) : (
                        <div
                          className="font-bold p-2 w-full hover:cursor-text hover:bg-gray-100 rounded"
                          onClick={() => setEditingIndex(index)}
                        >
                          {checklist.name}
                        </div>
                      )}
                      <div
                        className="hover:cursor-pointer hidden group-hover:flex"
                        onClick={() => removeChecklist(checklist.id)}
                      >
                        <X size={22} />
                      </div>
                    </div>

                    <ul className="mt-2 space-y-2">
                      <div>
                        {checklist.items.map((item, itemIndex) => (
                          <div
                            className="border p-2 hover:bg-gray-100 rounded flex justify-between items-center"
                            key={itemIndex}
                          >
                            <div className="flex w-full">
                              <input
                                type="checkbox"
                                checked={item.isChecked}
                                onChange={(event) =>
                                  updateItem(
                                    checklist.id,
                                    item.id,
                                    item.name,
                                    event.target.checked,
                                  )
                                }
                                className="mr-2"
                              />
                              {editingItemId === item.id ? (
                                <input
                                  type="text"
                                  value={editingItemValue}
                                  className="px w-full focus:outline-none focus:bg-transparent"
                                  onChange={(event) =>
                                    setEditingItemValue(event.target.value)
                                  }
                                  autoFocus
                                  onBlur={() => {
                                    if (editingItemValue !== item.name) {
                                      updateItem(
                                        checklist.id,
                                        item.id,
                                        editingItemValue,
                                        item.isChecked,
                                      );
                                    }
                                    setEditingItemId(null);
                                  }}
                                  onKeyDown={(event) => {
                                    if (
                                      event.key === 'Enter' &&
                                      editingItemValue !== item.name
                                    ) {
                                      updateItem(
                                        checklist.id,
                                        item.id,
                                        editingItemValue,
                                        item.isChecked,
                                      );
                                      setEditingItemId(null);
                                    }
                                  }}
                                />
                              ) : (
                                <li
                                  className={
                                    item.isChecked
                                      ? 'line-through w-full'
                                      : 'w-full'
                                  }
                                  onClick={() => {
                                    setEditingItemId(item.id);
                                    setEditingItemValue(item.name);
                                  }}
                                >
                                  {item.name}
                                </li>
                              )}
                            </div>
                            <div
                              onClick={() =>
                                removeChecklistItem(checklist.id, item.id)
                              }
                              className="hover:cursor-pointer"
                            >
                              <X size={16} />
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2 mt-2">
                          <Input
                            type="text"
                            placeholder="新增項目..."
                            name="checklistItem"
                            onChange={(event) =>
                              setItemInput(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                addChecklistItem(checklist.id);
                              }
                            }}
                            className="bg-gray-100 w-full hover:bg-gray-200"
                          />
                        </div>
                      </div>
                    </ul>
                  </li>
                ))}
            </ul>
            {!isFormVisible && (
              <Button
                className="w-full mt-2"
                variant="secondary"
                onClick={() => setIsFormVisible(true)}
              >
                <Plus />
                新增其他列表
              </Button>
            )}
            {isFormVisible && (
              <form
                onSubmit={addChecklist}
                className="mt-2"
                onBlur={() => {
                  setTimeout(() => setIsFormVisible(false), 100);
                }}
              >
                <div className="flex gap-2 p-1">
                  <Input
                    type="text"
                    placeholder="新增清單"
                    name="checklist"
                    onChange={handleInputChange}
                    className="border p-2 mb-2"
                  />
                  <Button>新增</Button>
                </div>
              </form>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Checklist;
