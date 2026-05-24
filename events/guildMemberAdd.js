const { EmbedBuilder } = require('discord.js');
const fs   = require('fs');
const path = require('path');

// Anti-raid: compter les joins rapides
const joinLog = new Map();

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    const guild = member.guild;

    // ── Anti-Raid basique ───────────────────────────────────────────
    const now    = Date.now();
    const key    = guild.id;
    const record = joinLog.get(key) || [];
    const recent = record.filter(t => now - t < 10_000); // 10 sec
    recent.push(now);
    joinLog.set(key, recent);

    if (recent.length >= 8) {
      console.warn(`[ANTI-RAID] ⚠️ Raid détecté sur ${guild.name}! ${recent.length} joins en 10s`);
      // Notifier le log si configuré
      const logChan = guild.channels.cache.find(c => c.name === 'mod-logs' || c.name === 'logs');
      if (logChan) {
        logChan.send({
          embeds: [new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('🚨 RAID DÉTECTÉ')
            .setDescription(`**${recent.length} membres** ont rejoint en moins de 10 secondes!\nActivation de la vérification renforcée recommandée.`)
            .setTimestamp()
          ]
        }).catch(() => {});
      }
    }

    // ── Message de bienvenue ────────────────────────────────────────
    const welcomeChan = guild.channels.cache.find(
      c => c.name === 'bienvenue' || c.name === 'welcome' || c.name === 'général' || c.name === 'general'
    );
    if (!welcomeChan) return;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`👋 Bienvenue sur ${guild.name}!`)
      .setDescription(
        `Bienvenue <@${member.id}>!\n\n` +
        `> Tu es le **${guild.memberCount}ème** membre!\n` +
        `> Lis les règles et amuse-toi bien.\n\n` +
        `🔗 **discord.gg/szailand**`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    welcomeChan.send({ content: `<@${member.id}>`, embeds: [embed] }).catch(() => {});
  },
};
