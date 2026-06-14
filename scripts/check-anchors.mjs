// 빌드 산출물(dist)에서 내부 앵커 링크가 실제로 존재하는지 검사한다.
//
// 왜: 위키(Reference) 글이 블로그(Experience) 글의 특정 문단으로 `/posts/슬러그/#앵커`
// 형태로 링크하는데, 블로그 제목(heading)을 바꾸면 자동 생성된 slug id가 조용히 바뀌어
// 링크가 404 없이 "그냥 맨 위로" 깨진다. 빌드 시 이 깨짐을 잡아 실패시키기 위함.
//
// 무엇을: dist의 모든 .html에서 같은 사이트 내부 링크 중 #fragment가 붙은 것을 모아,
// 대상 페이지 HTML에 그 fragment가 id(또는 name)로 존재하는지 확인한다.

import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const DIST = "dist";

/** dist 아래 모든 .html 파일 경로를 재귀로 모은다. */
async function htmlFiles(dir) {
	const out = [];
	for (const ent of await readdir(dir, { withFileTypes: true })) {
		const full = join(dir, ent.name);
		if (ent.isDirectory()) {
			if (ent.name === "pagefind") continue; // 검색 인덱스는 검사 제외
			out.push(...(await htmlFiles(full)));
		} else if (ent.name.endsWith(".html")) {
			out.push(full);
		}
	}
	return out;
}

/** "dist/posts/foo/index.html" → 그 페이지의 사이트 경로 "/posts/foo/" */
function pageRoute(file) {
	let rel = "/" + relative(DIST, file).replaceAll("\\", "/");
	rel = rel.replace(/index\.html$/, "").replace(/\.html$/, "/");
	return rel.endsWith("/") ? rel : rel + "/";
}

/** HTML에서 id="..."(및 name="...") 속성 값을 모두 모은다. */
function collectIds(html) {
	const ids = new Set();
	for (const m of html.matchAll(/\sid="([^"]+)"/g)) ids.add(m[1]);
	for (const m of html.matchAll(/\sname="([^"]+)"/g)) ids.add(m[1]);
	return ids;
}

/** HTML에서 href="...#fragment" 중 내부 링크만 [path, fragment]로 추출. */
function collectAnchorLinks(html) {
	const links = [];
	for (const m of html.matchAll(/href="([^"]+#[^"]+)"/g)) {
		const href = m[1];
		// 외부 URL(스킴 포함)·메일 등 제외
		if (/^[a-z]+:\/\//i.test(href) || href.startsWith("mailto:")) continue;
		const hashIdx = href.indexOf("#");
		const path = href.slice(0, hashIdx);
		const fragment = decodeURIComponent(href.slice(hashIdx + 1));
		if (!fragment) continue; // 순수 "#"
		links.push({ path, fragment });
	}
	return links;
}

/** 링크의 path를 대상 페이지 라우트로 정규화. 빈 path(같은 페이지 내 앵커)는 source 자신. */
function resolveTarget(linkPath, sourceRoute) {
	if (linkPath === "" || linkPath === ".") return sourceRoute;
	let p = linkPath;
	if (!p.startsWith("/")) p = sourceRoute + p; // 상대경로(드묾)
	if (!p.endsWith("/")) p = p.endsWith(".html") ? p : p + "/";
	return p;
}

const files = await htmlFiles(DIST);

// 라우트 → 그 페이지의 id 집합
const idsByRoute = new Map();
const htmlByFile = new Map();
for (const f of files) {
	const html = await readFile(f, "utf8");
	htmlByFile.set(f, html);
	idsByRoute.set(pageRoute(f), collectIds(html));
}

const broken = [];
for (const f of files) {
	const sourceRoute = pageRoute(f);
	for (const { path, fragment } of collectAnchorLinks(htmlByFile.get(f))) {
		const target = resolveTarget(path, sourceRoute);
		const ids = idsByRoute.get(target);
		if (ids === undefined) continue; // 사이트 외부/미생성 페이지는 검사 대상 아님
		if (!ids.has(fragment)) {
			broken.push({ from: sourceRoute, to: target, fragment });
		}
	}
}

if (broken.length > 0) {
	console.error(`\n✗ 깨진 내부 앵커 ${broken.length}개 발견:\n`);
	for (const b of broken) {
		console.error(`  ${b.from}\n    → ${b.to}#${b.fragment}  (대상에 #${b.fragment} 없음)`);
	}
	console.error("\n블로그 제목을 바꿨다면 링크의 #앵커도 함께 고치세요.\n");
	process.exit(1);
}

console.log("✓ 내부 앵커 링크 검사 통과");
