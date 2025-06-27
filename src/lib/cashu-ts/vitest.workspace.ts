import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
	{
		test: {
			name: 'node',
			globals: true,
			environment: 'node'
		}
	},
	{
		test: {
			name: 'browser',
			globals: true,
			browser: {
				provider: 'playwright',
				name: 'chromium'
			}
		}
	}
]);
