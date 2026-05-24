const { isOwner } = require('../utils/permissions');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.content.startsWith(client.PREFIX)) return;

    const args    = message.content.slice(client.PREFIX.length).trim().split(/\s+/);
    const cmdName = args.shift().toLowerCase();
    const command = client.commands.get(cmdName) || client.commands.find(c => c.aliases?.includes(cmdName));
    if (!command) return;

    if (command.ownerOnly && !isOwner(message.author.id)) {
      return message.reply('🔒 Commande réservée aux propriétaires du bot.');
    }

    if (command.requireMod) {
      const member = message.member;
      const hasPerm = member?.permissions?.has('BanMembers') ||
                      member?.permissions?.has('KickMembers') ||
                      member?.permissions?.has('ManageMessages') ||
                      member?.permissions?.has('ManageGuild');
      if (!hasPerm) return message.reply('🚫 Tu n\'as pas les permissions nécessaires.');
    }

    try {
      await command.execute(message, args, client);
    } catch (err) {
      console.error(`[CMD] Erreur ${cmdName}:`, err);
      message.reply('❌ Une erreur est survenue.').catch(() => {});
    }
  },
};
