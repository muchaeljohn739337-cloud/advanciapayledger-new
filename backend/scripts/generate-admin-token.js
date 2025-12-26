"use strict";
/**
 * ADMIN TOKEN GENERATOR
 * Generates god-mode admin tokens
 * NO EXPIRATION - Admin never locked out
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
function generateAdminToken(options) {
    const { email = 'admin@advancia.com', role = 'SUPER_ADMIN', name = 'God Mode Administrator', permanent = false, } = options;
    const payload = {
        id: 'admin-god-mode-' + Date.now(),
        email,
        role,
        name,
        type: 'god-mode',
        iat: Math.floor(Date.now() / 1000),
    };
    // Permanent tokens never expire (admin never locked out)
    if (!permanent) {
        payload.exp = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60); // 1 year
    }
    const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET);
    return token;
}
function decodeToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}
// Main execution
console.log('');
console.log('============================================');
console.log('👑 ADMIN TOKEN GENERATOR');
console.log('============================================');
console.log('');
// Generate permanent god-mode token
const permanentToken = generateAdminToken({
    email: 'admin@advancia.com',
    role: 'SUPER_ADMIN',
    name: 'System Administrator',
    permanent: true,
});
console.log('🔑 PERMANENT GOD-MODE TOKEN (Never Expires):');
console.log('');
console.log(permanentToken);
console.log('');
console.log('============================================');
console.log('');
// Generate 1-year token
const yearToken = generateAdminToken({
    email: 'admin@advancia.com',
    role: 'SUPER_ADMIN',
    name: 'System Administrator',
    permanent: false,
});
console.log('🔑 1-YEAR GOD-MODE TOKEN:');
console.log('');
console.log(yearToken);
console.log('');
console.log('============================================');
console.log('');
// Decode and verify
console.log('📋 TOKEN DETAILS:');
console.log('');
const decoded = decodeToken(permanentToken);
if (decoded) {
    console.log('Email:', decoded.email);
    console.log('Role:', decoded.role);
    console.log('Name:', decoded.name);
    console.log('Type:', decoded.type);
    console.log('Issued:', new Date(decoded.iat * 1000).toISOString());
    console.log('Expires:', decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'NEVER (Permanent)');
}
console.log('');
console.log('============================================');
console.log('');
console.log('💾 SAVE THIS TOKEN TO:');
console.log('1. backend/.env as ADMIN_GOD_TOKEN=<token>');
console.log('2. Your secure password manager');
console.log('3. Environment variable on server');
console.log('');
console.log('🔐 USE WITH:');
console.log('Authorization: Bearer <token>');
console.log('or');
console.log('X-Admin-Secret: <token>');
console.log('');
console.log('============================================');
//# sourceMappingURL=generate-admin-token.js.map