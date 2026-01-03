// 앱 상태 관리
let currentMode = 'flashcard';
let currentIndex = 0;
let isFlipped = false;
let selectedAnswer = null;
let quizStats = {
    total: 0,
    correct: 0,
    studiedCards: new Set()
};

// 랜덤 순서 배열 (항상 랜덤으로 출제)
let randomOrder = [];

// 간격 반복 학습 시스템 - 각 단어별 학습 상태
let wordLearningData = {}; // { index: { level, nextReview, correctCount, wrongCount, lastStudied, mastery } }

// 간격 반복 학습 설정 (일 단위)
const SPACED_REPETITION_INTERVALS = [0, 1, 3, 7, 14, 30, 60]; // 레벨별 복습 간격
const MASTERY_THRESHOLD = 5; // 레벨 5 이상이면 완전 암기로 간주

// 로컬 스토리지에서 진행 상황 불러오기
function loadProgress() {
    try {
        const saved = localStorage.getItem('englishLearningProgress');
        if (saved) {
            const progress = JSON.parse(saved);
            currentIndex = progress.index || 0;
            currentMode = progress.mode || 'flashcard';
            
            // 모드 버튼 상태 업데이트
            document.querySelectorAll('.mode-btn').forEach((btn, idx) => {
                if ((idx === 0 && currentMode === 'flashcard') || 
                    (idx === 1 && currentMode === 'quiz')) {
                    btn.classList.add('active');
                    btn.setAttribute('aria-pressed', 'true');
                } else {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                }
            });
        }
        
        // 통계 불러오기
        const statsSaved = localStorage.getItem('englishLearningStats');
        if (statsSaved) {
            const stats = JSON.parse(statsSaved);
            quizStats = {
                total: stats.total || 0,
                correct: stats.correct || 0,
                studiedCards: new Set(stats.studiedCards || [])
            };
        }
        
        // 단어별 학습 데이터 불러오기
        const wordDataSaved = localStorage.getItem('wordLearningData');
        if (wordDataSaved) {
            wordLearningData = JSON.parse(wordDataSaved);
        }
        
        // 학습 목표 및 성취 데이터 불러오기
        loadAchievementData();
        
        // 테마 불러오기
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
    } catch (e) {
        console.warn('진행 상황을 불러올 수 없습니다:', e);
    }
}

// 진행 상황 저장
function saveProgress() {
    try {
        const progress = {
            index: currentIndex,
            mode: currentMode,
            timestamp: Date.now()
        };
        localStorage.setItem('englishLearningProgress', JSON.stringify(progress));
        
        // 통계 저장
        const statsToSave = {
            total: quizStats.total,
            correct: quizStats.correct,
            studiedCards: Array.from(quizStats.studiedCards)
        };
        localStorage.setItem('englishLearningStats', JSON.stringify(statsToSave));
        
        // 단어 학습 데이터 저장
        saveWordLearningData();
    } catch (e) {
        console.warn('진행 상황을 저장할 수 없습니다:', e);
    }
}

// 통계 업데이트
function updateStats() {
    if (!data || data.length === 0) return;
    
    const progressPercent = Math.round(((currentIndex + 1) / data.length) * 100);
    document.getElementById('progressPercent').textContent = progressPercent + '%';
    
    // 진행 바 업데이트
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = progressPercent + '%';
    }
    
    // 학습한 카드 수
    document.getElementById('studiedCount').textContent = quizStats.studiedCards.size;
    
    // 오늘 학습한 단어 수
    const todayStudiedEl = document.getElementById('todayStudied');
    if (todayStudiedEl) {
        todayStudiedEl.textContent = achievementData.todayStudied || 0;
    }
    
    // 연속 학습일
    const streakEl = document.getElementById('streakDays');
    if (streakEl) {
        streakEl.textContent = achievementData.streakDays || 0;
    }
    
    // 완전 암기한 단어 수
    const masteredEl = document.getElementById('masteredCount');
    if (masteredEl) {
        masteredEl.textContent = achievementData.totalWordsMastered || 0;
    }
    
    // 퀴즈 통계 (퀴즈 모드일 때만 표시)
    if (currentMode === 'quiz') {
        const quizStatsEl = document.getElementById('quizStats');
        if (quizStatsEl) {
            quizStatsEl.style.display = 'block';
            const correctRate = quizStats.total > 0 
                ? Math.round((quizStats.correct / quizStats.total) * 100) 
                : 0;
            document.getElementById('correctRate').textContent = correctRate + '%';
        }
    } else {
        const quizStatsEl = document.getElementById('quizStats');
        if (quizStatsEl) {
            quizStatsEl.style.display = 'none';
        }
    }
}

