# 퀴즈 프로그램 설계 문서

날짜: 2026-09-09

## 목적

출제자가 객관식 퀴즈를 만들고, 수검자가 그 퀴즈를 풀어 즉시 채점 결과를 받아볼 수 있는
웹 앱. 여러 사람이 각자 다른 기기/브라우저에서 접속해 같은 퀴즈를 공유한다.

## 요구사항 요약

- 로그인 없이 이름 + 역할(출제자/수검자)만 선택해서 입장
- 문제 유형은 객관식(선다형)만 지원
- 문제는 퀴즈(세트) 단위로 묶여서 제공
- 수검자는 퀴즈를 다 풀면 즉시 점수를 확인 (문제별 정답/오답 표시 포함)
- 별도의 결과 이력 저장은 하지 않음 (제출 시점에 즉석으로 채점)
- 여러 사람이 공유해야 하므로 서버 데이터베이스에 퀴즈를 저장

## 아키텍처

- **Next.js (App Router)**, Vercel에 배포 (Fluid Compute 기본값)
- **Postgres** (Vercel Marketplace의 Neon) + **Drizzle ORM**
- 로그인 시스템 없음: 랜딩 페이지에서 입력한 이름 + 역할을 쿠키에 저장해 해당 방문 동안 유지
- 데이터 변경(퀴즈 생성, 문제/보기 추가, 제출)은 Server Actions로 처리 (별도 API 라우트 불필요)

## 데이터 모델

```
quizzes
  id            uuid/serial PK
  title         text
  creator_name  text
  created_at    timestamp

questions
  id          uuid/serial PK
  quiz_id     FK -> quizzes.id
  text        text
  order       int

choices
  id            uuid/serial PK
  question_id   FK -> questions.id
  text          text
  is_correct    boolean
  order         int
```

결과(응시 이력)는 별도 테이블에 저장하지 않는다. 제출 시 서버에서 선택한 보기와
`is_correct`를 비교해 즉석으로 점수를 계산한다.

## 화면 흐름

1. `/` — 이름 입력 + 역할 선택 (출제자 / 수검자) → 쿠키 저장 후 이동
2. **출제자**
   - `/create` — 내가 만든 퀴즈 목록 + "새 퀴즈 만들기"
   - `/create/[quizId]` — 문제/보기 추가·수정·삭제, 정답 표시 지정
3. **수검자**
   - `/quizzes` — 풀 수 있는 퀴즈 목록
   - `/quizzes/[quizId]` — 문제 전체를 한 페이지에 표시, 답 선택 후 제출
   - `/quizzes/[quizId]/result` — 점수 + 문제별 정답/오답 표시

## 유효성 검사

- 퀴즈 저장 시: 문제 1개 이상, 각 문제는 보기 2개 이상 + 정답 정확히 1개
- 수검자 제출 시: 모든 문제에 답을 선택해야 제출 가능

## 에러 처리

- Server Action 실패 시 폼에 에러 메시지 표시 (토스트 또는 인라인)
- DB 연결 실패 등은 Next.js 기본 에러 바운더리로 처리

## 테스트

- 자동화 테스트 없이, 로컬 dev 서버에서 출제 → 풀이 → 채점 전체 플로우를 브라우저로
  직접 확인하는 방식으로 검증한다.

## 범위 밖 (Out of scope)

- 로그인/회원가입, 비밀번호 등 정식 인증
- 객관식 외 문제 유형 (OX, 주관식 등)
- 응시 결과 이력/통계
- 문제 유형 다양화, 시간 제한, 랜덤 출제 등 부가 기능
