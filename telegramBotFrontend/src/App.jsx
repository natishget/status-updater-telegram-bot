import { useEffect, useState } from 'react';
import axios from 'axios'; // ✅ You forgot to import axios
import './App.css';

function App() {
  const [statusData, setStatusData] = useState({
    status: "",
    id: "",
    name: "",
  });
  const [customError, setCustomError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    // ✅ Make sure Telegram WebApp object exists
    if (!window.Telegram || !window.Telegram.WebApp) {
      setCustomError("Not in Telegram");
      return;
    }

    const tg = window.Telegram.WebApp;
    tg.ready(); // ✅ Tells Telegram the app is ready

    const initData = tg.initData || tg.initDataUnsafe;
    if (!initData) {
      setCustomError("No initData received from Telegram");
      return;
    }

    const params = new URLSearchParams(initData);
    const data = Object.fromEntries(params);

    if (data.user) {
      try {
        data.user = JSON.parse(data.user);
      } catch (err) {
        setCustomError("Failed to parse user JSON");
        return;
      }

      setStatusData(prev => ({
        ...prev,
        id: data.user.id,
        name: data.user.first_name,
      }));
    } else {
      setCustomError("No user data found in initData");
    }
  }, []);

  const handleStatus = (e) => {
    const value = e.target.value;
    setStatusData(prev => ({
      ...prev,
      status: value
    }));
  };

  useEffect(() => {
    console.log(statusData);
  }, [statusData]);

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`http://localhost:3000/status`, statusData);
      alert("Successfully sent");
      setSent(true);
    } catch (error) {
      alert("Error occurred");
      console.log(error);
    }
  };

  return (
    <>
      <div>
        <h1>Hello {statusData.name || "Guest"}!!</h1>
        <input
          type="text"
          name="status"
          id="status"
          onChange={handleStatus}
          placeholder="What's on your mind?"
          className='inputText'
        /> 
        <br /><br />
        <button onClick={handleSubmit}>Send Status</button>
        <h2>What you're thinking is:</h2>
        <p>{ sent ? statusData.status : "" }</p>
        {customError && <p style={{color: "red"}}>{customError}</p>}
      </div>
    </>
  );
}

export default App;
