import { type CollectionEntry, getCollection } from "astro:content";

export type WikiEntry = CollectionEntry<"wiki">;

/** 카테고리 = id의 첫 경로 세그먼트. 폴더 구조가 곧 분류다.
 *  예) "Spring/data/jpa-n-plus-1" → "Spring"
 *  폴더 없이 루트에 둔 글은 "Uncategorized"로 묶는다. */
export function getCategory(entry: WikiEntry): string {
	const segments = entry.id.split("/");
	return segments.length > 1 ? segments[0]! : "Uncategorized";
}

/** 사이드바용 트리 노드.
 *  - folder 노드: 하위 children(폴더+글 혼합)을 가짐
 *  - entry 노드: 실제 위키 글 (leaf) */
export type WikiTreeNode =
	| { type: "folder"; name: string; path: string; children: WikiTreeNode[] }
	| { type: "entry"; name: string; entry: WikiEntry };

/** id 경로(슬래시 구분)를 따라 폴더 노드를 만들거나 찾아 내려가며 글을 매단다. */
function insert(roots: WikiTreeNode[], segments: string[], entry: WikiEntry, prefix: string): void {
	const [head, ...rest] = segments;
	if (rest.length === 0) {
		// 마지막 세그먼트 = 글(파일). 제목은 frontmatter title 우선.
		roots.push({ type: "entry", name: entry.data.title, entry });
		return;
	}
	const path = prefix ? `${prefix}/${head}` : head!;
	let folder = roots.find(
		(n): n is Extract<WikiTreeNode, { type: "folder" }> =>
			n.type === "folder" && n.name === head,
	);
	if (!folder) {
		folder = { type: "folder", name: head!, path, children: [] };
		roots.push(folder);
	}
	insert(folder.children, rest, entry, path);
}

/** 노드 배열을 정렬: 폴더 먼저(이름순), 그다음 글(제목순) — IDE 탐색기 관례. */
function sortNodes(nodes: WikiTreeNode[]): void {
	nodes.sort((a, b) => {
		if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
		return a.name.localeCompare(b.name);
	});
	for (const n of nodes) {
		if (n.type === "folder") sortNodes(n.children);
	}
}

/** 모든 위키 글을 폴더 구조 그대로 재귀 트리로 반환. */
export async function getWikiTree(): Promise<WikiTreeNode[]> {
	const all = await getCollection("wiki");
	const roots: WikiTreeNode[] = [];
	for (const entry of all) {
		insert(roots, entry.id.split("/"), entry, "");
	}
	sortNodes(roots);
	return roots;
}

/** 홈/인덱스에서 쓰는 평면 카테고리 그룹: [[category, entries[]], ...] */
export async function getWikiByCategory(): Promise<[string, WikiEntry[]][]> {
	const all = await getCollection("wiki");
	const grouped = Object.groupBy(all, getCategory);
	return Object.entries(grouped)
		.map(([category, entries]) => {
			const sorted = (entries ?? []).slice().sort((a, b) => a.id.localeCompare(b.id));
			return [category, sorted] as [string, WikiEntry[]];
		})
		.sort((a, b) => a[0].localeCompare(b[0]));
}
