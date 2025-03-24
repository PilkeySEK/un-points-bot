import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { joinFaction } from "../../util/db";
import { footer_icon_url } from "../../../config.json";

export default {
    data: new SlashCommandBuilder()
        .setName("leave-faction")
        .setDescription("Leave your faction"),
    execute: async (interaction: CommandInteraction) => {
        const user = interaction.user;
        await joinFaction(user.id, "");
        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(0x42baff)
                .setDescription("Left your faction.")
                .setTimestamp()
                .setFooter({ text: "UN Points Bot", iconURL: footer_icon_url })
            ]
        });
    }
};