import React, { useEffect, useState } from "react"
import axios from "axios";

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

        const FormData = require('form-data');

        let form = new FormData();
        form.append('subjectname', subjectValue);
        form.append('formatsubject', formatValue);
        form.append('teacher', teacherValue);
        form.append('groupname', groupValue);
        form.append('numberpair', numberValue);
        form.append('date_subject', dateSubject);

        console.log(form);

        console.log(subjectValue);
        console.log(formatValue);
        console.log(teacherValue);
        console.log(groupValue);
        console.log(numberValue);
        console.log(dateSubject);

        let config = {
            Authorization: 'Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXUyJ9.eyJjaGllZiI6InRydWUiLCJleHAiOjE3MTQ3MDMzNzcsImlhdCI6MTcxNDY5OTc3NywiaXNzIjoiU1AiLCJ1c2VybmFtZSI6Im1pc2hhIn0.BczYitTZuh0iAo12HMmzVenb9_Ww5ny6wzLQeic6YhUzn8WRb9LWiFpeSabNIyf7s6_A369nIPLaQ4m1lDG90A'
            
        }

        axios.post('http://localhost:8080/addshedule', form, {
            headers: {
                "Authorization": 'Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXUyJ9.eyJjaGllZiI6InRydWUiLCJleHAiOjE3MTQ3MDMzNzcsImlhdCI6MTcxNDY5OTc3NywiaXNzIjoiU1AiLCJ1c2VybmFtZSI6Im1pc2hhIn0.BczYitTZuh0iAo12HMmzVenb9_Ww5ny6wzLQeic6YhUzn8WRb9LWiFpeSabNIyf7s6_A369nIPLaQ4m1lDG90A',
                "content-type": "multipart/form-data",
            }
        })
            .then(res => console.log(res.data))
            .catch(err => console.log(err));
    }

    return(
        <div>
            <h2>Добавить пару</h2>
            <form>
                <label>
                    Название предмета:
                    <select value={subjectValue} onChange={e=>setSubjectValue(e.target.value)}>
                        {
                            subjectName.map(opt => <option>{opt.subjectname}</option>)
                        }
                    </select>
                    <h1>{subjectValue}</h1>
                </label>

                <label>
                    Тип предмета:
                    <select defaultValue={formatValue} value={formatValue} onChange={e=>setFormatValue(e.target.value)}>
                        {
                            formatSubject.map(opt => <option>{opt.formatsubject}</option>)
                        }
                    </select>
                    <h1>{formatValue}</h1>
                </label>
                
                <label>
                    Преподаватель:
                    <select value={teacherValue} onChange={e=>setTeacherValue(e.target.value)}>
                        {
                            teacher.map(opt => <option>{opt.teacherfio}</option>)
                        }
                    </select>
                    <h1>{teacherValue}</h1>
                </label>
                
                <label>
                    Группа:
                    <select value={groupValue} onChange={e=>setGroupValue(e.target.value)}>
                        {
                            groupName.map(opt => <option>{opt.groupname}</option>)
                        }
                    </select>
                    <h1>{groupValue}</h1>
                </label>

                <label>
                    Номер пары:
                    <select value={numberValue} onChange={e=>setNumberValue(e.target.value)}>
                        {
                            number.map(opt => <option>{opt}</option>)
                        }
                    </select>
                    <h1>{numberValue}</h1>
                </label>
                
                
                
                <label htmlFor="dateSubject">Дата пары</label>
                <input value={dateSubject} onChange={(e) => setDateSubject(e.target.value)} type="date" name="dateSubject" id="dateSubject" placeholder="Дата пары"/>
                <h1>{dateSubject}</h1>
                <button onClick={addShedule}>
                    Добавить
                </button>
                
            </form>
        </div>
    )
}