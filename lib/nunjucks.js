// packages
import nunjucks from 'nunjucks';

// local
import markdownTag from './tags/markdown.js';

/**
 * @param {import('nunjucks').Environment} env
 * @param {string} name
 * @param {(...args) => unknown} fn
 */
function addCustomTag(env, name, fn) {
	env.addExtension(name, {
		tags: [name],

		parse(parser, nodes) {
			// prep args variable
			let args;

			// get the tag token
			const token = parser.nextToken();

			// parse the supplied args
			args = parser.parseSignature(true, true);

			// step around bug with no-args tags
			if (args.children.length === 0) {
				args.addChild(new nodes.Literal(0, 0, ''));
			}

			// advance to the end of the block
			parser.advanceAfterBlockEnd(token.value);

			// pass things along to run()
			return new nodes.CallExtensionAsync(this, 'run', args);
		},

		async run(...args) {
			// the callback to run when finished
			const resolve = args.pop();

			const [{ ctx }, ...rest] = args;

			try {
				// run the function
				const value = await fn.call(ctx, ...rest);

				// resolve the value
				resolve(null, new nunjucks.runtime.SafeString(value));
			} catch (err) {
				resolve(err);
			}
		},
	});
}

/**
 * @param {import('nunjucks').Environment} env
 * @param {string} name
 * @param {(body: string, ...args) => unknown} fn
 */
function addCustomBlockTag(env, name, fn) {
	env.addExtension(name, {
		tags: [name],

		parse(parser, nodes) {
			// get the tag token
			const token = parser.nextToken();

			// parse the supplied args
			const args = parser.parseSignature(true, true);

			// advance to the end of the block
			parser.advanceAfterBlockEnd(token.value);

			// get the contents in between the beginning and end blocks
			const body = parser.parseUntilBlocks(`end${name}`);

			// finish out the end block
			parser.advanceAfterBlockEnd();

			// pass things along to run()
			return new nodes.CallExtensionAsync(this, 'run', args, [body]);
		},

		async run(...args) {
			// the callback to run when finished
			const resolve = args.pop();

			// the body is always the next to last argument
			const body = args.pop();

			const [{ ctx }, ...rest] = args;

			try {
				// run the function
				const value = await fn.call(ctx, body(), ...rest);

				// resolve the value
				resolve(null, new nunjucks.runtime.SafeString(value));
			} catch (err) {
				resolve(err);
			}
		},
	});
}

export function create() {
	const env = nunjucks.configure(['_layouts', process.cwd()], {
		autoescape: false,
		dev: true,
		noCache: true,
		throwOnUndefined: true,
	});

	addCustomBlockTag(env, 'md', markdownTag);

	return {
		render(contents, context, file) {
			return new Promise((resolve, reject) => {
				// create a new template
				const template = new nunjucks.Template(contents, env, file);

				template.render(context, (err, res) => {
					if (err) {
						reject(err);
					} else {
						resolve(res);
					}
				});
			});
		},
	};
}
