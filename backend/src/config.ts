import dotenv from 'dotenv'

dotenv.config()

export default {
  projectId: process.env.PROJECT_ID,
  privateKey: process.env.PRIVATE_KEY,
  clientEmail: process.env.CLIENT_EMAIL,
  assemblyAIKey: process.env.ASSEMBLY_AI_KEY,
  openAIKey: process.env.OPENAI_KEY,
}
