const bot = require("../index");


// -------------- Add Quizes ------------- //

bot.command("addquiz", async (ctx) => {
  try {
    const msg = ctx.message.text.split("/addquiz ")[1];
    if (!msg) {      
      await ctx.reply("Please provide the question in the following format:\n/addquiz\n1. Question text\nA. Option 1\nB. Option 2\nC. Option 3\nD. Option 4\nAnswer (Option number)\nExplanation (optional)");
      return;
    }

    const lines = msg.split("\n").map(line => line.trim());

    if (lines.length < 5) {
      await ctx.reply("Error: Please provide the question in the correct format.");
      return;
    }

    const question = lines[0];
    const options = {};

    for (let i = 1; i <= lines.length; i++) {
      if (lines[i] && lines[i].match(/^[A-D]\./)) {
        const optionLabel = lines[i].charAt(0);
        options[optionLabel] = lines[i].slice(2).trim();
      } else if (lines[i] && !isNaN(parseInt(lines[i]))) {
        const answer = parseInt(lines[i], 10);
        if (answer < 1 || answer > 26) {
          await ctx.reply("Error: Invalid answer option number. It should be between 1 and 26.");
          return;
        }
        continue;
      } else {
        const explanation = lines[i] || "No explanation provided.";
        continue;
      }
    }

    const answer = parseInt(lines[lines.length - 2], 10);
    const explanation = lines[lines.length - 1] || "No explanation provided.";

    const quiz = {
      question,
      options,
      answer,
      explanation,
    };

    await ctx.reply(`Quiz added successfully:\n${JSON.stringify(quiz, null, 2)}`);
  } catch (error) {
    console.error(error);
    await ctx.reply("Error occurred while processing the quiz. Please check the format and try again.");
  }
});



