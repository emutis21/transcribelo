"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assemblyTranscriptionService_1 = __importDefault(require("../domain/assemblyTranscriptionService"));
const transcriptionService_1 = __importDefault(require("../domain/transcriptionService"));
const speech_1 = require("@google-cloud/speech");
const config_1 = __importDefault(require("../config"));
let transcriptionService;
const speechClient = new speech_1.SpeechClient({
    projectId: config_1.default.projectId,
    credentials: {
        private_key: config_1.default.privateKey,
        client_email: config_1.default.clientEmail,
    },
});
// const openaiOptions: ClientOptions = {
//   apiKey: config.openAIKey!,
// }
// const openai = new OpenAI(openaiOptions)
const googleTranscriptionService = new transcriptionService_1.default(speechClient);
const assemblyTranscriptionService = new assemblyTranscriptionService_1.default(config_1.default.assemblyAIKey);
// const openaiTranscriptionService = new WhisperTranscriptionService({ openai })
const setTranscriptionService = (service) => {
    if (service === 'google') {
        transcriptionService = googleTranscriptionService;
        return;
    }
    if (service === 'assembly') {
        transcriptionService = assemblyTranscriptionService;
        return;
    }
    // if (service === 'openai') {
    //   transcriptionService = openaiTranscriptionService
    //   return
    // }
    console.log(service);
    throw new Error(`Unknown transcription service: ${service}`);
};
setTranscriptionService('assembly');
exports.default = {
    get transcriptionService() {
        return transcriptionService;
    },
    setTranscriptionService,
};
