const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`[BOT] ✅ Connecté en tant que ${client.user.tag}`);
    console.log(`[BOT] 📡 Sur ${client.guilds.cache.size} serveur(s)`);

    client.user.setPresence({
      activities: [{ name: 'discord.gg/szailand', type: ActivityType.Watching }],
      status: 'online',
    });
  },
};
