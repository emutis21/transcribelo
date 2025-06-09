"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadFileController_1 = __importDefault(require("../application/controllers/uploadFileController"));
const getTranscriptionController_1 = __importDefault(require("../application/controllers/getTranscriptionController"));
const router = (0, express_1.Router)();
router.post('/files', uploadFileController_1.default);
router.get('/transcription', getTranscriptionController_1.default);
// router.post('/assembly', {})
// router.get('/assembly', {})
exports.default = router;
