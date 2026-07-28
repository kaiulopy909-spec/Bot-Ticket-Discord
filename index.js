// ========================================
// SERVIDOR HTTP PARA O RENDER
// ========================================

const http = require("http");

const PORT = process.env.PORT || 3000;

http
    .createServer((req, res) => {
        res.writeHead(200, {
            "Content-Type": "text/plain; charset=utf-8"
        });

        res.end("Bot de tickets online!");
    })
    .listen(PORT, "0.0.0.0", () => {
        console.log(`✅ Servidor HTTP ativo na porta ${PORT}`);
    });


// ========================================
// CONFIGURAÇÃO DO BOT
// ========================================

require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    Collection,
    Events
} = require("discord.js");

const fs = require("fs");
const path = require("path");


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});


// Coleções usadas pelo bot

client.commands = new Collection();
client.buttons = new Collection();


// ========================================
// CARREGAR COMANDOS
// ========================================

const commandsPath = path.join(__dirname, "commands");

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);

        try {
            delete require.cache[require.resolve(filePath)];

            const command = require(filePath);

            if (
                command &&
                command.data &&
                typeof command.execute === "function"
            ) {
                client.commands.set(
                    command.data.name,
                    command
                );

                console.log(
                    `✅ Comando carregado: /${command.data.name}`
                );
            } else {
                console.log(
                    `⚠️ Comando ignorado: ${file}`
                );
            }
        } catch (error) {
            console.error(
                `❌ Erro ao carregar o comando ${file}:`,
                error
            );
        }
    }
} else {
    console.log("⚠️ A pasta commands não foi encontrada.");
}


// ========================================
// CARREGAR BOTÕES
// ========================================

const buttonsPath = path.join(__dirname, "buttons");

if (fs.existsSync(buttonsPath)) {
    const buttonFiles = fs
        .readdirSync(buttonsPath)
        .filter(file => file.endsWith(".js"));

    for (const file of buttonFiles) {
        const filePath = path.join(buttonsPath, file);

        try {
            delete require.cache[require.resolve(filePath)];

            const button = require(filePath);

            if (
                button &&
                button.customId &&
                typeof button.execute === "function"
            ) {
                client.buttons.set(
                    button.customId,
                    button
                );

                console.log(
                    `✅ Botão carregado: ${button.customId}`
                );
            } else {
                console.log(
                    `⚠️ Botão ignorado: ${file}`
                );
            }
        } catch (error) {
            console.error(
                `❌ Erro ao carregar o botão ${file}:`,
                error
            );
        }
    }
} else {
    console.log("⚠️ A pasta buttons não foi encontrada.");
}


// ========================================
// CARREGAR EVENTOS DA PASTA EVENTS
// ========================================

const eventsPath = path.join(__dirname, "events");

if (fs.existsSync(eventsPath)) {
    const eventFiles = fs
        .readdirSync(eventsPath)
        .filter(file => file.endsWith(".js"));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);

        try {
            delete require.cache[require.resolve(filePath)];

            const event = require(filePath);

            if (
                !event ||
                !event.name ||
                typeof event.execute !== "function"
            ) {
                console.log(
                    `⚠️ Evento ignorado: ${file}`
                );

                continue;
            }

            if (event.once) {
                client.once(event.name, (...args) => {
                    event.execute(...args, client);
                });
            } else {
                client.on(event.name, (...args) => {
                    event.execute(...args, client);
                });
            }

            console.log(
                `✅ Evento carregado: ${event.name}`
            );
        } catch (error) {
            console.error(
                `❌ Erro ao carregar o evento ${file}:`,
                error
            );
        }
    }
}


// ========================================
// BOT ONLINE
// ========================================

client.once(Events.ClientReady, readyClient => {
    console.log(
        `✅ Bot conectado como ${readyClient.user.tag}`
    );

    console.log(
        `✅ ${client.commands.size} comando(s) carregado(s)`
    );

    console.log(
        `✅ ${client.buttons.size} botão(ões) carregado(s)`
    );

    console.log(
        "📋 Botões registrados:",
        [...client.buttons.keys()].join(", ")
    );
});


// ========================================
// INTERAÇÕES: COMANDOS E BOTÕES
// ========================================

client.on(Events.InteractionCreate, async interaction => {
    try {
        // Comandos de barra, como /painel

        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(
                interaction.commandName
            );

            if (!command) {
                console.log(
                    `⚠️ Comando não encontrado: ${interaction.commandName}`
                );

                if (!interaction.replied) {
                    await interaction.reply({
                        content:
                            "❌ Esse comando não foi encontrado.",
                        ephemeral: true
                    });
                }

                return;
            }

            console.log(
                `⌨️ Comando usado: /${interaction.commandName}`
            );

            await command.execute(interaction);

            return;
        }


        // Botões

        if (interaction.isButton()) {
            console.log(
                `🔘 Botão usado: ${interaction.customId}`
            );

            const button = client.buttons.get(
                interaction.customId
            );

            if (!button) {
                console.log(
                    `❌ Botão não encontrado: ${interaction.customId}`
                );

                if (
                    !interaction.replied &&
                    !interaction.deferred
                ) {
                    await interaction.reply({
                        content:
                            "❌ Esse botão não está configurado no bot.",
                        ephemeral: true
                    });
                }

                return;
            }

            await button.execute(interaction);

            return;
        }
    } catch (error) {
        console.error(
            "❌ Erro ao processar interação:",
            error
        );

        const mensagem =
            "❌ Ocorreu um erro ao executar essa ação.";

        try {
            if (interaction.deferred) {
                await interaction.editReply({
                    content: mensagem
                });
            } else if (interaction.replied) {
                await interaction.followUp({
                    content: mensagem,
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: mensagem,
                    ephemeral: true
                });
            }
        } catch (replyError) {
            console.error(
                "❌ Não foi possível responder à interação:",
                replyError
            );
        }
    }
});


// ========================================
// TRATAMENTO DE ERROS
// ========================================

process.on("unhandledRejection", error => {
    console.error(
        "❌ Promessa rejeitada:",
        error
    );
});

process.on("uncaughtException", error => {
    console.error(
        "❌ Erro não tratado:",
        error
    );
});


// ========================================
// CONECTAR AO DISCORD
// ========================================

const token = process.env.TOKEN;

if (!token) {
    console.error(
        "❌ A variável TOKEN não foi configurada."
    );

    process.exit(1);
}

client.login(token).catch(error => {
    console.error(
        "❌ Não foi possível conectar o bot ao Discord:",
        error
    );

    process.exit(1);
});