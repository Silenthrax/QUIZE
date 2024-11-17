const { Telegraf } = require('telegraf');
const path = require('path');
const fs = require("fs");
const configs = require('config');


const bot = new Telegraf(configs.BOT_TOKEN);



const pluginsDir = path.join(__dirname, "/plugins/");
fs.readdir(pluginsDir, (err, files) => {
  if (err) {
    console.error("Error reading plugins directory:", err);
    return;
  }
  const modules = files.filter((file) => file.endsWith(".js"));
  modules.forEach((module) => {
    const modulePath = path.join(pluginsDir, module);
    const plugin = require(modulePath);

    if (plugin) {
      console.log(`Loaded plugin module: ${module}`);
    } else {
      console.log(`Invalid plugin module: ${module}`);
    }
  });
});



bot.catch((err) => {
  console.error('Error:', err);
});

bot.launch().then(() => {
  console.log("QuizBot is running...");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));


