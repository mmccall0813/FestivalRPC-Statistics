import {SlashCommandBuilder} from '@discordjs/builders';
import {EmbedBuilder, ChatInputCommandInteraction} from 'discord.js';
import { ExtendedClient, Command } from '../Bot';

const data = new SlashCommandBuilder()
    .setName('download')
    .setDescription('Shows how you how to get FestivalRPC.');

const exec = async (interaction: ChatInputCommandInteraction, client: ExtendedClient) => {
    let embed = new EmbedBuilder();
    
    embed.setTitle("Download");
    embed.setDescription("FestivalRPC can be downloaded from the project's github page\nhttps://github.com/mmccall0813/FestivalRPC/");
    embed.setColor("Green");

    interaction.reply({embeds: [embed]});
}

const exportData: Command = {
    data: data,
    exec: exec
}

export default exportData;