import express, { Express, Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

const app: Application = express();
dotenv.config();

app.use(express.json());

// OpenAI Configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const prompt: string = process.env.PROMPT;
console.log(prompt);



app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

// Endpoint to generate a cover letter
app.post('/generateCoverLetter', (req: Request, res: Response) => {
    const jobDescription: string = req.body.jobDescription;
});


export default app;
