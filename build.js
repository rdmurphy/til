// native
import { readFileSync, writeFileSync } from 'node:fs';
import { format, join, parse, relative } from 'node:path';

// packages
import matter from 'gray-matter';
import nunjucks from 'nunjucks';
import { totalist } from 'totalist/sync';

// local
import { outputFile } from './lib/fs.js';
import { create } from './lib/nunjucks.js';

const env = create();

env.render('index.html', (err, html) => {
	if (err) {
		console.error(err);
		return;
	}

	writeFileSync('_dist/index.html', html);
});

/** @type {Set<string>} */
const inputs = new Set();

totalist('pages', (name, abs) => {
	inputs.add(abs);
});

for (const input of inputs) {
	const raw = readFileSync(input, 'utf8');
	const { data, content } = matter(raw);
	const src = `{% extends 'base.html' %} {% block content %}{% md %}${content}{% endmd %}{% endblock %}`;
	const compiled = new nunjucks.Template(src, env, input, true);

	compiled.render(data, (err, html) => {
		if (err) {
			console.error(err);
			return;
		}

		const path = relative(process.cwd(), input);
		const { dir, name } = parse(path);
		outputFile(join('_dist', format({ dir, ext: '.html', name })), html);
	});
}
