import * as fs from "node:fs";
import * as path from "node:path";
import { Client, Collection, Events, GatewayIntentBits, MessageFlags, SlashCommandBuilder } from "discord.js";
import { token } from "../config.json";
import { init } from "./util/db";
import { getLastMonthEnd, Command } from "./util/util";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

let commands: Collection<string, Command> = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command: { data: SlashCommandBuilder, execute: (interaction: any) => Promise<void> } = require(filePath);
        commands.set(command.data.name, new Command(command.data, command.execute));
    }
}

client.once(Events.ClientReady, (readyClient) => {
    init();
    console.log(`Last month end: ${getLastMonthEnd()}`);
    console.log(`UN Points Bot logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        }
    }
});

client.login(token);