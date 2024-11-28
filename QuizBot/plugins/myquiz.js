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



// Poll Upload and Execution Function
async function pollUploader(ctx, user_id, quizName){
  const quizDataRaw = await getQuiz(user_id, quizName);
  const quizData = typeof quizDataRaw === "string" ? JSON.parse(quizDataRaw) : quizDataRaw;
}

const userResponses = {}; // Store responses globally
let activeQuizzes = {}; // Track active quizzes by chat

// Simulate fetching quiz data from an external source
async function getQuizData(userId, quizName) {
  return [
    {
      question: "What is the capital of France?",
      options: ["Paris", "Berlin", "Madrid"],
      correctAnswer: "paris",
      explanation: "Paris is the capital of France.",
    },
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5"],
      correctAnswer: "4",
      explanation: "2 + 2 equals 4.",
    },
  ];
}

// Function to send a quiz and manage its flow
async function startQuiz(ctx, userId, quizName) {
  try {
    const quizData = await getQuizData(userId, quizName);

    // Reset and initialize user responses for this quiz
    userResponses[userId] = { correct: 0, wrong: 0 };
    activeQuizzes[ctx.chat.id] = quizData;

    await ctx.replyWithHTML(
      `📝 <b>Quiz Started:</b> <b>${quizName}</b>\nTotal Questions: ${quizData.length}\nGet ready! 🎯`
    );

    for (let i = 0; i < quizData.length; i++) {
      const { question, options, correctAnswer, explanation } = quizData[i];

      const pollMessage = await ctx.replyWithPoll(question, options, {
        type: "quiz",
        correct_option_id: correctAnswer,
        explanation,
        is_anonymous: false,
      });

      // Associate the poll ID with the correct answer in the quiz data
      quizData[i].poll_id = pollMessage.poll.id;

      // Delay between polls to ensure user gets time to answer
      await new Promise((resolve) => setTimeout(resolve, 15000));
    }

    // Wait a little to ensure all answers are processed before results
    setTimeout(() => displayResults(ctx, userId, quizName), 5000);

  } catch (error) {
    console.error("Error starting quiz:", error);
    await ctx.reply("❌ Failed to start the quiz. Please try again.");
  }
}

// Handle user responses for each poll
bot.on("poll_answer", (ctx) => {
  const { user, poll_id, option_ids } = ctx.pollAnswer;
  const userId = user.id;

  const activeQuiz = Object.values(activeQuizzes).flat().find(
    (quiz) => quiz.poll_id === poll_id
  );

  if (activeQuiz) {
    const correctOption = activeQuiz.correctAnswer;
    const userAnswer = option_ids[0];

    if (!userResponses[userId]) {
      userResponses[userId] = { correct: 0, wrong: 0 };
    }

    if (userAnswer === correctOption) {
      userResponses[userId].correct += 1;
    } else {
      userResponses[userId].wrong += 1;
    }
  }
});

// Function to display quiz results
async function displayResults(ctx, userId, quizName) {
  const userResult = userResponses[userId];
  const resultsMessage = `🎉 <b>Quiz Completed: ${quizName}</b>\n\n✅ Correct: ${userResult.correct}\n❌ Wrong: ${userResult.wrong}\n\n🎯 <b>Thank you for participating!</b> 🥳`;

  if (resultsMessage.length > 4096) {
    const filePath = "/mnt/data/quiz_results.txt";
    fs.writeFileSync(filePath, resultsMessage);
    await ctx.replyWithDocument({ source: filePath, filename: "quiz_results.txt" });
    fs.unlinkSync(filePath);
  } else {
    await ctx.replyWithHTML(resultsMessage);
  }
}

// Command to initiate the quiz
bot.command("start_quiz", (ctx) => {
  const userId = ctx.from.id;
  startQuiz(ctx, userId, "Sample Quiz");
});












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


