const { isOwner } = require('../utils/permissions');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    if (command.ownerOnly && !isOwner(interaction.user.id)) {
      return interaction.reply({ content: '🔒 Commande réservée aux propriétaires du bot.', ephemeral: true });
    }

    if (command.requireMod) {
      const member = interaction.member;
      const hasPerm = member?.permissions?.has('BanMembers') ||
                      member?.permissions?.has('KickMembers') ||
                      member?.permissions?.has('ManageMessages') ||
                      member?.permissions?.has('ManageGuild');
      if (!hasPerm) return interaction.reply({ content: '🚫 Tu n\'as pas les permissions nécessaires.', ephemeral: true });
    }

    try {
      await command.execute(interaction, [], client);
    } catch (err) {
      console.error(`[SLASH] Erreur ${interaction.commandName}:`, err);
      const r = { content: '❌ Une erreur est survenue.', ephemeral: true };
      interaction.replied || interaction.deferred ? interaction.followUp(r) : interaction.reply(r);
    }
  },
};
