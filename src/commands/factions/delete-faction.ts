import { CommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { deleteFaction, getAllFactions } from "../../util/db";

let factions = await getAllFactions();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("delete-faction")
        .setDescription("Delete a faction")
        .addStringOption(option =>
            option.setName("faction")
                .setDescription("The faction")
                .setRequired(true)
                .addChoices(((): { name: string, value: string }[] => {
                    let ret: { name: string, value: string }[] = [];
                    factions.forEach(faction => {
                        ret.push({ name: faction.name, value: faction.id });
                    });
                    return ret;
                })())
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: async (interaction: CommandInteraction) => {
        const faction = interaction.options.get("faction")?.value as string;
        await deleteFaction(faction);
        await interaction.reply("Done");
    }
};