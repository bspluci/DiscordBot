module.exports = {
   name: "dm",
   description: "개인메세지 보내기",
   aliases: ["메세지", "귓"],
   args: true,
   usage: "@아이디 메세지",
   cooldown: 5,
   execute(message, args) {
      if (!message.mentions.users.first()) {
         return;
      }

      const user = message.client.users.cache.get(message.mentions.users.first().id);
      user.send(args);
   },
};
