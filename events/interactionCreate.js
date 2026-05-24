const { checkAccess, noAccessEmbed, isOwner } = require('../utils/permissions');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    if (command.ownerOnly && !isOwner(interaction.user.id)) {
      return interaction.reply({ embeds: [noAccessEmbed('🔒 Commande réservée aux propriétaires du bot.')], ephemeral: true });
    }

    const access = checkAccess(interaction, command.requireMod || false);
    if (!access.allowed) {
      return interaction.reply({ embeds: [noAccessEmbed(access.reason)], ephemeral: true });
    }

    try {
      await command.execute(interaction, [], client);
    } catch (err) {
      console.error(`[SLASH] Erreur ${interaction.commandName}:`, err);
      const reply = { content: '❌ Une erreur est survenue.', ephemeral: true };
      if (interaction.replied || interaction.deferred) interaction.followUp(reply);
      else interaction.reply(reply);
    }
  },
};
