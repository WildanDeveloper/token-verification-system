/**
 * Contoh cara menggunakan token verifier di script Anda
 */

const { TokenVerifier } = require('./token-verifier');

async function main() {
    // URL ke file tokens.json di GitHub
    const GITHUB_TOKEN_URL = 'https://raw.githubusercontent.com/WildanDeveloper/token-verification-system/main/tokens.json';
    
    const verifier = new TokenVerifier(GITHUB_TOKEN_URL);
    
    console.log('🔐 Verifikasi Token');
    const userToken = await verifier.promptToken();
    
    if (await verifier.checkToken(userToken)) {
        console.log('✅ Akses diberikan!\n');
        
        // ==========================================\n        // SCRIPT UTAMA ANDA DI SINI\n        // ==========================================\n        console.log('🚀 Menjalankan script utama...');
        
        // Contoh: Bot Telegram, Web Scraper, API, dll
        await yourMainScript();
        
    } else {
        console.log('❌ Akses ditolak!');
        process.exit(1);
    }
}

async function yourMainScript() {
    // Letakkan kode script Anda di sini
    console.log('Script berjalan dengan baik!');
    console.log('Token telah diverifikasi.');
    
    // Contoh:
    // const bot = new TelegramBot(TOKEN);
    // bot.start();
}

// Jalankan
main().catch(console.error);
