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

// 모드 변경
function setMode(mode) {
    if (!data || data.length === 0) {
        console.error('데이터를 불러올 수 없습니다.');
        return;
    }
    
    currentMode = mode;
    currentIndex = 0;
    isFlipped = false;
    selectedAnswer = null;
    
    // 모드 버튼 상태 업데이트
    document.querySelectorAll('.mode-btn').forEach((btn, idx) => {
        const isActive = (idx === 0 && mode === 'flashcard') || (idx === 1 && mode === 'quiz');
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
    
    if (currentIndex < 0 || currentIndex >= data.length) {
        currentIndex = 0;
    }
    
    const item = data[currentIndex];
    document.getElementById('progress').textContent = `${currentIndex + 1} / ${data.length}`;
    
    // 학습한 카드로 표시
    quizStats.studiedCards.add(currentIndex);
    
    if (currentMode === 'flashcard') {
        renderFlashcard(item);
    } else {
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
    
    // 카드 부분 - 간단하게 문장과 번역만
    content.innerHTML = `
        <div class="flashcard-wrapper">
            <div class="flashcard ${isFlipped ? 'flipped' : ''}" onclick="flipCard()" role="button" tabindex="0" 
                 onkeypress="if(event.key==='Enter'||event.key===' ') flipCard()" aria-label="카드 뒤집기">
                <div class="flashcard-inner">
                    <div class="flashcard-front">
                        <div class="difficulty-tag">${escapeHtml(item.difficulty)}</div>
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

// 퀴즈 유형 선택 (랜덤)
function getQuizType() {
    const types = ['fillBlank', 'context', 'translation'];
    return types[Math.floor(Math.random() * types.length)];
}

// 퀴즈 렌더링 - 다양한 유형 지원
function renderQuiz(item) {
    const content = document.getElementById('content');
    const explanationSection = document.getElementById('explanation-section');
    
    // 해설 섹션 숨기기
    explanationSection.style.display = 'none';
    
    // 핵심 표현 추출
    const keyExpr = item.keyExpression || extractKeyExpression(item.sentence);
    
    if (!keyExpr || keyExpr.length === 0) {
        content.innerHTML = '<p style="text-align: center; color: #f56565;">퀴즈를 생성할 수 없습니다.</p>';
        return;
    }
    
    // 퀴즈 유형 선택
    const quizType = getQuizType();
    
    if (quizType === 'fillBlank') {
        renderFillBlankQuiz(item, keyExpr);
    } else if (quizType === 'context') {
        renderContextQuiz(item, keyExpr);
    } else {
        renderTranslationQuiz(item, keyExpr);
    }
}

// 빈칸 채우기 퀴즈
function renderFillBlankQuiz(item, keyExpr) {
    const content = document.getElementById('content');
    
    // 문장에서 핵심 표현을 빈칸으로 대체
    const sentence = item.sentence;
    const blankPlaceholder = '______';
    
    // 여러 방법으로 빈칸 생성 시도
    let finalSentence = '';
    
    // 방법 1: 전체 핵심 표현을 빈칸으로
    const regex1 = new RegExp(escapeRegex(keyExpr), 'gi');
    if (regex1.test(sentence)) {
        finalSentence = sentence.replace(regex1, blankPlaceholder);
    }
    
    // 방법 2: 실패하면 핵심 표현의 주요 단어들로 시도
    if (!finalSentence || !finalSentence.includes(blankPlaceholder)) {
        const keyWords = keyExpr.split(/\s+/).filter(w => w.length > 2);
        if (keyWords.length > 0) {
            // 가장 긴 단어부터 시도
            keyWords.sort((a, b) => b.length - a.length);
            for (const word of keyWords) {
                const wordRegex = new RegExp('\\b' + escapeRegex(word) + '\\b', 'gi');
                if (wordRegex.test(sentence)) {
                    finalSentence = sentence.replace(wordRegex, blankPlaceholder);
                    break;
                }
            }
        }
    }
    
    // 방법 3: 여전히 실패하면 핵심 표현의 첫 단어 사용
    if (!finalSentence || !finalSentence.includes(blankPlaceholder)) {
        const firstWord = keyExpr.split(/\s+/)[0];
        if (firstWord) {
            const firstWordRegex = new RegExp('\\b' + escapeRegex(firstWord) + '\\b', 'gi');
            finalSentence = sentence.replace(firstWordRegex, blankPlaceholder);
        }
    }
    
    // 최종적으로 빈칸이 없으면 원문 그대로 사용 (fallback)
    if (!finalSentence || !finalSentence.includes(blankPlaceholder)) {
        finalSentence = sentence;
    }
    
    // 오답 생성 (다른 문장들의 핵심 표현 또는 유사한 표현)
    const otherExpressions = data
        .filter((_, i) => i !== currentIndex)
        .map(d => d.keyExpression || extractKeyExpression(d.sentence))
        .filter(expr => expr && expr.length > 0 && expr !== keyExpr)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
    
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
        <div class="sentence quiz-sentence" style="margin-bottom: 30px; line-height: 1.8;">
            ${sentenceWithStyledBlank}
        </div>
        <p style="font-size: 1.1em; color: var(--text-secondary); margin-bottom: 20px; font-weight: 600; text-align: center;">
            빈칸에 들어갈 적절한 표현을 선택하세요
        </p>
    `);
}

// 문맥 이해 퀴즈 (한국어 번역을 보고 적절한 영어 표현 선택)
function renderContextQuiz(item, keyExpr) {
    const content = document.getElementById('content');
    
    // 오답 생성
    const otherExpressions = data
        .filter((_, i) => i !== currentIndex)
        .map(d => d.keyExpression || extractKeyExpression(d.sentence))
        .filter(expr => expr && expr.length > 0 && expr !== keyExpr)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
    
    const options = [...otherExpressions, keyExpr]
        .filter(opt => opt && opt.length > 0)
        .sort(() => 0.5 - Math.random());
    
    if (options.length === 0) {
        content.innerHTML = '<p style="text-align: center; color: #f56565;">퀴즈를 생성할 수 없습니다.</p>';
        return;
    }
    
    renderQuizContent(content, item, options, keyExpr, `
        <div class="difficulty-tag">${escapeHtml(item.difficulty)}</div>
        <div style="background: var(--card-bg); padding: var(--spacing-lg); border-radius: 12px; margin-bottom: 25px; border-left: 4px solid var(--primary-color);">
            <p style="font-size: 1.1em; color: var(--text-secondary); margin-bottom: 15px; font-weight: 600;">
                📖 한국어 번역:
            </p>
            <p style="font-size: 1.15rem; line-height: 1.7; color: var(--text-primary); font-style: italic;">
                "${escapeHtml(item.natural_korean)}"
            </p>
        </div>
        <p style="font-size: 1.1em; color: var(--text-secondary); margin-bottom: 20px; font-weight: 600; text-align: center;">
            위 번역에 해당하는 영어 문장의 핵심 표현은?
        </p>
        <div style="background: var(--card-bg); padding: var(--spacing-md); border-radius: 8px; margin-bottom: 20px; opacity: 0.8;">
            <p style="font-size: 0.95rem; color: var(--text-tertiary); text-align: center;">
                ${escapeHtml(item.sentence)}
            </p>
        </div>
    `);
}

// 번역 기반 퀴즈 (핵심 표현의 의미를 보고 선택)
function renderTranslationQuiz(item, keyExpr) {
    const content = document.getElementById('content');
    
    // 오답 생성
    const otherExpressions = data
        .filter((_, i) => i !== currentIndex)
        .map(d => d.keyExpression || extractKeyExpression(d.sentence))
        .filter(expr => expr && expr.length > 0 && expr !== keyExpr)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
    
    const options = [...otherExpressions, keyExpr]
        .filter(opt => opt && opt.length > 0)
        .sort(() => 0.5 - Math.random());
    
    if (options.length === 0) {
        content.innerHTML = '<p style="text-align: center; color: #f56565;">퀴즈를 생성할 수 없습니다.</p>';
        return;
    }
    
    renderQuizContent(content, item, options, keyExpr, `
        <div class="difficulty-tag">${escapeHtml(item.difficulty)}</div>
        <div style="background: var(--card-bg); padding: var(--spacing-lg); border-radius: 12px; margin-bottom: 25px; border-left: 4px solid var(--accent-color);">
            <p style="font-size: 1.1em; color: var(--text-secondary); margin-bottom: 15px; font-weight: 600;">
                💡 표현의 의미:
            </p>
            <p style="font-size: 1.15rem; line-height: 1.7; color: var(--text-primary);">
                ${escapeHtml(item.native_core_meaning)}
            </p>
        </div>
        <p style="font-size: 1.1em; color: var(--text-secondary); margin-bottom: 20px; font-weight: 600; text-align: center;">
            위 의미에 해당하는 영어 표현을 선택하세요
        </p>
    `);
}

// 공통 퀴즈 콘텐츠 렌더링
function renderQuizContent(content, item, options, keyExpr, questionHtml) {
    content.innerHTML = `
        <div>
            ${questionHtml}
            <div class="quiz-options" role="radiogroup">
                ${options.map((opt, i) => `
                    <button class="option-btn" 
                            onclick="selectAnswer('${escapeHtml(opt).replace(/'/g, "\\'")}', '${escapeHtml(keyExpr).replace(/'/g, "\\'")}')" 
                            data-option="${escapeHtml(opt).replace(/"/g, '&quot;')}"
                            aria-label="선택지 ${i + 1}: ${escapeHtml(opt)}">
                        <span>${escapeHtml(opt)}</span>
                    </button>
                `).join('')}
            </div>
            <div id="feedback"></div>
        </div>
    `;
    
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
    
    // HTML 디코딩 (비교를 위해)
    const selectedDecoded = decodeHtml(selected);
    const correctDecoded = decodeHtml(correct);
    
    selectedAnswer = selectedDecoded;
    const buttons = document.querySelectorAll('.option-btn');
    const feedback = document.getElementById('feedback');
    
    // 통계 업데이트
    quizStats.total++;
    const isCorrect = selectedDecoded === correctDecoded;
    if (isCorrect) {
        quizStats.correct++;
    }
    
    buttons.forEach(btn => {
        const option = btn.getAttribute('data-option');
        btn.disabled = true;
        
        // HTML 엔티티 디코딩하여 비교
        const optionDecoded = decodeHtml(option);
        
        if (optionDecoded === correctDecoded) {
            btn.classList.add('correct');
        } else if (optionDecoded === selectedDecoded && selectedDecoded !== correctDecoded) {
            btn.classList.add('wrong');
        }
    });
    
    const item = data[currentIndex];
    
    const item = data[currentIndex];
    
    if (isCorrect) {
        feedback.innerHTML = `
            <div class="feedback correct" role="alert">
                <div style="font-size: 1.5em; margin-bottom: 10px;">✓ 정답입니다!</div>
                <div style="font-weight: normal; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2);">
                    <strong>의미:</strong> ${escapeHtml(item.native_core_meaning)}
                </div>
                <div style="font-weight: normal; margin-top: 10px; font-style: italic; opacity: 0.9;">
                    ${escapeHtml(item.natural_korean)}
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
                    <strong>의미:</strong> ${escapeHtml(item.native_core_meaning)}
                </div>
                <div style="font-weight: normal; margin-top: 10px; font-style: italic; opacity: 0.9;">
                    ${escapeHtml(item.natural_korean)}
                </div>
            </div>
        `;
    }
    
    updateStats();
    saveProgress();
}

// 이전 카드
function previousCard() {
    if (currentIndex > 0) {
        currentIndex--;
        isFlipped = false;
        selectedAnswer = null;
        const explanationSection = document.getElementById('explanation-section');
        if (explanationSection) {
            explanationSection.style.display = 'none';
        }
        renderCard();
    }
}

// 다음 카드
function nextCard() {
    if (currentIndex < data.length - 1) {
        currentIndex++;
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
    
    if (prevBtn) {
        prevBtn.disabled = currentIndex === 0;
    }
    if (nextBtn) {
        nextBtn.disabled = currentIndex >= data.length - 1;
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
    
    loadProgress();
    renderCard();
});

