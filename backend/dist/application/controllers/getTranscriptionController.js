"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userData = [];
const getTranscriptionController = (req, res) => {
    if (userData.length === 0) {
        return res.status(404).send({ message: 'No hay transcripciones disponibles' });
    }
    res.status(200).send({ data: userData });
};
exports.default = getTranscriptionController;
