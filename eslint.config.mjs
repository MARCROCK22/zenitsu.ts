import theConfig from '@marcrock22/eslint';
import { config } from 'typescript-eslint';

export default config(
    theConfig,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
            },
        },
    },
    {
        rules: {
            '@stylistic/quotes': ['error', 'backtick']
        }
    }
)