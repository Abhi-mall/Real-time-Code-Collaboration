import React, { useEffect, useRef, useState } from "react";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "../Socket.jsx";
import { ACTIONS } from "../Actions";
import logo from "../assets/logo1.png";
import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

const LANGUAGES = [
  "python3",
  "java",
  "cpp",
  "nodejs",
  "c",
  "ruby",
  "go",
  "scala",
  "bash",
  "sql",
  "pascal",
  "csharp",
  "php",
  "swift",
  "rust",
  "r",
];

function EditorPage() {
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState("");
  const [isCompileWindowOpen, setIsCompileWindowOpen] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python3");
  const codeRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const socketRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", handleErrors);
      socketRef.current.on("connect_failed", handleErrors);

      function handleErrors(err) {
        console.log("Error", err);
        toast.error("Socket connection failed, Try again later");
        navigate("/");
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) =>
          prev.filter((client) => client.socketId !== socketId)
        );
      });
    };
    init();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current?.off(ACTIONS.JOINED);
      socketRef.current?.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  if (!location.state) {
    return <Navigate to="/" />;
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied");
    } catch (error) {
      console.log(error);
      toast.error("Unable to copy Room ID");
    }
  };

  const leaveRoom = () => {
    navigate("/");
  };

  const runCode = async () => {
    setIsCompiling(true);
    try {
      const response = await axios.post("http://localhost:5000/compile", {
        code: codeRef.current,
        language: selectedLanguage,
      });
      setOutput(response.data.output || JSON.stringify(response.data));
    } catch (error) {
      console.error("Error compiling code:", error);
      setOutput(error.response?.data?.error || "An error occurred");
    } finally {
      setIsCompiling(false);
    }
  };

  const toggleCompileWindow = () => {
    setIsCompileWindowOpen(!isCompileWindowOpen);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-60 bg-gray-900 text-white flex flex-col p-4">
          <img src={logo} alt="Logo" className="w-28 mx-auto mb-4" />
          <hr className="border-gray-600 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Members</h2>
          <div className="flex-1 overflow-y-auto space-y-2">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
          <hr className="border-gray-600 mt-4 mb-2" />
          <button
            className="w-full bg-green-700 hover:bg-green-800 py-2 rounded mb-2"
            onClick={copyRoomId}
          >
            Copy Room ID
          </button>
          <button
            className="w-full bg-red-700 hover:bg-red-800 py-2 rounded"
            onClick={leaveRoom}
          >
            Leave Room
          </button>
        </div>

        {/* Editor + Language */}
        <div className="flex-1 flex flex-col bg-gray-800 text-white">
          <div className="p-2 bg-gray-900 flex justify-end pr-12 items-center">
            <select
              className="bg-gray-700 text-white p-2 rounded"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 overflow-auto">
            <Editor
              socketRef={socketRef}
              roomId={roomId}
              onCodeChange={(code) => {
                codeRef.current = code;
              }}
            />
          </div>
        </div>
      </div>

      {/* Compile button */}
      <button
        onClick={toggleCompileWindow}
        className="fixed bottom-4 right-4 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded shadow-lg z-50"
      >
        {isCompileWindowOpen ? "Close Compiler" : "Open Compiler"}
      </button>

      {/* Compile Output */}
      {isCompileWindowOpen && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 h-[30vh] z-40 overflow-y-auto shadow-inner transition-all">
          <div className="flex justify-between items-center mb-3">
            <h5 className="text-lg font-semibold">
              Compiler Output ({selectedLanguage})
            </h5>
            <div className="flex gap-2">
              <button
                onClick={runCode}
                disabled={isCompiling}
                className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded"
              >
                {isCompiling ? "Compiling..." : "Run Code"}
              </button>
              <button
                onClick={toggleCompileWindow}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-1 rounded"
              >
                Close
              </button>
            </div>
          </div>
          <pre className="bg-black text-green-400 p-3 rounded max-h-52 overflow-auto">
            {output || "Output will appear here after compilation"}
          </pre>
        </div>
      )}
    </div>
  );
}

export default EditorPage;
