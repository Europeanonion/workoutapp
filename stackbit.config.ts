import { defineStackbitConfig } from '@stackbit/types';

export default defineStackbitConfig({
    stackbitVersion: "~0.6.0",
    nodeVersion: "18",
    ssgName: "custom",
    contentSources: [
        {
            name: 'workout-data',
            handler: '@stackbit/types/content-sources/files',
            options: {
                patterns: ['data/**/*.json']
            }
        }
    ],
    buildCommand: "npm run build",
    deployCommand: "npm run deploy",
    staticDir: "public",
    uploadDir: "uploads",
    postInstallCommand: "npm i --no-save @stackbit/types"
});