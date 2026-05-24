const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { addLicense, removeLicense, loadLicensed } = require('../../utils/permissions');
const { successEmbed, errorEmbed, infoEmbed } = require('../../utils/embeds');
const INVITE = 'discord.gg/szailand';

// Helper pour charger la liste des licences
function getLicensed() {
  const fs = require('fs'), path = require('path');
  const DB = path.join(__dirname, '../../data/licensed.json');
  if (!fs.existsSync(DB)) return {};
  return JSON.parse(fs.readFileSync(DB, 'utf8'));
}

// ── LICENSE ──────────────────────────────────────────────────────────────────
const license = {
  name: 'license',
  ownerOnly: true,
  requireMod: false,
  data: new SlashCommandBuilder()
    .setName('license')
    .setDescription('[OWNER] Gérer les licences')
    .addSubcommand(s => s.setName('add').setDescription('Ajouter une licence').addStringOption(o => o.setName('guildid').setDescription('ID du serveur').setRequired(true)))
    .addSubcommand(s => s.setName('remove').setDescription('Retirer une licence').addStringOption(o => o.setName('guildid').setDescription('ID du serveur').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('Voir les serveurs licenciés')),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    let sub, guildId;

    if (isSlash) {
      sub     = ctx.options.getSubcommand();
      guildId = ctx.options.getString('guildid');
    } else {
      sub     = args[0]?.toLowerCase();
      guildId = args[1];
    }

    if (sub === 'add') {
      if (!guildId) return reply(ctx, isSlash, { embeds: [errorEmbed('Fournis un Guild ID.')] });
      addLicense(guildId, isSlash ? ctx.user.id : ctx.author.id);
      reply(ctx, isSlash, { embeds: [successEmbed('Licence ajoutée', `✅ Serveur \`${guildId}\` maintenant licencié.\nRejoin: **${INVITE}**`)] });
    } else if (sub === 'remove') {
      if (!guildId) return reply(ctx, isSlash, { embeds: [errorEmbed('Fournis un Guild ID.')] });
      removeLicense(guildId);
      reply(ctx, isSlash, { embeds: [successEmbed('Licence retirée', `❌ Serveur \`${guildId}\` n'est plus licencié.`)] });
    } else if (sub === 'list') {
      const data  = getLicensed();
      const keys  = Object.keys(data);
      if (keys.length === 0) return reply(ctx, isSlash, { embeds: [infoEmbed('Licences', 'Aucun serveur licencié.')] });
      const desc  = keys.map((id, i) => `**${i + 1}.** \`${id}\` – Ajouté <t:${Math.floor(new Date(data[id].addedAt).getTime() / 1000)}:R>`).join('\n');
      reply(ctx, isSlash, { embeds: [infoEmbed(`Serveurs licenciés (${keys.length})`, desc)] });
    }
  },
};

// ── EVAL (exécution de code JS) ───────────────────────────────────────────────
const evalCmd = {
  name: 'eval',
  ownerOnly: true,
  requireMod: false,
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('[OWNER] Exécuter du code JavaScript')
    .addStringOption(o => o.setName('code').setDescription('Code JS').setRequired(true)),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const code    = isSlash ? ctx.options.getString('code') : args.join(' ');
    try {
      let result = eval(code);
      if (result instanceof Promise) result = await result;
      if (typeof result !== 'string') result = require('util').inspect(result, { depth: 1 });
      if (result.length > 1900) result = result.slice(0, 1900) + '...';
      reply(ctx, isSlash, { embeds: [successEmbed('Eval', `\`\`\`js\n${result}\n\`\`\``)] });
    } catch (e) {
      reply(ctx, isSlash, { embeds: [errorEmbed(`\`\`\`js\n${e.message}\n\`\`\``)] });
    }
  },
};

