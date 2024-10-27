import {EmbedBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle} from 'discord.js';
import { ExtendedClient } from '../../Bot';
import { FuseResult } from 'fuse.js';
import { Song } from '../..';
import handleSingleResult from './singleResult';

export default async function handleMultipleResults(interaction: ChatInputCommandInteraction, client: ExtendedClient, results: FuseResult<Song>[]){
    const embed = new EmbedBuilder();
    const buttons = new ActionRowBuilder<ButtonBuilder>();

    embed.setTitle("Search Results")
    .setDescription("Multiple songs found... Select one from the list below or try searching something more specific.");

    results.slice(0, 4).forEach( (song, index) => {
        embed.addFields([
            {name: String(index+1), value: `${song.item.meta.tt} - ${song.item.meta.an}`}
        ]);
        buttons.addComponents([
            new ButtonBuilder()
            .setLabel(`${index+1}: ${song.item.meta.tt} - ${song.item.meta.an}`)
            .setCustomId(index.toString())
            .setStyle(ButtonStyle.Secondary)
        ]);
    });

    const response = await interaction.reply( {embeds: [embed], components: [buttons]} );

    const collector = response.createMessageComponentCollector({"time": 300 * 1000});

    collector.on("collect", (buttonPress) => {
        handleSingleResult(interaction, client, results[parseInt(buttonPress.customId)]);
    });

    collector.on("end", () => {
        buttons.components.forEach((button) => {
            button.setDisabled(true);
        })
        interaction.editReply({ embeds: [embed], components: [buttons]});
    })
}