const bot = require("../index");


// -------------- Buttons ------------------ //

const replyMarkup = {
  inline_keyboard: [
    [{ text: "🧰 Tools", callback_data: "tools_" }],
    [{ text: "🌐 Languanges", callback_data: "languages_" }]
  ]
};






bot.command("start", async (ctx) => {
    try {
        let name = ctx.from.first_name;
        await ctx.reply(
            `Hello, ${name},\n\nWelcome to QuizBot! I'm here to help you create and organize quizzes effortlessly.`,
        );
    } catch (error) {
        console.error("Error in start command:", error);
        await ctx.reply("An error occurred. Please try again later.");
    }
});




