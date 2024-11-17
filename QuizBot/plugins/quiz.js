const bot = require("../index")


bot.command('quiz', (ctx) => {
  const question = "What is the capital of France?";
  const options = ["Berlin", "Madrid", "Paris", "Rome"];
  const correctOptionId = 2;

  ctx.telegram.sendPoll(
    ctx.chat.id,
    question,
    options,
    {
      type: 'quiz',
      correct_option_id: correctOptionId,
      explanation: "Paris is the capital of France.",
      is_anonymous: false,
    }
  ).catch((error) => {
    console.error('Failed to send quiz:', error);
  });
});









