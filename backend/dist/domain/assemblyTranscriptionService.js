"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assemblyai_1 = require("assemblyai");
const fs = __importStar(require("fs"));
const https = __importStar(require("https"));
class AssemblyTranscriptionService {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error("API key is required for AssemblyAI service");
        }
        this.client = new assemblyai_1.AssemblyAI({ apiKey });
        this.apiKey = apiKey;
    }
    async transcribe(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }
            const uploadUrl = await this.uploadFile(filePath);
            if (!uploadUrl) {
                throw new Error("Failed to get upload URL from AssemblyAI");
            }
            console.log("Upload URL:", uploadUrl);
            const job = await this.client.transcripts.submit({
                audio_url: uploadUrl,
                language_code: "es",
            });
            console.log("Job submitted:", job);
            const transcript = await this.client.transcripts.waitUntilReady(job.id, {
                pollingInterval: 6000,
                pollingTimeout: 480000,
            });
            console.log("Full transcript response:", JSON.stringify(transcript, null, 2));
            console.log("Transcript ID:", transcript.id);
            if (!transcript.text) {
                throw new Error("Transcription completed but no text was returned");
            }
            return {
                id: transcript.id,
                text: transcript.text,
            };
        }
        catch (error) {
            console.error("Transcription error:", error);
            if (error instanceof Error) {
                throw new Error(`Transcription failed: ${error.message}`);
            }
            throw new Error("An unknown error occurred during transcription");
        }
    }
    uploadFile(filePath) {
        return new Promise((resolve, reject) => {
            try {
                const file = fs.createReadStream(filePath);
                const options = {
                    hostname: "api.assemblyai.com",
                    path: "/v2/upload",
                    method: "POST",
                    headers: {
                        authorization: this.apiKey,
                        "content-type": "application/octet-stream",
                    },
                };
                const req = https.request(options, (res) => {
                    let rawData = "";
                    res.setEncoding("utf8");
                    res.on("data", (chunk) => {
                        rawData += chunk;
                    });
                    res.on("end", () => {
                        try {
                            if (res.statusCode !== 200) {
                                const error = JSON.parse(rawData);
                                reject(new Error(`AssemblyAI API error: ${error.error || "Unknown error"}`));
                                return;
                            }
                            const parsedData = JSON.parse(rawData);
                            if (!parsedData.upload_url) {
                                reject(new Error("No upload URL received from AssemblyAI"));
                                return;
                            }
                            resolve(parsedData.upload_url);
                        }
                        catch (e) {
                            if (e instanceof SyntaxError) {
                                reject(new Error(`Invalid response from AssemblyAI: ${rawData}`));
                            }
                            else {
                                reject(e);
                            }
                        }
                    });
                });
                req.on("error", (error) => {
                    reject(new Error(`Network error during upload: ${error.message}`));
                });
                file.on("error", (error) => {
                    reject(new Error(`File read error: ${error.message}`));
                });
                file.pipe(req);
            }
            catch (error) {
                reject(new Error(`Failed to initialize upload: ${error instanceof Error ? error.message : "Unknown error"}`));
            }
        });
    }
}
exports.default = AssemblyTranscriptionService;
