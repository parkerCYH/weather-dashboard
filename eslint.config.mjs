import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import pluginQuery from '@tanstack/eslint-plugin-query';

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    prettier,
    {
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
        },
        plugins: {
            '@tanstack/query': pluginQuery,
        },
    },
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
        // Dependencies
        'node_modules/**',
        // Build outputs
        'dist/**',
        // Ignore generated API files from Orval
        'src/lib/api/generated/**',
        // Minified files
        '**/*.min.js',
    ]),
]);

export default eslintConfig;
