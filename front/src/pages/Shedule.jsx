import axios from "axios";
import React, {useEffect, useState} from 'react';
import { Link } from "react-router-dom";

function Shedule() {
    const [data, setData] = useState([]);
    const [modifedData, setModifedData] = useState([]);
    const [date, setDate] = useState('');

    const [group, setGroup] = useState([]);
    const [groupValue, setGroupValue] = useState('');
    const [button, setButton] = useState('');

    useEffect(() => {
        axios.get('http://localhost:8080/getallgroup')
        .then(res => setGroup(res.data))
        .catch(er => console.log(er));  
        

    }, []);


    function View(){
        const params = {
            date_start: date,
            groupname: groupValue
        }

        console.log(date);

        axios.get('http://localhost:8080/getallshedule', {params})
        .then((res) => {
            setData(res.data)
            console.log(res.data)
            let modifedDataT = [
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0]
            ];
            const arr = [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ];
            for(var i = 0; i < 6; i++){
                if(data[i] && data[i][arr[i]]){
                    let classesforDay = data[i][arr[i]];
                    console.log(classesforDay);
                    for(let index = 0; index < classesforDay.length; index++){
                        let obj = classesforDay[index];
                        console.log(obj);
                        modifedDataT [obj["numberpair"] - 1][i] = 
                            obj["subjectname"] +
                            "\n" +
                            obj["teacher"] +
                            "\n" +
                            obj["auditorium"];
                    }
                }
            }
            setModifedData(modifedDataT)
        })
        .catch(er => console.log(er));
    }


    return (
        <>
            <div className="link">
                <Link to="/addshedule">Добавить занятие</Link>
                <Link to="/adddata">Добавить данные</Link>
                <Link to="/editshedule">Удалить пару</Link>
                <Link to="/createaccount">Создать аккаунт</Link>
                <Link to="/logout">Выйти зи аккаунта</Link>
            </div>
            <div>
                <label>Выберите дату</label>
                <input value={date} onChange={(e) => setDate(e.target.value)} type="date" name="dateSubject" id="dateSubject" placeholder="Дата пары"/>
                <label>
                    Выберите группу
                    <select value={groupValue} onChange={e=>setGroupValue(e.target.value)}>
                        {
                            group.map(opt => <option>{opt.groupname}</option>)
                        }
                    </select>
                </label>
                <button onClick={View}>Показать</button>
                <table>
                    <thead>
                        <tr>
                            <th>Пара</th>
                            <th>Понедельник</th>
                            <th>Вторник</th>
                            <th>Среда</th>
                            <th>Четверг</th>
                            <th>Пятница</th>
                            <th>Суббота</th>
                        </tr>
                    </thead>
                    <tbody>

                        {modifedData.map((x, i) => (
                            <tr>
                                <td> {i + 1} </td>
                                <td> {modifedData[i][0]} </td>
                                <td> {modifedData[i][1]} </td>
                                <td> {modifedData[i][2]} </td>
                                <td> {modifedData[i][3]} </td>
                                <td> {modifedData[i][4]} </td>
                                <td> {modifedData[i][5]} </td>
                            </tr>
                        ))
                            
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default Shedule;