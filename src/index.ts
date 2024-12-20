import fs from "fs";
import socketio from "socket.io";
import { StatisticsBot } from "./Bot";
const { Client } = require('fnbr');
import axios from "axios";
import express from "express";
import http from "http";
import path from "path";

const config = JSON.parse(fs.readFileSync("./config.json").toString());
const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server);
let debuglogs = true;

app.get("/data.json", (req, res) => {
    res.sendFile(path.resolve("./data/data.json"));
});

(async () => {
    let auth;
    try {
      auth = { deviceAuth: JSON.parse(fs.readFileSync('./deviceAuth.json').toString()) };
    } catch (e) {
      auth = { authorizationCode: async () => Client.consoleQuestion('Please enter an authorization code: ') };
    }
  
    const client = new Client({ auth });
  
    client.on('deviceauth:created', (da: any) => fs.writeFileSync('./deviceAuth.json', JSON.stringify(da, null, 2)));
  
    await client.login();
    console.log(`Logged in as ${client.user.self.displayName}`);

    app.get("/island-code", async (req, res) => {
        if(typeof req.query.code !== "string") return;
        try {
            let data = await client.getCreativeIsland(req.query.code);
            res.json(data);
        } catch(err){
            res.sendStatus(404);
        }
    });
})();

export interface SongPlay {
    id: string,
    instrument: string,
    date: number,
    duration: number,
    difficulty: string
}
export interface Song {
    plays: SongPlay[],
    timeplayed: number,
    instruments: {
        [key: string]: number
    },
    meta: {
        tt: string,
        au: string,
        ry: string,
        an: string,
        sn: string,
        dn: number
    }
}
export interface Stats {
    [key: string]: Song
};



let data: Stats = {};

if(!fs.existsSync("./data")) fs.mkdirSync("data");
if(fs.existsSync("./data/data.json")){
    console.log("importing data...");
    data = JSON.parse(fs.readFileSync("./data/data.json").toString());
}

const bot = new StatisticsBot(config, data, io);

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

    socket.on("stopSong", async () => {
        if(!status.playing) return; // whar ?
        status.playing = false;

        try {
            if(!data[status.song]){
                let sparktracks = await axios.get("https://fortnitecontent-website-prod07.ol.epicgames.com/content/api/pages/fortnite-game/spark-tracks");
                let tracks: {[key: string]: any} = {};

                Object.values(sparktracks.data).forEach( (track) => {
                    if(typeof track === "object" && !Array.isArray(track)){
                        let song = track as any;
                        tracks[song.track.sn.toLowerCase()] = song;
                    }
                });
                if(!tracks[status.song]) return; // if not in sparktracks, ignore it

                data[status.song] = {plays: [], instruments: {}, timeplayed: 0, meta: tracks[status.song].track};
            };
        } catch(err){
            console.log("Error when getting song meta..." + err);
            return;
        }

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

server.listen(8924)