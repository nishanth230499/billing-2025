import { WebPDFLoader } from '@langchain/community/document_loaders/web/pdf'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import path from 'path'

import { fileToDataUrl } from '@/lib/utils/fileUtils'

export default class DocumentParser {
  constructor() {
    this.userPrompts = []
    this.chatOpenAI = new ChatOpenAI({
      model: 'gpt-4o',
      temperature: 0,
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  async addDocuments(documents) {
    const userPrompts = await Promise.all(
      documents.map(async (document) => {
        if (document instanceof File) {
          const ext = path.extname(document.name).toLowerCase()

          if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
            const dataUrl = await fileToDataUrl(document)
            return [
              'user',
              [
                {
                  type: 'image_url',
                  image_url: { url: dataUrl },
                },
              ],
            ]
          } else if (ext === '.pdf') {
            const loader = new WebPDFLoader(document)

            const docs = await loader.load()
            const pdfContent = docs.map((doc) => doc.pageContent).join('\n')
            return ['user', pdfContent]
          } else {
            return null
          }
        } else if (typeof document === 'string') {
          return ['user', document]
        } else {
          return null
        }
      })
    )
    this.userPrompts.push(...userPrompts)
  }

  async parse(structuredOutputSchema) {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', ''],
      ...this.userPrompts.filter(Boolean),
    ])

    const chain = prompt.pipe(
      this.chatOpenAI.withStructuredOutput(structuredOutputSchema)
    )

    return await chain.invoke()
  }
}
