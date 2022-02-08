// packages
import { toString } from 'hast-util-to-string';
import { refractor } from 'refractor';
import { visit } from 'unist-util-visit';

export default function rehypePrism(options) {
	options = options || {};

	if (options.alias) {
		refractor.alias(options.alias);
	}

	return (tree) => {
		visit(tree, 'element', visitor);
	};

	function visitor(node, _, parent) {
		if (!parent || parent.tagName !== 'pre' || node.tagName !== 'code') {
			return;
		}

		const lang = getLanguage(node);

		if (lang === null) {
			return;
		}

		let result;
		try {
			parent.properties.className = (parent.properties.className || []).concat(
				'language-' + lang,
			);
			result = refractor.highlight(toString(node), lang);
		} catch (err) {
			if (options.ignoreMissing && /Unknown language/.test(err.message)) {
				return;
			}
			throw err;
		}

		node.children = result.children;
	}
}

function getLanguage(node) {
	const className = node.properties.className || [];

	for (const classListItem of className) {
		if (classListItem.slice(0, 9) === 'language-') {
			return classListItem.slice(9).toLowerCase();
		}
	}

	return null;
}
