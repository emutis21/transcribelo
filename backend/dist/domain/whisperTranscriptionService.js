"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
class WhisperTranscriptionService {
    constructor(options) {
        this.openai = options.openai;
    }
    async transcribe(filePath) {
        const transcription = await this.openai.audio.transcriptions.create({
            file: node_fs_1.default.createReadStream(filePath),
            model: 'whisper-1',
            response_format: 'json',
        });
        return 'hola';
    }
}
exports.default = WhisperTranscriptionService;
