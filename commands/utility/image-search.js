const GoogleImages = require("../../node_modules/google-images");
const { googleID, googleToken } = require("../../config.json");
const googleImages = new GoogleImages(googleID, googleToken);

module.exports = {
   name: "img-search",
   description: "이미지 검색",
   aliases: ["이미지", "is", "짤"],
   args: true,
   usage: "검색어",
   cooldown: 1,
   execute(message, args) {
      const onMessage = async (message) => {
         try {
            const results = await googleImages.search(args[0], { size: "medium", safe: "high" });
            const reply = !results.length
               ? "검색 결과가 없습니다."
               : results[Math.floor(Math.random() * results.length)].url;
            message.channel.send(reply);
         } catch (e) {
            console.error(e);
            if (e.statusCode === 429) {
               message.channel.send("이미지 사용횟수를 초과하였습니다. 잠시후 다시 시도해 주세요.");
            } else {
               message.channel.send("Error happened, see the console");
            }
         }
      };

      onMessage(message);
   },
};
