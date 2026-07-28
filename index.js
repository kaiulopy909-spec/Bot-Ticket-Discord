// =====================
// Servidor HTTP para Render
// =====================
const http = require("http");

const PORT = process.env.PORT || 3000;

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Bot online!");
  })
  .listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor HTTP rodando na porta ${PORT}`);
  });

// =====================
// Fim do servidor HTTP
// =====================
require("dotenv").config();

const { Client, GatewayIntentBits, Collection } = require("discord.js");

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



client.commands = new Collection();



// Carregar eventos

const eventsPath = path.join(__dirname, "events");

const eventFiles = fs.readdirSync(eventsPath);



for (const file of eventFiles) {

    const event = require(`./events/${file}`);

    
    if (event.once) {

        client.once(event.name, (...args) => event.execute(...args));

    } else {

        client.on(event.name, (...args) => event.execute(...args));

    }

}



// Login do bot

client.login(process.env.TOKEN);