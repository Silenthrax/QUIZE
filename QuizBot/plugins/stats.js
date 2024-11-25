const bot = require("../index");
const { OWNER_ID } = require("../../config");
const { get_total_users } = require("../core/mongo/usersdb");
const { get_total_chats } = require("../core/mongo/chatsdb");



// ---------------- Stats ----------------- //
bot.command("stats", async (ctx) => {
    try {
        if (OWNER_ID.includes(ctx.message.from.id)) {
            const users = await get_total_users();
            const chats = await get_total_chats();

            const botInfo = await bot.telegram.getMe();
            const botName = botInfo.first_name;

            await ctx.replyWithPhoto(
                "https://graph.org//file/1e2e321668b57ba61d954.jpg",
                {
                    caption: `<b>${botName} System Stats</b>\n\n` +
                        `Total Users: <code>${users.length}</code>\n` +
                        `Total Chats: <code>${chats.length}</code>`,
                    parse_mode: "HTML"
                }
            );
        } else {
            await ctx.reply("This is an owner-only command.");
        }
    } catch (error) {
        console.error("Error in /stats command:", error);
        await ctx.reply("An error occurred while fetching the stats. Please try again later.");
    }
});



