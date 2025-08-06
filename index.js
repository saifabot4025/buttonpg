// ✅ CommonJS พร้อมใช้บน Node.js และ Render

const express = require("express");
const line = require("@line/bot-sdk");
require("dotenv").config();

// === LINE CONFIG ===
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new line.Client({ channelAccessToken: config.channelAccessToken });
const app = express();
app.use(line.middleware(config));

// === รายการล่าสุดที่อัปเดตได้ด้วยคำสั่งลับ ===
let latestTips = {
  "ทีเด็ดบอล": "⚽️ ทีเด็ดบอลยังไม่อัปเดต",
  "หวย": "🔢 หวยยังไม่อัปเดต",
  "มวย": "🥊 มวยยังไม่อัปเดต",
  "ไลฟ์": "📺 ไลฟ์สดยังไม่อัปเดต"
};

// === รายชื่อ + สุ่มเบอร์ + สุ่มถอน ===
const names = [/* (ชื่อ 100 ชื่อที่คุณให้มา) */];
const prefixes = ["06", "08", "09"];

function randomMaskedPhone() {
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}xxxx${suffix}`;
}

function generateWithdrawList() {
  const list = [];
  for (let i = 0; i < 10; i++) {
    const name = names[Math.floor(Math.random() * names.length)];
    const phone = randomMaskedPhone();
    const amount = (Math.floor(Math.random() * (49999 - 3000 + 1)) + 3000).toLocaleString();
    list.push(`คุณพี่ ${name} ยูส ${phone} ถอน ${amount}`);
  }
  const today = new Date().toLocaleDateString("th-TH");
  return `📋 รายการถอนล่าสุด\nวันที่ ${today}\n\n${list.join("\n")}`;
}

async function generateTopGameMessage() {
  const games = [/* รายชื่อเกม (เหมือนของคุณ) */];
  const selected = games.sort(() => 0.5 - Math.random()).slice(0, 5);
  const freeSpin = Math.floor(Math.random() * (500000 - 50000)) + 50000;
  const normal = Math.floor(Math.random() * (50000 - 5000)) + 5000;
  let msg = "🎲 เกมสล็อตแตกบ่อยวันนี้\n\n";
  selected.forEach((g, i) => msg += `${i + 1}. ${g} - ${Math.floor(Math.random() * 20) + 80}%\n`);
  msg += `\n💥 ฟรีสปินแตกล่าสุด: ${freeSpin.toLocaleString()} บาท\n💥 ปั่นธรรมดาแตกล่าสุด: ${normal.toLocaleString()} บาท\nเล่นเลย แตกง่าย จ่ายจริง 💕`;
  return msg;
}

async function generateReferralCommissionMessage() {
  const lines = [];
  for (let i = 0; i < 10; i++) {
    const phone = randomMaskedPhone();
    const amt = (Math.floor(Math.random() * 97000) + 3000).toLocaleString();
    lines.push(`ยูส ${phone} ได้ค่าคอมมิชชั่น ${amt}`);
  }
  return `🤝 ค่าคอมมิชชั่นแนะนำเพื่อน\n\n${lines.join("\n")}\n\n💡 ชวนเพื่อนมาเล่น รับค่าคอมทุกวัน!`;
}

// === HANDLE LINE MESSAGES ===
app.post("/webhook", express.json(), (req, res) => {
  Promise.all(req.body.events.map(async (event) => {
    if (event.type !== "message" || event.message.type !== "text") return;
    const msg = event.message.text.trim();
    const replyToken = event.replyToken;

    if (msg.startsWith("/อัปเดตทีเด็ด")) latestTips["ทีเด็ดบอล"] = msg.replace("/อัปเดตทีเด็ด", "").trim();
    else if (msg.startsWith("/อัปเดตหวย")) latestTips["หวย"] = msg.replace("/อัปเดตหวย", "").trim();
    else if (msg.startsWith("/อัปเดตมวย")) latestTips["มวย"] = msg.replace("/อัปเดตมวย", "").trim();
    else if (msg.startsWith("/อัปเดตไลฟ์")) latestTips["ไลฟ์"] = msg.replace("/อัปเดตไลฟ์", "").trim();

    else if (msg === "เมนู") {
      return client.replyMessage(replyToken, [{
        type: "text",
        text: "📲 เลือกเมนูที่ต้องการได้เลย",
        quickReply: {
          items: [
            { type: "action", action: { type: "uri", label: "ทางเข้าเล่นหลัก", uri: "https://pgthai289.net/?openExternalBrowser=1" } },
            { type: "action", action: { type: "uri", label: "สมัครสมาชิก", uri: "https://pgthai289.net/customer/register/BTAI/?openExternalBrowser=1" } },
            { type: "action", action: { type: "message", label: "รีวิวถอนล่าสุด", text: "รีวิวถอนล่าสุด" } },
            { type: "action", action: { type: "message", label: "สล็อตแตกดี", text: "สล็อตแตกดี" } },
            { type: "action", action: { type: "message", label: "รีวิวค่าคอม", text: "ค่าคอมมิชชั่น" } },
            { type: "action", action: { type: "message", label: "ทีเด็ดบอล", text: "ทีเด็ดบอล" } },
            { type: "action", action: { type: "message", label: "ทีเด็ดหวย", text: "หวย" } },
            { type: "action", action: { type: "message", label: "ทีเด็ดมวย", text: "มวย" } },
            { type: "action", action: { type: "message", label: "ไลฟ์สดนำเล่น", text: "ไลฟ์สด" } }
          ]
        }
      }]);
    }

    else if (msg === "รีวิวถอนล่าสุด") {
      return client.replyMessage(replyToken, [{ type: "text", text: generateWithdrawList() }]);
    }

    else if (msg === "สล็อตแตกดี") {
      return client.replyMessage(replyToken, [{ type: "text", text: await generateTopGameMessage() }]);
    }

    else if (msg === "ค่าคอมมิชชั่น") {
      return client.replyMessage(replyToken, [{ type: "text", text: await generateReferralCommissionMessage() }]);
    }

    else if (latestTips[msg]) {
      return client.replyMessage(replyToken, [{ type: "text", text: latestTips[msg] }]);
    }
  }))
    .then(() => res.status(200).end())
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
});

// === START SERVER ===
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("✅ LINE BOT is running on port", port));
