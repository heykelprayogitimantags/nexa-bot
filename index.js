const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const client = new Client({
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Silakan scan QR Code untuk login.');
});

client.on('ready', () => {
    console.log('Nexa Assistant aktif dan siap digunakan.');
});

const SYSTEM_PROMPT = `
Anda adalah Nexa Assistant, asisten virtual profesional yang mewakili Prof Heykel.
Gunakan bahasa Indonesia yang sopan, jelas, dan profesional.
Balasan harus ringkas dan tidak bertele-tele.
Hindari bahasa gaul dan emoji berlebihan.
Jika perlu tindak lanjut, sampaikan dengan jelas.
`;

client.on('message', async (msg) => {
    if (msg.isStatus || msg.from.includes('@g.us')) return;

    try {

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: `Pesan masuk: "${msg.body}"\n\nTuliskan balasan profesional yang sesuai.`
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7
        });

        const aiResponse =
            chatCompletion.choices[0]?.message?.content ||
            "Terima kasih atas pesannya. Akan segera ditindaklanjuti.";

        const introduction =
`Perkenalkan, saya Nexa Assistant, asisten yang membantu membalas pesan Anda. Saat ini beliau belum dapat merespons secara langsung.\n\n`;

        const finalResponse = introduction + aiResponse;

        const delay = Math.floor(Math.random() * 1000) + 2000;

        setTimeout(async () => {
            const chat = await msg.getChat();
            await chat.sendStateTyping();
            await msg.reply(finalResponse);
            console.log("Balasan terkirim.");
        }, delay);

    } catch (error) {
        console.error("Terjadi kesalahan:", error);
    }
});

client.initialize();