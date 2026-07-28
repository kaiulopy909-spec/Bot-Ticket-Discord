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
                console.log(`⚠️ Evento ignorado: ${file}`);
                continue;
            }

            // O InteractionCreate já é tratado neste index.js.
            // Ignora qualquer evento duplicado.
            if (event.name === Events.InteractionCreate) {
                console.log(`⚠️ Evento InteractionCreate ignorado: ${file}`);
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

            console.log(`✅ Evento carregado: ${event.name}`);

        } catch (error) {
            console.error(`❌ Erro ao carregar o evento ${file}:`, error);
        }
    }
}