import { ActionRowBuilder, ButtonBuilder, ButtonComponentData, ButtonStyle, CommandInteraction, ComponentType, EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { get_top_10_by_points } from "../../util/db";
import { footer_icon_url } from "../../../config.json";
import { getLeaderboard } from "../../api/api";
import { countLeaderboardPages, getLeaderboardPage } from "../../util/util";

export default {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Official OpenFront leaderboard"),
    execute: async (interaction: CommandInteraction) => {
        const fullLb = await getLeaderboard();
        const lb = await getLeaderboardPage(fullLb, 0, 5);
        const embed = new EmbedBuilder()
            .setColor(0x42baff)
            .setTitle("OpenFront Leaderboard")
            .setURL("https://openfront.io")
            .setDescription(`${(() => {
                if(lb === undefined) {
                    return "*Something went wrong :(*";
                }
                let ret = "";
                lb.forEach(entry => {
                    if(entry.public_id === null) {
                        ret += `***<anonymous>***\n__Wins__: ${entry.wins}\n__Losses__: ${entry.losses}\n__Ratio__: ${entry.wlr}\n`;
                    }
                    else {
                        if(entry.user === null) {
                            ret += `***${entry.public_id}***\n__Wins__: ${entry.wins}\n__Losses__: ${entry.losses}\n__Ratio__: ${entry.wlr}\n`;
                        }
                        else {
                            ret += `***${entry.public_id}***\n__Wins__: ${entry.wins}\n__Losses__: ${entry.losses}\n__Ratio__: ${entry.wlr}\n__Discord__: <@${entry.user.id}> (\`@${entry.user.username}\`)\n`;
                        }
                    }
                });
                return ret;
            })()}`)
            .setTimestamp()
            .setFooter({ text: "UN Points Bot", iconURL: footer_icon_url });

        const nextPage = new ButtonBuilder()
            .setCustomId("nextPage:0")
            //.setLabel("Next")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("➡️");
        const prevPage = new ButtonBuilder()
            .setCustomId("prevPage:0")
            //.setLabel("Prev")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("⬅️");
        const pages = new ButtonBuilder()
            .setCustomId("pages")
            .setStyle(ButtonStyle.Success)
            .setDisabled(true)
            .setLabel(`1/${countLeaderboardPages(fullLb, 5)}`);
        const row: any = new ActionRowBuilder().addComponents(prevPage, pages, nextPage);
        await interaction.reply({ embeds: [embed], components: [ row ] });
    }
};