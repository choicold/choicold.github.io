---
title: "pg_trgm"
description: "support for similarity of text using trigram matching"
publishDate: "2026-06-03T21:00:00+09:00"
---

> support for similarity of text using trigram matching

## 레퍼런스

- 공식문서 — [F.33. pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html)
- 소스코드 — [contrib/pg_trgm](https://github.com/postgres/postgres/tree/master/contrib/pg_trgm)

## 요약

| 항목 | 목적 | 자세히 |
| --- | --- | --- |
| `CREATE EXTENSION pg_trgm` | 확장 활성화 (trigram 함수·연산자·연산자클래스 등록) | [원리](#trigram이란) |
| `gin_trgm_ops` | GIN 인덱스가 `LIKE`·`ILIKE`·`%`를 타게 하는 연산자 클래스 | [구현](#내부-동작) |
| `gist_trgm_ops` | 같은 목적의 GiST 버전 (인덱스 작고 갱신 싸지만 검색 느림) | [구현](#내부-동작) |
| `similarity(a, b)` / `%` | 두 문자열의 trigram 유사도(0~1) 계산·비교 | [유사도](#유사도는-어떻게-재나) |
| `show_trgm(text)` | 문자열이 어떤 trigram으로 쪼개지는지 직접 확인 | [구현](#내부-동작) |

**상황별 선택**

| 이런 상황이면 | 이걸 쓴다 |
| --- | --- |
| `LIKE '앞%'` (앞 고정) | 그냥 B-tree — pg_trgm 불필요 |
| `LIKE '%중간%'` 부분일치 | `gin_trgm_ops` + GIN 인덱스 |
| 오타 허용·유사 검색 | `similarity()` / `%` 연산자 |
| 쓰기 많고 인덱스 작아야 함 | `gist_trgm_ops` 검토 |

## 개념·원리

### trigram이란

문자열을 **3글자 단위 조각**으로 그룹화하고, 두 문자열이 공유하는 trigram의 개수를 세어 유사도를 측정
  :::note[**trigram 추출 규칙**]
  - 단어가 아닌 문자는 무시하고, 각 단어 앞에 공백 2개, 뒤에 공백 1개를 붙여 그룹화
  - 검색어에는 `%`의 위치에 따라 padding이 달라짐
  :::

```text
1. "hello"  →  그룹화  →  "  h", " he", "hel", "ell", "llo", "lo "

2. 검색어 "%ello%"  →  `%`가 앞 뒤로 존재해 패딩 없이 trigram: "ell", "llo"
        
3. ("ell", "llo")을 trigram으로 가진 행을 인덱스에서 후보군을 추림 → hello 후보
        
4. recheck: 실제로 "%ello%"에 맞는지 힙에서 확인 → hello 매칭
```

:::important[**핵심은 문자열을**위치와 무관한 3글자 조각들의 집합으로 바라본다**는 것**]
:::

### 유사도는 어떻게 재나

두 문자열을 각각 trigram 집합으로 만든 뒤, **공통 조각의 비율**로 유사도를 매긴다(자카드 유사도 계열). `similarity()`는 0~1을 반환하고, `%` 연산자는 기본 임계값(`pg_trgm.similarity_threshold`, 기본 0.3) 이상이면 참.

- `'word'` vs `'words'` → 조각 대부분 공통 → 높은 유사도
- 오타·부분 표기에도 매칭 → "오타 허용 검색"이 가능한 이유

## 구현

### 내부 동작

`show_trgm()`으로 실제 분해를 눈으로 볼 수 있다.

```sql
SELECT show_trgm('hello');
-- {"  h"," he",ell,hel,llo,"lo "}

-- 확장 + 부분일치용 GIN 인덱스
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_news_title_trgm ON news USING gin (title gin_trgm_ops);
```

`gin_trgm_ops`는 GIN 연산자 클래스로, GIN이 trigram을 색인·검색하기 위한 함수 묶음을 제공한다:

- **extract** — 색인/질의 대상 문자열에서 trigram 키 집합을 뽑는다(색인 시·검색 시 각각).
- **consistent** — 인덱스가 추린 후보가 실제 조건(`LIKE`/`%`)을 만족할 가능성이 있는지 판정.
- **recheck** — GIN은 trigram 매칭이 "후보"만 주므로, 힙에서 실제 행을 다시 검사해 거짓양성을 거른다.

그래서 실행 계획은 보통 **Bitmap Index Scan(후보 수집) → Recheck**로 나타난다.

```sql
EXPLAIN ANALYZE SELECT * FROM news WHERE title LIKE '%키워드%';
-- Seq Scan (93ms)  →  Bitmap Index Scan on idx_news_title_trgm (2.5ms)
```

## 실제 적용 사례
> (블로그 글 예정)
