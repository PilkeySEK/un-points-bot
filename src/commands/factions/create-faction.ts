import { CommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { createFaction } from "../../util/db";
import { deploy } from "../../deploy-commands";

export default {
    data: new SlashCommandBuilder()
        .setName("create-faction")
        .setDescription("Create a new faction")
        .addStringOption(option =>
            option.setName("name")
                .setDescription("The display name")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("id")
                .setDescription("The id")
                .setRequired(true)
        )
        .addAttachmentOption(option =>
            option.setName("icon")
                .setDescription("The Faction's icon")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: async (interaction: CommandInteraction) => {
        const name = interaction.options.get("name", true).value as string;
        const id = interaction.options.get("id", true).value as string;
        let icon = interaction.options.get("icon", true).attachment;
        let attachment_url = "";
        if(icon == undefined) attachment_url = "";
        else attachment_url = icon.url;
        await createFaction({name: name, id: id, icon: attachment_url});
        await deploy();
        if(attachment_url == "") await interaction.reply({content: "Done"});
        else await interaction.reply({content: "Done", files: [attachment_url]});
    }
};