// 다크 모드 토글
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

// 테마 아이콘 업데이트
function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// 랜덤 순서 생성
function generateRandomOrder() {
    if (!data || data.length === 0) return [];
    const order = Array.from({ length: data.length }, (_, i) => i);
    // Fisher-Yates 셔플 알고리즘
    for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
}

// 모드 변경
function setMode(mode) {
    if (!data || data.length === 0) {
        console.error('데이터를 불러올 수 없습니다.');
        return;
    }
    
    currentMode = mode;
    isFlipped = false;
    selectedAnswer = null;
    
    // 랜덤 순서 생성
    randomOrder = generateRandomOrder();
    currentIndex = randomOrder[0] || 0;
    
    // 모드 버튼 상태 업데이트
    document.querySelectorAll('.mode-btn').forEach((btn, idx) => {
        const modeNames = ['flashcard', 'quiz'];
        const isActive = modeNames[idx] === mode;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive);
    });
    
    saveProgress();
    renderCard();
}

// 카드 렌더링
function renderCard() {
    if (!data || data.length === 0) {
        document.getElementById('content').innerHTML = 
            '<p style="text-align: center; color: var(--error-color);">데이터를 불러올 수 없습니다.</p>';
        return;
    }
    
    // 랜덤 순서가 없으면 생성
    if (randomOrder.length === 0) {
        randomOrder = generateRandomOrder();
    }
    
    // 현재 인덱스가 유효한지 확인
    if (currentIndex < 0 || currentIndex >= data.length) {
        currentIndex = randomOrder[0] || 0;
    }
    
    const item = data[currentIndex];
    const currentPos = randomOrder.indexOf(currentIndex);
    const displayNumber = currentPos >= 0 ? currentPos + 1 : 1;
    document.getElementById('progress').textContent = `${displayNumber} / ${data.length}`;
    
    // 학습한 카드로 표시
    quizStats.studiedCards.add(currentIndex);
    
    if (currentMode === 'flashcard') {
        renderFlashcard(item);
    } else if (currentMode === 'quiz') {
        renderQuiz(item);
    }
    
    updateButtons();
    updateStats();
    saveProgress();
}

