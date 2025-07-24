import { bootstrapWorker } from '@vendure/core';
import { config } from './vendure-config';

// Start the Vendure worker process
bootstrapWorker(config)
    .then(worker => worker.startJobQueue())
    .catch(err => {
        console.error('Failed to start Vendure worker:', err);
    });
