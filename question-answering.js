import { pipeline } from '@huggingface/transformers';

export default class QuestionAnsweringPipeline {
    static task = 'question-answering';
    static model = 'Xenova/distilbert-base-cased-distilled-squad';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

export async function answerQuestion(question, context, args = {}) {
    const qaPipeline = await QuestionAnsweringPipeline.getInstance();
    return await qaPipeline(question, context, args);
}

export async function questionAnsweringRequestHandler({ question, context, res, ...args}) {
    let response;
    if (question && context) {
        response = await answerQuestion(question, context);
        res.statusCode = 200;
    } else {
        response = { error: 'Bad Request' };
        res.statusCode = 400;
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
}