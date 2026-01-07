const state = {
    order: [],
    index: 0,
    selectedSpan: "",
    llmResult: null,
    checkpointIndex: 0,
    answers: {},
    isLoading: false
};

const elements = {
    sourceSentence: document.getElementById("sourceSentence"),
    cardCounter: document.getElementById("cardCounter"),
    selectedSpan: document.getElementById("selectedSpan"),
    checkpointPanel: document.getElementById("checkpointPanel"),
    statusMessage: document.getElementById("statusMessage"),
    userTranslation: document.getElementById("userTranslation"),
    finalPanel: document.getElementById("finalPanel"),
    finalSentence: document.getElementById("finalSentence"),
    finalCore: document.getElementById("finalCore"),
    finalCoach: document.getElementById("finalCoach"),
    finalUserTranslation: document.getElementById("finalUserTranslation"),
    apiKey: document.getElementById("apiKey"),
    model: document.getElementById("model"),
    saveSettings: document.getElementById("saveSettings"),
    captureSpan: document.getElementById("captureSpan"),
    generateCheckpoints: document.getElementById("generateCheckpoints"),
    nextSentence: document.getElementById("nextSentence"),
    revealFinal: document.getElementById("revealFinal")
};

function init() {
    if (!Array.isArray(data) || data.length === 0) {
        setStatus("문장 데이터가 없습니다.");
        return;
    }
    state.order = shuffle(Array.from({ length: data.length }, (_, i) => i));
    state.index = 0;
    loadSettings();
    bindEvents();
    renderSentence();
}

function bindEvents() {
    elements.saveSettings.addEventListener("click", saveSettings);
    elements.captureSpan.addEventListener("click", captureSpan);
    elements.generateCheckpoints.addEventListener("click", generateCheckpoints);
    elements.nextSentence.addEventListener("click", goNextSentence);
    elements.revealFinal.addEventListener("click", revealFinal);
}

function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function currentSentence() {
    return data[state.order[state.index]];
}

function renderSentence() {
    const item = currentSentence();
    state.selectedSpan = "";
    state.llmResult = null;
    state.checkpointIndex = 0;
    state.answers = {};
    elements.sourceSentence.textContent = item.source_sentence;
    elements.cardCounter.textContent = `${state.index + 1} / ${data.length}`;
    elements.selectedSpan.textContent = "선택한 막힘 없음";
    elements.userTranslation.value = "";
    elements.checkpointPanel.innerHTML = '<p class="placeholder">체크포인트를 생성하면 선택지가 표시됩니다.</p>';
    elements.finalPanel.style.display = "none";
    setStatus("");
}

function loadSettings() {
    const savedKey = localStorage.getItem("loopbackApiKey");
    const savedModel = localStorage.getItem("loopbackModel");
    if (savedKey) {
        elements.apiKey.value = savedKey;
    }
    if (savedModel) {
        elements.model.value = savedModel;
    }
}

function saveSettings() {
    localStorage.setItem("loopbackApiKey", elements.apiKey.value.trim());
    localStorage.setItem("loopbackModel", elements.model.value.trim());
    setStatus("설정이 저장되었습니다.");
}

function setStatus(message) {
    elements.statusMessage.textContent = message;
}

function captureSpan() {
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : "";
    if (!selectedText) {
        setStatus("선택한 문구가 없습니다.");
        return;
    }
    const sentence = currentSentence().source_sentence;
    if (!sentence.includes(selectedText)) {
        setStatus("선택한 문구가 원문에 없습니다.");
        return;
    }
    state.selectedSpan = selectedText;
    elements.selectedSpan.textContent = `선택한 막힘 ${selectedText}`;
    setStatus("막힘 위치가 기록되었습니다.");
}

function buildPrompt(sentence, translation, selectedSpan) {
    return `너는 영어 독해 코치다. 아래 입력을 기반으로 JSON만 출력하라.

입력
문장: ${sentence}
사용자 해석: ${translation || "없음"}
사용자 막힘 위치: ${selectedSpan || "없음"}

출력 규칙
1 JSON만 출력한다
2 영어 원문은 절대 변경하지 않는다
3 checkpoints는 2개에서 4개를 생성한다
4 trigger_span은 반드시 원문에 존재하는 부분 문자열이다
5 options A는 잘못된 독해를 대표하고 options B는 의도된 독해 움직임을 대표한다
6 micro_coach와 nudge는 짧고 실행 가능해야 한다
7 추가 예문과 장황한 설명은 금지한다
8 모든 문자열에서 하이픈 문자를 사용하지 않는다

출력 형식
{
  "sentence_id": "${currentSentence().sentence_id}",
  "source_sentence": "${sentence}",
  "checkpoints": [
    {
      "trigger_span": "",
      "risk_profile": "",
      "micro_coach": "",
      "question_ko": "",
      "options": {"A": "", "B": ""},
      "nudge": ""
    }
  ],
  "final_core": "",
  "final_coach_line": ""
}`;
}

