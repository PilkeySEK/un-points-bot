import { CommandInteraction, EmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { addDailyPoints, get_user_points, set_user_points } from "../../util/db";

export default {
    data: new SlashCommandBuilder()
        .setName("remove-points")
        .setDescription("Remove a amount from a user's point amount")
        .addIntegerOption(option => option.setName("points").setRequired(true).setDescription("The points amount to remove"))
        .addUserOption(option => option.setName("user").setRequired(false).setDescription("The user to remove the points from"))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: async (interaction: CommandInteraction) => {
        let user = interaction.options.get("user")?.user;
        if (user == undefined) user = interaction.user;
        const points = interaction.options.get("points")?.value as number;
        const curr_points = await get_user_points(user.id);
        if (user == undefined) return;
        try {
            await set_user_points(user.id, curr_points - points);
                        let date = new Date();
                        await addDailyPoints(user.id, 0-points, date.getUTCDate(), date.getUTCMonth(), date.getUTCFullYear());
        }
        catch (e) {
            interaction.reply({ content: "Something went wrong :(", flags: MessageFlags.Ephemeral });
            return;
        }
        interaction.reply({ content: `Successfully removed \`${points}\` from <@${user.id}> (now \`${curr_points + points}\`)`, flags: MessageFlags.Ephemeral, allowedMentions: { users: [] } });
    }
};