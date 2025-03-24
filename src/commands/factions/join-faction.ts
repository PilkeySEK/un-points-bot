import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getAllFactions, joinFaction } from "../../util/db";
import { footer_icon_url } from "../../../config.json";

module.exports = {
    data: (async () => {
        const factions = await getAllFactions();

        return new SlashCommandBuilder()
        .setName("join-faction")
        .setDescription("Join the specified faction")
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
        )})(),
    execute: async (interaction: CommandInteraction) => {
        const faction = interaction.options.get("faction")?.value as string;
        const user = interaction.user;
        await joinFaction(user.id, faction);
        const faction_name = (await getAllFactions()).find(f => f.id == faction);
        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(0x42baff)
                .setDescription(faction_name == undefined ? `The faction **${faction}** was not found :(` : `Joined **${faction_name}**!`)
                .setTimestamp()
                .setFooter({ text: "UN Points Bot", iconURL: footer_icon_url })
            ]
        });
    }
};