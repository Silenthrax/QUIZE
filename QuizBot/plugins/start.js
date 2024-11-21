const bot = require("../index");

// -------------- Buttons ------------------ //

const replyMarkup = {
  inline_keyboard: [
    [{ text: "🧰 Tools", callback_data: "tools_" }],
    [{ text: "🌐 Languages", callback_data: "languages_" }] // Fixed typo
  ]
};

bot.command("stat", (ctx) => {
  try {
    let name = ctx.from.first_name || "there"; 
    ctx.reply(
      `Hello, ${name},\n\nI am your new Quiz Bot, and I’m built using JavaScript.`,
      { reply_markup: replyMarkup }
    );
  } catch (error) {
    console.error("Error in the start command:", error.message);
    ctx.reply("Oops! Something went wrong. Please try again later."); 
  }
});



