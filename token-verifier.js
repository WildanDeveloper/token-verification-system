const axios = require('axios');
const readline = require('readline');

class TokenVerifier {
    constructor(githubRawUrl) {
        /**
         * Initialize token verifier
         * githubRawUrl: URL ke file tokens.json di GitHub (raw content)
         * Contoh: https://raw.githubusercontent.com/WildanDeveloper/token-verification-system/main/tokens.json
         */
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
                console.log('✅ Token valid! Script dapat dijalankan.');
                return true;
            } else {
                console.log('❌ Token tidak valid! Hubungi admin untuk mendapatkan akses.');
                return false;
            }

        } catch (error) {
            console.error('❌ Error mengecek token:', error.message);
            return false;
        }
    }

    async promptToken() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            rl.question('Masukkan token Anda: ', (token) => {
                rl.close();
                resolve(token.trim());
            });
        });
    }
}

async function main() {
    // URL ke file tokens.json di GitHub (gunakan raw.githubusercontent.com)
    const GITHUB_TOKEN_URL = 'https://raw.githubusercontent.com/WildanDeveloper/token-verification-system/main/tokens.json';

    const verifier = new TokenVerifier(GITHUB_TOKEN_URL);

    console.log('='.repeat(50));
    console.log('SISTEM VERIFIKASI TOKEN');
    console.log('='.repeat(50));

    const userToken = await verifier.promptToken();

    if (await verifier.checkToken(userToken)) {
        console.log('\n🚀 Memulai script...\n');
        // PANGGIL SCRIPT UTAMA ANDA DI SINI
        await runMainScript();
    } else {
        console.log('\n⛔ Akses ditolak!');
        process.exit(1);
    }
}

async function runMainScript() {
    /**
     * LETAKKAN SCRIPT UTAMA ANDA DI SINI
     */
    console.log('Script utama berjalan...');
    
    // Contoh script Anda:
    // const yourScript = require('./your-main-script');
    // await yourScript.run();
}

// Jalankan jika file ini dijalankan langsung
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { TokenVerifier };