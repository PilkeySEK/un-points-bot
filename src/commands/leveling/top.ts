import { CommandInteraction, EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { get_top_10_by_points } from "../../util/db";
import { footer_icon_url } from "../../../config.json";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("top")
        .setDescription("Get the top 10 members by point amount"),
    execute: async (interaction: CommandInteraction) => {
        const top10 = await get_top_10_by_points();
        const embed = new EmbedBuilder()
            .setColor(0x42baff)
            .setTitle("Top Members")
            .setURL("https://openfront.io")
            .setDescription(`${(() => {
                let str = "";
                for (let i = 0; i < top10.length; i++) {
                    str = str + `${i + 1}. <@${top10[i].user_id}> - ${top10[i].points} pts\n`
                };
                return str == "" ? "*Nothing to display :(*" : str;
            })()}`)
            .setTimestamp()
            .setFooter({ text: "UN Points Bot", iconURL: footer_icon_url });

        await interaction.reply({ embeds: [embed] });
    }
};