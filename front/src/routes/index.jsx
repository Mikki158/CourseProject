import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useAuth } from "../provider/authProvider";
import { ProtectedRoute } from "./ProtectedRoute";
import Login from "../pages/Login";
import Logout from "../pages/Logout";
import { Register } from "../pages/Register";
import { AddShedule } from "../pages/AddShedule";
import { AddData } from "../pages/AddData";
import Shedule from "../pages/Shedule";
import { EditShedule } from "../pages/EditShedule";
import NotificationProvider from "../Notifications/NotificationProvider";
import '../App.css'

const Routes = () => {
  const { token } = useAuth();

  // Define public routes accessible to all users
  const routesForPublic = [
    {
      path: "/service",
      element: <div>Service Page</div>,
    },
    {
      path: "/about-us",
      element: <div>About Us</div>,
    }
  ];

  // Define routes accessible only to authenticated users
  const routesForAuthenticatedOnly = [
    {
      path: "/",
      element: <ProtectedRoute />, // Wrap the component in ProtectedRoute
      children: [
        {
          path: "",
          element: <Shedule />,
        },
        {
          path: "/profile",
          element: <div>User Profile</div>,
        },
        {
          path: "/logout",
          element: <Logout />,
        },
        {
            path: "/createaccount",
            element: <Register />,
        },
        {
          path: "/addshedule",
          element: <AddShedule />
        },
        {
          path: "/adddata",
          element: <AddData />
        },
        {
          path: "/shedule",
          element: <Shedule />
        },
        {
          path: "/editshedule",
          element: <EditShedule />
        }
      ],
    },
  ];

  // Define routes accessible only to non-authenticated users
  const routesForNotAuthenticatedOnly = [
    {
      path: "/login",
      element: <Login/>,
    },
  ];

  // Combine and conditionally include routes based on authentication status
  const router = createBrowserRouter([
    ...routesForPublic,
    ...(!token ? routesForNotAuthenticatedOnly : []),
    ...routesForAuthenticatedOnly,
  ]);

  // Provide the router configuration using RouterProvider
  return <RouterProvider router={router} />;
};

export default Routes;