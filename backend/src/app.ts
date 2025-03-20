import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import cors from 'cors';

const app: Express = express();
dotenv.config();
app.use(cors());
app.use(express.json());

// OpenAI Configuration
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const prompt1: string = process.env.COVERLETTER_GENERATION_PROMPT || '';
const prompt2: string = process.env.REVISION_PROMPT || '';


app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

// Endpoint to generate a cover letter
app.post(
    '/generateCoverLetter',
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const pageContent: string = req.body.content;
            const resume: string = req.body.resume;

            console.log('pageContent:', pageContent, 'resume:', resume);

            // Check if there is any content to generate a cover letter
            if (!pageContent) {
                res.status(400).json({ message: 'The extension could not read anything on the current tab!!' });
                return;
            }
            if (!resume) {
                res.status(400).json({ message: 'No resume content is found' });
                return;
            }

            if (!prompt || !process.env.MODEL_NAME) {
                res.status(400).json({ message: 'Configuration error: Missing prompt or model name' });
                return;
            }

            const response = await client.chat.completions.create({
                model: process.env.MODEL_NAME,
                messages: [
                    {
                        role: 'system',
                        content: prompt1
                    },
                    {
                        role: 'user',
                        content: `Job Posting:\n${pageContent}\n\nResume:\n${resume}`
                    }
                ]
            });

            res.status(200).json({ content: response.choices[0].message.content });
        } catch (error) {
            next(error);
        }
    }
);

// Endpoint to revise a cover letter
app.post(
    '/reviseCoverLetter',
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const existingCoverLetter: string = req.body.existingCoverLetter;
            const revisionInstructions: string = req.body.revisionInstructions;
            const resume: string = req.body.resume;
            const jobDescription: string = req.body.jobDescription;

            if (!existingCoverLetter) {
                res.status(400).json({ message: 'No existing cover letter provided' });
                return;
            }

            if (!revisionInstructions) {
                res.status(400).json({ message: 'No revision instructions provided' });
                return;
            }

            if (!prompt2 || !process.env.MODEL_NAME) {
                res.status(400).json({ message: 'Configuration error: Missing prompt or model name' });
                return;
            }

            const response = await client.chat.completions.create({
                model: process.env.MODEL_NAME,
                messages: [
                    {
                        role: 'system',
                        content: prompt2
                    },
                    {
                        role: 'user',
                        content: `Job Posting:\n${jobDescription}\n\nResume:\n${resume}\n\nExisting Cover Letter:\n${existingCoverLetter}\n\nRevision Instructions:\n${revisionInstructions}`
                    }
                ]
            });

            res.status(200).json({ content: response.choices[0].message.content });
        } catch (error) {
            next(error);
        }
    }
);

export default app;