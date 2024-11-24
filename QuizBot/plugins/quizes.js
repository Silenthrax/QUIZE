const bot = require("../index");

const SupportMarkup = {
  inline_keyboard: [
    [{ text: "➕ Support", url: "https://t.me/DevsLaboratory" }]
  ],
};

const TryAgainMarkup = {
  inline_keyboard: [
    [{ text: "🔄 Try Again", callback_data: "try_again" }]
  ],
};

// -------------- Add Quizzes Function ------------- //

const addquiz = async (ctx) => {
  try {
    const msg = ctx.message.text.split("/addquiz ")[1];
    if (!msg || msg.trim() === "") {
      await ctx.reply(
        "<b>📝 Quiz Format Guide:</b>\n" +
        "Please use the following format to add a quiz:\n\n" +
        "<code>/addquiz</code> Question text\n" +
        "Option 1\n" +
        "Option 2\n" +
        "Option 3\n" +
        "Option 4\n" +
        "✅ Answer (Option number)\n" +
        "ℹ️ Explanation (optional)",
        { parse_mode: "HTML" }
      );
      return;
    }

    const lines = msg.split("\n").map(line => line.trim()).filter(line => line !== "");

    if (lines.length < 3) {
      await ctx.replyWithHTML(
        "<b>⚠️ Error:</b> Your quiz format is incomplete. Please include a question, options, and an answer.",
        { reply_markup: TryAgainMarkup }
      );
      return;
    }

    // Extract the question
    const question = lines[0].replace(/\s+/g, " ").trim(); // Normalize spaces
    if (!question) {
      await ctx.replyWithHTML(
        "<b>❌ Error:</b> Question is missing! Please start with a clear question in your quiz format.",
        { reply_markup: TryAgainMarkup }
      );
      return;
    }

    // Extract options
    const options = [];
    let answerIndex = -1;
    let explanation = "ℹ️ No explanation provided.";

    for (let i = 1; i < lines.length; i++) {
      if (!isNaN(parseInt(lines[i], 10))) {
        answerIndex = parseInt(lines[i], 10);
        if (answerIndex < 1 || answerIndex > options.length) {
          await ctx.replyWithHTML(
            "<b>❌ Error:</b> The answer is invalid or out of range. Please make sure the answer matches one of the options (e.g., 1, 2, 3, or 4).",
            { reply_markup: TryAgainMarkup }
          );
          return;
        }
      } else if (i === lines.length - 1 && answerIndex !== -1) {
        explanation = lines[i].trim() || "ℹ️ No explanation provided.";
      } else {
        options.push(lines[i]);
      }
    }

    if (options.length === 0) {
      await ctx.replyWithHTML(
        "<b>⚠️ Error:</b> No options provided! Please include at least one option for the quiz.",
        { reply_markup: TryAgainMarkup }
      );
      return;
    }

    if (answerIndex === -1) {
      await ctx.replyWithHTML(
        "<b>❌ Error:</b> Answer is missing! Please specify the correct answer as a number (e.g., 1, 2, 3, or 4).",
        { reply_markup: TryAgainMarkup }
      );
      return;
    }

    const quiz = {
      question,
      options,
      answer: answerIndex,
      explanation,
    };

    const formattedOptions = options.map((option, index) => `\n${index + 1}. ${option}`).join("");

    await ctx.replyWithHTML(
      "<b>🎉 Quiz Added Successfully!</b>\n\n" +
      `<b>📖 Question:</b> ${quiz.question}\n` +
      `<b>📋 Options:</b>${formattedOptions}\n` +
      `<b>✅ Answer:</b> ${quiz.answer}\n` +
      `<b>ℹ️ Explanation:</b> ${quiz.explanation}`,
      { reply_markup: SupportMarkup }
    );
  } catch (error) {
    console.error(error);
    await ctx.replyWithHTML(
      "<b>⚠️ Error:</b> Something went wrong while processing your quiz. Please check the format and try again.",
      { reply_markup: TryAgainMarkup }
    );
  }
};


// ------------- Add More Quiz -------------- //
bot.command("addquiz", async (ctx) => {
  await addquiz(ctx);
});


bot.action("try_again", async (ctx) => {
  await ctx.answerCbQuery("🔄 Let's try adding the quiz again!");
  await ctx.reply("Please use the `/addquiz` command to retry.");
});
