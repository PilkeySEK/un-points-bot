import { CommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { createFaction } from "../../util/db";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("create-faction")
        .setDescription("Create a new faction")
        .addStringOption(option =>
            option.setName("name")
                .setDescription("The display name")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("id")
                .setDescription("The id")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: async (interaction: CommandInteraction) => {
        const name = interaction.options.get("name")?.value as string;
        const id = interaction.options.get("id")?.value as string;
        await createFaction({name: name, id: id});
        await interaction.reply("Done");
    }
};