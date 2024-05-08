import React, { useEffect, useState } from "react"
import axios from "axios";
import { useAuth } from "../provider/authProvider";
import { Link } from "react-router-dom";
import { useNotification } from "../Notifications/NotificationProvider";

export const AddShedule = () => {

    const [subjectName, setSubjectName] = useState([]);
    const [subjectValue, setSubjectValue] = useState('');

    const [formatSubject, setFromatSubject] = useState([]);
    const [formatValue, setFormatValue] = useState('');

    const [teacher, setTeacher] = useState([]);
    const [teacherValue, setTeacherValue] = useState(''); 

    const [groupName, setGroupName] = useState([]);
    const [groupValue, setGroupValue] = useState('');

    const number = [1, 2, 3, 4, 5, 6, 7];
    const [numberValue, setNumberValue] = useState('');

    const [dateSubject, setDateSubject] = useState('');

    const [val, setVal] = useState('');
    const data=["one", "two", "three", "four", "five"];

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

    function addShedule(e){

        e.preventDefault();

        console.log("Go");

        const form = new FormData();
        form.append('subjectname', subjectValue);
        form.append('formatsubject', formatValue);
        form.append('teacher', teacherValue);
        form.append('groupname', groupValue);
        form.append('numberpair', numberValue);
        form.append('date_subject', dateSubject);

        axios.post('http://localhost:8080/addshedule', form, {
            headers: {
                "Authorization": 'Bearer ' + token,
                "content-type": "multipart/form-data",
            }
        })
            .then(function(res){
                console.log("result")
                console.log(res.data)
                console.log(res.status)

                dispatch({
                    type: "SUCCESS",
                    message: "Занятие успешно добавлено"
                  })
            }
            )
            .catch(function(error){
                   if(error.response){
                    dispatch({
                        type: "ERROR",
                        message: error.response.data
                      })
                   } else if(error.request){
                    console.log("request")
                   } else {
                    console.log("else")
                   }
                }
                
            );
    }

    return(
        <div>
            <Link to="/">На главную</Link>
            <h3>{result}</h3>
            <h2>Добавить пару</h2>
            <form className="link">
                <label>
                    Название предмета:
                    <select value={subjectValue} onChange={e=>setSubjectValue(e.target.value)}>
                        {
                            subjectName.map(opt => <option >{opt.subjectname}</option>)
                        }
                    </select>
                    <h3>{subjectValue}</h3>
                </label>

                <label>
                    Тип предмета:
                    <select defaultValue={formatValue} value={formatValue} onChange={e=>setFormatValue(e.target.value)}>
                        {
                            formatSubject.map(opt => <option>{opt.formatsubject}</option>)
                        }
                    </select>
                    <h3>{formatValue}</h3>
                </label>
                
                <label>
                    Преподаватель:
                    <select value={teacherValue} onChange={e=>setTeacherValue(e.target.value)}>
                        {
                            teacher.map(opt => <option>{opt.teacherfio}</option>)
                        }
                    </select>
                    <h3>{teacherValue}</h3>
                </label>
                
                <label>
                    Группа:
                    <select value={groupValue} onChange={e=>setGroupValue(e.target.value)}>
                        {
                            groupName.map(opt => <option>{opt.groupname}</option>)
                        }
                    </select>
                    <h3>{groupValue}</h3>
                </label>

                <label>
                    Номер пары:
                    <select value={numberValue} onChange={e=>setNumberValue(e.target.value)}>
                        {
                            number.map(opt => <option>{opt}</option>)
                        }
                    </select>
                    <h3>{numberValue}</h3>
                </label>
                
                
                
                <label htmlFor="dateSubject">Дата пары</label>
                <input value={dateSubject} onChange={(e) => setDateSubject(e.target.value)} type="date" name="dateSubject" id="dateSubject" placeholder="Дата пары"/>
                <h3>{dateSubject}</h3>
                <button onClick={addShedule}>
                    Добавить
                </button>
                
            </form>
        </div>
    )
}