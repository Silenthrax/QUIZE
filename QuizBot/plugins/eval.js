const bot = require("../index");
const { OWNER_ID } = require("./config");
const { exec } = require('child_process');
const {shellCommand} = require("@jadesrochers/subprocess");



bot.command("sh", async (ctx) => {
    try {
        if (OWNER_ID.includes(ctx.message.from.id)) {
            const txt = ctx.message.text.split("/sh");
            const shell = await shellCommand(txt[txt.length - 1].trim());
            await ctx.reply(`OUTPUT:\n${shell.stdout}`, {
                reply_to_message_id: ctx.message.message_id
            });
        } else {
            await ctx.reply("You do not have permission to use this command.");
        }
    } catch (error) {
        await ctx.reply(`Error:\n${error}`, {
            reply_to_message_id: ctx.message.message_id
        });
    }
});



