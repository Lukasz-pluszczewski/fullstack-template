import { Route, Routes } from 'react-router';
import { Error } from '../platform/errors/Error';
import { RouteNotFoundError } from '../platform/errors/errors';
import Examples, {
  Dates,
  Dropzone,
  Form,
  Modal,
  Notifications,
  Spotlight,
  Table,
} from './Examples';
import Home from './Home';

export default function Router() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="examples">
        <Route index element={<Examples />} />
        <Route path="form" element={<Form />} />
        <Route path="table" element={<Table />} />
        <Route path="dropzone" element={<Dropzone />} />
        <Route path="dates" element={<Dates />} />
        <Route path="modal" element={<Modal />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="spotlight" element={<Spotlight />} />
      </Route>
      <Route
        path="*"
        element={
          <Error
            error={
              new RouteNotFoundError({ message: 'Not found', httpStatus: 404 })
            }
          />
        }
      />

      {/*<Route element={<AuthLayout />}>*/}
      {/*  <Route path="login" element={<Login />} />*/}
      {/*  <Route path="register" element={<Register />} />*/}
      {/*</Route>*/}
    </Routes>
  );
}
