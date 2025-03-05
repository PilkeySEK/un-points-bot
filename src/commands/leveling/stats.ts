import { CommandInteraction, EmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { get_user_points, get_wins } from "../../util/db";
import { footer_icon_url } from "../../../config.json";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("Get a user's stats")
        .addUserOption(option => option.setName("user").setRequired(false).setDescription("The user")),
    execute: async (interaction: CommandInteraction) => {
        let user = interaction.options.get("user")?.user;
        if (user == undefined) user = interaction.user;
        const points = await get_user_points(user.id);
        const wins = await get_wins(user.id);
        const embed = new EmbedBuilder()
            .setColor(0x42baff)
            .setDescription(`# Stats for <@${user.id}>\n__Points:__ ${points} pts\n__Wins:__ ${wins} ${wins == 1 ? "win" : "wins"}`)
            .setTimestamp()
            .setFooter({ text: "UN Points Bot", iconURL: footer_icon_url })
        interaction.reply({ embeds: [embed] })
    }
};