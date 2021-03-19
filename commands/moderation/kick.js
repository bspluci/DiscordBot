module.exports = {
   name: "kick",
   description: "사용자를 추방합니다.",
   guildOnly: true,
   permissions: "KICK_MEMBERS",
   execute(message) {
      if (!message.mentions.users.size) {
         return message.reply("you need to tag a user in order to kick them!");
      }

      const member = message.mentions.users.first();

      member.kick();
      message.channel.send(`${member.username}을(를) 추방했습니다.`);
   },
};
