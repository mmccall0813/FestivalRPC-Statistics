import {SlashCommandBuilder} from '@discordjs/builders';
import {EmbedBuilder, ChatInputCommandInteraction} from 'discord.js';
import { ExtendedClient, Command } from '../Bot';
import { SongPlay } from '..';
import { all } from 'axios';

const data = new SlashCommandBuilder()
    .setName('userstats')
    .setDescription('See stats on a user.')
    .addStringOption( (option) => option.setName("name").setDescription("The user identifier to look for, must be exact match.").setRequired(true) );

const exec = async (interaction: ChatInputCommandInteraction, client: ExtendedClient) => {
    let embed = new EmbedBuilder();

    interface RecentTrack extends SongPlay {
        song: string
    }

    let allPlays: RecentTrack[] = [];

    Object.keys(client.data).forEach( (songid) => {
        let stuff = client.data[songid];
        let withSongId: RecentTrack[] = [];

        stuff.plays.forEach( (p) => withSongId.push({...p, song: songid}));

        allPlays = allPlays.concat(withSongId);
    });

    if(allPlays.length === 0){
        embed.setTitle("User not found.")
        .setDescription("Make sure the identifier is **exactly** the same as what you're looking for.");

        return interaction.reply({embeds: [embed]});
    }

    embed.setTitle("User Stats");
    embed.setColor("Green");

    let totalTime = 0;
    let instrumentTally: {[key: string]: number} = {"Vocals": 0, "Lead": 0, "Bass": 0, "Drums": 0, "Pro Lead": 0, "Pro Bass": 0};

    allPlays.forEach( (play) => {
        totalTime += play.duration;
        instrumentTally[play.instrument]++;
    })

    let instrumentBreakdown = "";

    Object.keys(instrumentTally).forEach( (inst) => {
        instrumentBreakdown += `${inst}: ${instrumentTally[inst]}\n`;
    });

    allPlays.sort( (a, b) => {
        return b.date - a.date;
    });

    let recent = allPlays.slice(0, 5);
    let recentString = "";

    recent.forEach( (play) => {
        recentString += `<t:${Math.floor(play.date / 1000)}:R> Played ${client.data[play.song].meta.tt} on ${play.difficulty} ${play.instrument} for ${play.duration} seconds\n`;
    });

    embed.addFields([
        {"name": "Total Song Plays", value: `${allPlays.length}`},
        {"name": "Total Time Spent Playing Songs", value: `${Math.floor(totalTime / 3600)}h ${Math.floor((totalTime % 3600) / 60)}m ${totalTime % 60}s`},
        {"name": "Instrument Play Count", value: instrumentBreakdown},
        {"name": "Recent Tracks", value: recentString}
    ]);

    interaction.reply({embeds: [embed]});    
}

const exportData: Command = {
    data: data,
    exec: exec
}

export default exportData;