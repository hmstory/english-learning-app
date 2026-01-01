# 📚 영어 원서 단어 학습 앱

Big Little Lies 원서를 활용한 인터랙티브 영어 학습 웹 애플리케이션입니다.

## ✨ 주요 기능

- **플래시카드 모드**: 문장을 클릭하여 의미와 설명을 확인할 수 있습니다
- **퀴즈 모드**: 핵심 표현을 선택하는 객관식 퀴즈를 풀 수 있습니다
- **진행 상황 저장**: 로컬 스토리지를 통해 학습 진행 상황이 자동 저장됩니다
- **키보드 단축키**: 
  - `←` / `→`: 이전/다음 카드
  - `Space` / `Enter`: 카드 뒤집기 (플래시카드 모드)
- **반응형 디자인**: 모바일과 데스크톱 모두에서 사용 가능합니다

## 🚀 사용 방법

### 로컬에서 실행

1. 저장소를 클론하거나 다운로드합니다
2. `index.html` 파일을 웹 브라우저에서 엽니다
3. 또는 로컬 서버를 실행합니다:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (http-server 설치 필요)
   npx http-server
   ```
4. 브라우저에서 `http://localhost:8000` 접속

### GitHub Pages로 배포

1. GitHub에 저장소를 생성합니다
2. 모든 파일을 커밋하고 푸시합니다
3. 저장소 설정(Settings) → Pages로 이동
4. Source를 "main" 브랜치로 선택
5. 몇 분 후 `https://[사용자명].github.io/[저장소명]`에서 접속 가능

## 📁 프로젝트 구조

```
english-learning-app/
├── index.html      # 메인 HTML 파일
├── styles.css      # 스타일시트
├── app.js          # 애플리케이션 로직
├── data.js         # 학습 데이터
├── README.md       # 프로젝트 설명
└── .gitignore      # Git 제외 파일
```

## 🎯 학습 데이터

현재 Big Little Lies 원서에서 추출한 10개의 문장이 포함되어 있습니다. 각 문장에는 다음 정보가 포함됩니다:

- 원문 문장
- 자연스러운 한국어 번역
- 핵심 표현
- 구조 분석
- 표현 설명
- 난이도 (B2/C1)

## 🔧 커스터마이징

### 새로운 문장 추가

`data.js` 파일의 `data` 배열에 새로운 객체를 추가하면 됩니다:

```javascript
{
  "sentence": "새로운 문장",
  "source": {
    "title": "책 제목",
    "author": "작가명"
  },
  "difficulty": "B2",
  "tags": ["태그1", "태그2"],
  "native_core_meaning": "핵심 의미",
  "step_by_step": {
    "structure": "구조 분석",
    "expressions": "표현 설명",
    "native_interpretation": "원어민 해석"
  },
  "natural_korean": "자연스러운 한국어 번역",
  "keyExpression": "핵심 표현"
}
```

### 스타일 변경

`styles.css` 파일을 수정하여 색상, 폰트, 레이아웃을 변경할 수 있습니다.

## 🌐 브라우저 지원

- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)

## 📝 라이선스

이 프로젝트는 개인 학습 목적으로 제작되었습니다.

## 🙏 감사의 말

- 원서: Big Little Lies by Liane Moriarty
- 디자인: 모던하고 깔끔한 UI/UX

## 🔮 향후 개선 계획

- [ ] 더 많은 문장 추가
- [ ] 학습 통계 기능
- [ ] 즐겨찾기 기능
- [ ] 다크 모드
- [ ] 오디오 재생 기능
- [ ] 다른 원서 추가

---

만든이: 영어 학습을 위한 개인 프로젝트

