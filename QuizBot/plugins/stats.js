const bot = require("../index");
const { get_total_users } = require("../core/mongo/usersdb");
const { get_total_chats } = require("../core/mongo/chatsdb");

const Owner = 6107581019;


bot.command("stats", async (ctx) => {
    const users = await get_total_users();
    const chats = await get_total_chats();

    try {
        if (ctx.message.from.id === Owner) {           
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
            ctx.reply("This is an owner-only command.");
        }
    } catch (error) {
        console.error(error);
        ctx.reply("An error occurred while fetching the stats. Please try again later.");
    }
});


