import { max, pipeline } from "@huggingface/transformers";

export default class SummarizationPipeline {
    static task = 'summarization';
    static model = 'Xenova/bart-large-cnn';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

export async function summarize(text, args = {}) {
    const summarizer = await SummarizationPipeline.getInstance();
    return await summarizer(text, args);
}

export async function summarizationRequestHandler({ text, res, ...args}) {
    let response;
    if (text) {
        response = await summarize(text, {
            max_new_tokens: 500,
            min_length: 80,
            // max_length: 200,
            num_beams: 4,
            no_repeat_ngram_size: 3,
            // use_cache: false,
            // do_sample: true,
        });
        res.statusCode = 200;
    } else {
        response = { error: 'Bad Request' };
        res.statusCode = 400;
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
}