async function generateCheckpoints() {
    if (state.isLoading) return;
    const apiKey = elements.apiKey.value.trim();
    if (!apiKey) {
        setStatus("API 키를 입력하세요.");
        return;
    }
    const model = elements.model.value.trim() || "gpt-4o-mini";
    const sentence = currentSentence().source_sentence;
    const translation = elements.userTranslation.value.trim();
    const prompt = buildPrompt(sentence, translation, state.selectedSpan);

    state.isLoading = true;
    elements.generateCheckpoints.disabled = true;
    setStatus("체크포인트를 생성하는 중입니다.");

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                temperature: 0.2,
                messages: [
                    { role: "system", content: "영어 독해 코치로서 JSON만 출력한다" },
                    { role: "user", content: prompt }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "요청 실패");
        }

        const payload = await response.json();
        const content = payload.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error("응답이 비어 있습니다");
        }

        const parsed = JSON.parse(content);
        const validation = validateResult(parsed, sentence);
        if (!validation.valid) {
            throw new Error(validation.message);
        }

        state.llmResult = parsed;
        state.checkpointIndex = 0;
        state.answers = {};
        renderCheckpoint();
        setStatus("체크포인트가 생성되었습니다.");
    } catch (error) {
        setStatus(`생성 오류 ${error.message}`);
    } finally {
        state.isLoading = false;
        elements.generateCheckpoints.disabled = false;
    }
}

function validateResult(result, sentence) {
    if (!result || typeof result !== "object") {
        return { valid: false, message: "JSON 형식이 아닙니다" };
    }
    if (result.source_sentence !== sentence) {
        return { valid: false, message: "원문이 일치하지 않습니다" };
    }
    if (!Array.isArray(result.checkpoints)) {
        return { valid: false, message: "checkpoints가 없습니다" };
    }
    if (result.checkpoints.length < 2 || result.checkpoints.length > 4) {
        return { valid: false, message: "checkpoints 개수가 범위 밖입니다" };
    }
    const serialized = JSON.stringify(result);
    if (serialized.includes("-")) {
        return { valid: false, message: "하이픈 문자가 포함되어 있습니다" };
    }
    for (const checkpoint of result.checkpoints) {
        if (!checkpoint.trigger_span || !sentence.includes(checkpoint.trigger_span)) {
            return { valid: false, message: "trigger_span이 원문에 없습니다" };
        }
        if (!checkpoint.options || !checkpoint.options.A || !checkpoint.options.B) {
            return { valid: false, message: "선택지가 누락되었습니다" };
        }
    }
    return { valid: true, message: "ok" };
}

function renderCheckpoint() {
    if (!state.llmResult) return;
    const checkpoint = state.llmResult.checkpoints[state.checkpointIndex];
    if (!checkpoint) return;

    elements.checkpointPanel.innerHTML = "";

    const card = document.createElement("div");
    card.className = "checkpoint-card";

    const title = document.createElement("h3");
    title.textContent = `체크포인트 ${state.checkpointIndex + 1} / ${state.llmResult.checkpoints.length}`;

    const question = document.createElement("p");
    question.textContent = checkpoint.question_ko;

    const optionRow = document.createElement("div");
    optionRow.className = "option-row";

    const buttonA = buildOptionButton("A", checkpoint.options.A);
    const buttonB = buildOptionButton("B", checkpoint.options.B);

    optionRow.append(buttonA, buttonB);

    const feedback = document.createElement("div");
    feedback.className = "checkpoint-feedback";
    feedback.textContent = "선택하면 코치 피드백이 표시됩니다.";

    const nextButton = document.createElement("button");
    nextButton.className = "btn ghost";
    nextButton.textContent = "다음 체크포인트";
    nextButton.addEventListener("click", () => {
        if (state.checkpointIndex < state.llmResult.checkpoints.length - 1) {
            state.checkpointIndex += 1;
            renderCheckpoint();
        } else {
            setStatus("모든 체크포인트를 확인했습니다.");
        }
    });

    card.append(title, question, optionRow, feedback, nextButton);
    elements.checkpointPanel.append(card);

    function showFeedback(choice) {
        state.answers[checkpoint.trigger_span] = choice;
        buttonA.classList.toggle("active", choice === "A");
        buttonB.classList.toggle("active", choice === "B");
        feedback.textContent = `${checkpoint.micro_coach} ${checkpoint.nudge}`.trim();
    }

    buttonA.addEventListener("click", () => showFeedback("A"));
    buttonB.addEventListener("click", () => showFeedback("B"));
}

function buildOptionButton(label, text) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-btn";
    button.textContent = `${label} ${text}`;
    return button;
}

function revealFinal() {
    if (!state.llmResult) {
        setStatus("체크포인트를 먼저 생성하세요.");
        return;
    }
    elements.finalPanel.style.display = "block";
    elements.finalSentence.innerHTML = highlightSentence(
        state.llmResult.source_sentence,
        state.llmResult.checkpoints.map((item) => item.trigger_span)
    );
    elements.finalCore.textContent = state.llmResult.final_core;
    elements.finalCoach.textContent = state.llmResult.final_coach_line;
    elements.finalUserTranslation.textContent = elements.userTranslation.value.trim() || "입력 없음";
}

function highlightSentence(sentence, spans) {
    const ranges = spans
        .map((span) => ({ span, index: sentence.indexOf(span) }))
        .filter((item) => item.index >= 0)
        .sort((a, b) => a.index - b.index);

    let result = "";
    let cursor = 0;

    ranges.forEach((item) => {
        const start = item.index;
        const end = start + item.span.length;
        if (start < cursor) {
            return;
        }
        result += escapeHtml(sentence.slice(cursor, start));
        result += `<mark>${escapeHtml(sentence.slice(start, end))}</mark>`;
        cursor = end;
    });

    result += escapeHtml(sentence.slice(cursor));
    return result;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function goNextSentence() {
    state.index = (state.index + 1) % data.length;
    renderSentence();
}

init();
