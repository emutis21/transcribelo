import { Router } from 'express'
import uploadFileController from '../application/controllers/uploadFileController'
import getTranscriptionController from '../application/controllers/getTranscriptionController'

const router = Router()

router.post('/files', uploadFileController)
router.get('/transcription', getTranscriptionController)

// router.post('/assembly', {})
// router.get('/assembly', {})

export default router
