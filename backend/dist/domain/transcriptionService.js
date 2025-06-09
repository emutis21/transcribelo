"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const speech_1 = require("@google-cloud/speech");
const node_fs_1 = __importDefault(require("node:fs"));
class GoogleTranscriptionService {
    constructor(client) {
        this.client = client;
    }
    async transcribe(filePath) {
        const file = node_fs_1.default.readFileSync(filePath);
        const audioBytes = file.toString('base64');
        const audio = { content: audioBytes };
        const config = {
            encoding: speech_1.protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3,
            sampleRateHertz: 16000,
            languageCode: 'es-CO',
            enableSpeakerDiarization: true,
            diarizationSpeakerCount: 2,
            enableAutomaticPunctuation: true,
            enableWordTimeOffsets: true,
        };
        const request = { audio, config };
        const [response] = await this.client.recognize(request);
        console.log(`Transcription: ${JSON.stringify(response)}`);
        return response;
    }
}
exports.default = GoogleTranscriptionService;
