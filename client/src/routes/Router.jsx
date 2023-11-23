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
import Map from '../components/Map';
import TripForm from '../components/TripForm';
import MyTrips from '../components/Trips';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<></>} />
      <Route element={<ProtectedRoute />}>
        <Route path="/trip" element={<TripForm />} />
        <Route path="users/:userId/trips" element={<MyTrips />} />
        <Route
          path="/trips/:tripId"
          element={
            <>
              <Map />
              <Chat />
            </>
          }
        />
      </Route>
      <Route path="/profile" element={<Profile />} />
      <Route path="/auth" element={<Auth />} />
      <Route
        path="*"
        element={<ErrorHandler error="404" message="走錯啦！" />}
      />
    </Route>,
  ),
);

export default router;
