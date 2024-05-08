import axios from "axios";
import { useAuth } from "../provider/authProvider";
import React, { useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { useNotification } from "../Notifications/NotificationProvider";

export const AddData = () => {
    {/*Предмет*/}
    const [subjectName, setSubjectName] = useState('');
    const [auditorium, setAuditorium] = useState('');

    {/*Преподаватель*/}
    const [teacherfio, setTeacherFIO] = useState('');
    const [academicDegree, setAcademicDegree] = useState('');
    const [category, setCategory] = useState('');
    const [post, setPost] = useState('');

    {/*Группа*/}
    const [groupName, setGroupName] = useState('');
    const [direction, setDirection] = useState('');
    const [peopleCount, setPeopleCount] = useState('');

    const [data, setData] = useState('');

    const {token} = useAuth();

    const dispatch = useNotification();

    const [result, setResult] = useState('');

    function addSubject(e){
        e.preventDefault();

        const form = new FormData();
        form.append('data', data);
        form.append('subjectname', subjectName);
        form.append('auditorium', auditorium);

        axios.post('http://localhost:8080/adddata', form, {
            headers: {
                "Authorization": "Bearer " + token,
                "content-type": "multipart/form-data",
            }
        })
            .then(function(res){
                dispatch({
                    type: "SUCCESS",
                    message: "Предмет успешно добавлен"
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

    function addTeacher(e){
        e.preventDefault();

        const form = new FormData();
        form.append('data', data);
        form.append('teacherfio', teacherfio);
        form.append('academic_degree', academicDegree);
        form.append('category', category);
        form.append('post', post);

        axios.post('http://localhost:8080/adddata', form, {
            headers: {
                "Authorization": "Bearer " + token,
                "content-type": "multipart/form-data",
            }
        })
            .then(function(res){
                dispatch({
                    type: "SUCCESS",
                    message: "Преподаватель успешно добавлен добавлен"
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

    function addGroup(e){
        e.preventDefault();

        const form = new FormData();
        form.append('data', data);
        form.append('groupname', groupName);
        form.append('direction', direction);
        form.append('peoplecount', peopleCount);

        axios.post('http://localhost:8080/adddata', form, {
            headers: {
                "Authorization": "Bearer " + token,
                "content-type": "multipart/form-data",
            }
        })
            .then(function(res){
                dispatch({
                    type: "SUCCESS",
                    message: "Группа успешно добавлена"
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

    return (
        <div>
            <Link to="/">На главную</Link>
            <h3>{result}</h3>
            <h2>Добавить данные</h2>
            <form>
                <label>
                    Что добавить?
                    <select value={data} onChange={e=>{
                        setData(e.target.value);
                        setResult('');
                    }}>
                        <option value="subject">Предмет</option>
                        <option value="teacher">Преподавателя</option>
                        <option value="group">Группу</option>
                    </select>
                </label>
            </form>

            {
                data == "subject" &&
                <div>
                    <form className="link">
                        <label>Название предмета</label>
                        <input value={subjectName} onChange={(e) => setSubjectName(e.target.value)} name="subjectName" placeholder="Предмет"/>                     
                        <label>Аудитория</label>                                            
                        <input value={auditorium} onChange={(e) => setAuditorium(e.target.value)} name="auditorium" placeholder="315 УК1"/>
                    </form>
                    <button onClick={addSubject}>Добавить предмет</button>
                </div>

                
            }
            {
                data == "teacher" &&
                <div>
                    <form className="link">
                        <label>ФИО преподавателя</label>
                        <input value={teacherfio} onChange={(e) => setTeacherFIO(e.target.value)} name="teacherfio" placeholder="Иванов И. И."/>
                        <label>Ученая степень (не обязательно)</label>
                        <input value={academicDegree} onChange={(e) => setAcademicDegree(e.target.value)} name="academic" placeholder="Кандидат технических наук"/>
                        <label>Категория (не обязательно)</label>
                        <input value={category} onChange={(e) => setCategory(e.target.value)} name="category" placeholder="Доцент"/>
                        <label>Должность</label>
                        <input value={post} onChange={(e) => setPost(e.target.value)} name="post" placeholder="Преподаватель"/>
                    </form>
                    <button onClick={addTeacher}>Добавить преподавателя</button>
                </div>
            }
            {
                data == "group" &&
                <div>
                    <form className="link">
                        <label>Номер группы</label>
                        <input value={groupName} onChange={(e) => setGroupName(e.target.value)} name="groupname" placeholder="ПЕ-12б"/>
                        <label>Направление</label>
                        <input value={direction} onChange={(e) => setDirection(e.target.value)} name="direction" placeholder="Информатика и вычислительная техника"/>
                        <label>Количество студентов</label>
                        <input value={peopleCount} onChange={(e) => setPeopleCount(e.target.value)} name="peopleCount" placeholder="24"/>
                    </form>
                    <button onClick={addGroup}>Добавить группу</button>
                </div>
            }
        </div>
    )
}