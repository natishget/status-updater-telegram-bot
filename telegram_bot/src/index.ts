import { Telegraf, Markup } from "telegraf";
import { message, callbackQuery, channelPost } from "telegraf/filters";
import { createNewStatus, fetchLatestStatus, fetchUserLatestStatus } from "../src/statusService.js";
import http from 'http';

interface UserRecord {
    name: string;
    id: number;
    status: string;
    createdAt: Date;
}

const bot = new Telegraf("7663200590:AAE5ASn3nggCioJbU8DkyKR2IW2qqfuEF58");
const PORT = 3001;

bot.start((ctx) => {
    const name = ctx.update.message.from.first_name;
    const chatId = ctx.update.message.from.id;
    console.log(name, chatId)
    //const url = `https://status-updater-telegram-bot.vercel.app/?name=${encodeURIComponent(name)}&chatId=${chatId}`
    const url = `https://status-updater-telegram-bot.vercel.app/`

    ctx.reply(
        `Hello ${ctx.update.message.from.first_name}!`,
        Markup.inlineKeyboard(
            [
                // Markup.button.url("🌐 Visit Website", url),
                Markup.button.webApp('🌐 Visit Website', url)
            ]),
    );

    ctx.reply(
        'Choose an option:',
        Markup.keyboard([
            ['/start', '/latest', '/mystatus'] // Buttons send these commands
        ]).resize()
    );
});

const server = http.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/status") {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body); // parse JSON body
                const response = createNewStatus(data); // your function
                // sendResponseOnBot(response);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(response));
                console.log(response)
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


const sendResponseOnBot = (message: UserRecord) => {
    bot.on('text', (ctx) => {
        ctx.reply(`👤 User: ${message?.name}\n📌 Status: ${message?.status}\n🕒 Created At: ${message?.createdAt}`);
    });
};


// Handle /latest
bot.command('latest', (ctx) => {

    const latest = fetchLatestStatus();

    if (!latest) {
        return ctx.reply("No status found.");
    }

    // console.log(latest);

    const message = 'Latest User Status\n\n' +
        latest
            .slice(0, 3)
            .map(user =>
                `👤 User: ${user?.id ?? ''}\n📌 Status: ${user?.status ?? ''}\n🕒 Created At: ${user?.createdAt ?? ''}\n`
            )
            .join('\n');

    ctx.reply(message);
});



// Handle /mystatus
bot.command('mystatus', (ctx) => {
    const chatId = ctx.update.message.from.id

    const latest = fetchUserLatestStatus(chatId);

    if (!latest) {
        return ctx.reply("You have no status yet");
    }

    const message = 'Latest User Status\n\n' +
        latest
            .slice(0, 3)
            .map(user =>
                `👤 User: ${user?.id ?? ''}\n📌 Status: ${user?.status ?? ''}\n🕒 Created At: ${user?.createdAt ?? ''}\n`
            )
            .join('\n');

    ctx.reply(message);


});


bot.launch();

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});


