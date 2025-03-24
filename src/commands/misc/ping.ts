import { CommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { is_connected } from "../../util/db";

export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Pong!"),
    execute: async (interaction: CommandInteraction) => {
        await interaction.reply({ content: `Pong!\n__Latency:__ \`${Date.now() - interaction.createdTimestamp}ms\`\n__Database Status:__ \`${(await is_connected()) ? "Connected" : "Disconnected"}\``, flags: MessageFlags.Ephemeral });
    }
};