---
tags:
  - javascript
---

# I am the first post!

But probably not really. This is just here to test build stuff.

## Here's some code

```js
function square(n) {
	return n * n;
}
```

And here it is as `TypeScript`.

```ts
function square(n: number): number {
	return n * n;
}
```

#### Tags
{% for tag in tags %}
- {{ tag }}
{% endfor %}