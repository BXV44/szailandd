const { checkAccess, noAccessEmbed, isOwner } = require('../utils/permissions');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.content.startsWith(client.PREFIX)) return;

    const args    = message.content.slice(client.PREFIX.length).trim().split(/\s+/);
    const cmdName = args.shift().toLowerCase();
    const command = client.commands.get(cmdName) || client.commands.find(c => c.aliases?.includes(cmdName));
    if (!command) return;

    // Commandes owner-only
    if (command.ownerOnly && !isOwner(message.author.id)) {
      return message.reply({ embeds: [noAccessEmbed('🔒 Commande réservée aux propriétaires du bot.')] });
    }

    // Vérif licence + permission modération
    const access = checkAccess(message, command.requireMod || false);
    if (!access.allowed) {
      return message.reply({ embeds: [noAccessEmbed(access.reason)] });
    }

    try {
      await command.execute(message, args, client);
    } catch (err) {
      console.error(`[CMD] Erreur ${cmdName}:`, err);
      message.reply('❌ Une erreur est survenue lors de l\'exécution de la commande.').catch(() => {});
    }
  },
};
