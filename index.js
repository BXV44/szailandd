const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const fs   = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.commands      = new Collection();
client.slashCommands = new Collection();
client.PREFIX        = '+';
client.OWNERS        = ['1222217828770516992', '1371573736054194356'];
client.INVITE        = 'discord.gg/szailand';

// ── Charger toutes les commandes ──────────────────────────────────────────────
function loadCommand(cmd, file) {
  if (!cmd || typeof cmd !== 'object') return;
  // Objet unique avec data ET/OU name
  if (cmd.name) {
    client.commands.set(cmd.name, cmd);
    if (cmd.aliases) cmd.aliases.forEach(a => client.commands.set(a, cmd));
  }
  if (cmd.data) client.slashCommands.set(cmd.data.name, cmd);
}

const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));
for (const folder of commandFolders) {
  const files = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const mod = require(path.join(__dirname, 'commands', folder, file));
    // Fichier qui exporte plusieurs commandes (module.exports = { cmd1, cmd2, ... })
    if (mod.name || mod.data) {
      loadCommand(mod);
    } else {
      // Multi-export
      for (const key of Object.keys(mod)) {
        loadCommand(mod[key], file);
      }
    }
  }
}

console.log(`[BOT] 📦 ${client.commands.size} commandes préfixe | ${client.slashCommands.size} slash chargées`);

// ── Charger tous les events ───────────────────────────────────────────────────
const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(path.join(__dirname, 'events', file));
  if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
  else client.on(event.name, (...args) => event.execute(...args, client));
}

client.login(process.env.TOKEN);
