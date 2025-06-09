import { Request, Response } from 'express'

type Word = {
  start: number
  end: number
  text: string
  confidence: number
  speaker: null
}

type Transcription = {
  words: Word[]
}

type ResponseData = {
  transcription: Transcription
}

const userData: Transcription = { words: [] }

const getAssemblyTranscriptionController = async (req: Request, res: Response) => {
  try {
    if (userData.words.length === 0) {
      const response: ResponseData = {
        transcription: { words: [] },
      }
      return res.status(204).send(response)
    }

    const response: ResponseData = {
      transcription: userData,
    }
    res.status(200).send(response)
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Hubo un error al obtener las transcripciones' })
  }
}

export default getAssemblyTranscriptionController
