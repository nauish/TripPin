import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from './ui/button';

import { tagIconMapping } from '@/lib/utils';

const NearbySearchResults = ({
  nearbyResults,
  setNearbyResults,
  setCenter,
  addPlaceToTrip,
  handleNearbySearch,
  map,
  setClickLocation,
  size,
}) => {
  return (
    nearbyResults.length > 0 && (
      <Droppable droppableId="nearbyResults" type="card">
        {(provided) => (
          <div>
            <div className="flex justify-between mx-16">
              <h2 className="font-bold text-xl">附近地點</h2>
              <div
                className="text-blue-500 hover:text-blue-700 cursor-pointer"
                onClick={() => {
                  setNearbyResults([]);
                }}
              >
                清除附近地點
              </div>
            </div>
            <ul
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-[120px] grid gap-x-2 mx-16 ${
                size > 1200
                  ? 'grid-cols-4'
                  : size > 800
                  ? 'grid-cols-3'
                  : 'grid-cols-2'
              }`}
            >
              {nearbyResults.map((result, index) => (
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
                      className="bg-white border border-gray-200 shadow-md flex justify-between flex-col
                      rounded-lg p-2 mb-2 
                      cursor-move hover:bg-slate-50 group"
                      onClick={() => {
                        setCenter(result.geometry.location);
                        setClickLocation({
                          lat: result.geometry.location.lat(),
                          lng: result.geometry.location.lng(),
                        });
                      }}
                    >
                      <div className="flex flex-col justify">
                        <h3 className="mark-on-map font-bold text-left overflow-hidden text-ellipsis whitespace-nowrap">
                          {result.types && tagIconMapping[result.types[0]]}
                          {result.name}
                        </h3>

                        {result.price_level && (
                          <div className="text-gray-700 text-sm">
                            評分：{result.rating}
                          </div>
                        )}
                        {result.price_level && (
                          <div className="text-gray-700 text-sm">
                            {'$'.repeat(result.price_level)}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <Button
                          className="w-full p-0"
                          variant="ghost"
                          onClick={() => addPlaceToTrip(result)}
                        >
                          新增
                        </Button>
                        <Button
                          variant="secondary"
                          className="w-full"
                          onClick={() => handleNearbySearch(map, result)}
                        >
                          鄰近
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

export default NearbySearchResults;
