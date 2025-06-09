"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transcribeAudio = (transcriptionService, filePath) => {
    return transcriptionService.transcribe(filePath);
};
exports.default = transcribeAudio;
