const bot = require("../index");
const configs = require("../config");
const {shellCommand} = require("@jadesrochers/subprocess");



bot.command("sh", async (ctx) => {

    try {
        
        if (configs.OWNER_ID.includes(ctx.message.from.id)) {
            
            const txt = ctx.message.text.split("/sh") ;

            const shell = await shellCommand(txt[txt.length - 1]);
            await ctx.reply(`OUTPUT : \n${shell.stdout}`,{
                reply_to_message_id : ctx.message.message_id
            });
        };

    } catch (eor) {
        await ctx.reply(`Error : \n${eor}`,{
            reply_to_message_id : ctx.message.message_id
        })
        console.log(eor);
    };
});




