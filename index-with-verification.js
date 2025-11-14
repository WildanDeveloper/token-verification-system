const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const CFonts = require('cfonts');
const figlet = require("figlet");
const readline = require('readline');

// ═══════════════════════════════════════════════════
// 🔐 SISTEM VERIFIKASI TOKEN
// ═══════════════════════════════════════════════════

const GITHUB_TOKEN_URL = 'https://raw.githubusercontent.com/WildanDeveloper/token-verification-system/main/tokens.json';

class TokenVerifier {
    constructor(githubRawUrl) {
        this.githubUrl = githubRawUrl;
    }

    async checkToken(userToken) {
        try {
            const response = await axios.get(this.githubUrl, {
                timeout: 10000,
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            const data = response.data;
            const validTokens = data.valid_tokens || [];

            if (validTokens.includes(userToken)) {
                console.log('\x1b[32m✅ Token valid! Bot dapat dijalankan.\x1b[0m');
                return true;
            } else {
                console.log('\x1b[31m❌ Token tidak valid! Hubungi admin untuk mendapatkan akses.\x1b[0m');
                return false;
            }

        } catch (error) {
            console.error('\x1b[31m❌ Error mengecek token:\x1b[0m', error.message);
            return false;
        }
    }

    async promptToken() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            rl.question('\x1b[36m🔑 Masukkan token Anda: \x1b[0m', (token) => {
                rl.close();
                resolve(token.trim());
            });
        });
    }
}

async function verifyAccess() {
    console.log('\x1b[33m' + '='.repeat(60) + '\x1b[0m');
    console.log('\x1b[36m           🔐 SISTEM VERIFIKASI TOKEN\x1b[0m');
    console.log('\x1b[33m' + '='.repeat(60) + '\x1b[0m\n');

    const verifier = new TokenVerifier(GITHUB_TOKEN_URL);
    const userToken = await verifier.promptToken();

    if (await verifier.checkToken(userToken)) {
        console.log('\n\x1b[32m✅ Verifikasi berhasil! Memulai bot...\x1b[0m\n');
        return true;
    } else {
        console.log('\n\x1b[31m⛔ Akses ditolak! Token tidak valid.\x1b[0m');
        console.log('\x1b[33m💬 Hubungi @ForceStress untuk mendapatkan akses.\x1b[0m\n');
        process.exit(1);
    }
}

// ═══════════════════════════════════════════════════
// 🤖 MAIN BOT SCRIPT
// ═══════════════════════════════════════════════════

async function startBot() {
    const token = '8064000665:AAHS4cFT7iypeV9_zXVbRRpg3xlg71nFkZE';
    const bot = new TelegramBot(token, {polling: true});
    
    // Sisanya adalah kode bot Anda yang sama seperti file index.js
    console.log('✅ Bot berhasil dijalankan!');
    console.log('🔐 Token telah diverifikasi.');
    
    // ... sisanya kode bot Anda ...
}

// Jalankan verifikasi lalu start bot
verifyAccess().then(() => {
    startBot();
}).catch(error => {
    console.error('Error:', error);
    process.exit(1);
});
