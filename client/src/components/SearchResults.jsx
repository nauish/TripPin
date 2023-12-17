import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from './ui/button';

const SearchResults = ({
  searchResults,
  setSearchResults,
  setCenter,
  addPlaceToTrip,
  handleNearbySearch,
  map,
}) => {
  return (
    searchResults.length > 0 && (
      <Droppable droppableId="searchResults" type="card">
        {(provided) => (
          <div>
            <div className="flex justify-between px-16">
              <h2 className="font-bold text-xl">搜尋結果</h2>
              <div
                className="text-blue-500 hover:text-blue-700 cursor-pointer"
                onClick={() => {
                  setSearchResults([]);
                }}
              >
                清除搜尋結果
              </div>
            </div>
            <ul
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="list-none px-16"
            >
              {searchResults.map((result, index) => (
                <Draggable
                  draggableId={result.place_id}
                  index={index}
                  key={index}
                >
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-white border border-gray-200 shadow-xl 
                            rounded-lg p-4 mb-2 
                            cursor-move hover:bg-slate-100"
                      onClick={() => {
                        setCenter(result.geometry.location);
                      }}
                    >
                      <h3 className="text-lg font-bold">
                        {index + 1}. {result.name}
                      </h3>
                      <p className="text-gray-700">
                        {result.formatted_address}
                      </p>
                      {result.url && (
                        <p className="text-gray-700">
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            詳細資訊
                          </a>
                        </p>
                      )}
                      <div className="flex gap-2 justify-end">
                        <Button onClick={() => addPlaceToTrip(result)}>
                          新增到行程
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleNearbySearch(map, result)}
                        >
                          搜尋鄰近景點
                        </Button>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          </div>
        )}
      </Droppable>
    )
  );
};

export default SearchResults;
