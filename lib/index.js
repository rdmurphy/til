// native
import { readFile } from 'node:fs/promises';
import { format, join, parse } from 'node:path';

// packages
import glob from 'fast-glob';
import matter from 'gray-matter';
import { premove } from 'premove';

// local
import { outputFile } from './fs.js';
import { create } from './nunjucks.js';

const OUTPUT_DIR = '_dist';
const ENTRYPOINTS_PATTERN = '**/*.{html,md}';
const IGNORE_PATTERNS = [
	// the README.md
	'README.md',
	// any files starting with an underscore
	'**/_*/**',
	// any files in node_modules
	'**/node_modules',
];

export async function build() {
	await premove(OUTPUT_DIR);

	const env = create();

	const files = await glob(ENTRYPOINTS_PATTERN, {
		cwd: process.cwd(),
		ignore: IGNORE_PATTERNS,
	});

	for (const file of files) {
		// get the file path parts
		const { dir, ext, name } = parse(file);
		// read in the raw file
		const raw = await readFile(file, 'utf8');
		// parse any front matter
		const { data, content } = matter(raw);

		let html;

		switch (ext) {
			case '.html':
				html = await env.render(content, data, file);
				break;
			case '.md':
				const src = `{% extends 'base.html' %} {% block content %}{% md %}${content}{% endmd %}{% endblock %}`;
				html = await env.render(src, data, file);
				break;
			default:
				throw new Error(`Unsupported file type: ${ext}`);
		}

		outputFile(join(OUTPUT_DIR, format({ dir, ext: '.html', name })), html);
	}
}
