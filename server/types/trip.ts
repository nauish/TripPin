export interface User {
  name: string;
}

export interface Place {
  id: string;
  name: string;
  day_number: number;
  tag: string;
  type: string;
  note: string;
  dnd_order: number;
  marker_type: string;
  start_hour: string;
  end_hour: string;
  longitude: number;
  latitude: number;
  address: string;
  distance_from_previous: number;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  type: string;
  privacy_setting: string;
  note: string;
  photo: string;
  user: User;
  places: Place[];
}

export interface PlacesByDay {
  [dayNumber: number]: Place[];
}
