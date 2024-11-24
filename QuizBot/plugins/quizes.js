const bot = require("../index");

// -------------- Add Quizzes ------------- //

bot.command("addquiz", async (ctx) => {
  try {
    const msg = ctx.message.text.split("/addquiz ")[1];
    if (!msg || msg.trim() === "") {
      await ctx.reply(
        "Please provide the question in the following format:\n" +
        "/addquiz\n1. Question text\nA. Option 1\nB. Option 2\nC. Option 3\nD. Option 4\nAnswer (Option number)\nExplanation (optional)"
      );
      return;
    }

    const lines = msg.split("\n").map(line => line.trim()).filter(line => line !== "");

    if (lines.length < 5) {
      await ctx.reply("Error: Please provide the question in the correct format.");
      return;
    }

    const question = lines[0].replace(/\s+/g, " ").trim(); // Normalize spaces in the question
    const options = {};

    let answer, explanation;

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].match(/^[A-D]\./)) {
        const optionLabel = lines[i].charAt(0).toUpperCase();
        options[optionLabel] = lines[i].slice(2).trim();
      } else if (!isNaN(parseInt(lines[i], 10))) {
        answer = parseInt(lines[i], 10);
        if (answer < 1 || answer > 4) { // Ensure answer is valid
          await ctx.reply("Error: Invalid answer option number. It should be between 1 and 4.");
          return;
        }
      } else if (i === lines.length - 1) {
        explanation = lines[i].trim() || "No explanation provided.";
      }
    }

    if (!answer) {
      await ctx.reply("Error: The answer must be a number. Please provide it in a valid format.");
      return;
    }

    const quiz = {
      question,
      options,
      answer,
      explanation: explanation || "No explanation provided.",
    };

    await ctx.reply(`Quiz added successfully:\n${JSON.stringify(quiz, null, 2)}`);
  } catch (error) {
    console.error(error);
    await ctx.reply("Error occurred while processing the quiz. Please check the format and try again.");
  }
});



