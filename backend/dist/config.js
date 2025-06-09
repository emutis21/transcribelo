"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.default = {
    projectId: process.env.PROJECT_ID,
    privateKey: process.env.PRIVATE_KEY,
    clientEmail: process.env.CLIENT_EMAIL,
    assemblyAIKey: process.env.ASSEMBLY_AI_KEY,
    openAIKey: process.env.OPENAI_KEY,
};
