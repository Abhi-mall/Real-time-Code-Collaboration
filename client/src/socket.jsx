import { io } from "socket.io-client";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const initSocket = async () => {
  const options = {
    "force new connection": true,
    reconnectionAttempts: "Infinity",
    timeout: 10000,
    transports: ["websocket"],
  };
  return io(backendUrl, options);
};
