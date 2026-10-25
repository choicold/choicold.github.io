---
title: "Brief"
description: "관심사 기반 뉴스 요약 앱의 검색 성능 개선"
period: "2026.02 ~ 2026.04"
stack: ["Spring Boot", "PostgreSQL", "JPA"]
team: "9인 팀"
role: "검색과 DB 담당"
repoUrl: "https://github.com/swyp-app-4/Brief"
storeUrl: "https://play.google.com/store/apps/details?id=com.swyp.brife&hl="
order: 1
---

## Problem & Solution

**Problem**: 뉴스 제목과 요약 대상 검색이 `ILIKE '%키워드%'`로 구현돼 데이터 증가에 따라 Seq Scan 선형 탐색 발생

**Solution**: 외부 검색엔진 없이 PostgreSQL 내 `pg_trgm` GIN 인덱스를 적용해 부분일치 검색 병목 해결

## Core Features

- **뉴스 부분일치 검색**: `pg_trgm` GIN 인덱스 기반 `ILIKE` 성능 개선
- **무한 스크롤 피드**: `Slice` 기반 count 쿼리 회피
- **카테고리 균형 홈피드**: Window Function 단일 쿼리
- **관심사 온보딩**: `category_group`/`category` 분리 스키마

## Technical Highlights

- **문제 확인**: `ILIKE '%키워드%'` 검색의 Seq Scan 병목을 확인. 현재 부분일치 검색을 유지하면서 실행 시간을 줄이는 데 집중
- **대안 검토**: PGroonga와 Elasticsearch도 검토했으나 형태소 분석과 랭킹은 MVP 우선순위가 낮았고, Elasticsearch는 별도 클러스터와 동기화가 필요
- **인덱스 선택**: **추가 인프라가 필요 없는 `pg_trgm` GIN 적용**. 인덱스로 후보를 찾고 힙에서 recheck해 위양성 제거
- **결과 검증**: 뉴스 약 1.6만 건에서 **93ms → 2.5ms**. EXPLAIN ANALYZE로 Seq Scan에서 Bitmap Index Scan을 활용하는 실행계획으로 전환 확인
- **검색 한계**: 2글자 검색어는 풀스캔 폴백 가능. 코로나와 COVID처럼 표현이 다른 단어의 의미 매칭은 불가
- **스키마 설계**: 온보딩과 뉴스 수집 등의 책임이 혼재된 Category를 `category_group`과 `category`로 분리해 **갱신 이상 해결**

## Impact

- 검색 쿼리 뉴스 약 1.6만 건 기준 **93ms → 2.5ms** (약 37배, EXPLAIN ANALYZE), **외부 검색엔진과 인프라 추가 없이 달성**