// 플래시카드 렌더링
function renderFlashcard(item) {
    const content = document.getElementById('content');
    const explanationSection = document.getElementById('explanation-section');
    const keyExpr = item.keyExpression || extractKeyExpression(item.sentence);
    
    // 학습 상태 정보 가져오기
    const wordData = wordLearningData[currentIndex];
    const learningStatus = getLearningStatusDisplay(wordData);
    
    // 카드 부분 - 간단하게 문장과 번역만
    content.innerHTML = `
        <div class="flashcard-wrapper">
            <div class="flashcard ${isFlipped ? 'flipped' : ''}" onclick="flipCard()" role="button" tabindex="0" 
                 onkeypress="if(event.key==='Enter'||event.key===' ') flipCard()" aria-label="카드 뒤집기">
                <div class="flashcard-inner">
                    <div class="flashcard-front">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; width: 100%; flex-wrap: wrap; gap: 8px;">
                            <div class="difficulty-tag">${escapeHtml(item.difficulty)}</div>
                            <div style="flex-shrink: 0;">${learningStatus}</div>
                        </div>
                        <div class="sentence">${escapeHtml(item.sentence)}</div>
                        <div class="source">— ${escapeHtml(item.source.title)}</div>
                        <div class="hint">클릭하여 번역 확인하기</div>
                    </div>
                    <div class="flashcard-back">
                        <div class="meaning">${escapeHtml(item.natural_korean)}</div>
                        <div class="hint">클릭하여 원문으로 돌아가기</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 해설 부분 - 카드와 완전히 분리
    explanationSection.innerHTML = `
        <div class="explanation-container">
            <div class="explanation-header">
                <h3>📖 상세 해설</h3>
                <button class="explanation-toggle" onclick="toggleExplanation()" aria-label="해설 보기/숨기기">
                    <span id="explanationToggleIcon">▼</span>
                </button>
            </div>
            <div class="explanation-content" id="explanationContent">
                <div class="explanation-item">
                    <h4>📝 핵심 표현</h4>
                    <p class="key-expression"><strong>${escapeHtml(keyExpr)}</strong></p>
                    <p>${escapeHtml(item.native_core_meaning)}</p>
                </div>
                <div class="explanation-item">
                    <h4>🔍 구조 분석</h4>
                    <p>${escapeHtml(item.step_by_step.structure)}</p>
                </div>
                <div class="explanation-item">
                    <h4>💡 표현 설명</h4>
                    <p>${escapeHtml(item.step_by_step.expressions)}</p>
                </div>
            </div>
        </div>
    `;
    
    // 카드를 뒤집었을 때만 해설 표시
    if (isFlipped) {
        explanationSection.style.display = 'block';
    } else {
        explanationSection.style.display = 'none';
    }
}

// 해설 토글
function toggleExplanation() {
    const content = document.getElementById('explanationContent');
    const icon = document.getElementById('explanationToggleIcon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▼';
    } else {
        content.style.display = 'none';
        icon.textContent = '▶';
    }
}

// 퀴즈 렌더링 - 단어 연상 빈칸 채우기 퀴즈
function renderQuiz(item) {
    const content = document.getElementById('content');
    const explanationSection = document.getElementById('explanation-section');
    
    // 해설 섹션 숨기기
    if (explanationSection) {
        explanationSection.style.display = 'none';
    }
    
    // 핵심 표현 추출
    const keyExpr = item.keyExpression || extractKeyExpression(item.sentence);
    
    if (!keyExpr || keyExpr.length === 0) {
        content.innerHTML = '<p style="text-align: center; color: #f56565;">퀴즈를 생성할 수 없습니다.</p>';
        return;
    }
    
    // 단어 연상 빈칸 채우기 퀴즈 렌더링
    renderWordAssociationQuiz(item, keyExpr);
}

// 영어 교사 관점에서 의미적으로 유사한 보기 생성
function generateSmartOptions(currentItem, correctExpr) {
    // 1. 같은 태그를 가진 표현들 (의미적으로 유사)
    const sameTagExpressions = data
        .filter((d, i) => i !== currentIndex && d.tags && currentItem.tags)
        .filter(d => {
            const commonTags = d.tags.filter(tag => currentItem.tags.includes(tag));
            return commonTags.length > 0;
        })
        .map(d => d.keyExpression || extractKeyExpression(d.sentence))
        .filter(expr => expr && expr.length > 0 && expr !== correctExpr);
    
    // 2. 같은 난이도를 가진 표현들
    const sameDifficultyExpressions = data
        .filter((d, i) => i !== currentIndex && d.difficulty === currentItem.difficulty)
        .map(d => d.keyExpression || extractKeyExpression(d.sentence))
        .filter(expr => expr && expr.length > 0 && expr !== correctExpr);
    
    // 3. 비슷한 길이의 표현들 (단어 수 기준)
    const correctWordCount = correctExpr.split(/\s+/).length;
    const similarLengthExpressions = data
        .filter((d, i) => i !== currentIndex)
        .map(d => ({
            expr: d.keyExpression || extractKeyExpression(d.sentence),
            wordCount: (d.keyExpression || extractKeyExpression(d.sentence)).split(/\s+/).length
        }))
        .filter(obj => obj.expr && obj.expr.length > 0 && obj.expr !== correctExpr)
        .filter(obj => Math.abs(obj.wordCount - correctWordCount) <= 2) // ±2 단어 차이
        .map(obj => obj.expr);
    
    // 4. 비슷한 단어를 포함한 표현들
    const correctWords = correctExpr.toLowerCase().split(/\s+/);
    const similarWordExpressions = data
        .filter((d, i) => i !== currentIndex)
        .map(d => {
            const expr = d.keyExpression || extractKeyExpression(d.sentence);
            if (!expr || expr === correctExpr) return null;
            const exprWords = expr.toLowerCase().split(/\s+/);
            const commonWords = correctWords.filter(w => exprWords.includes(w));
            return { expr, commonWords: commonWords.length };
        })
        .filter(obj => obj && obj.commonWords > 0)
        .sort((a, b) => b.commonWords - a.commonWords)
        .map(obj => obj.expr);
    
    // 우선순위: 같은 태그 > 같은 난이도 > 비슷한 길이 > 비슷한 단어
    const allOptions = [
        ...sameTagExpressions.slice(0, 2),
        ...sameDifficultyExpressions.filter(e => !sameTagExpressions.includes(e)).slice(0, 1),
        ...similarLengthExpressions.filter(e => !sameTagExpressions.includes(e) && !sameDifficultyExpressions.includes(e)).slice(0, 1),
        ...similarWordExpressions.filter(e => !sameTagExpressions.includes(e) && !sameDifficultyExpressions.includes(e) && !similarLengthExpressions.includes(e)).slice(0, 1)
    ];
    
    // 중복 제거 및 최대 3개 선택
    const uniqueOptions = [...new Set(allOptions)];
    
    // 부족하면 랜덤으로 채우기
    if (uniqueOptions.length < 3) {
        const randomOptions = data
            .filter((d, i) => i !== currentIndex)
            .map(d => d.keyExpression || extractKeyExpression(d.sentence))
            .filter(expr => expr && expr.length > 0 && expr !== correctExpr && !uniqueOptions.includes(expr))
            .sort(() => 0.5 - Math.random())
            .slice(0, 3 - uniqueOptions.length);
        
        uniqueOptions.push(...randomOptions);
    }
    
    return uniqueOptions.slice(0, 3);
}

// 단어 연상 빈칸 채우기 퀴즈 (의미 설명을 보고 빈칸 채우기)
function renderWordAssociationQuiz(item, keyExpr) {
    const content = document.getElementById('content');
    
    // 문장에서 핵심 표현을 빈칸으로 대체
    const sentence = item.sentence;
    const blankPlaceholder = '______';
    
    // 여러 방법으로 빈칸 생성 시도
    let finalSentence = '';
    
    // 방법 1: 전체 핵심 표현을 빈칸으로
    if (keyExpr && keyExpr.trim().length > 0) {
        try {
            const regex1 = new RegExp(escapeRegex(keyExpr), 'gi');
            if (regex1.test(sentence)) {
                finalSentence = sentence.replace(regex1, blankPlaceholder);
            }
        } catch (e) {
            console.warn('정규식 생성 실패:', e);
        }
    }
    
    // 방법 2: 실패하면 핵심 표현의 주요 단어들로 시도
    if (!finalSentence || !finalSentence.includes(blankPlaceholder)) {
        const keyWords = keyExpr.split(/\s+/).filter(w => w && w.length > 2);
        if (keyWords.length > 0) {
            // 가장 긴 단어부터 시도
            keyWords.sort((a, b) => b.length - a.length);
            for (const word of keyWords) {
                try {
                    const wordRegex = new RegExp('\\b' + escapeRegex(word) + '\\b', 'gi');
                    if (wordRegex.test(sentence)) {
                        finalSentence = sentence.replace(wordRegex, blankPlaceholder);
                        break;
                    }
                } catch (e) {
                    console.warn('단어 정규식 생성 실패:', e);
                    continue;
                }
            }
        }
    }
    
    // 방법 3: 여전히 실패하면 핵심 표현의 첫 단어 사용
    if (!finalSentence || !finalSentence.includes(blankPlaceholder)) {
        const firstWord = keyExpr.split(/\s+/).filter(w => w && w.length > 0)[0];
        if (firstWord) {
            try {
                const firstWordRegex = new RegExp('\\b' + escapeRegex(firstWord) + '\\b', 'gi');
                finalSentence = sentence.replace(firstWordRegex, blankPlaceholder);
            } catch (e) {
                console.warn('첫 단어 정규식 생성 실패:', e);
            }
        }
    }
    
    // 최종적으로 빈칸이 없으면 원문 그대로 사용 (fallback)
    if (!finalSentence || !finalSentence.includes(blankPlaceholder)) {
        finalSentence = sentence;
    }
    
    // 영어 교사 관점에서 의미적으로 유사한 보기 생성
    const otherExpressions = generateSmartOptions(item, keyExpr);
    
    const options = [...otherExpressions, keyExpr]
        .filter(opt => opt && opt.length > 0)
        .sort(() => 0.5 - Math.random());
    
    if (options.length === 0) {
        content.innerHTML = '<p style="text-align: center; color: #f56565;">퀴즈를 생성할 수 없습니다.</p>';
        return;
    }
    
    // 빈칸을 시각적으로 강조하기 위해 스타일 적용
    const sentenceWithStyledBlank = escapeHtml(finalSentence).replace(
        /______/g,
        '<span class="quiz-blank" style="display: inline-block; padding: 4px 12px; margin: 0 4px; background: linear-gradient(135deg, var(--primary-color), var(--accent-color)); color: white; border-radius: 6px; font-weight: 600; font-size: 1.1em; min-width: 120px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">______</span>'
    );
    
    renderQuizContent(content, item, options, keyExpr, `
        <div class="difficulty-tag">${escapeHtml(item.difficulty)}</div>
        <div style="background: var(--card-bg); padding: var(--spacing-lg); border-radius: 12px; margin-bottom: 25px; border-left: 4px solid var(--primary-color);">
            <p style="font-size: 1.1em; color: var(--text-secondary); margin-bottom: 15px; font-weight: 600;">
                💡 표현의 의미:
            </p>
            <p style="font-size: 1.15rem; line-height: 1.7; color: var(--text-primary);">
                ${escapeHtml(item.native_core_meaning)}
            </p>
        </div>
        <div class="sentence quiz-sentence" style="margin-bottom: 30px; line-height: 1.8;">
            ${sentenceWithStyledBlank}
        </div>
        <p style="font-size: 1.1em; color: var(--text-secondary); margin-bottom: 20px; font-weight: 600; text-align: center;">
            위 의미에 맞는 표현으로 빈칸을 채우세요
        </p>
    `);
}

// 공통 퀴즈 콘텐츠 렌더링
function renderQuizContent(content, item, options, keyExpr, questionHtml) {
    // 전체 HTML 구조 생성
    const container = document.createElement('div');
    container.innerHTML = questionHtml;
    
    // 퀴즈 옵션 컨테이너 생성
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'quiz-options';
    optionsContainer.setAttribute('role', 'radiogroup');
    
    // 각 옵션 버튼 생성
    options.forEach((opt, i) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.setAttribute('data-option', escapeHtml(opt));
        button.setAttribute('aria-label', `선택지 ${i + 1}: ${escapeHtml(opt)}`);
        
        const span = document.createElement('span');
        span.textContent = opt;
        button.appendChild(span);
        
        // 이벤트 리스너로 안전하게 연결
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('버튼 클릭됨:', opt); // 디버깅용
            if (typeof selectAnswer === 'function') {
                selectAnswer(opt, keyExpr);
            } else {
                console.error('selectAnswer 함수를 찾을 수 없습니다');
            }
        });
        
        optionsContainer.appendChild(button);
    });
    
    // 피드백 영역 생성
    const feedbackDiv = document.createElement('div');
    feedbackDiv.id = 'feedback';
    
    // 컨테이너에 추가
    container.appendChild(optionsContainer);
    container.appendChild(feedbackDiv);
    
    // content에 설정
    content.innerHTML = '';
    content.appendChild(container);
    
    selectedAnswer = null;
}

// 핵심 표현 추출
function extractKeyExpression(sentence) {
    if (!sentence) return '';
    
    const patterns = [
        /at (one's|her|his|my|your) wit's end/i,
        /from a bar of soap/i,
        /wade through/i,
        /end up \w+ing/i,
        /so .+ as to/i,
        /put in/i,
        /duty-free/i,
        /bargain price/i,
        /tipsy swoon/i,
        /dopey,? bovine/i
    ];
    
    for (let pattern of patterns) {
        const match = sentence.match(pattern);
        if (match) return match[0];
    }
    
    // 패턴이 없으면 짧은 구문 찾기
    const words = sentence.split(' ');
    if (words.length > 3) {
        return words.slice(0, 4).join(' ') + '...';
    }
    return sentence;
}

// 카드 뒤집기
function flipCard() {
    isFlipped = !isFlipped;
    const flashcard = document.querySelector('.flashcard');
    const explanationSection = document.getElementById('explanation-section');
    
    if (flashcard) {
        flashcard.classList.toggle('flipped', isFlipped);
    }
    
    // 카드를 뒤집었을 때만 해설 표시
    if (explanationSection) {
        if (isFlipped) {
            explanationSection.style.display = 'block';
            // 해설 내용이 보이도록 설정
            const explanationContent = document.getElementById('explanationContent');
            if (explanationContent) {
                explanationContent.style.display = 'block';
                const icon = document.getElementById('explanationToggleIcon');
                if (icon) {
                    icon.textContent = '▼';
                }
            }
        } else {
            explanationSection.style.display = 'none';
        }
    }
}

// 답 선택
function selectAnswer(selected, correct) {
    if (selectedAnswer) return; // 이미 답을 선택함
    
    if (!selected || !correct) {
        console.error('selectAnswer: selected 또는 correct가 없습니다');
        return;
    }
    
    // HTML 디코딩 (비교를 위해)
    const selectedDecoded = decodeHtml(selected);
    const correctDecoded = decodeHtml(correct);
    
    selectedAnswer = selectedDecoded;
    const buttons = document.querySelectorAll('.option-btn');
    const feedback = document.getElementById('feedback');
    
    if (!feedback) {
        console.error('피드백 요소를 찾을 수 없습니다');
        return;
    }
    
    // 통계 업데이트
    quizStats.total++;
    const isCorrect = selectedDecoded === correctDecoded;
    if (isCorrect) {
        quizStats.correct++;
    }
    
    // 간격 반복 학습 시스템 업데이트 (에러 방지)
    try {
        if (typeof updateWordLearning === 'function') {
            updateWordLearning(currentIndex, isCorrect);
        }
    } catch (e) {
        console.warn('학습 데이터 업데이트 실패:', e);
    }
    
    buttons.forEach(btn => {
        const option = btn.getAttribute('data-option');
        if (!option) return;
        
        btn.disabled = true;
        
        // HTML 엔티티 디코딩하여 비교
        const optionDecoded = decodeHtml(option);
        
        if (optionDecoded === correctDecoded) {
            btn.classList.add('correct');
        } else if (optionDecoded === selectedDecoded && selectedDecoded !== correctDecoded) {
            btn.classList.add('wrong');
        }
    });
    
    // 현재 아이템 가져오기
    if (!data || !Array.isArray(data) || currentIndex < 0 || currentIndex >= data.length) {
        console.error('유효하지 않은 데이터 또는 인덱스');
        return;
    }
    
    const item = data[currentIndex];
    
    if (!item) {
        console.error('아이템을 찾을 수 없습니다');
        feedback.innerHTML = '<div class="feedback wrong" role="alert">오류가 발생했습니다.</div>';
        return;
    }
    
    if (isCorrect) {
        feedback.innerHTML = `
            <div class="feedback correct" role="alert">
                <div style="font-size: 1.5em; margin-bottom: 10px;">✓ 정답입니다!</div>
                <div style="font-weight: normal; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2);">
                    <strong>의미:</strong> ${escapeHtml(item.native_core_meaning || '')}
                </div>
                <div style="font-weight: normal; margin-top: 10px; font-style: italic; opacity: 0.9;">
                    ${escapeHtml(item.natural_korean || '')}
                </div>
            </div>
        `;
    } else {
        feedback.innerHTML = `
            <div class="feedback wrong" role="alert">
                <div style="font-size: 1.5em; margin-bottom: 10px;">✗ 틀렸습니다</div>
                <div style="font-weight: normal; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2);">
                    <strong>정답:</strong> <span style="color: #4ade80; font-weight: 600;">${escapeHtml(correctDecoded)}</span>
                </div>
                <div style="font-weight: normal; margin-top: 10px;">
                    <strong>의미:</strong> ${escapeHtml(item.native_core_meaning || '')}
                </div>
                <div style="font-weight: normal; margin-top: 10px; font-style: italic; opacity: 0.9;">
                    ${escapeHtml(item.natural_korean || '')}
                </div>
            </div>
        `;
    }
    
    updateStats();
    saveProgress();
}

// 이전 카드 (랜덤 순서)
function previousCard() {
    if (randomOrder.length === 0) {
        randomOrder = generateRandomOrder();
    }
    
    const currentPos = randomOrder.indexOf(currentIndex);
    let prevIndex = -1;
    
    if (currentPos > 0) {
        prevIndex = randomOrder[currentPos - 1];
    } else if (randomOrder.length > 0) {
        // 첫 번째면 마지막으로 순환
        prevIndex = randomOrder[randomOrder.length - 1];
    }
    
    if (prevIndex >= 0) {
        currentIndex = prevIndex;
        isFlipped = false;
        selectedAnswer = null;
        const explanationSection = document.getElementById('explanation-section');
        if (explanationSection) {
            explanationSection.style.display = 'none';
        }
        renderCard();
    }
}

// 다음 카드 (랜덤 순서)
function nextCard() {
    if (randomOrder.length === 0) {
        randomOrder = generateRandomOrder();
    }
    
    const currentPos = randomOrder.indexOf(currentIndex);
    let nextIndex = -1;
    
    if (currentPos >= 0 && currentPos < randomOrder.length - 1) {
        nextIndex = randomOrder[currentPos + 1];
    } else if (randomOrder.length > 0) {
        // 마지막이면 처음으로 순환하거나 새로운 랜덤 순서 생성
        randomOrder = generateRandomOrder();
        nextIndex = randomOrder[0];
    }
    
    if (nextIndex >= 0) {
        currentIndex = nextIndex;
        isFlipped = false;
        selectedAnswer = null;
        const explanationSection = document.getElementById('explanation-section');
        if (explanationSection) {
            explanationSection.style.display = 'none';
        }
        renderCard();
    }
}

// 버튼 상태 업데이트
function updateButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (randomOrder.length === 0) {
        randomOrder = generateRandomOrder();
    }
    
    const currentPos = randomOrder.indexOf(currentIndex);
    
    // 랜덤 순서에서는 항상 버튼 활성화 (순환)
    if (prevBtn) {
        prevBtn.disabled = false;
    }
    if (nextBtn) {
        nextBtn.disabled = false;
    }
}

// HTML 이스케이프
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// HTML 디코딩
function decodeHtml(html) {
    if (!html) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

// 정규식 이스케이프
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ========== 간격 반복 학습 시스템 ==========

// 단어 학습 상태 업데이트
function updateWordLearning(wordIndex, isCorrect) {
    if (!wordLearningData[wordIndex]) {
        wordLearningData[wordIndex] = {
            level: 0,
            nextReview: Date.now(),
            correctCount: 0,
            wrongCount: 0,
            lastStudied: Date.now(),
            mastery: false
        };
    }
    
    const wordData = wordLearningData[wordIndex];
    wordData.lastStudied = Date.now();
    
    if (isCorrect) {
        wordData.correctCount++;
        // 정답이면 레벨 상승
        if (wordData.level < SPACED_REPETITION_INTERVALS.length - 1) {
            wordData.level++;
        }
    } else {
        wordData.wrongCount++;
        // 오답이면 레벨 하향 (최소 0)
        if (wordData.level > 0) {
            wordData.level = Math.max(0, wordData.level - 1);
        }
    }
    
    // 다음 복습 시간 계산 (일 단위)
    const daysUntilReview = SPACED_REPETITION_INTERVALS[wordData.level];
    wordData.nextReview = Date.now() + (daysUntilReview * 24 * 60 * 60 * 1000);
    
    // 완전 암기 여부
    wordData.mastery = wordData.level >= MASTERY_THRESHOLD && wordData.correctCount >= 3;
    
    // 저장
    saveWordLearningData();
    updateAchievementData();
}

// 단어 학습 데이터 저장
function saveWordLearningData() {
    try {
        localStorage.setItem('wordLearningData', JSON.stringify(wordLearningData));
    } catch (e) {
        console.warn('단어 학습 데이터 저장 실패:', e);
    }
}

// 오늘 복습해야 할 단어 목록 가져오기
function getWordsToReview() {
    const now = Date.now();
    return data
        .map((item, index) => ({ item, index }))
        .filter(({ index }) => {
            const wordData = wordLearningData[index];
            if (!wordData) return true; // 아직 학습하지 않은 단어
            return now >= wordData.nextReview; // 복습 시간이 된 단어
        })
        .map(({ index }) => index);
}

// 어려운 단어 목록 가져오기 (틀린 횟수가 많은 순)
function getDifficultWords(limit = 10) {
    return Object.entries(wordLearningData)
        .filter(([index, data]) => data.wrongCount > 0)
        .sort((a, b) => {
            // 틀린 횟수 우선, 그 다음 정답률
            const wrongDiff = b[1].wrongCount - a[1].wrongCount;
            if (wrongDiff !== 0) return wrongDiff;
            const accuracyA = a[1].correctCount / (a[1].correctCount + a[1].wrongCount);
            const accuracyB = b[1].correctCount / (b[1].correctCount + b[1].wrongCount);
            return accuracyA - accuracyB;
        })
        .slice(0, limit)
        .map(([index]) => parseInt(index));
}

// 완전 암기한 단어 목록
function getMasteredWords() {
    return Object.entries(wordLearningData)
        .filter(([index, data]) => data.mastery)
        .map(([index]) => parseInt(index));
}

// 학습 목표 및 성취 데이터
let achievementData = {
    dailyGoal: 10, // 하루 목표 단어 수
    todayStudied: 0,
    todayDate: new Date().toDateString(),
    streakDays: 0, // 연속 학습일
    lastStudyDate: null,
    totalWordsMastered: 0,
    totalStudyDays: 0
};

// 성취 데이터 불러오기
function loadAchievementData() {
    try {
        const saved = localStorage.getItem('achievementData');
        if (saved) {
            achievementData = JSON.parse(saved);
            
            // 날짜가 바뀌었는지 확인
            const today = new Date().toDateString();
            if (achievementData.todayDate !== today) {
                // 연속 학습일 체크
                const lastDate = achievementData.lastStudyDate ? new Date(achievementData.lastStudyDate) : null;
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                
                if (lastDate && lastDate.toDateString() === yesterday.toDateString()) {
                    achievementData.streakDays++;
                } else if (lastDate && lastDate.toDateString() !== today) {
                    achievementData.streakDays = 0; // 연속이 끊김
                }
                
                achievementData.todayDate = today;
                achievementData.todayStudied = 0;
                saveAchievementData();
            }
        }
    } catch (e) {
        console.warn('성취 데이터 불러오기 실패:', e);
    }
}

// 성취 데이터 저장
function saveAchievementData() {
    try {
        localStorage.setItem('achievementData', JSON.stringify(achievementData));
    } catch (e) {
        console.warn('성취 데이터 저장 실패:', e);
    }
}

// 성취 데이터 업데이트
function updateAchievementData() {
    const today = new Date().toDateString();
    if (achievementData.todayDate === today) {
        achievementData.todayStudied++;
    } else {
        achievementData.todayDate = today;
        achievementData.todayStudied = 1;
    }
    
    achievementData.lastStudyDate = new Date().toISOString();
    achievementData.totalWordsMastered = getMasteredWords().length;
    
    saveAchievementData();
    updateStats();
}

// 학습 상태 표시 HTML 생성
function getLearningStatusDisplay(wordData) {
    if (!wordData) {
        return '<span style="font-size: 0.85rem; color: var(--text-tertiary); padding: 4px 8px; background: var(--card-bg); border-radius: 6px;">🆕 새 단어</span>';
    }
    
    const level = wordData.level || 0;
    const mastery = wordData.mastery;
    const correctCount = wordData.correctCount || 0;
    const wrongCount = wordData.wrongCount || 0;
    
    let statusText = '';
    let statusColor = '';
    
    if (mastery) {
        statusText = '✅ 완전 암기';
        statusColor = '#10b981';
    } else if (level >= 3) {
        statusText = `📚 레벨 ${level}`;
        statusColor = '#3b82f6';
    } else if (level >= 1) {
        statusText = `📖 레벨 ${level}`;
        statusColor = '#f59e0b';
    } else {
        statusText = '🔄 학습 중';
        statusColor = '#ef4444';
    }
    
    return `<span style="font-size: 0.85rem; color: white; padding: 4px 8px; background: ${statusColor}; border-radius: 6px; font-weight: 500;">
        ${statusText} (✓${correctCount} ✗${wrongCount})
    </span>`;
}

// 키보드 단축키
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        previousCard();
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextCard();
    } else if (e.key === ' ' || e.key === 'Enter') {
        if (currentMode === 'flashcard') {
            e.preventDefault();
            flipCard();
        }
    }
});

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    if (typeof data === 'undefined' || !data || data.length === 0) {
        console.error('데이터를 불러올 수 없습니다.');
        document.getElementById('content').innerHTML = 
            '<p style="text-align: center; color: #f56565;">데이터를 불러올 수 없습니다. data.js 파일을 확인해주세요.</p>';
        return;
    }
    
    // 초기 랜덤 순서 생성
    randomOrder = generateRandomOrder();
    
    loadProgress();
    renderCard();
});

