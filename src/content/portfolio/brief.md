---
title: "Brief - 관심사 기반 뉴스 큐레이션 앱 서비스"
description: "외부 검색엔진 없이 PostgreSQL 내부 인덱싱으로 뉴스 검색 병목을 해결한 백엔드 프로젝트"
period: "2026.02 ~ 2026.04"
stack: ["Spring Boot", "PostgreSQL", "JPA", "LLM"]
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

- **검색 방식 의사결정**
  - 선택지
    - `ILIKE`: 구현은 단순하지만 부분일치 검색에서 풀스캔 발생
    - PGroonga: PostgreSQL 내 FTS 확장으로 형태소 기반 검색 가능
    - Elasticsearch+nori: 형태소 분석과 랭킹에 강하지만 별도 클러스터와 동기화 파이프라인 필요
    - `pg_trgm` GIN: PostgreSQL 내부 인덱스로 기존 `ILIKE` 검색 병목 완화
  - 판단: 형태소 분석·랭킹 본격화 시 PGroonga 또는 ES가 후보이나 현재 규모엔 과한 복잡도, MVP기준 인프라 추가 비용이 없는 `pg_trgm` GIN 선택
  - 결과: 1.6만 건 기준 Seq Scan 93ms → Bitmap Index Scan 2.5ms
- **`pg_trgm` 내부 동작**: 문자열을 3글자 조각 집합으로 보고 GIN 후보 추출 후 힙에서 recheck하는 구조. `gin_trgm_ops`가 extract로 trigram 키를 추출하고 consistent로 후보를 판정, recheck로 위양성 제거. 실행계획을 Seq Scan에서 Bitmap Index Scan → Recheck로 전환
- **동작 범위와 한계 파악**: 2글자 검색어는 trigram 생성 한계로 풀스캔 폴백 가능, 코로나 ↔ COVID 같은 의미 매칭은 불가
- **테이블 분리 설계**: 온보딩 선택, 뉴스 수집, Topic 부모 책임이 혼재된 단일 Category를 `category_group`와 `category`로 분리 → 갱신 이상 해결

## Impact

- 검색 쿼리 뉴스 약 1.6만 건 기준 **93ms → 2.5ms** (약 37배, EXPLAIN ANALYZE), 외부 검색엔진과 인프라 추가 없이 달성
