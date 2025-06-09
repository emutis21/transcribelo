"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const diContainer_1 = __importDefault(require("../../infrastructure/diContainer"));
const uploadDir = node_path_1.default.join(__dirname, '../../../uploads');
if (!node_fs_1.default.existsSync(uploadDir)) {
    node_fs_1.default.mkdirSync(uploadDir);
}
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = `${node_crypto_1.default.randomUUID()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});
const upload = (0, multer_1.default)({ storage }).single('file');
const uploadFileController = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).send({ message: 'Error al cargar el archivo' });
        }
        const { file } = req;
        if (!file) {
            return res.status(400).send({ message: 'No se ha cargado ningún archivo' });
        }
        try {
            const transcriptionResult = await diContainer_1.default.transcriptionService.transcribe(file.path);
            console.log("Transcription result:", transcriptionResult);
            if ("id" in transcriptionResult && "text" in transcriptionResult) {
                res.status(200).send({
                    message: "El archivo se cargó correctamente",
                    transcription: transcriptionResult.text,
                    transcriptId: transcriptionResult.id,
                });
            }
            else {
                const googleResult = transcriptionResult;
                res.status(200).send({
                    message: "El archivo se cargó correctamente",
                    transcription: googleResult.transcript || googleResult.text || "No transcription available",
                    transcriptId: null,
                });
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error al procesar el archivo" });
        }
        finally {
            node_fs_1.default.unlinkSync(file.path);
        }
    });
};
exports.default = uploadFileController;
