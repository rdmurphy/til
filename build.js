// packages
import { writeFileSync } from 'node:fs';

// local
import { create } from './lib/nunjucks.js';

const env = create();

env.render('index.html', (err, html) => {
	if (err) {
		console.error(err);
		return;
	}

	writeFileSync('_dist/index.html', html);
});
