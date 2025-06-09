import { Request, Response } from 'express'

const userData: Array<Record<string, string>> = []

const getTranscriptionController = (req: Request, res: Response) => {
  if (userData.length === 0) {
    return res.status(404).send({ message: 'No hay transcripciones disponibles' })
  }

  res.status(200).send({ data: userData })
}

export default getTranscriptionController
