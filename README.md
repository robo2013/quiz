# 퀴즈 프로그램

출제자가 객관식 퀴즈를 만들고, 수검자가 풀어 즉시 채점 결과를 받는 웹 앱.

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
