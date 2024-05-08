import { useNavigate } from "react-router-dom";
import { useAuth } from "../provider/authProvider";
import { useEffect } from "react";
import { useNotification } from "../Notifications/NotificationProvider";

const Logout = () => {
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const dispatch = useNotification();


  setTimeout(() => {
    setToken();
    navigate("/", { replace: true });
  }, 100);


  return <>Logout Page</>;
};

export default Logout;