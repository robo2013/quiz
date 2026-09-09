# 퀴즈 프로그램

출제자가 객관식 퀴즈를 만들고, 수검자가 이름을 입력해 풀면 즉시 채점 결과를 받아보는 웹 앱입니다.

## 주요 기능

- **이름 + 역할 입력**: 로그인 없이 이름과 역할(출제자/수검자)만 입력하면 세션이 생성됩니다.
- **출제자**
  - 퀴즈 생성 및 목록 조회
  - 퀴즈 편집 화면에서 문항과 보기(정답 표시 포함) 추가/수정
  - 퀴즈 발행(공개) 여부 관리
- **수검자**
  - 발행된 퀴즈 목록 조회
  - 퀴즈 풀이 후 제출
  - 채점 결과(맞은 개수 등) 확인

## 기술 스택

- [Next.js](https://nextjs.org) (App Router, Server Actions)
- React 19 + TypeScript
- [Drizzle ORM](https://orm.drizzle.team) + [Neon Postgres](https://neon.tech)
- Tailwind CSS

## 폴더 구조

```
src/
  app/
    page.tsx              # 이름/역할 입력 랜딩 페이지
    actions.ts             # 세션 생성 서버 액션
    create/                # 출제자 화면 (퀴즈 목록, 생성, 편집)
      page.tsx
      actions.ts
      [quizId]/
        page.tsx           # 문항/보기 편집
        actions.ts
    quizzes/                # 수검자 화면 (퀴즈 목록, 풀이, 결과)
      page.tsx
      [quizId]/
        page.tsx
        result/page.tsx
  db/
    schema.ts               # quizzes / questions / choices 테이블 정의
    index.ts                # DB 커넥션
  lib/
    session.ts               # 쿠키 기반 세션(이름, 역할) 관리
```

## 데이터 모델

- `quizzes`: 퀴즈 제목, 출제자 이름, 발행 여부
- `questions`: 퀴즈에 속한 문항, 순서
- `choices`: 문항에 속한 보기, 정답 여부, 순서

## 개발 환경 실행

```bash
npm install
npx vercel env pull .env.local --yes
npm run dev
```

`http://localhost:3000` 접속 → 이름 입력 후 "출제자" 또는 "수검자"로 입장.

## 스키마 변경 시

```bash
npx dotenv -e .env.local -- npx drizzle-kit push
```
