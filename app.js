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

// 퀴즈 렌더링
function renderQuiz(item) {
    const content = document.getElementById('content');
    const explanationSection = document.getElementById('explanation-section');
    
    // 해설 섹션 숨기기
    explanationSection.style.display = 'none';
    
    // 핵심 표현 추출
    const keyExpr = item.keyExpression || extractKeyExpression(item.sentence);
    
    // 퀴즈에서는 하이라이트하지 않고 원문 그대로 표시
    const sentence = escapeHtml(item.sentence);
    
    // 오답 생성 (다른 문장들의 핵심 표현)
    const otherExpressions = data
        .filter((_, i) => i !== currentIndex)
        .map(d => d.keyExpression || extractKeyExpression(d.sentence))
        .filter(expr => expr && expr.length > 0)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
    
    const options = [...otherExpressions, keyExpr]
        .filter(opt => opt && opt.length > 0)
        .sort(() => 0.5 - Math.random());
    
    if (options.length === 0) {
        content.innerHTML = '<p style="text-align: center; color: #f56565;">퀴즈를 생성할 수 없습니다.</p>';
        return;
    }
    
    content.innerHTML = `
        <div>
            <div class="difficulty-tag">${escapeHtml(item.difficulty)}</div>
            <div class="sentence" style="margin-bottom: 30px;">${sentence}</div>
            <p style="font-size: 1.1em; color: var(--text-secondary); margin-bottom: 15px; font-weight: 600;">
                이 문장의 핵심 표현은 무엇일까요?
            </p>
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
    
    if (isCorrect) {
        feedback.innerHTML = `
            <div class="feedback correct" role="alert">
                <div style="font-size: 1.5em; margin-bottom: 10px;">✓ 정답!</div>
                <div style="font-weight: normal; margin-top: 10px;">${escapeHtml(item.native_core_meaning)}</div>
            </div>
        `;
    } else {
        feedback.innerHTML = `
            <div class="feedback wrong" role="alert">
                <div style="font-size: 1.5em; margin-bottom: 10px;">✗ 오답</div>
                <div style="font-weight: normal; margin-top: 10px;">정답: <strong>${escapeHtml(correctDecoded)}</strong></div>
                <div style="font-weight: normal; margin-top: 5px;">${escapeHtml(item.native_core_meaning)}</div>
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

