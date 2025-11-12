import { pipeline } from '@huggingface/transformers';

export default class TextGenerationPipeline {
    static task = 'text2text-generation';
    static model = 'Xenova/flan-t5-small';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

export async function generateText(prompt, args = {}) {
    const textGenerator = await TextGenerationPipeline.getInstance();
    return await textGenerator(prompt, args);
}

export async function textGenerationRequestHandler({ text, res, ...args}) {
    let response;
    if (text) {
        response = await generateText(text, { max_new_tokens: 100 });
        res.statusCode = 200;
    } else {
        response = { error: 'Bad Request' };
        res.statusCode = 400;
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
}