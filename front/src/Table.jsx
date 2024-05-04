import axios from "axios";
import React, {useEffect, useState} from 'react';

function Table() {
    const [data, setData] = useState([]);
    const [modifedData, setModifedData] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:8080/getallshedule?date_start=2024-04-22&date_end=2024-04-27&groupname=ПЕ-12б')
        .then((res) => {
            //setData(res.data)
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
                        modifedDataT[obj["numberpair"] - 1][i] = 
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
    }, []);
    

    return (
        
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Pair</th>
                        <th>Monday</th>
                        <th>Tuesday</th>
                        <th>Wednesday</th>
                        <th>Thursday</th>
                        <th>Friday</th>
                        <th>Saturday</th>
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
    )
}

export default Table;