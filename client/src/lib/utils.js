import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString) => {
  if (!dateString) return '尚未定';
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: '2-digit',
    month: 'numeric',
    day: 'numeric',
  });
};

export const formatBudget = (budget) => {
  if (budget == null) return '還沒評估預算';

  return budget.toLocaleString('en-US', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  });
};

export const debounce = (callback, delay = 250) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      callback(...args);
    }, delay);
  };
};

export const throttle = (callback, limit = 250) => {
  let wait = false; // Initially, we're not waiting
  return () => {
    if (!wait) {
      callback.call();
      wait = true; //
      setTimeout(() => {
        wait = false;
      }, limit);
    }
  };
};

export const tagIconMapping = {
  accounting: '💼',
  airport: '✈️',
  amusement_park: '🎠',
  aquarium: '🐠',
  art_gallery: '🎨',
  atm: '💳',
  bakery: '🥐',
  bank: '🏦',
  bar: '🍻',
  beauty_salon: '💇',
  bicycle_store: '🚲',
  book_store: '📚',
  bowling_alley: '🎳',
  bus_station: '🚌',
  cafe: '☕',
  campground: '⛺',
  car_dealer: '🚗',
  car_rental: '🚕',
  car_repair: '🔧',
  car_wash: '🚿',
  casino: '🎰',
  country: '🏞️',
  cemetery: '⚰️',
  church: '⛪',
  city_hall: '🏛',
  clothing_store: '👗',
  convenience_store: '🏪',
  courthouse: '⚖️',
  dentist: '🦷',
  department_store: '🛍',
  doctor: '👨‍⚕️',
  drugstore: '💊',
  electrician: '💡',
  electronics_store: '📺',
  embassy: '🏢',
  fire_station: '🚒',
  florist: '💐',
  funeral_home: '⚱️',
  furniture_store: '🛋',
  gas_station: '⛽',
  gym: '🏋️',
  hair_care: '💇',
  hardware_store: '🔨',
  hindu_temple: '🕉',
  home_goods_store: '🛏',
  hospital: '�',
  insurance_agency: '📑',
  jewelry_store: '💍',
  laundry: '👕',
  lawyer: '👨‍⚖️',
  library: '📖',
  light_rail_station: '🚈',
  liquor_store: '🍾',
  local_government_office: '🏫',
  locksmith: '🔑',
  lodging: '🏨',
  meal_delivery: '🍱',
  meal_takeaway: '🥡',
  mosque: '🕌',
  movie_rental: '📼',
  movie_theater: '🎬',
  moving_company: '🚚',
  museum: '🏛',
  night_club: '🕺',
  painter: '🖌',
  premise: '🏠',
  park: '🌳',
  parking: '🅿️',
  pet_store: '🐾',
  pharmacy: '💊',
  physiotherapist: '👨‍⚕️',
  plumber: '🔧',
  police: '👮',
  post_office: '📮',
  primary_school: '🏫',
  real_estate_agency: '🏠',
  restaurant: '🍽️',
  roofing_contractor: '🏠',
  rv_park: '🚐',
  school: '🏫',
  secondary_school: '🏫',
  shoe_store: '👠',
  shopping_mall: '🛍',
  spa: '💆',
  stadium: '🏟',
  storage: '📦',
  store: '🏬',
  subway_station: '🚇',
  supermarket: '🛒',
  synagogue: '✡️',
  taxi_stand: '🚖',
  tourist_attraction: '🗺',
  train_station: '🚉',
  transit_station: '🚏',
  travel_agency: '🌍',
  university: '🎓',
  veterinary_care: '🐕',
  zoo: '🦁',
};
