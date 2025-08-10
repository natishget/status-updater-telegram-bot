import { Telegraf, Markup } from "telegraf";
import { message, callbackQuery, channelPost } from "telegraf/filters";
import { createNewStatus, fetchLatestStatus, fetchUserLatestStatus } from "./statusService.js";
import http from 'http';

const bot = new Telegraf("7663200590:AAE5ASn3nggCioJbU8DkyKR2IW2qqfuEF58");
const PORT = 3000;

const server = http.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/createStatus") {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body); // parse JSON body
                const response = createNewStatus(data); // your function
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(response));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });

    } else {
        res.writeHead(404);
        res.end();
    }
});


bot.start((ctx) => {
    const name = ctx.update.message.from.first_name;
    const chatId = ctx.update.message.from.id;
    console.log(name, chatId)
    const url = `https://status-updater-telegram-bot.vercel.app/?name=${encodeURIComponent(name)}&chatId=${chatId}`
    ctx.reply(
        `Hello ${ctx.update.message.from.first_name}!`,
        Markup.inlineKeyboard(
            [
                Markup.button.url("🌐 Visit Website", url),
            ]),
    );

    ctx.reply(
        'Choose an option:',
        Markup.keyboard([
            ['/start', '/latest', '/mystatus'] // Buttons send these commands
        ]).resize()
    );
});



// Handle /latest
bot.command('latest', (ctx) => {

    const latest = fetchLatestStatus();

    if (!latest) {
        return ctx.reply("No status found.");
    }

    ctx.reply(
        `Latest User Status\n\n
         👤 User: ${latest[0]?.id}\n📌 Status: ${latest[0]?.status}\n🕒 Created At: ${latest[0]?.createdAt}\n\n 
         👤 User: ${latest[1]?.id}\n📌 Status: ${latest[1]?.status}\n🕒 Created At: ${latest[1]?.createdAt}\n\n
         👤 User: ${latest[2]?.id}\n📌 Status: ${latest[2]?.status}\n🕒 Created At: ${latest[2]?.createdAt}`,

    );
});

// Handle /mystatus
bot.command('mystatus', (ctx) => {
    const chatId = ctx.update.message.from.id

    const latest = fetchUserLatestStatus(chatId);

    if (!latest) {
        return ctx.reply("You have no status yet");
    }

    ctx.reply(
        `Latest User Status\n\n
         👤 User: ${latest[0]?.id}\n📌 Status: ${latest[0]?.status}\n🕒 Created At: ${latest[0]?.createdAt}\n\n 
         👤 User: ${latest[1]?.id}\n📌 Status: ${latest[1]?.status}\n🕒 Created At: ${latest[1]?.createdAt}\n\n
         👤 User: ${latest[2]?.id}\n📌 Status: ${latest[2]?.status}\n🕒 Created At: ${latest[2]?.createdAt}`,

    );
});


bot.launch();

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});


