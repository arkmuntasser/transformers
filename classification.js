import { pipeline } from "@huggingface/transformers";

export default class ClassificationPipeline {
    static task = 'text-classification';
    static model = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

export async function classify(text) {
    const classifier = await ClassificationPipeline.getInstance();
    return await classifier(text);
}

export async function classificationRequestHandler({ text, res, ...args}) {
    let response;
    if (text) {
        response = await classify(text);
        res.statusCode = 200;
    } else {
        response = { error: 'Bad Request' };
        res.statusCode = 400;
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
}