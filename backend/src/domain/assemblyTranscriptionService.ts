import { AssemblyAI } from "assemblyai";
import * as fs from "fs";
import * as https from "https";

interface IAssemblyTranscriptionService {
  transcribe(filePath: string): Promise<{ id: string; text: string }>;

  submitTranscription(filePath: string): Promise<{ id: string }>;
  getTranscriptionResult(id: string): Promise<{ id: string; text: string; status: string }>;
}

class AssemblyTranscriptionService implements IAssemblyTranscriptionService {
  private client: AssemblyAI;
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("API key is required for AssemblyAI service");
    }
    this.client = new AssemblyAI({ apiKey });
    this.apiKey = apiKey;
  }

  async transcribe(filePath: string): Promise<{ id: string; text: string }> {
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

      if (!transcript.text) {
        throw new Error("Transcription completed but no text was returned");
      }

      return {
        id: transcript.id,
        text: transcript.text,
      };
    } catch (error) {
      console.error("Transcription error:", error);
      if (error instanceof Error) {
        throw new Error(`Transcription failed: ${error.message}`);
      }
      throw new Error("An unknown error occurred during transcription");
    }
  }

  async submitTranscription(filePath: string): Promise<{ id: string }> {
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

      return { id: job.id };
    } catch (error) {
      console.error("Submit transcription error:", error);
      if (error instanceof Error) {
        throw new Error(`Submit failed: ${error.message}`);
      }
      throw new Error("An unknown error occurred during submit");
    }
  }

  async getTranscriptionResult(id: string): Promise<{ id: string; text: string; status: string }> {
    try {
      console.log(`Checking AssemblyAI job status for ID: ${id}`);

      const transcript = await this.client.transcripts.get(id);

      console.log(`AssemblyAI response:`, {
        id: transcript.id,
        status: transcript.status,
        text: transcript.text ? `${transcript.text.substring(0, 100)}...` : null,
      });

      let status: string;

      if (transcript.status === "queued" || transcript.status === "processing") {
        status = "processing";
      } else if (transcript.status === "completed") {
        status = "completed";
      } else {
        status = "error";
      }

      return {
        id: transcript.id,
        text: transcript.text || "",
        status: status,
      };
    } catch (error) {
      console.error("Get transcription error:", error);
      return {
        id: id,
        text: "",
        status: "error",
      };
    }
  }

  private uploadFile(filePath: string): Promise<string> {
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
            } catch (e) {
              if (e instanceof SyntaxError) {
                reject(new Error(`Invalid response from AssemblyAI: ${rawData}`));
              } else {
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
      } catch (error) {
        reject(new Error(`Failed to initialize upload: ${error instanceof Error ? error.message : "Unknown error"}`));
      }
    });
  }
}

export default AssemblyTranscriptionService;
export type { IAssemblyTranscriptionService };
