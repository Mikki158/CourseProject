import REact, {useEffect} from 'react'
import axios from 'axios'

function Table() {
    useEffect(() => {
        axios.get('http://localhost:8080/getallshedule?date=2024-04-25&groupname=ПЕ-12б')
        .then(res => console.log(res))
        .catch(er => console.log(er));
    }, [])
    return (
        <div>
            
        </div>
    )
}

export default Table