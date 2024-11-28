const bot = require("../index");
const fs = require("fs");
const { getQuiz, getAllQuizNames, deleteAllQuizzes } = require("../core/mongo/quizesdb");



// ------------------ Buttons ------------------ //
const removeAllMarkup = {
  inline_keyboard: [
    [
      { text: "Remove All Quizzes", callback_data: "remove_all_quizzes" }
    ]
  ]
};

// ---------------- My Quiz Command ---------------- //
bot.command("myquiz", async (ctx) => {
  const user_id = ctx.message.from.id;
  const allquizNames = await getAllQuizNames(user_id);

  if (!allquizNames || allquizNames.length === 0) {
    ctx.reply('Quiz not found.');
    return;
  }

  let NameText = 'Here are all your Quiz Names:\n\n';
  const botName = ctx.botInfo.username;

  allquizNames.forEach((name, index) => {
    NameText += `<b>Quiz ${index + 1} : ${name}</b>\nhttps://t.me/${botName}?start=QuizName_${name}\n\n`;
  });

  await ctx.replyWithHTML(NameText, {
    reply_markup: removeAllMarkup 
  });
});


// ------------- Actions -------------- //
bot.action('remove_all_quizzes', async (ctx) => {
  const user_id = ctx.from.id;
  await deleteAllQuizzes(user_id);  
  await ctx.answerCbQuery('All quizzes have been removed.');
  await ctx.editMessageText('All quizzes have been removed successfully!');
});




// ------------- Poll Uploader ---------------- //

const userResponses = {};

async function pollUploader(ctx, user_id, name) {
  try {
    const quizDataRaw = await getQuiz(user_id, name);
    const quizData = typeof quizDataRaw === "string" ? JSON.parse(quizDataRaw) : quizDataRaw;

    await ctx.replyWithHTML(
      `📝 <b>Quiz Started</b>: <b>${name}</b> 📚\n\nTotal Questions: ${quizData.length}. Get ready! 🎯`
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Set up the poll answer listener once
    bot.on("poll_answer", async (ctx) => {
      const userId = ctx.pollAnswer.user.id;
      const name = ctx.pollAnswer.user.first_name;
      const selectedOption = ctx.pollAnswer.option_ids[0];

      // Ensure userResponses is initialized for new users
      if (!userResponses[userId]) {
        userResponses[userId] = { name: name, correct: 0, wrong: 0 };
      }

      // Find the quiz question based on poll ID
      const quiz = quizData.find((q) => q.poll_id === ctx.pollAnswer.poll_id);
      if (quiz) {
        if (selectedOption === quiz.correctAnswer) {
          userResponses[userId].correct += 1;
          console.log("correct");
        } else {
          userResponses[userId].wrong += 1;
          console.log("wrong");
        }
      }
    });

    // Loop through each quiz question
    for (const quiz of quizData) {
      const { question, options, correctAnswer, explanation } = quiz;
      const pollOptions = Object.values(options).map(String);

      const pollMessage = await bot.telegram.sendPoll(ctx.chat.id, question, pollOptions, {
        type: "quiz",
        correct_option_id: correctAnswer,
        explanation,
        is_anonymous: false,
      });

      quiz.poll_id = pollMessage.poll.id;

      await new Promise((resolve) => setTimeout(resolve, 15000)); // Delay between polls
    }

    console.log(userResponses);
    const sortedResults = Object.values(userResponses)
      .sort((a, b) => b.correct - a.correct);

    let resultsMessage = "🎉 <b>Quiz Completed Successfully!</b>\n\n🏆 <b>Results:</b>\n\n";
    sortedResults.forEach((user, index) => {
      resultsMessage += `<b>${index + 1}. ${user.name}</b>\n✅ Correct: ${user.correct}\n❌ Wrong: ${user.wrong}\n\n`;
    });

    if (resultsMessage.length > 4096) {
      const filePath = "/mnt/data/quiz_results.txt";
      fs.writeFileSync(filePath, resultsMessage);
      await ctx.replyWithDocument({ source: filePath, filename: "quiz_results.txt" });
      fs.unlinkSync(filePath);
    } else {
      await ctx.replyWithHTML(resultsMessage);
    }

    await ctx.replyWithHTML("🎯 <b>Thank you for participating!</b>🥳");

  } catch (error) {
    console.error("Error uploading poll:", error);
    await ctx.reply("❌ Failed to upload the poll. Please try again.");
  }
}





let results = { correct: 0, incorrect: 0 }; // Store user results
let totalPolls = 2; // Number of polls in the quiz
let answeredPolls = 0; // Track how many polls have been answered

bot.command('poll', async (ctx) => {
  results = { correct: 0, incorrect: 0 };
  answeredPolls = 0;

  // First Quiz Poll
  await ctx.replyWithPoll('What is the capital of France?', ['Paris', 'London', 'Berlin'], {
    is_anonymous: false,
    type: 'quiz',
    correct_option_id: 0, // Paris is the correct answer
  });

  // Wait for 2 seconds before sending the next poll
  setTimeout(async () => {
    // Second Quiz Poll
    await ctx.replyWithPoll('What is 2 + 2?', ['3', '4', '5'], {
      is_anonymous: false,
      type: 'quiz',
      correct_option_id: 1, // 4 is the correct answer
    });
  }, 2000);
});

// Handle Poll Answers
bot.on('poll_answer', (ctx) => {
  const { option_ids, poll_id } = ctx.update.poll_answer;
  answeredPolls++;

  // Check if the answer is correct based on poll_id
  const correctAnswers = {
    0: 0, // First poll's correct option
    1: 1, // Second poll's correct option
  };

  const correctOption = correctAnswers[answeredPolls - 1]; // -1 because polls are answered sequentially
  const userAnswer = option_ids[0];

  if (userAnswer === correctOption) {
    results.correct += 1;
  } else {
    results.incorrect += 1;
  }

  // End quiz automatically after both polls are answered
  if (answeredPolls === totalPolls) {
    ctx.telegram.sendMessage(
      ctx.update.poll_answer.user.id,
      `Quiz Over! \nCorrect Answers: ${results.correct}\nIncorrect Answers: ${results.incorrect}`
    );
  }
});













module.exports = { pollUploader };


