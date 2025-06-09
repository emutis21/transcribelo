"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userData = { words: [] };
const getAssemblyTranscriptionController = async (req, res) => {
    try {
        if (userData.words.length === 0) {
            const response = {
                transcription: { words: [] },
            };
            return res.status(204).send(response);
        }
        const response = {
            transcription: userData,
        };
        res.status(200).send(response);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Hubo un error al obtener las transcripciones' });
    }
};
exports.default = getAssemblyTranscriptionController;
