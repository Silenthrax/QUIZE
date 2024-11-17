const { Telegraf } = require('telegraf');
const path = require('path');
const fs = require("fs");
const config = require('./config');

// -------- Create Bot Client ----------- //
const bot = new Telegraf(config.BOT_TOKEN);


// -------- Loading all modules ----------- //
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



// --------- Error handling ------------- //
bot.catch((err) => {
    console.error('Error:', err);
});

// Launch the bot
bot.launch().then(() => {
  console.log("QuizBot is running...");
});

// Graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));



