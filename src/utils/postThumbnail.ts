import type { CollectionEntry } from "astro:content";
import path from "node:path";
import type { ImageMetadata } from "astro";

const images = import.meta.glob<{ default: ImageMetadata }>(
	"/src/content/post/**/*.{png,jpg,jpeg,webp,gif,avif,svg}",
);

/** Prefer a cover or body image; fall back to the shared default thumbnail. */
export async function postThumbnail(
	post: CollectionEntry<"post">,
	defaultThumbnail = "/images/github-profile-thumbnail.png",
) {
	if (post.data.coverImage) return post.data.coverImage.src;
	const body = (post.body ?? "").replace(/```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`]*`/g, "");
	const match = /!\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\s*\)/.exec(body);
	const source = match?.[1] ?? match?.[2];
	if (!source) return defaultThumbnail;
	if (/^https?:\/\//.test(source) || (source.startsWith("/") && !source.startsWith("//"))) {
		return source;
	}
	if (!post.filePath) return defaultThumbnail;
	let decoded: string;
	try {
		decoded = decodeURIComponent(source);
	} catch {
		return defaultThumbnail;
	}
	const key = `/${path.relative(process.cwd(), path.resolve(path.dirname(post.filePath), decoded))}`;
	const image = images[key];
	return image ? (await image()).default : defaultThumbnail;
}
