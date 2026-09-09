"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const productRoutes_js_1 = __importDefault(require("./routes/productRoutes.js"));
const campaignRoutes_js_1 = __importDefault(require("./routes/campaignRoutes.js"));
const simulationRoutes_js_1 = __importDefault(require("./routes/simulationRoutes.js"));
const marketplaceRoutes_js_1 = __importDefault(require("./routes/marketplaceRoutes.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API Routes
app.use('/api/products', productRoutes_js_1.default);
app.use('/api/campaigns', campaignRoutes_js_1.default);
app.use('/api/simulate', simulationRoutes_js_1.default);
app.use('/api/marketplaces', marketplaceRoutes_js_1.default);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'MarketLens API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
app.listen(PORT, () => {
    console.log(`🚀 MarketLens API server is running on http://localhost:${PORT}`);
});
