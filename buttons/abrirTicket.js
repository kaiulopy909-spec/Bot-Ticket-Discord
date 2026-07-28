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

    customId: "abrir_ticket",


    async execute(interaction) {


        try {


            await interaction.deferReply({
                ephemeral: true
            });



            const guild = interaction.guild;
            const user = interaction.user;



            // Verifica se já existe ticket

            const ticketExistente = guild.channels.cache.find(

                canal => canal.name === `ticket-${user.id}`

            );


            if (ticketExistente) {

                return interaction.editReply({

                    content: `❌ Você já possui um ticket aberto: ${ticketExistente}`

                });

            }




            // Permissões do canal

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

                        PermissionFlagsBits.ReadMessageHistory

                    ]

                }

            ];





            // Adiciona cargos da equipe

            if (config.staffRoles) {


                config.staffRoles.forEach(roleId => {


                    permissoes.push({

                        id: roleId,

                        allow: [

                            PermissionFlagsBits.ViewChannel,

                            PermissionFlagsBits.SendMessages,

                            PermissionFlagsBits.ReadMessageHistory

                        ]

                    });


                });


            }







            // CRIA O CANAL DO TICKET

            const canal = await guild.channels.create({

                name: `ticket-${user.id}`,

                type: ChannelType.GuildText,

                permissionOverwrites: permissoes

            });







            // Botões

            const botoes = new ActionRowBuilder()

            .addComponents(


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







            // Mensagem do ticket

            const embed = new EmbedBuilder()

            .setColor("#5865F2")

            .setTitle("👋 Bem-vindo ao Ticket")

            .setDescription(

                `Olá ${user}!\n\n` +

                "Explique seu problema ou dúvida.\n\n" +

                "⏳ Aguarde um membro da equipe responder."

            )

            .setFooter({

                text: "Sistema de Tickets"

            })

            .setTimestamp();







            // Envia mensagem dentro do ticket

            await canal.send({

                content: `${user}`,

                embeds: [embed],

                components: [botoes]

            });







            // Resposta para quem abriu

            await interaction.editReply({

                content: `✅ Seu ticket foi criado: ${canal}`

            });





        } catch(error) {


            console.log("ERRO AO CRIAR TICKET:");

            console.log(error);



            if (interaction.deferred) {


                await interaction.editReply({

                    content: "❌ Erro ao criar ticket."

                });


            }


        }


    }

};