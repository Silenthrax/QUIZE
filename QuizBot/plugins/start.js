const bot = require("../index");


// -------------- Buttons ------------------ //

const replyMarkup = {
  inline_keyboard: [
    [{ text: "🧰 Tools", callback_data: "tools_" }],
    [{ text: "🌐 Languanges", callback_data: "languages_" }]
  ]
};



bot.command("start", (ctx) => {
    let name = ctx.from.first_name;
    ctx.reply(`Hello, ${name},\n\nI am your new Quiz Bot, and I’m built using JavaScript.`,
    { reply_markup: replyMarkup });
});




