import { CommandInteraction, EmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { set_wins } from "../../util/db";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("set-wins")
        .setDescription("Set a user's win amount")
        .addIntegerOption(option => option.setName("wins").setRequired(true).setDescription("The win amount to set"))
        .addUserOption(option => option.setName("user").setRequired(false).setDescription("The user to set the wins of"))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: async (interaction: CommandInteraction) => {
        let user = interaction.options.get("user")?.user;
        if (user == undefined) user = interaction.user;
        const wins = interaction.options.get("wins")?.value as number;
        if (user == undefined) return;
        try {
            await set_wins(user.id, wins);
        }
        catch (e) {
            interaction.reply({ content: "Something went wrong :(", flags: MessageFlags.Ephemeral });
            return;
        }
        interaction.reply({ content: `Successfully set the win amount of <@${user.id}> to \`${wins}\``, flags: MessageFlags.Ephemeral, allowedMentions: { users: [] } });
    }
};