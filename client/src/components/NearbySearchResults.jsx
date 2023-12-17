import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from './ui/button';

const NearbySearchResults = ({
  nearbyResults,
  setNearbyResults,
  setCenter,
  addPlaceToTrip,
  handleNearbySearch,
  map,
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
              className="min-h-[120px] grid grid-cols-2 gap-x-2 mx-16"
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
                      className="bg-white border border-gray-200 shadow-xl 
                      rounded-lg p-2 mb-2 
                      cursor-move hover:bg-slate-100 group"
                      onClick={() => {
                        setCenter(result.geometry.location);
                      }}
                    >
                      <h3 className="mark-on-map font-bold text-left">
                        {result.name}
                      </h3>

                      {result.price_level && (
                        <div className="text-gray-700">
                          評分：{result.rating}
                          <span className="mx-1 text-gray-400">-</span>
                          價格：{'$'.repeat(result.price_level)}
                        </div>
                      )}
                      <div className=" justify-between m-2 gap-2 hidden group-hover:flex">
                        <Button
                          className="w-full"
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
