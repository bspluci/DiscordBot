module.exports = {
   name: "chmove",
   description: "사용자를 해당 음성 채널에 이동시킵니다.",
   args: true,
   usage: "@사용자 채널이름",
   aliases: ["이동", "cm", "채널이동"],
   args: true,
   cooldown: 1,
   execute(message, args) {
      if (!message.mentions.users.first()) {
         return;
      }

      if (!args[1]) {
         message.channel.send(`${message.author} 이동할 채널명을 입력해 주세요.`);
         return;
      }

      let moveChannel = "";
      const user = message.guild.members.cache.get(
         message.client.users.cache.get(message.mentions.users.first().id).id
      );
      const channelName = args.splice(1, args.length - 1).join("");
      const channelId = message.guild.channels.cache.map((id) => {
         if (id.name.replace(/(\s*)/g, "") == channelName) {
            moveChannel = id;
         }
      });

      moveChannel
         ? user.voice.channelID
            ? user.voice.setChannel(moveChannel.id)
            : message.channel.send(`${message.author} 음성채널에 참여한 인원만 이동 가능합니다.`)
         : message.channel.send(`${message.author} 채널명을 확인해 주세요.`);
   },
};
