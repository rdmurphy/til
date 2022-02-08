// native
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * Takes a string and writes it out to the provided file path. All directories
 * in the path are created if needed.
 *
 * @param {string} dest The output file path
 * @param {string} data The content to be written to the `dest`
 * @returns {void} If no error is thrown, returns `void`.
 */
export function outputFile(dest, data) {
	mkdirSync(dirname(dest), { recursive: true });

	try {
		writeFileSync(dest, data);
	} catch (e) {
		throw e;
	}
}
