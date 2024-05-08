import { useNavigate } from "react-router-dom";
import { useAuth } from "../provider/authProvider";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNotification } from "../Notifications/NotificationProvider";

const Login = () => {
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const dispatch = useNotification();

  useEffect(() => {
    
  })

  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [usernameDirty, setUsernameDirty] = useState(false);
  const [passwordDirty, setPasswordDirty] = useState(false);
  const [usernameError, setUsernameError] = useState('Имя пользователя не может быть пустым');
  const [passwordError, setPasswordError] = useState('Пароль не может быть пустым');
  const [formValid, setFormValid] = useState(false);

  useEffect(() => {
      if(usernameError || passwordError){
        setFormValid(false)
      } else {
        setFormValid(true)
      }
  }, [usernameError, passwordError])

  function Loading(){
    const url = 'http://localhost:8080/login';
    const data = {username: username, password: password};
    axios.post(url, data)
        .then(response => {
            console.log(response);
            dispatch({
              type: "SUCCESS",
              message: "Вы вошли в аккаунт"
            });
            setToken(response.data.access_token);
            navigate("/", { replace: true });
        })
        .catch(function(error) {
          dispatch({
            type: "ERROR",
            message: error.response.data
          });
          console.log(error);
        });
  }

  const usernameHandler = (e) => {
    setUserName(e.target.value)
    setUsernameError('')
  }

  const passwordHandler = (e) => {
    setPassword(e.target.value)
    if(!e.target.value){
      setPasswordError('Пароль не может быть пустым')
    }
    else {
      setPasswordError('')
    }
  }

  const blurHandler = (e) => {
    switch (e.target.name){
      case 'username':
        setUsernameDirty(true)
        break;
      
      case 'password':
        setPasswordDirty(true)
        break;
    }
  }

  const handleLogin = () => {
    setToken("this is a test token");
    navigate("/", { replace: true });
  };


  return(
    <div className="link">
        <h2>Login</h2>
          <label htmlFor="usename">usename</label>
          {(usernameDirty && usernameError) && <div style={{color:'red'}}>{usernameError}</div>}
          <input onBlur={e => blurHandler(e)} value={username} onChange={(e) => usernameHandler(e)} placeholder="Username" id="username" name="username"/>
          <label htmlFor="password">password</label>
          {(passwordDirty && passwordError) && <div style={{color:'red'}}>{passwordError}</div>}
          <input onBlur={e => blurHandler(e)} value={password} onChange={(e) => passwordHandler(e)} type="password"placeholder="*********" id="password" name="password"/>
          <button disabled={!formValid} type={'button'} onClick={Loading}>Log In</button>
    </div>
  );
};

export default Login;