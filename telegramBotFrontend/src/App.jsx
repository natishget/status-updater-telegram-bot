import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useLocation } from 'react-router-dom';

function App() {
  const [statusData, setStatusData] = useState({
    status: "",
    id: "",
    name: "",
  });
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const userInfo = new URLSearchParams(location.search);
    const chatId = userInfo.get('chatId');
    const name = userInfo.get('name');

    setStatusData(prev => ({
      ...prev,
      id: chatId,
      name: name,
    }));
  }, [location.search]);

  const handleStatus = (e) =>{
    const value = e.target.value;
    setStatusData(prev => ({
      ...prev,
      status: value
    }));
  }

  const handleSubmit = async () =>{
    try{
      const response = await axios.post(`http://localhost:3000/status`, statusData);

      alert("successfully sent");
      setSent(true);
    } catch( error){
      console.log(error);
    }
  }

  return (
    <>
      <div className=''>
        <h1>Hello {statusData?.name}!!</h1>
        <input type="text" name="status" id="stauts" onChange={handleStatus} placeholder="What's on your mind?" className='inputText'
         /> <br /><br />
        <button onClick={handleSubmit}>Send Status</button>
        <h2>What you're thinking is: </h2>
        <p>{ sent ?? statusData.status}</p>
      </div>
    </>
  )
}

export default App
