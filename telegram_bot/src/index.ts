import { Telegraf, Markup, Context } from "telegraf";
import { createNewStatus, fetchLatestStatus, fetchUserLatestStatus } from "./statusService.js";
import http, { IncomingMessage, ServerResponse } from "http";

// interface for a single user record
interface UserRecord {
    name: string;
    id: number;
    status: string;
    createdAt: string; // JSON will give string, not Date
}

// create bot instance
const bot = new Telegraf<Context>("7663200590:AAE5ASn3nggCioJbU8DkyKR2IW2qqfuEF58");
const PORT = 3001;

// /start handler
bot.start((ctx: Context) => {
    const name = ctx.message?.from.first_name || "User";
    const chatId = ctx.message?.from.id;
    console.log(name, chatId);

    const url = `https://status-updater-telegram-bot.vercel.app/`;

    ctx.reply(
        `Hello ${name}!`,
        Markup.inlineKeyboard([
            Markup.button.webApp("🌐 Visit Website", url),
        ])
    );

    ctx.reply(
        "Choose an option:",
        Markup.keyboard([["/start", "/latest", "/mystatus"]]).resize()
    );
});

// http server for status updates
const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.method === "POST" && req.url === "/status") {
        let body = "";
        req.on("data", (chunk: Buffer) => {
            body += chunk.toString();
        });
        req.on("end", () => {
            try {
                const data = JSON.parse(body);
                const response = createNewStatus(data);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(response));
                console.log(response);
            } catch (err) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Invalid JSON" }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

// send message to bot (currently unused in your logic)
const sendResponseOnBot = (message: UserRecord) => {
    bot.on("text", (ctx: Context) => {
        ctx.reply(
            `👤 User: ${message?.name}\n📌 Status: ${message?.status}\n🕒 Created At: ${message?.createdAt}`
        );
    });
};

// /latest command
bot.command("latest", (ctx: Context) => {
    const latest = fetchLatestStatus();

    if (!latest || latest.length === 0) {
        return ctx.reply("No status found.");
    }

    const message =
        "Latest User Status\n\n" +
        latest
            .slice(0, 3)
            .map(
                (user) =>
                    `ID: ${user?.id ?? ""}\n👤 User: ${user?.name ?? ""}\n📌 Status: ${user?.status ?? ""
                    }\n🕒 Created At: ${user?.createdAt ?? ""}\n`
            )
            .join("\n");

    ctx.reply(message);
});

// /mystatus command
bot.command("mystatus", (ctx: Context) => {
    const chatId = ctx.message?.from.id;
    if (!chatId) {
        return ctx.reply("Could not get your chat ID.");
    }

    const latest = fetchUserLatestStatus(chatId);

    if (!latest || latest.length === 0) {
        return ctx.reply("You have no status yet.");
    }

    const message =
        "Your Latest Status\n\n" +
        latest
            .slice(0, 3)
            .map(
                (user) =>
                    `ID: ${user?.id ?? ""}\n👤 User: ${user?.id ?? ""}\n📌 Status: ${user?.status ?? ""
                    }\n🕒 Created At: ${user?.createdAt ?? ""}\n`
            )
            .join("\n");

    ctx.reply(message);
});

// start bot
bot.launch();

// start server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
