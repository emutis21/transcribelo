"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const serverless_express_1 = __importDefault(require("@vendia/serverless-express"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./infrastructure/routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "https://tu-app.vercel.app",
    credentials: true,
}));
app.use(express_1.default.json());
app.use("/api", routes_1.default);
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
exports.handler = (0, serverless_express_1.default)({ app });
