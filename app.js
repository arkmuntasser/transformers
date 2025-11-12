import http from 'http';
import querystring from 'querystring';
import url from 'url';
import fs from 'fs';

import { summarizationRequestHandler } from './summarization.js';
import { classificationRequestHandler } from './classification.js';
import { textGenerationRequestHandler } from './text-generation.js';
import { questionAnsweringRequestHandler } from './question-answering.js';

const server = http.createServer();
const hostname = '127.0.0.1';
const port = 3000;

const summaryHTMLFile = await fs.promises.readFile('./website/summary.html', 'utf-8');
const textGenerationHTMLFile = await fs.promises.readFile('./website/generate.html', 'utf-8');
const questionAnsweringHTMLFile = await fs.promises.readFile('./website/answer.html', 'utf-8');

server.on('request', async (req, res) => {
    const parsedUrl = url.parse(req.url);
    let { text, context, question } = querystring.parse(parsedUrl.query);

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        await new Promise((resolve, reject) => {
            try {
                req.on('end', () => {
                    const parsedBody = JSON.parse(body);
                    text = parsedBody.text;
                    context = parsedBody.context;
                    question = parsedBody.question;
                    resolve();
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    switch (parsedUrl.pathname) {
        case '/summary':
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(summaryHTMLFile);
            break;
        case '/generate':
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(textGenerationHTMLFile);
            break;
        case '/answer':
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(questionAnsweringHTMLFile);
            break;
        case '/summarize':
            await summarizationRequestHandler({ text, res });
            break;
        case '/classify':
            await classificationRequestHandler({ text, res });
            break;
        case '/generate-text':
            await textGenerationRequestHandler({ text, res });
            break;
        case '/answer-question':
            await questionAnsweringRequestHandler({ question, context, res });
            break;
        default:
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});