# choicold's blog

개발/기술, 학습 아카이브, 그리고 회고를 기록하는 공간입니다.

🔗 **https://choicold.github.io**

[Astro](https://astro.build) 기반 정적 블로그이며, [Astro Cactus](https://github.com/chrismwilliams/astro-theme-cactus) 테마를 토대로 구성했습니다.

## 기술 스택

- **프레임워크**: Astro v6
- **스타일링**: Tailwind CSS v4
- **콘텐츠**: MD / MDX (Content Collections)
- **검색**: Pagefind (정적 검색)
- **배포**: GitHub Pages (GitHub Actions 자동 배포)
- **기타**: 다크/라이트 모드, RSS, 사이트맵, OG 이미지 자동 생성

## 페이지 구성

| 경로 | 설명 |
| :--- | :--- |
| `/` | CV — 이력·프로젝트·수상 내역 |
| `/about/` | 이전 CV 주소 (`/`로 이동) |
| `/portfolio/` | 포트폴리오 |
| `/posts/` | 블로그 글 목록 |
| `/wiki/` | 위키 |
| `/tags/` | 태그별 글 모음 |

## 로컬 실행

Node 버전은 `.nvmrc` 기준입니다.

```bash
npm install      # 의존성 설치
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드 → ./dist
npm run preview  # 빌드 결과 로컬 미리보기
```

| 명령어 | 설명 |
| :--- | :--- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 (Pagefind 인덱싱 포함) |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run check` | 타입 체크 + Biome 검사 |
| `npm run lint` | Biome 자동 수정 |
| `npm run format` | Prettier 포매팅 |

## 글 작성

브라우저에서 작성하려면 배포된 사이트의 [`/admin/`](https://choicold.github.io/admin/)을 사용합니다.
새 글은 비공개로 시작하고, 공개 상태를 바꿔 저장하면 GitHub Actions가 블로그에 반영합니다.
최초 GitHub 토큰 로그인과 이미지 첨부 등은 [에디터 사용법](docs/blog-editor.md)을 참고하세요.

`src/content/post/` 에 `.md` 또는 `.mdx` 파일을 추가하면 파일명이 URL slug가 됩니다.
글의 프론트매터에 `category: "회고"` 또는 `category: "기술"`을 지정하면 Blog의 해당 폴더에 표시됩니다. 분류를 바꿔도 파일 경로를 유지하면 글 주소는 바뀌지 않습니다. 태그는 분류와 별도로 지정합니다.
짧은 노트는 `src/content/note/` 에 추가합니다. 프론트매터 스키마는 `src/content.config.ts` 에 정의돼 있습니다.

## 배포

`main` 브랜치에 푸시하면 GitHub Actions(`.github/workflows/deploy.yml`)가 빌드 후 GitHub Pages로 자동 배포합니다.

## 크레딧

[Astro Cactus](https://github.com/chrismwilliams/astro-theme-cactus) by Chris Williams.

## License

[MIT](./LICENSE)
