const {
        MessageEmbed,
        MessageActionRow,
        MessageSelectMenu,
        Message
      } = require("discord.js");
      const config = require("../../botconfig/config.json");
      const ee = require("../../botconfig/embed.json");
      const settings = require("../../botconfig/settings.json");
      module.exports = {
        name: "search", //the command name for the Slash Command
      
        category: "🎵 Music",
        aliases: ["fetch"],
        usage: "search <search_term>",
      
        description: "Search and select from a list of results to play/queue the songg you want!", //the command description for Slash Command Overview
        cooldown: 2,
        requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
        alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
        run: async (client, message, args) => {
          try {
            //console.log(interaction, StringOption)
      
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
            if (channel.userLimit != 0 && channel.full)
              return message.reply({
                embeds: [new MessageEmbed()
                  .setColor(ee.wrongcolor)
                  .setFooter(ee.footertext, ee.footericon)
                  .setTitle(`<:declined:780403017160982538> Your Voice Channel is full, I can't join!`)
                ],
              });
            if (channel.guild.me.voice.channel && channel.guild.me.voice.channel.id != channel.id) {
              return message.reply({
                embeds: [new MessageEmbed()
                  .setColor(ee.wrongcolor)
                  .setFooter(ee.footertext, ee.footericon)
                  .setTitle(`<:declined:780403017160982538> I am already connected somewhere else`)
                ],
              });
            }
            if (!args[0]) {
              return message.reply({
                embeds: [new MessageEmbed()
                  .setColor(ee.wrongcolor)
                  .setFooter(ee.footertext, ee.footericon)
                  .setTitle(`${client.allEmojis.x} **Please add a Search Query!**`)
                  .setDescription(`**Usage**\n\`${client.settings.get(message.guild.id, "prefix")}search <search_term>\``)
                ],
              });
            }
           //same as in IntChoices //RETURNS NUMBER
  try {
            let query = args.join(" ");
    if (!query) {
      return message.reply({
        embeds: [new MessageEmbed()
          .setTitle(`${client.allEmojis.x} Please provide a search term!`)
        ]
      });
    }
      let res = await client.distube.search(query, {
      limit: 10,
      retried: true,
      safeSearch: true,
      type: "video",
    });
    let tracks = res
      .map((song, index) => {
        return `${index + 1}). [${song.name}](${song.url}) ~ \`[${
          song.formattedDuration
        }]\``;
      })
      .join("\n\n");

    let embed = new MessageEmbed()
      .setColor(ee.color)
      .setTitle(`Search Results for __${query}__`)
      .setDescription(`Select songs from the dropdown below to play or queue them.\n\nYou can select another song to queue it when the player is active!`);

    let menuraw = new MessageActionRow().addComponents([
      new MessageSelectMenu()
        .setCustomId("search")
        .setPlaceholder(`Select Results To Play/Queue`)
        .addOptions(
          res.map((song, index) => {
            return {
              label: song.name.substring(0, 50),
              value: song.url,
              description: `Duration ~ [${song.formattedDuration}]`
            };
          })
        ),
    ]);

    message
      .reply({ embeds: [embed], components: [menuraw] })
      .then(async (msg) => {
        let filter = (i) => i.user.id === message.author.id;
        let collector = await msg.createMessageComponentCollector({
          filter: filter,
        });
        const { channel } = message.member.voice;
        collector.on("collect", async (interaction) => {
          if (interaction.isSelectMenu()) {
            await interaction.deferUpdate().catch((e) => {});
            if (interaction.customId === "search") {
              let song = interaction.values[0];
              try {
				let queue = client.distube.getQueue(guildId)
				let options = {
					member: member,
				}
				if (!queue) options.textChannel = guild.channels.cache.get(channelId)
              client.distube.playVoiceChannel(channel, song, options);
              } catch (e) {
				console.log(e.stack ? e.stack : e)
			}
            }
          }
        });
      });
          } catch {
            return message.reply({
        embeds: [new MessageEmbed()
              .setTitle(`${client.allEmojis.x} No results found, try a different query`)
              .setDescription("**I highly recommend typing the way you search for videos on YouTube to get the best results!**")
              .setColor(ee.wrongcolor)
        ]
      })
          }
          } catch (e) {
            console.log(String(e.stack).bgRed)
          }
        }
      }