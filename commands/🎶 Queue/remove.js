const {
	MessageEmbed,
	Message
} = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
const {
	check_if_dj
} = require("../../handlers/functions")
module.exports = {
	name: "remove", //the command name for the Slash Command

	category: "🎶 Queue",
	aliases: ["delete", "rqueue", "pushout"],
	usage: "remove <song_position> <how_many_songs_after_it[OPTIONAL]>",

	description: "Removes song(s) from the queue", //the command description for Slash Command Overview
	cooldown: 10,
	requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
	alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
	run: async (client, message, args) => {
		try {
			//things u can directly access in an interaction!
			const {
				member,
				channelId,
				guildId,
				applicationId,
				commandName,
				deferred,
				replied,
				ephemeral,
				options,
				id,
				createdTimestamp
			} = message;
			const {
				guild
			} = member;
			const {
				channel
			} = member.voice;
			if (!channel) return message.reply({
				embeds: [
					new MessageEmbed().setColor(ee.wrongcolor).setTitle(`${client.allEmojis.x} **Join ${guild.me.voice.channel ? "my" : "a"} Voice Channel First!**`)
				],

			})
			if (channel.guild.me.voice.channel && channel.guild.me.voice.channel.id != channel.id) {
				return message.reply({
					embeds: [new MessageEmbed()
						.setColor(ee.wrongcolor)
						.setFooter(ee.footertext, ee.footericon)
						.setTitle(`${client.allEmojis.x} Join my Voice Channel!`)
						.setDescription(`<#${guild.me.voice.channel.id}>`)
					],
				});
			}
			try {
				let newQueue = client.distube.getQueue(guildId);
				if (!newQueue || !newQueue.songs || newQueue.songs.length == 0) return message.reply({
					embeds: [
						new MessageEmbed().setColor(ee.wrongcolor).setTitle(`${client.allEmojis.x} **There's nothing being played right now!**`)
					],

				})
				if (check_if_dj(client, member, newQueue.songs[0])) {
					return message.reply({
						embeds: [new MessageEmbed()
							.setColor(ee.wrongcolor)
							.setFooter(ee.footertext, ee.footericon)
							.setTitle(`${client.allEmojis.x} **You're not a DJ, nor the Song Requester!**`)
							.setDescription(`**DJ ROLES**\n${check_if_dj(client, member, newQueue.songs[0])}`)
						],
					});
				}
				if (!args[0]) {
					return message.reply({
						embeds: [new MessageEmbed()
							.setColor(ee.wrongcolor)
							.setFooter(ee.footertext, ee.footericon)
							.setTitle(`${client.allEmojis.x} **Please mention a Song Position!**`)
							.setDescription(`**Usage**\n\`${client.settings.get(message.guild.id, "prefix")}remove <song_position_in_queue> <no_of_songs_to_remove_after_it[OPTIONAL]>\``)
						],
					});
				}
				let songIndex = Number(Number(args[0]) - 1);
        if (songIndex <= 0) return message.reply({
					embeds: [
						new MessageEmbed().setColor(ee.wrongcolor).setTitle(`${client.allEmojis.x} **You can't remove an ongoing track or a track that's finished or doesn't exist!**`)
					],

				})
        if (!songIndex) {
					return message.reply({
						embeds: [new MessageEmbed()
							.setColor(ee.wrongcolor)
							.setFooter(ee.footertext, ee.footericon)
							.setTitle(`${client.allEmojis.x} **Please mention the Song Position!**`)
							.setDescription(`**Usage**\n\`${client.settings.get(message.guild.id, "prefix")}remove <song_position_in_queue> <no_of_songs_to_remove_after_it[OPTIONAL]>\``)
						],
					});
				}
				let amount = Number(args[1] ? args[1] : "1");
				if (!amount) amount = 1;
        if (amount <= 0 || amount > newQueue.songs.length) return message.reply({
					embeds: [
						new MessageEmbed().setColor(ee.wrongcolor).setTitle(`${client.allEmojis.x} **Mentioned amount out of queue or queue length!**`)
					],

				})
				if (songIndex > newQueue.songs.length - 1) return message.reply({
					embeds: [
						new MessageEmbed().setColor(ee.wrongcolor).setTitle(`${client.allEmojis.x} **This Song does not exist!**`)
						.setDescription(`**The last Song in Queue is in Position \`${newQueue.songs.length}\`**`)
					],

				})
				newQueue.songs.splice(songIndex, amount);
				message.reply({
					embeds: [new MessageEmbed()
					  .setColor(ee.color)
					  .setTimestamp()
					  .setTitle(`🗑 **Threw ${amount} Song${amount > 1 ?"s": ""} out of the Queue!**`)
					  .setFooter(`Requested by ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]
				})
			} catch (e) {
				console.log(e.stack ? e.stack : e)
			}
		} catch (e) {
			console.log(String(e.stack).bgRed)
		}
	}
}
/**
 * @INFO
 * Bot Coded by Tomato#6966 | https://github.com/Tomato6966/Discord-Js-Handler-Template
 * @INFO
 * Work for Milrato Development | https://milrato.eu
 * @INFO
 * Please mention Him / Milrato Development, when using this Code!
 * @INFO
 */
