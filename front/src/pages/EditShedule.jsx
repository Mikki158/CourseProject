import React, {useEffect, useState} from "react";
import axios from "axios";
import { useAuth } from "../provider/authProvider";
import { Link } from "react-router-dom";
import { useNotification } from "../Notifications/NotificationProvider";

export const EditShedule = () => {
    const [date, setDate] = useState('');

    const [subjectName, setSubjectName] = useState([]);
    const [subjectValue, setSubjectValue] = useState('');

    const [groupName, setGroupName] = useState([]);
    const [groupValue, setGroupValue] = useState('');

    const number = [1, 2, 3, 4, 5, 6, 7];
    const [numberValue, setNumberValue] = useState('');

    const [teacher, setTeacher] = useState([]);
    const [teacherValue, setTeacherValue] = useState('');

    const [formatSubject, setFromatSubject] = useState([]);
    const [formatValue, setFormatValue] = useState('');

    const [result, setResult] = useState('');

    const {token} = useAuth();

    const dispatch = useNotification();

    useEffect(() => {
        axios.get('http://localhost:8080/getallsubjectname')
        .then(res => setSubjectName(res.data))
        .catch(er => console.log(er));

        axios.get('http://localhost:8080/getallformat')
        .then(res => setFromatSubject(res.data))
        .catch(er => console.log(er));

        axios.get('http://localhost:8080/getallteacher')
        .then(res => setTeacher(res.data))
        .catch(er => console.log(er));

        axios.get('http://localhost:8080/getallgroup')
        .then(res => setGroupName(res.data))
        .catch(er => console.log(er));

    }, []);

    function Edit(){
        
    }

    function Delete(e){
        e.preventDefault();

        const form = new FormData();
        form.append("date_subject", date);
        form.append("numberpair", numberValue);
        form.append("groupname", groupValue);

        axios.post('http://localhost:8080/deleteshedule', form, {
            headers: {
                "Authorization": "Bearer " + token,
                "content-type": "multipart/form-data",
            }
        })
            .then(function(res){
                dispatch({
                    type: "SUCCESS",
                    message: "Занятие успешно удалено"
                  })
            }
            )
            .catch(function(err){
                dispatch({
                    type: "ERROR",
                    message: err.response.data
                  })
            }
            );
    }

    return(
        <div>
            <Link to="/">На главную</Link>
            <h3>{result}</h3>
            <form className="link">

                <label>
                    Выберите день
                    <input value={date} onChange={(e) => setDate(e.target.value)} type="date" name="dateSubject" id="dateSubject"/>
                </label>

                <label>
                    Выберите номер пары
                    <select value={numberValue} onChange={e=>setNumberValue(e.target.value)}>
                        {
                            number.map(opt => <option>{opt}</option>)
                        }
                    </select>
                </label>

                <label>
                    Выберите номер группы
                    <select value={groupValue} onChange={e=>setGroupValue(e.target.value)}>
                        {
                            groupName.map(opt=> <option>{opt.groupname}</option>)
                        }
                    </select>
                </label>
            </form>
            <button onClick={Delete}>
                Удалить
            </button>
        </div>
    )
}