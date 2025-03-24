import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { factionMembers, getAllFactions, joinFaction } from "../../util/db";
import { footer_icon_url } from "../../../config.json";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("list-factions")
        .setDescription("List all factions"),
    execute: async (interaction: CommandInteraction) => {
        const factions = await getAllFactions();
        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(0x42baff)
                .setDescription(`## Factions${((): string => {
                    let ret: string = "";
                    factions.forEach(faction => {
                        ret += "\n**";
                        ret += faction.name;
                        ret += "**\n__Members__: `";
                        ret += factionMembers(faction.id);
                        ret += "`";
                    });
                    return ret == "" ? "\n*none*" : ret;
                })()}`)
                .setTimestamp()
                .setFooter({ text: "UN Points Bot", iconURL: footer_icon_url })
            ]
        });
    }
};