// ── ANNOUNCE ─────────────────────────────────────────────────────────────────
const announce = {
  name: 'announce',
  ownerOnly: true,
  requireMod: false,
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('[OWNER] Annoncer dans tous les serveurs')
    .addStringOption(o => o.setName('message').setDescription('Message').setRequired(true)),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const msg     = isSlash ? ctx.options.getString('message') : args.join(' ');
    const embed   = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📢 Annonce Officielle')
      .setDescription(msg)
      .setFooter({ text: `${INVITE} | Annonce du bot` })
      .setTimestamp();

    let sent = 0;
    for (const guild of client.guilds.cache.values()) {
      const chan = guild.channels.cache.find(c =>
        c.isTextBased() && (c.name.includes('général') || c.name.includes('general') || c.name.includes('bot') || c.name.includes('annonce'))
      ) || guild.channels.cache.find(c => c.isTextBased() && c.permissionsFor(guild.members.me)?.has('SendMessages'));
      if (chan) { await chan.send({ embeds: [embed] }).catch(() => {}); sent++; }
    }
    reply(ctx, isSlash, { embeds: [successEmbed('Annonce envoyée', `Message envoyé dans **${sent}** serveur(s).`)] });
  },
};

// ── SHUTDOWN ──────────────────────────────────────────────────────────────────
const shutdown = {
  name: 'shutdown',
  ownerOnly: true,
  requireMod: false,
  data: new SlashCommandBuilder().setName('shutdown').setDescription('[OWNER] Éteindre le bot'),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    await reply(ctx, isSlash, { embeds: [successEmbed('Shutdown', '🔴 Bot en cours d\'arrêt... À bientôt!')] });
    setTimeout(() => process.exit(0), 2000);
  },
};

// ── STATUS ────────────────────────────────────────────────────────────────────
const status = {
  name: 'setstatus',
  ownerOnly: true,
  requireMod: false,
  data: new SlashCommandBuilder()
    .setName('setstatus')
    .setDescription('[OWNER] Changer le status du bot')
    .addStringOption(o => o.setName('texte').setDescription('Texte du status').setRequired(true))
    .addStringOption(o => o.setName('type').setDescription('Type').setRequired(false).addChoices(
      { name: 'Playing', value: 'Playing' },
      { name: 'Watching', value: 'Watching' },
      { name: 'Listening', value: 'Listening' },
      { name: 'Competing', value: 'Competing' },
    )),
  async execute(ctx, args, client) {
    const { ActivityType } = require('discord.js');
    const isSlash = !!ctx.isChatInputCommand;
    const text    = isSlash ? ctx.options.getString('texte') : args.slice(1).join(' ');
    const type    = isSlash ? (ctx.options.getString('type') || 'Watching') : (args[0] || 'Watching');
    const typeMap = { Playing: ActivityType.Playing, Watching: ActivityType.Watching, Listening: ActivityType.Listening, Competing: ActivityType.Competing };
    client.user.setActivity(text, { type: typeMap[type] || ActivityType.Watching });
    reply(ctx, isSlash, { embeds: [successEmbed('Status modifié', `Status: **${type}** ${text}`)] });
  },
};

// ── GUILDS (voir tous les serveurs) ──────────────────────────────────────────
const guilds = {
  name: 'guilds',
  ownerOnly: true,
  requireMod: false,
  data: new SlashCommandBuilder().setName('guilds').setDescription('[OWNER] Voir les serveurs du bot'),
  async execute(ctx, args, client) {
    const isSlash = !!ctx.isChatInputCommand;
    const list    = [...client.guilds.cache.values()].map((g, i) => `**${i + 1}.** ${g.name} (\`${g.id}\`) – ${g.memberCount} membres`);
    const pages   = [];
    for (let i = 0; i < list.length; i += 15) pages.push(list.slice(i, i + 15).join('\n'));
    const embed = infoEmbed(`Serveurs (${client.guilds.cache.size})`, pages[0] || 'Aucun serveur.');
    reply(ctx, isSlash, { embeds: [embed] });
  },
};

function reply(ctx, isSlash, payload) {
  return isSlash ? ctx.reply(payload) : ctx.reply(payload);
}

module.exports = { license, eval: evalCmd, announce, shutdown, status, guilds };
