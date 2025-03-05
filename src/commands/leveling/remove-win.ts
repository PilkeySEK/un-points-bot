import { CommandInteraction, EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { get_user_points, remove_win, set_user_points } from "../../util/db";
import { win_point_amount, footer_icon_url } from "../../../config.json";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("remove-win")
        .setDescription("Un-register a win."),
    execute: async (interaction: CommandInteraction) => {
        const curr_points = await get_user_points(interaction.user.id);
        if(curr_points - win_point_amount < 0) {
            interaction.reply({content: "You don't have a win.", flags: MessageFlags.Ephemeral});
            return;
        }
        try {
            await set_user_points(interaction.user.id, curr_points - win_point_amount);
            await remove_win(interaction.user.id);
        }
        catch (e) {
            interaction.reply({ content: "Something went wrong :(", flags: MessageFlags.Ephemeral });
            return;
        }
        const embed = new EmbedBuilder()
            .setColor(0x42baff)
            .setDescription(`Un-registered your win. Removed \`${win_point_amount}\` pts.`)
            .setTimestamp()
            .setFooter({ text: "UN Points Bot", iconURL: footer_icon_url });

        interaction.reply({ embeds: [embed] });
    }
};