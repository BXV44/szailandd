const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`[BOT] ✅ Connecté en tant que ${client.user.tag}`);
    console.log(`[BOT] 📡 Sur ${client.guilds.cache.size} serveur(s)`);

    // Status : discord.gg/szailand
    client.user.setPresence({
      activities: [{
        name: 'discord.gg/szailand',
        type: ActivityType.Watching,
      }],
      status: 'online',
    });

    // Rotation de status toutes les 30 secondes
    const statuses = [
      { name: 'discord.gg/szailand', type: ActivityType.Watching },
      { name: `+help | ${client.guilds.cache.size} serveurs`, type: ActivityType.Playing },
      { name: 'discord.gg/szailand | /help', type: ActivityType.Listening },
    ];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % statuses.length;
      client.user.setActivity(statuses[i]);
    }, 30_000);
  },
};
