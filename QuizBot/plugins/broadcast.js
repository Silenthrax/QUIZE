const bot = require("../index");
const { OWNER_ID } = require("../../config");
const { get_total_users } = require("../core/mongo/usersdb");
const { get_total_chats } = require("../core/mongo/chatsdb");
const { Markup } = require("telegraf");


// --------------- Functions ----------------- //
async function broadcast(ctx, msg, all_users, all_chats) {
  let done_users = 0, done_chats = 0, failed_users = 0, failed_chats = 0;

  for (const user of all_users) {
    try {
      await ctx.telegram.sendMessage(user, msg);
      done_users++;
    } catch {
      failed_users++;
    }
  }

  for (const chat of all_chats) {
    try {
      await ctx.telegram.sendMessage(chat, msg);
      done_chats++;
    } catch {
      failed_chats++;
    }
  }

  return `
Broadcast Summary:
-------------------
✅ Done Users: ${done_users}
❌ Failed Users: ${failed_users}
✅ Done Chats: ${done_chats}
❌ Failed Chats: ${failed_chats}
`;
}

async function forwardMessage(ctx, message_id, all_users, all_chats) {
  let done_users = 0, done_chats = 0, failed_users = 0, failed_chats = 0;

  for (const user of all_users) {
    try {
      await ctx.telegram.forwardMessage(user, ctx.chat.id, message_id);
      done_users++;
    } catch {
      failed_users++;
    }
  }

  for (const chat of all_chats) {
    try {
      await ctx.telegram.forwardMessage(chat, ctx.chat.id, message_id);
      done_chats++;
    } catch {
      failed_chats++;
    }
  }

  return `
Forward Message Summary:
-------------------------
✅ Done Users: ${done_users}
❌ Failed Users: ${failed_users}
✅ Done Chats: ${done_chats}
❌ Failed Chats: ${failed_chats}
`;
}


// ---------------- Broadcast ------------------ //
bot.command("broadcast", async (ctx) => {
  try {
    if (OWNER_ID.includes(ctx.message.from.id)) {
      const reply = ctx.message.reply_to_message;
      const args = ctx.message.text.split(" ").slice(1).join(" ");
      
      if (!reply && !args) {
        return ctx.reply(
          "Please reply to a message or provide a message to broadcast.\nUsage: /broadcast <message>",
          { reply_to_message_id: ctx.message.message_id }
        );
      }

      const message = reply ? (reply.text || reply.caption) : args;

      const sanitizedMessage = encodeURIComponent(message.slice(0, 64)); // Ensure the message doesn't exceed Telegram's limit

      const buttons = Markup.inlineKeyboard([
        [Markup.button.callback("📢 Broadcast", `action_broadcast:${sanitizedMessage}`)],
        [Markup.button.callback("🔄 Forward", `action_forward:${reply ? reply.message_id : ''}`)],
      ]);

      return ctx.reply(
        "Choose an action for the message:",
        {
          reply_to_message_id: ctx.message.message_id,
          reply_markup: buttons,
        }
      );
    } else {
      await ctx.reply("This is an owner-only command.");
    }
  } catch (error) {
    console.error("Error in /broadcast command:", error);
    await ctx.reply(
      "An error occurred while processing the broadcast. Please try again later."
    );
  }
});


// --------------- Actions ----------------- //
bot.action(/action_broadcast:(.+)/, async (ctx) => {
  try {
    const message = ctx.match[1];
    const users = await get_total_users();
    const chats = await get_total_chats();

    const summary = await broadcast(ctx, message, users, chats);
    await ctx.reply(summary);
    await ctx.answerCbQuery("Broadcast executed successfully!");
  } catch (error) {
    console.error("Error in action_broadcast:", error);
    await ctx.answerCbQuery("Failed to execute broadcast.");
  }
});

bot.action(/action_forward:(.*)/, async (ctx) => {
  try {
    const message_id = ctx.match[1];
    if (!message_id) {
      return ctx.answerCbQuery("Please reply to a message to forward.");
    }

    const users = await get_total_users();
    const chats = await get_total_chats();
    const summary = await forwardMessage(ctx, message_id, users, chats);

    await ctx.reply(summary);
    await ctx.answerCbQuery("Forward executed successfully!");
  } catch (error) {
    console.error("Error in action_forward:", error);
    await ctx.answerCbQuery("Failed to execute forward.");
  }
});





