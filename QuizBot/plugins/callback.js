const bot = require("../index");
//const AddUsersQuiz = require("./plugins/addquiz")



bot.on('callback_query', (ctx) => {
    const callbackData = ctx.callbackQuery.data;
    if (callbackData === 'delete_me') {
        return ctx.answerCallbackQuery('Deleted...');
    } else if (callbackData === 'add_more') {
        return ctx.answerCallbackQuery('Add More Quizes...');
    } 
});




