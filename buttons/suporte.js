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
    customId: "suporte_ticket",

    async execute(interaction) {
        try {
            await interaction.deferReply({
                ephemeral: true
            });

            const guild = interaction.guild;
            const user = interaction.user;
            const nomeCanal = `suporte-${user.id}`;

            const ticketExistente = guild.channels.cache.find(
                canal => canal.name === nomeCanal
            );

            if (ticketExistente) {
                return interaction.editReply({
                    content: `❌ Você já possui um ticket de suporte aberto: ${ticketExistente}`
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
                topic: `Ticket de suporte de ${user.tag} | ID: ${user.id}`,
                permissionOverwrites: permissoes
            };

            // Opcional: coloque "ticketCategoryId" no config.json
            // para criar os tickets dentro de uma categoria.
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
                    .setLabel("Atender Ticket")
                    .setEmoji("👤")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("fechar_ticket")
                    .setLabel("Fechar Ticket")
                    .setEmoji("🔒")
                    .setStyle(ButtonStyle.Danger)
            );

            const embed = new EmbedBuilder()
                .setColor("#5865F2")
                .setTitle("🛠️ Ticket de suporte")
                .setDescription(
                    `Olá ${user}!\n\n` +
                    "Explique detalhadamente sua dúvida ou problema.\n\n" +
                    "Você também pode enviar imagens ou arquivos que ajudem a equipe.\n\n" +
                    "⏳ Aguarde um membro da equipe responder."
                )
                .addFields({
                    name: "Usuário",
                    value: `${user.tag}\n\`${user.id}\``,
                    inline: true
                })
                .setFooter({
                    text: "Sistema de Tickets • Suporte"
                })
                .setTimestamp();

            await canal.send({
                content: `${user}`,
                embeds: [embed],
                components: [botoes]
            });

            await interaction.editReply({
                content: `✅ Seu ticket de suporte foi criado: ${canal}`
            });
        } catch (error) {
            console.error("Erro ao criar ticket de suporte:", error);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({
                    content: "❌ Ocorreu um erro ao criar o ticket de suporte."
                });
            } else {
                await interaction.reply({
                    content: "❌ Ocorreu um erro ao criar o ticket de suporte.",
                    ephemeral: true
                });
            }
        }
    }
};