import type { CollectionEntry } from "astro:content";
import { siteConfig } from "@/site.config";

export function getFormattedDate(
	date: Date | undefined,
	options?: Intl.DateTimeFormatOptions,
): string {
	if (date === undefined) {
		return "Invalid Date";
	}

	return new Intl.DateTimeFormat(siteConfig.date.locale, {
		...(siteConfig.date.options as Intl.DateTimeFormatOptions),
		...options,
	}).format(date);
}

export function collectionDateSort(
	a: CollectionEntry<"post" | "wiki">,
	b: CollectionEntry<"post" | "wiki">,
) {
	// wiki는 publishDate가 선택값이라 없으면 0(가장 과거)으로 취급
	const aTime = a.data.publishDate?.getTime() ?? 0;
	const bTime = b.data.publishDate?.getTime() ?? 0;
	return bTime - aTime;
}
