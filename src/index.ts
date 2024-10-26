import { readFileSync } from "fs";
import socketio from "socket.io";

const config = JSON.parse(readFileSync("./config.json").toString());
const io = new socketio.Server();
let debuglogs = true;

io.on("connection", (socket) => {
    let identified = false;
    let id = "";
    let status = {
        "playing": false,
        "song": "",
        "instrument": "",
        "difficulty": "",
        "started": 0
    }

    if(debuglogs) console.log("recieved socketio connection")

    socket.on("identify", (name: string) => {
        if(typeof name !== "string") return socket.disconnect(); // stop trying to crash my server!!!
        id = name;
    });

    socket.on("startSong", (song: string, instrument: string, difficulty: string) => {
        if(typeof song !== "string" || typeof instrument !== "string" || typeof difficulty !== "string") return socket.disconnect(); // stop trying to crash my server!!!
        status.playing = true;
        status.song = song;
        status.difficulty = difficulty;
        status.instrument = instrument;
        status.started = Date.now();
    })

    
    setTimeout( () => {
        if(!identified) socket.disconnect();
    }, 5000);
})

io.listen(8924)