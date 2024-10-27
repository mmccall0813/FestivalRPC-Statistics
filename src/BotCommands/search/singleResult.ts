import {EmbedBuilder, ChatInputCommandInteraction} from 'discord.js';
import { ExtendedClient } from '../../Bot';
import { FuseResult } from 'fuse.js';
import { Song } from '../..';

export default function handleSingleResult(interaction: ChatInputCommandInteraction, client: ExtendedClient, result: FuseResult<Song>){
    const embed = new EmbedBuilder();
    let song = result.item;

    embed.setTitle(song.meta.tt || "No song title...?");
    embed.setColor("DarkPurple");
    embed.setFooter({text: song.meta.sn});

    embed.addFields( [
        {name: "Artist", value: song.meta.an, inline: true},
        {name: "Length", value: `${Math.floor(song.meta.dn / 60)}m ${song.meta.dn % 60}s`, inline: true},
        {name: "Total Plays", value: `${song.plays.length}`, inline: true}
    ]);

    let recent = song.plays.slice(song.plays.length - 5).reverse();
    let recentString = "";

    recent.forEach( (play) => {
        recentString += `<t:${Math.floor(play.date / 1000)}:R> ${play.id} played this song on ${play.difficulty} ${play.instrument} for ${play.duration} seconds\n`;
    });

    let instrumentBreakdown = "";

    Object.keys(song.instruments).forEach( (inst) => {
        instrumentBreakdown += `${inst}: ${song.instruments[inst]}\n`;
    });

    embed.addFields([
        {
            name: "Plays per instrument",
            value: instrumentBreakdown,
            inline: false
        },
        {
            name: "Recent Plays",
            value: recentString,
            inline: false
        }
    ]);

    interaction.replied ? interaction.editReply( {embeds: [embed], components: []} ) : interaction.reply( { embeds: [embed] });
}