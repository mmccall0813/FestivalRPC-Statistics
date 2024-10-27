import {SlashCommandBuilder} from '@discordjs/builders';
import {EmbedBuilder, ChatInputCommandInteraction} from 'discord.js';
import { ExtendedClient, Command } from '../Bot';

const data = new SlashCommandBuilder()
    .setName('connected')
    .setDescription('Shows how many FestivalRPC instances are connected to the analytics server.');

const exec = async (interaction: ChatInputCommandInteraction, client: ExtendedClient) => {
    let embed = new EmbedBuilder();
    let sockets = await client.io.fetchSockets();

    embed.setTitle("Connected count");
    embed.setDescription("There are currently " + sockets.length + " FestivalRPC instances connected to the analytics server.");
    embed.setColor("Green");

    interaction.reply({embeds: [embed]});
}

const exportData: Command = {
    data: data,
    exec: exec
}

export default exportData;