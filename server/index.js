import express from 'express'
import http from 'http';
import {Server} from 'socket.io'
import dotenv from 'dotenv'
import axios from 'axios';
import cors from 'cors'
dotenv.config()

const app = express()

const server = http.createServer(app)
const PORT = 5000

const io = new Server(server,{
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});


const languagesConfig = {
  python3 : { versionIndex: "3" },
  
  java: { versionIndex: "3" },
  cpp: { versionIndex: "4" },
  nodejs: { versionIndex: "3" },
  c: { versionIndex: "4" },
  ruby: { versionIndex: "3" },
  go: { versionIndex: "3" },
  scala: { versionIndex: "3" },
  bash: { versionIndex: "3" },
  sql: { versionIndex: "3" },
  pascal: { versionIndex: "2" },
  csharp: { versionIndex: "3" },
  php: { versionIndex: "3" },
  swift: { versionIndex: "3" },
  rust: { versionIndex: "3" },
  r: { versionIndex: "3" },
};



// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

const userSocketMap = {}

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
    return {
      socketId,
      username : userSocketMap[socketId]
    }
  })
}

io.on("connection", (socket)=> {
  // console.log(`User connected ${socket.id}`)

   socket.on('join', ({roomId, username}) => {
    userSocketMap[socket.id] = username
    socket.join(roomId)
    const clients = getAllConnectedClients(roomId)    
  //notify to new user is joined
    clients.forEach(({socketId}) => {
      io.to(socketId).emit('joined',  {
        clients,
        username,
        socketId : socket.id,
      })
    })
   })

  socket.on('code-change', ({code, roomId}) => {
    socket.in(roomId).emit('code-change', {code})
  })

   // when new user join the room all the code which are there are also shows on that persons editor
  socket.on("code-sync", ({ socketId, code }) => {
    io.to(socketId).emit('code-change', { code });
  });

  //leave room
  socket.on('disconnecting', ()=> {
  const rooms = [...socket.rooms];
  rooms.forEach((roomId) => {
    socket.in(roomId).emit('disconnected', {
      socketId : socket.id,
      username : userSocketMap[socket.id]
    })
   })

   delete userSocketMap[socket.id]
   socket.leave()
  })
})

app.post("/compile", async (req, res) => {
  const {code, language} = req.body
  try {
    const response = await axios.post("https://api.jdoodle.com/v1/execute", {
      language,
      script : code,
      versionIndex : languagesConfig[language].versionIndex,
      clientId : process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECERET_KEY
    })
    res.json(response.data)
  } catch (error) {
    console.log(error)
    return res.status(500).json({
     error: "Failed to compile code"
    })
  }
})


server.listen(PORT, (req, res)=> {
  console.log(`server is running ${PORT}`)
})
