# 블로그 에디터 사용법

관리 화면: https://choicold.github.io/admin/

Sveltia CMS가 기존 Markdown 파일을 GitHub 저장소의 `main` 브랜치에 저장합니다.
저장할 때마다 기존 GitHub Actions 배포가 실행됩니다. 별도 서버는 필요하지 않습니다.

## 첫 로그인

1. GitHub의 [Fine-grained personal access tokens](https://github.com/settings/personal-access-tokens/new)에서 토큰을 만듭니다.
2. Resource owner는 `choicold`, Repository access는 **Only select repositories → choicold.github.io**로 설정합니다.
3. Repository permissions의 **Contents → Read and write**를 허용합니다. Metadata 읽기 권한은 자동으로 추가됩니다. 이 구성에는 Pull requests 권한이 필요 없습니다.
4. 만료일을 지정하고 발급한 토큰을 관리 화면의 **Sign In with Token**에 입력합니다.

토큰은 채팅이나 저장소에 붙여 넣지 않습니다. 에디터가 로그인 정보를 해당 브라우저의 로컬 저장소에 보관하므로 개인 브라우저에서 사용하고, 공용 기기에서는 로그아웃합니다. 만료된 경우 새 토큰으로 로그인합니다.

GitHub 로그인 버튼을 통한 OAuth는 별도 인증 서버가 필요하므로 이번 구성에는 포함하지 않습니다.
로그인 방식과 권한은 [Sveltia CMS GitHub 문서](https://sveltiacms.app/en/docs/backends/github)를 따릅니다.

## 작성과 발행

- **블로그 글**에서 새 글을 만들거나 기존 글을 엽니다. 서식 편집과 Markdown 편집을 사용할 수 있습니다.
- 새 글의 **공개 상태**는 기본 **비공개 — 작성 중**입니다. 제목·요약·본문 등을 입력하고 에디터의 저장 버튼을 눌러 보관합니다.
- 준비되면 **공개 — 블로그에 표시**로 바꾸고 저장합니다.
- 공개된 글을 수정하고 저장하면 수정 내용도 배포됩니다. 발행본과 수정 초안을 따로 유지하지 않습니다.
- 글을 내릴 때는 **비공개 — 작성 중**으로 바꾸고 저장합니다. 파일은 남고 다음 배포부터 블로그에서 빠집니다.
- CMS의 Save/Publish 버튼 이름과 관계없이, 블로그 공개 여부는 **공개 상태** 필드가 결정합니다. 상태만 바꾸고 저장하지 않으면 반영되지 않습니다.
- 자동 저장으로 간주하지 말고 편집 후 저장 완료를 확인합니다.

반영 상태는 [GitHub Actions](https://github.com/choicold/choicold.github.io/actions/workflows/deploy.yml)에서 확인합니다. 저장에 성공해도 배포가 실패하면 블로그에는 이전 배포 내용이 남습니다.

## 이미지와 글 주소

새 글은 `src/content/post/<slug>/index.md`에 저장되며 주소는 `/posts/<slug>/`입니다. 기존 글 경로는 유지합니다. 공개 후 파일명/slug를 바꾸면 주소가 달라지므로 주의합니다.
이미지는 본문에 삽입하거나 대표 이미지로 첨부할 수 있으며, 글 폴더에 함께 저장됩니다. 대표 이미지는 이미지 설명도 입력합니다.
기본 에디터 미리보기는 본문 확인용입니다. 블로그의 전체 디자인과 사용자 정의 Markdown 문법은 실제 배포 화면과 다를 수 있습니다. 비공개 글의 실제 사이트 주소는 404가 정상입니다.

## 비공개의 의미

`draft: true` 글은 프로덕션 글 목록, 개별 글 페이지, 태그, RSS, 검색 색인 및 사이트맵에서 제외됩니다. 공개 GitHub 저장소의 원본까지 숨기는 기능은 아닙니다.
로컬 개발 서버에서는 기존 동작대로 비공개 글도 확인할 수 있습니다.

## 유지보수

설정은 `public/admin/config.yml`, 진입 화면은 `src/pages/admin/index.astro`에 있습니다.
CMS는 CDN의 `0.262.2` 버전에 고정되어 있으며 무결성 해시로 검증됩니다. 버전을 올릴 때 `src`와 `integrity`를 함께 갱신하고 로그인·편집 화면을 확인합니다.
현재 관리 대상은 `.md` 블로그 글입니다. 위키·포트폴리오·MDX 컴포넌트 편집은 이 화면의 대상에 포함하지 않았습니다.
