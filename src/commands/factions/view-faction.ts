import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { factionMembers, getAllFactions, getFaction } from "../../util/db";
import { footer_icon_url } from "../../../config.json";

export default {
    data: await (async () => {
        const factions = await getAllFactions();
        return new SlashCommandBuilder()
            .setName("view-faction")
            .setDescription("View a faction")
            .addStringOption(option =>
                option.setName("faction")
                    .setDescription("The faction")
                    .setRequired(true)
                    .addChoices(((): { name: string; value: string; }[] => {
                        let ret: { name: string, value: string }[] = [];
                        factions.forEach(faction => {
                            ret.push({ name: faction.name, value: faction.id });
                        });
                        return ret;
                    })())
            )
    })(),
    execute: async (interaction: CommandInteraction) => {
        const faction_id = interaction.options.get("faction")?.value as string;
        const faction = await getFaction(faction_id);
        if (faction == null) {
            await interaction.reply({ content: "Couldn't find that faction :(" });
            return;
        }
        const members = await factionMembers(faction_id);
        let embed = new EmbedBuilder()
            .setColor(0x42baff)
            .setDescription(`## ${faction.name}\n__Members__: \`${members}\`\n__ID__: \`${faction.id}\``)
            .setTimestamp()
            .setFooter({ text: "UN Points Bot", iconURL: footer_icon_url });
        if (faction.icon != "") embed.setImage(faction.icon);
        await interaction.reply({
            embeds: [embed]
        });
    }
};