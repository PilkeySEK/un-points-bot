import { CommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { deleteFaction, getAllFactions, getFaction } from "../../util/db";
import { deploy } from "../../deploy-commands";

export default {
    data: await (async () => {
        const factions = await getAllFactions();
        return new SlashCommandBuilder()
            .setName("delete-faction")
            .setDescription("Delete a faction")
            .addStringOption(option =>
                option.setName("faction")
                    .setDescription("The faction")
                    .setRequired(true)
                    .addChoices(((): { name: string; value: string; }[] => {
                        let ret: { name: string, value: string }[] = [];
                        factions.forEach(faction => {
                            ret.push({ name: faction.name, value: faction.id });
                        });
                        return ret;
                    })())
            )
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    })(),
    execute: async (interaction: CommandInteraction) => {
        const faction_id = interaction.options.get("faction", true).value as string;
        const faction = await getFaction(faction_id);
        if(faction == null) return;
        await interaction.guild?.channels.delete(faction.channel, "Deleting faction channel");
        await interaction.guild?.roles.delete(faction.role, "Deleting faction role");
        await deleteFaction(faction_id);
        await deploy();
        await interaction.reply("Done");
    }
};