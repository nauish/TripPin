import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';
import Chat from '../components/Chat';
import Auth from '../components/Auth';
import ErrorHandler from '../components/Error';
import RootLayout from '../layouts/RootLayout';
import Profile from '../components/Profile';
import ProtectedRoute from './ProtectedRoute';
import MyTrips from '../pages/MyTrips';
import TripForm from '../components/TripForm';
import PlacesMaps from '../components/PlaceMaps';
import Hero from '@/components/Hero';
import SavedTrips from '@/pages/SavedTrips';
import AttendedTrips from '@/pages/AttendedTrips';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Hero />} />
      <Route
        path="/trips/:tripId"
        element={
          <>
            <PlacesMaps />
            <Chat />
          </>
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route path="/trip" element={<TripForm />} />
        <Route path="/users/:userId/trips" element={<MyTrips />} />
        <Route path="/user/trips" element={<MyTrips />} />
        <Route path="/user/saved" element={<SavedTrips />} />
        <Route path="/user/attended" element={<AttendedTrips />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="/auth" element={<Auth />} />
      <Route
        path="*"
        element={<ErrorHandler error="404" message="走錯啦！" />}
      />
    </Route>,
  ),
);

export default router;
