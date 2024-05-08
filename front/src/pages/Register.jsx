import React, {useEffect, useState} from "react";
import axios from "axios";
import { useAuth } from "../provider/authProvider";
import { Link } from "react-router-dom";
import { useNotification } from "../Notifications/NotificationProvider";

export const Register = () => {
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [chief, setChief] = useState('');


    const [usernameDirty, setUsernameDirty] = useState('');
    const [passwordDirty, setPasswordDirty] = useState('');
    const [emailDirty, setEmailDirty] = useState('');
    const [chiefDirty, setChiedDirty] = useState('');

    const [usernameError, setUsernameError] = useState('Имя пользователя не может быть пустым');
    const [passwordError, setPasswordError] = useState('Пароль не может быть пустым');
    const [emailError, setEmailError] = useState('Почта не может быть пустой');
    const [chiefError, setChiefError] = useState('Должность не может быть пустой');

    const [formValid, setFormValid] = useState('');

    const {token} = useAuth();

    const dispatch = useNotification();

    useEffect(() => {
        if(usernameError || passwordError || emailError || chiefError){
            setFormValid(false)
        } else{
            setFormValid(true)
        }
    }, [usernameError, passwordError, emailError, chiefError])

    function Registration(){
        console.log("1111111111")
        const url = 'http://localhost:8080/createaccount';
        const data = {username: username, password: password, emailid: email, chief: chief};
        axios.post(url, data, {
            headers: {
                "Authorization": 'Bearer ' + token,
                "content-type": "multipart/form-data",
            }
            })
            .then(response => {
                dispatch({
                    type: "SUCCESS",
                    message: "Аккаунт создан"
                    })
                setToken(response.data.access_token);
                navigate("/", { replace: true });
            })
            .catch(function(error) {
                dispatch({
                    type: "ERROR",
                    message: error.response.data
                    })                            
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

    const emailHandler = (e) => {
        setEmail(e.target.value)
        const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
        if(!re.test(String(e.target.value).toLowerCase())){
            setEmailError('Некорректный email')
        } else {
            setEmailError('')
        }
    }

    const chiefHandler = (e) => {
        setChief(e.target.value)
        setChiedDirty(e.target.value)
        setChiefError('')
    }

    const bluerHandler = (e) => {
        switch (e.target.name){
            case 'username':
                setUsernameDirty(true)
                break;

            case 'password':
                setPasswordDirty(true)
                break;

            case 'email':
                setEmailDirty(true)
                break;

            case 'chief':
                setChiedDirty(true)
                break;
        }
    }

    return (
        <div className="auth-form-container">
            <Link to="/">На главную</Link>
            <h2>Регистрация</h2>
            <form className="link">
                <label htmlFor="UserName">UserName</label>
                {(usernameDirty && usernameError) && <div style={{color: 'red'}}>{usernameError}</div>}
                <input onBlur={e => bluerHandler(e)} value={username} onChange={(e) => usernameHandler(e)} name="username" id="username" placeholder="UserName"/>

                <label htmlFor="email">Email</label>
                {(emailDirty && emailError) && <div style={{color: 'red'}}>{emailError}</div>}
                <input onBlur={e => bluerHandler(e)} value={email} onChange={(e) => emailHandler(e)} type="email" name="email" id="email" placeholder="youremail@yandex.ru"/>

                <label htmlFor="chief">Должность</label>
                {(chiefDirty && chiefError) && <div style={{color: 'red'}}>{chiefError}</div>}
                <select onBlur={e => bluerHandler(e)} value={chief} onChange={e => chiefHandler(e)}>
                    <option onBlur={e => bluerHandler(e)} value="true">Администратор</option>
                    <option onBlur={e => bluerHandler(e)} value="false">Рабочий</option>
                </select>

                <label htmlFor="password">password</label>
                {(passwordDirty && passwordError) && <div style={{color: 'red'}}>{passwordError}</div>}
                <input onBlur={e => bluerHandler(e)} value={password} onChange={(e) => passwordHandler(e)} type="password"placeholder="*********" id="password" name="password"/>
                
                <button disabled={!formValid} type={'button'} onClick={Registration} >Sign up</button>
            </form>
        </div>
    )
}