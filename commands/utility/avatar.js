module.exports = {
   name: "avatar",
   aliases: ["아바타", "아이콘"],
   description: "Get the avatar URL of the tagged user(s), or your own avatar.",
   execute(message) {
      if (!message.mentions.users.size) {
         return message.channel.send(`Your avatar: ${message.author.displayAvatarURL()}`);
      }

      const avatarList = message.mentions.users.map((user) => {
         return `${user.username}'s avatar: ${user.displayAvatarURL()}`;
      });

      message.channel.send(avatarList);
   },
};
