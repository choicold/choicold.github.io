import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { getCategory } from "@/data/wiki";
import { siteConfig } from "@/site.config";

export const GET = async () => {
	const entries = await getCollection("wiki");

	return rss({
		title: `${siteConfig.title} — Wiki`,
		description: siteConfig.description,
		site: import.meta.env.SITE,
		items: entries.map((entry) => ({
			title: entry.data.title,
			description: entry.data.description ?? getCategory(entry),
			// 갱신일 우선, 없으면 작성일 (둘 다 없으면 생략)
			...((entry.data.updatedDate ?? entry.data.publishDate)
				? { pubDate: entry.data.updatedDate ?? entry.data.publishDate }
				: {}),
			link: `wiki/${entry.id}/`,
		})),
	});
};
