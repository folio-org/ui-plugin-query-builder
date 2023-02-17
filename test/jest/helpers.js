export const delayedResponse = (delay, value) => new Promise(resolve => setTimeout(resolve, delay, value));
