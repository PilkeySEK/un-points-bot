import { CommandInteraction, EmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { get_user, get_user_points, get_wins, getAllFactions, getMonthlyPoints, MonthlyPoints } from "../../util/db";
import { footer_icon_url } from "../../../config.json";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("Get a user's stats")
        .addUserOption(option => option.setName("user").setRequired(false).setDescription("The user")),
    execute: async (interaction: CommandInteraction) => {
        let user = interaction.options.get("user")?.user;
        if (user == undefined) user = interaction.user;
        const db_user = await get_user(user.id);
        const factions = await getAllFactions();
        const points = db_user.points;
        const wins = await get_wins(user.id);
        const monthly_points = await (async (): Promise<string> => {
            const monthly = await getMonthlyPoints(user.id);
            let str = "";
            let ordered_monthly: MonthlyPoints[] = monthly;
            ordered_monthly.sort((a, b) => {
                if(a.year < b.year) return 1;
                if(a.year > b.year) return -1;
                if(a.month < b.month) return 1;
                return -1;
            });
            ordered_monthly.forEach((elem) => {
                str += `**${elem.month + 1}**/**${elem.year}**: ${elem.points}\n`;
            });
            return str;
        })();
        const embed = new EmbedBuilder()
            .setColor(0x42baff)
            .setDescription(`# Stats for <@${user.id}>\n__Points:__ ${points} pts\n__Wins:__ ${wins} ${wins == 1 ? "win" : "wins"}\n__Faction:__ ${factions.find(faction => faction.id == db_user.faction)}\n\n## Monthly Points\n${monthly_points}`)
            .setTimestamp()
            .setFooter({ text: "UN Points Bot", iconURL: footer_icon_url })
        interaction.reply({ embeds: [embed] })
    }
};