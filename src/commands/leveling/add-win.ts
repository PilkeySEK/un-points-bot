import { CommandInteraction, EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { add_win, addDailyPoints, get_user_points, set_user_points } from "../../util/db";
import { win_point_amount, footer_icon_url } from "../../../config.json";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("add-win")
        .setDescription("Use this when you won a game!"),
    execute: async (interaction: CommandInteraction) => {
        
        const curr_points = await get_user_points(interaction.user.id);
        try {
            await set_user_points(interaction.user.id, curr_points + win_point_amount);
            await add_win(interaction.user.id);
            let date = new Date();
            await addDailyPoints(interaction.user.id, win_point_amount, date.getUTCDate(), date.getUTCMonth(), date.getUTCFullYear());
        }
        catch (e) {
            interaction.reply({ content: "Something went wrong :(", flags: MessageFlags.Ephemeral });
            return;
        }
        const embed = new EmbedBuilder()
            .setColor(0x42baff)
            .setDescription(`Registered your win! Added \`${win_point_amount}\` pts.`)
            .setTimestamp()
            .setFooter({ text: "UN Points Bot", iconURL: footer_icon_url });

        interaction.reply({ embeds: [embed] });
    }
};