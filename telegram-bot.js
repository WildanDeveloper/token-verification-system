const { Telegraf } = require('telegraf');
const axios = require('axios');
const crypto = require('crypto');

// Konfigurasi
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';  // Token bot Telegram Anda
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'YOUR_GITHUB_PAT';  // Personal Access Token GitHub
const GITHUB_REPO = 'WildanDeveloper/token-verification-system';  // Format: username/repo
const GITHUB_FILE_PATH = 'tokens.json';  // Path file di repo
const ADMIN_USER_IDS = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',').map(id => parseInt(id)) : [123456789];  // ID Telegram admin

class TokenManager {
    constructor() {
        this.apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;
        this.headers = {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Token-Manager-Bot'
        };
    }

    async getCurrentData() {
        try {
            const response = await axios.get(this.apiUrl, { headers: this.headers });
            const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
            return {
                data: JSON.parse(content),
                sha: response.data.sha
            };
        } catch (error) {
            console.error('Error getting current data:', error.message);
            return {
                data: { valid_tokens: [] },
                sha: null
            };
        }
    }

    async updateGithubFile(data, sha) {
        try {
            const content = JSON.stringify(data, null, 2);
            const encoded = Buffer.from(content).toString('base64');

            const payload = {
                message: `Update tokens - ${new Date().toISOString()}`,
                content: encoded,
                sha: sha
            };

            const response = await axios.put(this.apiUrl, payload, { headers: this.headers });
            return response.status === 200;
        } catch (error) {
            console.error('Error updating GitHub file:', error.message);
            return false;
        }
    }

    generateToken() {
        return crypto.randomBytes(24).toString('hex');
    }

    async addToken(customToken = null) {
        const { data, sha } = await this.getCurrentData();
        const token = customToken || this.generateToken();

        if (!data.valid_tokens.includes(token)) {
            data.valid_tokens.push(token);
            data.updated_at = new Date().toISOString();

            if (await this.updateGithubFile(data, sha)) {
                return { success: true, token };
            }
        }
        return { success: false, token: null };
    }

    async removeToken(token) {
        const { data, sha } = await this.getCurrentData();

        const index = data.valid_tokens.indexOf(token);
        if (index > -1) {
            data.valid_tokens.splice(index, 1);
            data.updated_at = new Date().toISOString();

            return await this.updateGithubFile(data, sha);
        }
        return false;
    }

    async listTokens() {
        const { data } = await this.getCurrentData();
        return data.valid_tokens || [];
    }
}

// Inisialisasi bot dan manager
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
const tokenManager = new TokenManager();

// Middleware untuk cek admin
function isAdmin(ctx) {
    return ADMIN_USER_IDS.includes(ctx.from.id);
}

// Command: /start
bot.command('start', (ctx) => {
    ctx.reply(
        '🤖 *Bot Manajemen Token*\n\n' +
        'Commands:\n' +
        '/addtoken - Generate token baru\n' +
        '/removetoken [token] - Hapus token\n' +
        '/listtokens - Lihat semua token\n' +
        '/myid - Lihat ID Telegram Anda',
        { parse_mode: 'Markdown' }
    );
});

// Command: /addtoken
bot.command('addtoken', async (ctx) => {
    if (!isAdmin(ctx)) {
        return ctx.reply('❌ Anda tidak memiliki akses admin!');
    }

    try {
        const result = await tokenManager.addToken();
        
        if (result.success) {
            ctx.reply(
                '✅ *Token baru berhasil dibuat!*\n\n' +
                `Token: \\`${result.token}\
\n` +
                '_Klik untuk copy_',
                { parse_mode: 'Markdown' }
            );
        } else {
            ctx.reply('❌ Gagal membuat token!');
        }
    } catch (error) {
        ctx.reply('❌ Error: ' + error.message);
    }
});

// Command: /removetoken
bot.command('removetoken', async (ctx) => {
    if (!isAdmin(ctx)) {
        return ctx.reply('❌ Anda tidak memiliki akses admin!');
    }

    const token = ctx.message.text.split(' ')[1];
    
    if (!token) {
        return ctx.reply('❌ Gunakan: /removetoken [token]');
    }

    try {
        const success = await tokenManager.removeToken(token);
        
        if (success) {
            ctx.reply('✅ Token berhasil dihapus!');
        } else {
            ctx.reply('❌ Token tidak ditemukan!');
        }
    } catch (error) {
        ctx.reply('❌ Error: ' + error.message);
    }
});

// Command: /listtokens
bot.command('listtokens', async (ctx) => {
    if (!isAdmin(ctx)) {
        return ctx.reply('❌ Anda tidak memiliki akses admin!');
    }

    try {
        const tokens = await tokenManager.listTokens();
        
        if (tokens.length === 0) {
            return ctx.reply('📝 Belum ada token terdaftar.');
        }

        const tokenList = tokens.map((t, i) => `${i + 1}. \\`${t}\
`).join('\n');
        ctx.reply(
            `📝 *Daftar Token (${tokens.length}):*\n\n${tokenList}`,
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        ctx.reply('❌ Error: ' + error.message);
    }
});

// Command: /myid
bot.command('myid', (ctx) => {
    ctx.reply(
        `👤 *Informasi Anda:*\n\n` +
        `ID: \\`${ctx.from.id}\
` +
        `Username: @${ctx.from.username || 'N/A'}\n` +
        `Nama: ${ctx.from.first_name}`,
        { parse_mode: 'Markdown' }
    );
});

// Error handler
bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('❌ Terjadi kesalahan!');
});

// Start bot
bot.launch().then(() => {
    console.log('🤖 Bot started successfully!');
    console.log(`Bot username: @${bot.botInfo.username}`);
}).catch(err => {
    console.error('Failed to start bot:', err);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));  
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = { TokenManager };