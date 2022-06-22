console.log(`Welcome to SERVICE HANDLER /--/ By https://milrato.eu /--/ Discord: Tomato#6966`.yellow);
const PlayerMap = new Map()
const Discord = require(`discord.js`);
const config = require(`../botconfig/config.json`);
const ee = require(`../botconfig/embed.json`);
const {
  MessageButton,
  MessageActionRow,
  MessageEmbed,
  MessageSelectMenu
} = require(`discord.js`);
const { check_if_dj
} = require("./functions");
let songEditInterval = null;
module.exports = (client) => {
  try {
    client.distube
      .on(`playSong`, async (queue, track) => {
        try {
          client.guilds.cache.get(queue.id).me.voice.setDeaf(true).catch((e) => {
            //console.log(e.stack ? String(e.stack).grey : String(e).grey)
          })
        } catch (error) {
          console.log(error)
        }
        try {
          var newQueue = client.distube.getQueue(queue.id)
          var newTrack = track;
          var data = receiveQueueData(newQueue, newTrack)
          //Send message with buttons
          let currentSongPlayMsg = await queue.textChannel.send(data).then(msg => {
            PlayerMap.set(`currentmsg`, msg.id);
            return msg;
          })
          //create a collector for the thinggy
          var collector = currentSongPlayMsg.createMessageComponentCollector({
            filter: (i) => i.isButton() && i.user && i.message.author.id == client.user.id,
            time: track.duration > 0 ? track.duration * 1000 : 600000
          }); //collector for 5 seconds
          //array of all embeds, here simplified just 10 embeds with numbers 0 - 9
          let lastEdited = false;

          /**
           * @INFORMATION - EDIT THE SONG MESSAGE EVERY 10 SECONDS!
           */
          try{clearInterval(songEditInterval)}catch(e){}
          songEditInterval = setInterval(async () => {
            if (!lastEdited) {
              try{
                var newQueue = client.distube.getQueue(queue.id)
                var newTrack = newQueue.songs[0];
                var data = receiveQueueData(newQueue, newTrack)
                await currentSongPlayMsg.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
              }catch (e){
                clearInterval(songEditInterval)
              }
            }
          }, 10000)

          collector.on('collect', async i => {
            if(i.customId != `10` && check_if_dj(client, i.member, client.distube.getQueue(i.guild.id).songs[0])) {
              return i.reply({embeds: [new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setFooter(ee.footertext, ee.footericon)
                .setTitle(`${client.allEmojis.x} **You're not a DJ, nor the Song Requester!**`)
                .setDescription(`**DJ ROLES**\n${check_if_dj(client, i.member, client.distube.getQueue(i.guild.id).songs[0])}`)
              ],
              ephemeral: true});
            }
            lastEdited = true;
            setTimeout(() => {
              lastEdited = false
            }, 7000)
            //skip
            if (i.customId == `1`) {
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTitle(`${client.allEmojis.x} Join a Voice Channel first!`)
                  .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true
                })
              //get the player instance
              const queue = client.distube.getQueue(i.guild.id);
              //if no player available return aka not playing anything
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `Streaming to <#${channel.id}>`,
                  embeds: [new MessageEmbed()
                  .setColor("#4A90E2")
                  .setTitle("🔉 Join my Voice Channel first!")
                  .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true
                })
              //if ther is nothing more to skip then stop music and leave the Channel
              if (newQueue.songs.length > 1) {
              if (newQueue.repeatMode === 1) {
                await newQueue.setRepeatMode(0)
              }
              await newQueue.skip();
              i.reply({
                    embeds: [new MessageEmbed()
                    .setColor(ee.color)
                    .setTitle(`⏭  **Skipped the Track!**`)
                    .setFooter(`Requested by ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]  
                  })
              } else {
                i.reply({
                    embeds: [new MessageEmbed()
                    .setColor(ee.color)
                    .setDescription(`⏭  **Nothing to skip ahead!**\n⏹  **Consider stopping if you really wish to!**`)
                    .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true  
                  })
              }
            }
            //stop
            if (i.customId == `2`) {
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTitle(`${client.allEmojis.x} Join a Voice Channel first!`)
                  .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true
                })

              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `Streaming to <#${channel.id}>`,
                  embeds: [new MessageEmbed()
                  .setColor("#4A90E2")
                  .setTitle("🔉 Join my Voice Channel first!")
                  .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true
                })
                //stop the track
                clearInterval(songEditInterval);
                //edit the current song message
                await client.distube.stop(i.guild.id)
              i.reply({
                  embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTitle("⏹ Stopped playing!")
                  .setFooter(`Requested by ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]
                })
            }
            //pause/resume
            if (i.customId == `3`) {
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTitle(`${client.allEmojis.x} Join a Voice Channel first!`)
                  .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `Streaming to <#${channel.id}>`,
                  embeds: [new MessageEmbed()
                  .setColor("#4A90E2")
                  .setTitle("🔉 Join my Voice Channel first!")
                  .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true
                })
              if (newQueue.playing) {
                await client.distube.pause(i.guild.id);
                i.reply({
                  embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTitle('⏸️ Paused the current Track!')
                  .setFooter(`Requested by ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]
                })
                var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {})
              } else {
                //pause the player
                await client.distube.resume(i.guild.id);
                i.reply({
                  embeds: [new MessageEmbed()
                  .setColor('#7ED321')
                  .setTitle('▶️ Resumed the current Track!')
                  .setFooter(`Requested by ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]
                })
              }
              var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {})
            }
            //autoplay
            if (i.customId == `4`) {
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTitle(`${client.allEmojis.x} Join a Voice Channel first!`)
                  .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `Streaming to <#${channel.id}>`,
                  embeds: [new MessageEmbed()
                  .setColor("#4A90E2")
                  .setTitle("🔉 Join my Voice Channel first!")
                  .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true
                })
              //pause the player
              if (!newQueue || !newQueue.previousSongs || newQueue.previousSongs.length == 0) return i.reply({
                    embeds: [new MessageEmbed()
                    .setColor(ee.color)
                    .setDescription(`⏮️  **Nothing to move back to!**\n⏹  **Consider stopping if you really wish to!**`)
                    .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true  
                  });
              //Send Success Message
             if (newQueue && newQueue.previousSongs || !newQueue.previousSongs.length == 0) {
               if (newQueue.repeatMode === 1) {
                 await newQueue.setRepeatMode(0)
               }
               await newQueue.previous();
               i.reply({
                    embeds: [new MessageEmbed()
                    .setColor(ee.color)
                    .setTitle(`⏮️  **Switched to the previous track!**`)
                    .setAuthor(`Requested by ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]
                  })
            }
            }
            //Shuffle
            if(i.customId == `5`){
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTitle(`${client.allEmojis.x} Join a Voice Channel first!`)
                  .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `Streaming to <#${channel.id}>`,
                  embeds: [new MessageEmbed()
                  .setColor("#4A90E2")
                  .setTitle("🔉 Join my Voice Channel first!")
                  .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true
                })
              //pause the player
              let volincrease = Number(newQueue.volume + 10);
              if (volincrease > 150) volincrease = 150;
              await newQueue.setVolume(volincrease);
              i.reply({
                    embeds: [new MessageEmbed()
                    .setColor("#7ED321")
                    .setTitle(`✅ Volume set to ${Math.floor(newQueue.volume)}%!`)
                    .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true  
                  })
              var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {})
            }
            //Songloop
            if(i.customId == `6`){
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTitle(`${client.allEmojis.x} Join a Voice Channel first!`)
                  .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `Streaming to <#${channel.id}>`,
                  embeds: [new MessageEmbed()
                  .setColor("#4A90E2")
                  .setTitle("🔉 Join my Voice Channel first!")
                  .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true
                })
              //Disable the Repeatmode
              if (newQueue.repeatMode === 0 && newQueue.songs.length > 1) {
                await newQueue.setRepeatMode(1)
                i.reply({
                    embeds: [new MessageEmbed()
                    .setColor("#7ED321")
                    .setTitle(`✅ Enabled Song Loop!`)
                    .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true  
                  })
                var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {})
              } else if (newQueue.repeatMode === 0 && newQueue.songs.length === 1) {
                await newQueue.setRepeatMode(2)
                i.reply({
                    embeds: [new MessageEmbed()
                    .setColor("#7ED321")
                    .setTitle(`✅ Enabled Song Loop!`)
                    .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true  
                  })
                var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {})
              } else if (newQueue.repeatMode === 1 && newQueue.songs.length > 1) {
                await newQueue.setRepeatMode(2)
                i.reply({
                    embeds: [new MessageEmbed()
                    .setColor("#7ED321")
                    .setTitle(`✅ Enabled Queue Loop!`)
                    .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true  
                  })
                var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {})
              } else if (newQueue.repeatMode === 1 && newQueue.songs.length === 1) {
                await newQueue.setRepeatMode(2)
                i.reply({
                    embeds: [new MessageEmbed()
                    .setColor("#7ED321")
                    .setTitle(`✅ Enabled Song Loop!`)
                    .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true  
                  })
                var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {})
              } else {
              await newQueue.setRepeatMode(0)
              i.reply({
                    embeds: [new MessageEmbed()
                    .setColor(ee.color)
                    .setTitle(`${client.allEmojis.x} Turned off loop! Repeat mode set to default!`)
                    .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true  
                  })
                var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {})
            }
            } 
            //Queueloop
            if(i.customId == `7`){
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTitle(`${client.allEmojis.x} Join a Voice Channel first!`)
                  .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `Streaming to <#${channel.id}>`,
                  embeds: [new MessageEmbed()
                  .setColor("#4A90E2")
                  .setTitle("🔉 Join my Voice Channel first!")
                  .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true
                })
              //Disable the Repeatmode
              let voldecrease = Number(newQueue.volume - 10);
              if (voldecrease < 50) voldecrease = 50;
              await newQueue.setVolume(voldecrease)
              i.reply({
                    embeds: [new MessageEmbed()
                    .setColor("#7ED321")
                    .setTitle(`✅ Volume set to ${Math.floor(newQueue.volume)}%!`)
                    .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true  
                  })
              var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {})
            }
            //Forward
            if(i.customId == `8`){
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTitle(`${client.allEmojis.x} Join a Voice Channel first!`)
                  .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `Streaming to <#${channel.id}>`,
                  embeds: [new MessageEmbed()
                  .setColor("#4A90E2")
                  .setTitle("🔉 Join my Voice Channel first!")
                  .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true
                })
              let seektime = newQueue.currentTime + 10;
              if (seektime >= newQueue.songs[0].duration) seektime = newQueue.songs[0].duration - 1;
              await newQueue.seek(Number(seektime))
              collector.resetTimer({time: (newQueue.songs[0].duration - newQueue.currentTime) * 1000})
              i.reply({
                    embeds: [new MessageEmbed()
                    .setColor('#4A90E2')
                    .setTitle(`⏩ Forwarded the song by 10 seconds!`)
                    .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true  
                  })
              var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {})
            }
            //Rewind
            if(i.customId == `9`){
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTitle(`${client.allEmojis.x} Join a Voice Channel first!`)
                  .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `Streaming to <#${channel.id}>`,
                  embeds: [new MessageEmbed()
                  .setColor("#4A90E2")
                  .setTitle("🔉 Join my Voice Channel first!")
                  .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true
                })
              let seektime = newQueue.currentTime - 10;
              if (seektime < 0) seektime = 0;
              if (seektime >= newQueue.songs[0].duration - newQueue.currentTime) seektime = 0;
              await newQueue.seek(Number(seektime))
              collector.resetTimer({time: (newQueue.songs[0].duration - newQueue.currentTime) * 1000})
              if (seektime > 0) {
                i.reply({
                    embeds: [new MessageEmbed()
                    .setColor('#4A90E2')
                    .setTitle(`⏪ Rewinded the song by 10 seconds!`)
                    .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true  
                  })
              } else {
                i.reply({
                    embeds: [new MessageEmbed()
                    .setColor('#4A90E2')
                    .setTitle(`⏪ Rewinded the song to start!`)
                    .setFooter(`Requested by ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]
                  })
              }
              var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {})
            }
            //Lyrics
            if(i.customId == `10`){let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTitle(`${client.allEmojis.x} Join a Voice Channel first!`)
                  .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `Streaming to <#${channel.id}>`,
                  embeds: [new MessageEmbed()
                  .setColor("#4A90E2")
                  .setTitle("🔉 Join my Voice Channel first!")
                  .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))],
                  ephemeral: true
                })
              let embeds = [];
				let k = 10;
				let theSongs = newQueue.songs;
				//defining each Pages
				for (let i = 0; i < theSongs.length; i += 10) {
					let qus = theSongs;
					const current = qus.slice(i, k)
					let j = 1;
					const info = current.map((track) => `${j++}). [${String(track.name).replace(/\[/igu, "{").replace(/\]/igu, "}").substr(0, 60)}](${track.url}) ~ \`${track.formattedDuration}\``).join("\n")
					const embed = new MessageEmbed()
						.setColor(ee.color)
						.setDescription(`${info}`)
					if (i < 10) {
						embed.setTitle(`📑 **Current Queue Details**`)
						embed.setDescription(`**Now Playing**\n> [${theSongs[0].name.replace(/\[/igu, "{").replace(/\]/igu, "}")}](${theSongs[0].url})\n\n${info}`)
					}
					embeds.push(embed);
					k += 10; //Raise k to 10
				}
				embeds[embeds.length - 1] = embeds[embeds.length - 1]
					.setFooter(`${theSongs.length} Song${newQueue.songs.length == 1 ? `` : `s`} in Queue | Duration ~ ${newQueue.formattedDuration}`, ee.footericon)
				let pages = []
				for (let i = 0; i < embeds.length; i += 3) {
					pages.push(embeds.slice(i, i + 3));
				}
				pages = pages.slice(0, 24)
				const Menu = new MessageSelectMenu()
					.setCustomId("QUEUEPAGES")
					.setPlaceholder("Select a Page")
					.addOptions([
						pages.map((page, index) => {
							let Obj = {};
							Obj.label = `Page ${index + 1}`
							Obj.value = `${index}`;
							Obj.description = `Shows the ${index + 1}/${pages.length} Page!`
							return Obj;
						})
					])
				const row = new MessageActionRow().addComponents([Menu])
				i.reply({
					embeds: [embeds[0]],
					components: [row],
          ephemeral: true
				});
				//Event
				client.on('interactionCreate', (i) => {
					if (!i.isSelectMenu()) return;
					if (i.customId === "QUEUEPAGES" && i.applicationId == client.user.id) {
						i.reply({
							embeds: pages[Number(i.values[0])],
              ephemeral: true
						}).catch(e => {})
					}
				});
            }
          });
        } catch (error) {
          console.error(error)
        }
      })
      .on(`addSong`, (queue, song) => queue.textChannel.send({
        embeds: [
          new MessageEmbed()
          .setColor(ee.color)
          .setThumbnail(`https://img.youtube.com/vi/${song.id}/mqdefault.jpg`)
          .setFooter("Requested by " + song.user.tag, song.user.displayAvatarURL({
            dynamic: true
          }))
          .setTitle(`${client.allEmojis.check_mark} **Song added to the Queue!**`)
          .setDescription(`[${song.name}](${song.url})  ~  \`${song.formattedDuration}\``)
          .addField(`⌛ **Estimated Time**`, `\`${queue.songs.length - 1} song${queue.songs.length > 1 ? "s" : ""}\` ~ \`${(Math.floor((queue.duration - song.duration) / 60 * 100) / 100).toString().replace(".", ":")}\``)
          .addField(`🌀 **Queue Duration**`, `\`${queue.formattedDuration}\``)
        ]
      }))
      .on(`addList`, (queue, playlist) => queue.textChannel.send({
        embeds: [
          new MessageEmbed()
          .setColor(ee.color)
          .setThumbnail(playlist.thumbnail.url ? playlist.thumbnail.url : `https://img.youtube.com/vi/${playlist.songs[0].id}/mqdefault.jpg`)
          .setFooter("Requested by" + playlist.user.tag, playlist.user.displayAvatarURL({
            dynamic: true
          }))
          .setTitle(`${client.allEmojis.check_mark} **Playlist added to the Queue!**`)
          .setDescription(`[${playlist.name}](${playlist.url ? playlist.url : ""})  -  \`${playlist.songs.length} Song${playlist.songs.length > 0 ? "s" : ""}\``)
          .addField(`⌛ **Estimated Time**`, `\`${queue.songs.length - - playlist.songs.length} song${queue.songs.length > 1 ? "s" : ""}\` ~ \`${(Math.floor((queue.duration - playlist.duration) / 60 * 100) / 100).toString().replace(".", ":") != 0 ? (Math.floor((queue.duration - playlist.duration) / 60 * 100) / 100).toString().replace(".", ":") : `Playlist(Queue) Duration`}\``)
          .addField(`🌀 **Queue Duration**`, `\`${queue.formattedDuration}\``)
        ]
      }))
       // DisTubeOptions.searchSongs = true
      .on(`searchResult`, (message, result) => {
        let i = 0
        message.channel.send(`**Choose an option from below**\n${result.map((song) => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join(`\n`)}\n*Enter anything else or wait 60 seconds to cancel*`)
      })
      // DisTubeOptions.searchSongs = true
      .on(`searchCancel`, message => message.channel.send(`Searching canceled`).catch((e)=>console.log(e)))
      .on(`error`, (channel, e) => {
        channel.send(`An error encountered: ${e}`).catch((e)=>console.log(e))
        console.error(e)
      })
      .on(`empty`, channel => channel.send(`Voice channel is empty! Leaving the channel...`).catch((e)=>console.log(e)))
      .on(`searchNoResult`, message => message.channel.send(`No result found!`).catch((e)=>console.log(e)))
      .on(`finishSong`, (queue, song) => {
        var embed = new MessageEmbed().setColor(ee.color)
        .setAuthor(`${song.name}`, "https://cdn.discordapp.com/attachments/883978730261860383/883978741892649000/847032838998196234.png", song.url)
        .setDescription(`✅ **FINISHED PLAYING!**`)
        .setThumbnail(`https://img.youtube.com/vi/${song.id}/mqdefault.jpg`)
        .setFooter(`Requested by ${song.user.tag}`, song.user.displayAvatarURL({
          dynamic: true
        }));
        queue.textChannel.messages.fetch(PlayerMap.get(`currentmsg`)).then(currentSongPlayMsg=>{
          currentSongPlayMsg.edit({embeds: [embed], components: []}).catch((e) => {
            //console.log(e.stack ? String(e.stack).grey : String(e).grey)
          })
        }).catch((e) => {
          //console.log(e.stack ? String(e.stack).grey : String(e).grey)
        })
      })
      .on(`finish`, queue => {
        queue.textChannel.send({
          embeds: [
            new MessageEmbed().setColor(ee.color).setFooter(ee.footertext, ee.footericon)
            .setTitle("⛔️ LEFT THE CHANNEL")
            .setDescription(":headphones: **No more songs left to play!**")
            .setTimestamp()
          ]
        })
      })
      .on(`initQueue`, queue => {
        try {
          client.settings.ensure(queue.id, {
            defaultvolume: 50,
            defaultautoplay: false,
            defaultfilters: [`bassboost6`, `clear`]
          })
          let data = client.settings.get(queue.id)
          queue.autoplay = Boolean(data.defaultautoplay);
          queue.volume = Number(data.defaultvolume);
          queue.setFilter(data.defaultfilters);
        } catch (error) {
          console.error(error)
        }
      });
  } catch (e) {
    console.log(String(e.stack).bgRed)
  }
  function receiveQueueData(newQueue, newTrack) {
    var djs = client.settings.get(newQueue.id, `djroles`);
    if(!djs || !Array.isArray(djs)) djs = [];
    else djs = djs.map(r => `<@&${r}>`);
    if(djs.length == 0 ) djs = "`not setup`";
    else djs.slice(0, 15).join(", ");
    if(!newTrack) return new MessageEmbed().setColor(ee.wrongcolor).setTitle("NO SONG FOUND?!?!")
    var embed = new MessageEmbed().setColor(ee.color)
      .addField(`🌀 Queue`, `>>> \`${newQueue.songs.length} song${newQueue.songs.length == 1 ? `` : `s`}\`\n\`ETA ~ ${newQueue.formattedDuration}\`\n⠀`, true)
      .addField(`🔊 Volume`, `>>> \`${Math.floor(newQueue.volume)} %\`\n⠀`, true)
      .addField(`⏱ Duration`, `>>> \`${newQueue.formattedCurrentTime} / ${newTrack.formattedDuration}\``, true)
      .setAuthor(`${newTrack.name}`, `https://images-ext-1.discordapp.net/external/DkPCBVBHBDJC8xHHCF2G7-rJXnTwj_qs78udThL8Cy0/%3Fv%3D1/https/cdn.discordapp.com/emojis/859459305152708630.gif`, `${newTrack.url ? newTrack.url : newTrack.streamURL}`)
      .setImage(`https://img.youtube.com/vi/${newTrack.id}/mqdefault.jpg`)
      .setFooter(`Requested by ${newTrack.user.tag}`, newTrack.user.displayAvatarURL({
        dynamic: true
      }));
    let skip = new MessageButton().setStyle('SECONDARY').setCustomId('1').setEmoji(`<:nextbutton:982697337749143592>`)
    let stop = new MessageButton().setStyle('SECONDARY').setCustomId('2').setEmoji(`<:stopbutton:982697506821505074>`)
    let pause = new MessageButton().setStyle('SECONDARY').setCustomId('3').setEmoji(`<:pausebutton:982697472998666250>`)
    let back = new MessageButton().setStyle('SECONDARY').setCustomId('4').setEmoji(`<:backbutton:982697312843362304>`)
    let invol = new MessageButton().setStyle('SECONDARY').setCustomId('5').setEmoji(`<:volumeup:982697213878763530>`)
    if (!newQueue.playing) {
      pause = pause.setEmoji(`<:playbutton:982697402517565470>`)
    }
    let loopmode = new MessageButton().setStyle('SECONDARY').setCustomId('6').setEmoji(`<:repeati:982697190596177920>`)
    let devol = new MessageButton().setStyle('SECONDARY').setCustomId('7').setEmoji(`<:volumedown:982697241607278642>`)
    let forward = new MessageButton().setStyle('SECONDARY').setCustomId('8').setEmoji(`<:fastforwardbutton:982697439876223046>`)
    let rewind = new MessageButton().setStyle('SECONDARY').setCustomId('9').setEmoji(`<:fastbackward:982697281092481085>`)
    let queue = new MessageButton().setStyle('SECONDARY').setCustomId('10').setEmoji(`<:document:982700578662678589>`)
    if (newQueue.repeatMode === 1 || newQueue.repeatMode === 2 && newQueue.songs.length === 1) {
      loopmode = loopmode.setEmoji(`<:repeatonce:982697156118986782>`)
    } else if (newQueue.repeatMode === 2 && newQueue.songs.length > 1) {
      loopmode = loopmode.setEmoji(`<:sync:982697369072189484>`)
    } else {
      loopmode = loopmode.setEmoji(`<:repeati:982697190596177920>`)
    }
    if (Math.floor(newQueue.currentTime) < 10) {
      rewind = rewind.setDisabled()
    } else {
      rewind = rewind.setDisabled(false)
    }
    if (Math.floor(newQueue.volume) <= 50) {
      devol = devol.setDisabled()
    } else {
      devol = devol.setDisabled(false)
    }
    if (Math.floor(newQueue.volume) >= 150) {
      invol = invol.setDisabled()
    } else {
      invol = invol.setDisabled(false)
    }
    if (Math.floor((newTrack.duration - newQueue.currentTime)) <= 10) {
      forward = forward.setDisabled()
    } else {
      forward = forward.setDisabled(false)
    }
    const row = new MessageActionRow().addComponents([back, rewind, pause, forward, skip]);
    const row2 = new MessageActionRow().addComponents([loopmode, devol, stop, invol, queue]);
    return {
      embeds: [embed],
      components: [row, row2]
    };
  }
};