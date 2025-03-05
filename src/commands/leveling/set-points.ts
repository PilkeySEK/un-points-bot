import { CommandInteraction, EmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { set_user_points } from "../../util/db";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("set-points")
        .setDescription("Set a user's point amount")
        .addIntegerOption(option => option.setName("points").setRequired(true).setDescription("The points amount to set"))
        .addUserOption(option => option.setName("user").setRequired(false).setDescription("The user to set the points of"))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: async (interaction: CommandInteraction) => {
        let user = interaction.options.get("user")?.user;
        if (user == undefined) user = interaction.user;
        const points = interaction.options.get("points")?.value as number;
        if (user == undefined) return;
        try {
            await set_user_points(user.id, points);
        }
        catch (e) {
            interaction.reply({ content: "Something went wrong :(", flags: MessageFlags.Ephemeral });
            return;
        }
        interaction.reply({ content: `Successfully set the point amount of <@${user.id}> to \`${points}\``, flags: MessageFlags.Ephemeral, allowedMentions: { users: [] } });
    }
};