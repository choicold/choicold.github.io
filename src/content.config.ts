import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

function removeDupsAndLowerCase(array: string[]) {
	return [...new Set(array.map((str) => str.toLowerCase()))];
}

const titleSchema = z.string().max(60);

const baseSchema = z.object({
	title: titleSchema,
});

const post = defineCollection({
	loader: glob({ base: "./src/content/post", pattern: "**/*.{md,mdx}" }),
	schema: ({ image }) =>
		baseSchema.extend({
			description: z.string(),
			coverImage: z
				.object({
					alt: z.string(),
					src: image(),
				})
				.optional(),
			draft: z.boolean().default(false),
			ogImage: z.string().optional(),
			tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
			publishDate: z
				.string()
				.or(z.date())
				.transform((val) => new Date(val)),
			updatedDate: z
				.string()
				.optional()
				.transform((str) => (str ? new Date(str) : undefined)),
			pinned: z.boolean().default(false),
		}),
});

// 위키: 카테고리는 frontmatter가 아니라 폴더 구조(id의 첫 경로 세그먼트)로 결정한다.
// 예) src/content/wiki/Spring/transaction.md → id "Spring/transaction" → 카테고리 "Spring".
// 작성일보다 갱신일이 중요한 지식 베이스라 둘 다 선택값으로 둔다.
const wiki = defineCollection({
	loader: glob({ base: "./src/content/wiki", pattern: "**/*.{md,mdx}" }),
	schema: baseSchema.extend({
		description: z.string().optional(),
		publishDate: z.iso
			.datetime({ offset: true }) // ISO 8601 with offset (e.g. "2024-01-01T00:00:00+09:00")
			.transform((val) => new Date(val))
			.optional(),
		updatedDate: z.iso
			.datetime({ offset: true })
			.transform((val) => new Date(val))
			.optional(),
	}),
});

const portfolio = defineCollection({
	loader: glob({ base: "./src/content/portfolio", pattern: "**/*.{md,mdx}" }),
	schema: baseSchema.extend({
		description: z.string(),
		order: z.number().default(0),
		period: z.string(),
		repoUrl: z.string().url().optional(),
		role: z.string(),
		stack: z.array(z.string()).default([]),
		storeUrl: z.string().url().optional(),
		team: z.string(),
	}),
});

const tag = defineCollection({
	loader: glob({ base: "./src/content/tag", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		title: titleSchema.optional(),
		description: z.string().optional(),
	}),
});

export const collections = { post, wiki, portfolio, tag };
