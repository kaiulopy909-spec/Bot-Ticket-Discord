const {
    ChannelType,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

const config = require("../config.json");

module.exports = {
    customId: "denuncia_ticket",

    async execute(interaction) {
        try {
            await interaction.deferReply({
                ephemeral: true
            });

            const guild = interaction.guild;
            const user = interaction.user;
            const nomeCanal = `denuncia-${user.id}`;

            const ticketExistente = guild.channels.cache.find(
                canal => canal.name === nomeCanal
            );

            if (ticketExistente) {
                return interaction.editReply({
                    content: `❌ Você já possui uma denúncia aberta: ${ticketExistente}`
                });
            }

            const permissoes = [
                {
                    id: guild.id,
                    deny: [
                        PermissionFlagsBits.ViewChannel
                    ]
                },
                {
                    id: user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.EmbedLinks
                    ]
                },
                {
                    id: interaction.client.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.ManageChannels
                    ]
                }
            ];

            if (Array.isArray(config.staffRoles)) {
                for (const roleId of config.staffRoles) {
                    const cargo = guild.roles.cache.get(roleId);

                    if (!cargo) {
                        console.warn(`Cargo da equipe não encontrado: ${roleId}`);
                        continue;
                    }

                    permissoes.push({
                        id: roleId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.AttachFiles,
                            PermissionFlagsBits.EmbedLinks
                        ]
                    });
                }
            }

            const dadosCanal = {
                name: nomeCanal,
                type: ChannelType.GuildText,
                topic: `Denúncia enviada por ${user.tag} | ID: ${user.id}`,
                permissionOverwrites: permissoes
            };

            // Opcional: coloque "ticketCategoryId" no config.json
            // para criar as denúncias dentro de uma categoria.
            if (
                config.ticketCategoryId &&
                guild.channels.cache.has(config.ticketCategoryId)
            ) {
                dadosCanal.parent = config.ticketCategoryId;
            }

            const canal = await guild.channels.create(dadosCanal);

            const botoes = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("atendente_ticket")
                    .setLabel("Assumir Denúncia")
                    .setEmoji("👤")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("fechar_ticket")
                    .setLabel("Fechar Denúncia")
                    .setEmoji("🔒")
                    .setStyle(ButtonStyle.Danger)
            );

            const embed = new EmbedBuilder()
                .setColor("#ED4245")
                .setTitle("🚨 Canal de denúncia")
                .setDescription(
                    `Olá ${user}!\n\n` +
                    "Envie as seguintes informações:\n\n" +
                    "• Usuário denunciado;\n" +
                    "• Motivo da denúncia;\n" +
                    "• Data e horário aproximado;\n" +
                    "• Prints, vídeos ou outras provas.\n\n" +
                    "🔒 Esta denúncia é visível somente para você e para a equipe."
                )
                .addFields({
                    name: "Denunciante",
                    value: `${user.tag}\n\`${user.id}\``,
                    inline: true
                })
                .setFooter({
                    text: "Sistema de Tickets • Denúncia"
                })
                .setTimestamp();

            await canal.send({
                content: `${user}`,
                embeds: [embed],
                components: [botoes]
            });

            await interaction.editReply({
                content: `✅ Sua denúncia foi criada: ${canal}`
            });
        } catch (error) {
            console.error("Erro ao criar denúncia:", error);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({
                    content: "❌ Ocorreu um erro ao criar a denúncia."
                });
            } else {
                await interaction.reply({
                    content: "❌ Ocorreu um erro ao criar a denúncia.",
                    ephemeral: true
                });
            }
        }
    }
};