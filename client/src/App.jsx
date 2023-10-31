import "./App.css";
import Chat from "./Chat/Chat";
import Messages from "./Chat/Messages";
import View from "./Chat/View";
import { Routes, Route } from "react-router-dom";
import io from "socket.io-client";

function App() {
  const socket = io.connect("http://localhost:3120/");

  return (
    <>
      <Routes>
        <Route path="/" element={<View socket={socket} />} />
        <Route path="/messages/:name" element={<Messages socket={socket} />} />
        <Route
          path="/chat/:type/:user/:user_id/:forward_id"
          element={<Chat socket={socket} />}
        />
      </Routes>
      <div>
        <a href="https://yamakalyan3120.web.app/" referrerPolicy="noreferernoreference" target="_black">Developed by yama kalyan</a>
      </div>
    </>
  );
}

export default App;
