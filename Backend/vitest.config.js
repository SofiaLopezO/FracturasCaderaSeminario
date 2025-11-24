// vitest.config.js
import { defineConfig } from 'vitest/config';

const isCoverage = process.env.COVERAGE === '1';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.{spec,test}.js'],
        exclude: ['tests/_helpers/**', 'node_modules/**'],

        reporters: isCoverage
            ? ['default', 'json']
            : ['default', 'verbose', 'json'],
        outputFile: { json: './test-results.json' },

        slowTestThreshold: 300,
        testTimeout: 30000, 
        hookTimeout: 30000, 
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/**',
                'tests/**',
                '**/*.spec.js',
                '**/*.test.js',
            ],
        },
    },
});
