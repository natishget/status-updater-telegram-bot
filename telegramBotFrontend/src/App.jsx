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
  const [customeError, setCustomError] = useState("")
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    const initData = tg.initData;
  
    if (!initData) return;
  
    const params = new URLSearchParams(initData);
    const data = Object.fromEntries(params);
  
    if (data.user) {
      try {
        data.user = JSON.parse(data.user);
      } catch (err) {
        setCustomError(err);
        return;
      }
  
      setStatusData(prev => ({
        ...prev,
        id: data.user.id,
        name: data.user.first_name,
      }));
    }
  }, []);

  const handleStatus = (e) =>{
    const value = e.target.value;
    setStatusData(prev => ({
      ...prev,
      status: value
    }))
  } 

  useEffect(() =>{
    console.log(statusData)
  }, [statusData])
  

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
        <p>{ customeError }</p>
      </div>
    </>
  )
}

export default App
