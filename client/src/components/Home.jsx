import React, { useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo1.png"; // Update path if needed

function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const id = uuid();
    setRoomId(id);
    toast.success("Room ID generated");
  };

  const createRoom = (e) => {
    e.preventDefault();
    if (!roomId || !username) {
      toast.error("Both fields required");
      return;
    }
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
    toast.success("Room is created");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md border ">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo" className="h-32 w-32" />
        </div>

        <form className="space-y-5">
          <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
            Join a Room
          </h2>

          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />

          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />

          <button
            onClick={createRoom}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Join
          </button>

          <div className="text-sm text-center text-gray-600 dark:text-gray-300">
            Don’t have a Room ID?{" "}
            <span
              onClick={generateRoomId}
              className="text-green-600 cursor-pointer hover:underline dark:text-green-400"
            >
              Create New
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Home;
