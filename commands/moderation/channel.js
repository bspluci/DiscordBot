module.exports = {
   name: "channel",
   description: "특정 채널 가져오기",
   args: true,
   usage: "#채널이름 메세지",
   execute(message, args) {
      // message.channel.send(`${message.channel.client.token}에 오신걸 환영합니다.`);

      const channel = message.client.channels.cache.get(message.mentions.channels.first().id);

      args.splice(0, 1);
      channel.send(args);
   },
};
