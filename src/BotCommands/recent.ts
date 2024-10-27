import {SlashCommandBuilder} from '@discordjs/builders';
import {EmbedBuilder, ChatInputCommandInteraction} from 'discord.js';
import { ExtendedClient, Command } from '../Bot';
import { SongPlay } from '..';

const data = new SlashCommandBuilder()
    .setName('recent')
    .setDescription('Shows how what songs have been recently played.');

const exec = async (interaction: ChatInputCommandInteraction, client: ExtendedClient) => {
    let embed = new EmbedBuilder();
    let sockets = await client.io.fetchSockets();
    let plays: RecentTrack[] = [];

    interface RecentTrack extends SongPlay {
        song: string
    }

    Object.keys(client.data).forEach( (songId) => {
        client.data[songId].plays.forEach( (play) => {
            plays.push({...play, song: songId});
        });
    });

    plays.sort( (a, b) => {
        return b.date - a.date;
    });

    let desc = "";

    plays.splice(0, 5).forEach( (play) => {
        desc += `<t:${Math.floor(play.date / 1000)}:R> ${play.id} played ${client.data[play.song].meta.tt} on ${play.difficulty} ${play.instrument} for ${play.duration} seconds\n`;
    })

    embed.setTitle("Recent Tracks");
    embed.setColor("Green");
    embed.setDescription(desc);

    interaction.reply({embeds: [embed]});
}

const exportData: Command = {
    data: data,
    exec: exec
}

export default exportData;