import { CommandInteraction, EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { add_recruit, addDailyPoints, get_user_points, set_user_points } from "../../util/db";
import { recruit_point_amount, footer_icon_url } from "../../../config.json";
import { isStaff } from "../../util/util";

export default {
    data: new SlashCommandBuilder()
        .setName("add-recruit")
        .setDescription("Register a recruit for the specified user.")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to add the recruit for")
                .setRequired(true)
        ),
    execute: async (interaction: CommandInteraction) => {
        // permission check
        if(!interaction.inGuild() || interaction.guild == undefined) return;
        const guildMember = interaction.guild.members.cache.get(interaction.user.id);
        if(guildMember == undefined) return;
        if(!(await isStaff(guildMember))) return;

        const user = interaction.options.get("user", true).user;
        if(user == undefined) {
            interaction.reply({content: "Something went wrong :( user is undefined it seems :[", flags: MessageFlags.Ephemeral});
            return;
        }
        
        const curr_points = await get_user_points(user.id);
        try {
            await set_user_points(user.id, curr_points + recruit_point_amount);
            await add_recruit(user.id);
            let date = new Date();
            await addDailyPoints(user.id, recruit_point_amount, date.getUTCDate(), date.getUTCMonth(), date.getUTCFullYear());
        }
        catch (e) {
            interaction.reply({ content: "Something went wrong :(", flags: MessageFlags.Ephemeral });
            return;
        }
        const embed = new EmbedBuilder()
            .setColor(0x42baff)
            .setDescription(`Registered the recruit! Added \`${recruit_point_amount}\` pts.`)
            .setTimestamp()
            .setFooter({ text: "UN Points Bot", iconURL: footer_icon_url });

        interaction.reply({ embeds: [embed] });
    }
};