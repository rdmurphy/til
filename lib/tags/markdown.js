// packages
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';

// vendor
import rehypePrism from '../vendor/rehype-prism.js';

export default async function markdownTag(/** @type {string} */ body) {
	const output = await unified()
		.use(remarkParse)
		.use(remarkRehype)
		.use(rehypePrism)
		.use(rehypeStringify)
		.process(body);

	return output.toString();
}
