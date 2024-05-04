import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useAuth } from "../provider/authProvider";
import { ProtectedRoute } from "./ProtectedRoute";
import Logout from "../pages/Logout";
import Login from "../pages/Login"

const Routes = () => {
    const {token} = useAuth();

    const routesForPublic = [
        {
            path: "/service",
            element: <div>Service Page</div>,
        },
        {
            path: "/about-us",
            element: <div>About Us</div>,
        },
    ];
    
    const routesForAuthentificatedOnly = [
        {
            path: "/",
            element: <ProtectedRoute />,
            children: [
                {
                    path: "/",
                    element: <div>User Home Page</div>,
                },
                {
                    path: "/profile",
                    element: <div>User Profile</div>,
                },
                {
                    path: "/logout",
                    element: <Logout />,
                },
            ],
        },
    ];
    
    const routesForNotAuthenticaredOnly = [
        {
            path: "/",
            element: <div>Home Page</div>,
        },
        {
            path: "/login",
            element: <Login />,
        },
    ];
    
    const router = createBrowserRouter([
        ...routesForPublic,
        ...(!token ? routesForNotAuthenticaredOnly : []),
        ...routesForAuthentificatedOnly,
    ]);
    
    return <RouterProvider router={router} />;
};

export default Routes