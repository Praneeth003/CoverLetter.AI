import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

const app: Express = express();
dotenv.config();

app.use(express.json());

// OpenAI Configuration
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const prompt: string = process.env.PROMPT || '';
const resumeText: string = ``;

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

// Endpoint to generate a cover letter
app.post(
    '/generateCoverLetter',
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const inputContent: string = req.body.content;
            console.log('inputContent:', inputContent);

            // Check if the content has some job description or not
            if (!inputContent) {
                res.status(400).json({ message: 'The extension could not read anything on the screen!!' });
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
                        content: prompt
                    },
                    {
                        role: 'user',
                        content: `Job Posting:\n${inputContent}\n\nResume:\n${resumeText}`
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