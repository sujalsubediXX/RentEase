import {Outlet} from 'react-router-dom';
import { AuthProvider } from "./contexts/AuthContext";
export const App = () => {
  return (
   <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}
