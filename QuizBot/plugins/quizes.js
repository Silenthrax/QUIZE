const bot = require("../index");

const AddMoreMarkup = {
  inline_keyboard: [
    [{ text: "➕ Add More Quiz", callback_data: "add_more" }]
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
        "📝 **Quiz Format Guide**:\n" +
        "Please use the following format to add a quiz:\n\n" +
        "`/addquiz` Question text\n" +
        "Option 1\n" +
        "Option 2\n" +
        "Option 3\n" +
        "Option 4\n" +
        "✅ Answer (Option number)\n" +
        "ℹ️ Explanation (optional)"
      );
      return;
    }

    const lines = msg.split("\n").map(line => line.trim()).filter(line => line !== "");

    if (lines.length < 3) {
      await ctx.replyWithHTML(
        "⚠️ **Error**: Your quiz format is incomplete. Please include a question, options, and an answer.",
        { reply_markup: TryAgainMarkup }
      );
      return;
    }

    // Extract the question
    const question = lines[0].replace(/\s+/g, " ").trim(); // Normalize spaces
    if (!question) {
      await ctx.replyWithHTML(
        "❌ **Error**: Question is missing! Please start with a clear question in your quiz format.",
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
            "❌ **Error**: The answer is invalid or out of range. Please make sure the answer matches one of the options (e.g., 1, 2, 3, or 4).",
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
        "⚠️ **Error**: No options provided! Please include at least one option for the quiz.",
        { reply_markup: TryAgainMarkup }
      );
      return;
    }

    if (answerIndex === -1) {
      await ctx.replyWithHTML(
        "❌ **Error**: Answer is missing! Please specify the correct answer as a number (e.g., 1, 2, 3, or 4).",
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
      `🎉 **Quiz Added Successfully!**\n\n` +
      `📖 **Question**: ${quiz.question}\n` +
      `📋 **Options**:${formattedOptions}\n` +
      `✅ **Answer**: ${quiz.answer}\n` +
      `ℹ️ **Explanation**: ${quiz.explanation}`,
      { reply_markup: AddMoreMarkup }
    );
  } catch (error) {
    console.error(error);
    await ctx.replyWithHTML(
      "⚠️ **Error**: Something went wrong while processing your quiz. Please check the format and try again.",
      { reply_markup: TryAgainMarkup }
    );
  }
};

bot.command("addquiz", async (ctx) => {
  await addquiz(ctx);
});

bot.action("add_more", async (ctx) => {
  await ctx.answerCbQuery("⏳ Ready to add more quizzes!");
  await addquiz(ctx);
});

bot.action("try_again", async (ctx) => {
  await ctx.answerCbQuery("🔄 Let's try adding the quiz again!");
  await addquiz(ctx);
});




