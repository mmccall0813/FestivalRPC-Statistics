import fs from "fs";
import socketio from "socket.io";

const config = JSON.parse(fs.readFileSync("./config.json").toString());
const io = new socketio.Server();
let debuglogs = true;

interface SongPlay {
    id: string,
    instrument: string,
    date: number,
    duration: number,
    difficulty: string
}

let data: {[key: string]: {plays: SongPlay[], timeplayed: number, instruments: {[key: string]: number}}} = {};

if(!fs.existsSync("./data")) fs.mkdirSync("data");
if(fs.existsSync("./data/data.json")) data = JSON.parse(fs.readFileSync("./data/data.json").toString());

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
        identified = true;
    });

    socket.on("startSong", (song: string, instrument: string, difficulty: string) => {
        if(typeof song !== "string" || typeof instrument !== "string" || typeof difficulty !== "string") return socket.disconnect(); // stop trying to crash my server!!!
        if(debuglogs) console.log("recieved startsong");
        status.playing = true;
        status.song = song;
        status.difficulty = difficulty;
        status.instrument = instrument;
        status.started = Date.now();
    })

    socket.on("stopSong", () => {
        if(!status.playing) return; // whar ?
        status.playing = false;

        if(!data[status.song]){
            data[status.song] = {plays: [], instruments: {}, timeplayed: 0};
        };

        data[status.song].plays.push(
            {
                "date": Date.now(),
                "difficulty": status.difficulty,
                "duration": Math.floor((Date.now() - status.started) / 1000),
                "instrument": status.instrument,
                "id": id
            }
        );

        data[status.song].timeplayed += Math.floor((Date.now() - status.started) / 1000);
        if(!data[status.song].instruments[status.instrument]) data[status.song].instruments[status.instrument] = 0;
        data[status.song].instruments[status.instrument]++;

        fs.writeFileSync("./data/data.json", JSON.stringify(data, null, 2));

        if(debuglogs) console.log(id + " just finished playing " + status.song + " and spent " + ((Date.now() - status.started) / 1000) + " seconds playing it.")
    })
    
    setTimeout( () => {
        if(!identified) socket.disconnect();
    }, 5000);
})

io.listen(8924)