// Big Little Lies 원서 학습 데이터
const data = [
  {
    "sentence": "Lily didn't know Amabella from a bar of soap, so I felt bad, but not that bad.",
    "source": {
      "title": "Big Little Lies",
      "author": "Liane Moriarty"
    },
    "user_question_summary": "관용 표현 'not know A from a bar of soap'의 의미와 뉘앙스를 알고 싶어서 질문함",
    "difficulty": "B2",
    "tags": ["관용표현", "문맥 이해"],
    "native_core_meaning": "Lily는 Amabella가 누군지 전혀 모르는 완전한 남이라는 의미다.",
    "step_by_step": {
      "structure": "주어(Lily) + 동사(didn't know) + 목적어(Amabella) + 관용 표현(from a bar of soap) + 결과절(so I felt bad, but not that bad)",
      "expressions": "'not know A from B'는 A와 B를 구분 못할 정도로 모른다는 뜻이고, 'from a bar of soap'는 흔한 관용적 조합이다.",
      "native_interpretation": "릴리는 아마벨라가 누군지도 모르는 남이었기 때문에 미안하긴 했지만 그렇게까지 미안하진 않았다."
    },
    "natural_korean": "릴리는 아마벨라가 누군지도 모르는 남이었기 때문에 좀 미안하긴 했지만, 그렇게까지 미안하진 않았다.",
    "keyExpression": "know A from a bar of soap"
  },
  {
    "sentence": "a tipsy nineteen-year-old swoon.",
    "source": {
      "title": "Big Little Lies",
      "author": "Liane Moriarty"
    },
    "user_question_summary": "'tipsy nineteen-year-old swoon'이 어떤 느낌의 묘사인지 알고 싶어서 질문함",
    "difficulty": "C1",
    "tags": ["비유", "어감", "문맥 이해"],
    "native_core_meaning": "술에 살짝 취한 열아홉 살 소녀가 황홀하게 홀딱 반한 상태를 비유적으로 묘사한 표현이다.",
    "step_by_step": {
      "structure": "관사 생략 + 형용사구(tipsy nineteen-year-old) + 명사(swoon)로 이루어진 명사구.",
      "expressions": "'tipsy'는 살짝 취한 상태, 'swoon'은 황홀경이나 반해버린 상태를 의미한다.",
      "native_interpretation": "술에 살짝 취한 열아홉 살짜리 소녀가 황홀하게 푹 빠진 순간 같은 반응을 말한다."
    },
    "natural_korean": "술에 살짝 취한 열아홉 살 소녀가 황홀하게 푹 빠진 듯한 반응.",
    "keyExpression": "tipsy swoon"
  },
  {
    "sentence": "Why try to hide her body when he already knew just how abhorrent it was?",
    "source": {
      "title": "Big Little Lies",
      "author": "Liane Moriarty"
    },
    "user_question_summary": "Why로 시작하는 문장 구조와 자기혐오 감정을 어떻게 해석해야 할지 알고 싶어서 질문함",
    "difficulty": "C1",
    "tags": ["구조 분석", "문맥 이해"],
    "native_core_meaning": "그가 이미 자신의 몸을 얼마나 혐오하는지 아는데, 그걸 숨기려 해봤자 소용없다는 자조다.",
    "step_by_step": {
      "structure": "Why + 동사원형(try) + to hide her body + 부가적 정보절(when he already knew ...).",
      "expressions": "'abhorrent'는 '혐오스러운'이라는 강한 부정적 형용사로, 자기 몸에 대한 강한 혐오를 드러낸다.",
      "native_interpretation": "그는 이미 내 몸을 얼마나 끔찍하게 생각하는지 아는데, 그걸 숨기려 해봤자 무슨 의미가 있겠냐는 체념 섞인 생각이다."
    },
    "natural_korean": "그가 내 몸을 얼마나 끔찍하게 여기는지 이미 아는데, 이제 와서 그걸 숨겨서 뭐하겠어?",
    "keyExpression": "abhorrent"
  },
  {
    "sentence": "For her dopey, bovine \"bye.\"",
    "source": {
      "title": "Big Little Lies",
      "author": "Liane Moriarty"
    },
    "user_question_summary": "'dopey, bovine'이 어떤 어감인지 알고 싶어서 질문함",
    "difficulty": "C1",
    "tags": ["비유", "어감"],
    "native_core_meaning": "멍청하고 둔해 보이는 인사 'bye'를 비꼬는 표현이다.",
    "step_by_step": {
      "structure": "전치사 for + 소유격 her + 형용사(dopey, bovine) + 명사(bye) 구조의 명사구.",
      "expressions": "'dopey'는 어리벙벙하고 멍청한, 'bovine'은 소 같은 → 느리고 둔한 이미지를 준다.",
      "native_interpretation": "그녀가 멍청하고 둔해 보이는 목소리로 내뱉는 '잘 가'라는 인사를 비꼬는 말이다."
    },
    "natural_korean": "그녀가 멍청하고 소같이 둔한 목소리로 하는 그 '잘 가'라는 인사를 두고 하는 말이다.",
    "keyExpression": "dopey, bovine"
  },
  {
    "sentence": "She'd loved the fact that Perry didn't even need a list when he went duty-free shopping for perfume...",
    "source": {
      "title": "Big Little Lies",
      "author": "Liane Moriarty"
    },
    "user_question_summary": "과거완료 시제와 'the fact that' 구조, 감정 뉘앙스를 확인하려고 질문함",
    "difficulty": "B2",
    "tags": ["구조 분석", "문맥 이해"],
    "native_core_meaning": "페리가 면세점에서 향수를 살 때 목록 없이도 척척 고르는 모습을 그녀가 아주 좋아했다는 뜻이다.",
    "step_by_step": {
      "structure": "주어(She) + 과거완료 동사(had loved) + 목적어(the fact that 절).",
      "expressions": "'duty-free shopping'은 면세점 쇼핑을 뜻하는 관용적 결합이고, 리스트 없이 산다는 건 상대를 잘 안다는 뉘앙스를 준다.",
      "native_interpretation": "그녀는 페리가 면세점에서 향수를 살 때 목록 같은 거 없이도 알아서 척척 골라 사는 모습을 정말 좋아했었다."
    },
    "natural_korean": "그녀는 페리가 면세점에서 향수를 살 때 목록 같은 건 필요도 없이 척척 골라 사는 걸 정말 좋아했었다.",
    "keyExpression": "duty-free shopping"
  },
  {
    "sentence": "A little violence was a bargain price for a life that would otherwise be just too sickeningly, lavishly, moonlit perfect.",
    "source": {
      "title": "Big Little Lies",
      "author": "Liane Moriarty"
    },
    "user_question_summary": "형용사 나열과 반어적 비유를 이해하려고 질문함",
    "difficulty": "C1",
    "tags": ["비유", "강조", "문맥 이해"],
    "native_core_meaning": "약간의 폭력쯤은 지나치게 완벽한 삶에 비하면 헐값 같은 대가라는 냉소적인 표현이다.",
    "step_by_step": {
      "structure": "주어(A little violence) + 동사(was) + 보어(a bargain price for a life that ...).",
      "expressions": "'a bargain price for ~'은 '~에 비하면 엄청 싸다'라는 비유, 'sickeningly, lavishly, moonlit perfect'는 너무 완벽해서 역겹다는 뉘앙스를 더한다.",
      "native_interpretation": "너무 낭만적이고 호화롭고 완벽해서 오히려 역겨운 삶에 비하면, 약간의 폭력쯤은 정말 헐값 같은 대가였다는 식의 반어다."
    },
    "natural_korean": "그렇지 않으면 소름 끼칠 만큼 지나치게 완벽했을 삶에 비하면, 약간의 폭력쯤은 헐값이었다.",
    "keyExpression": "a bargain price"
  },
  {
    "sentence": "Poor Renata was at her wit's end.",
    "source": {
      "title": "Big Little Lies",
      "author": "Liane Moriarty"
    },
    "user_question_summary": "'at her wit's end' 관용 표현의 의미를 확인하려고 질문함",
    "difficulty": "B2",
    "tags": ["관용표현"],
    "native_core_meaning": "레나타가 더 이상 어찌할 바를 모를 만큼 지쳐 있다는 의미다.",
    "step_by_step": {
      "structure": "주어(Renata) + be동사(was) + 관용구(at her wit's end).",
      "expressions": "'at one's wit's end'는 완전히 지쳐서 해결 방법을 모르겠다는 뜻의 관용 표현이다.",
      "native_interpretation": "레나타는 이제 정말 어떻게 해야 할지 모를 만큼 지치고 막다른 데 몰려 있었다."
    },
    "natural_korean": "불쌍한 레나타는 이제 완전히 진이 빠져 어찌할 바를 모르는 상태였다.",
    "keyExpression": "at one's wit's end"
  },
  {
    "sentence": "the petition about getting the council to put in a pedestrian crossing on Park Street.",
    "source": {
      "title": "Big Little Lies",
      "author": "Liane Moriarty"
    },
    "user_question_summary": "'get + 목적어 + to부정사'와 'put in'의 의미를 확인하려고 질문함",
    "difficulty": "B2",
    "tags": ["구조 분석", "관용표현"],
    "native_core_meaning": "시의회에 파크 스트리트에 횡단보도를 설치해 달라고 요청하는 청원을 가리킨다.",
    "step_by_step": {
      "structure": "명사(the petition) + 전치사 about + 동명사구(getting the council to put in ...).",
      "expressions": "'get A to B'는 A가 B하게 만들다, 'put in'은 설치하다라는 의미로 쓰인다.",
      "native_interpretation": "파크 스트리트에 횡단보도를 설치해 달라고 시의회에 요청하는 청원에 대한 이야기다."
    },
    "natural_korean": "파크 스트리트에 횡단보도를 설치해 달라고 시의회에 요청하는 청원.",
    "keyExpression": "get A to do, put in"
  },
  {
    "sentence": "probably end up having to wade through some awful, worthy tomes.",
    "source": {
      "title": "Big Little Lies",
      "author": "Liane Moriarty"
    },
    "user_question_summary": "'end up ~ing'과 'wade through'의 관용적 쓰임을 이해하려고 질문함",
    "difficulty": "B2",
    "tags": ["관용표현", "구조 분석"],
    "native_core_meaning": "결국 고상하지만 끔찍하게 지루한 두꺼운 책들을 억지로 읽게 될 거라는 의미다.",
    "step_by_step": {
      "structure": "부사(probably) + 동사구(end up having to wade through ...) 형태.",
      "expressions": "'end up ~ing'은 결국 ~하게 되다, 'wade through'는 지루한 것을 꾸역꾸역 읽다/처리하다라는 뜻이다.",
      "native_interpretation": "결국 재미없고 부담스러운 두꺼운 책들을 꾸역꾸역 읽게 될지도 모른다는 투로 말하고 있다."
    },
    "natural_korean": "결국엔 재미없지만 그럴듯한 두꺼운 책들을 꾸역꾸역 읽게 될지도 모른다.",
    "keyExpression": "wade through"
  },
  {
    "sentence": "Can't possibly think people would be so small-minded as to sign it.",
    "source": {
      "title": "Big Little Lies",
      "author": "Liane Moriarty"
    },
    "user_question_summary": "주어 생략과 'so ~ as to' 구문의 의미를 분석하려고 질문함",
    "difficulty": "B2",
    "tags": ["생략", "구조 분석"],
    "native_core_meaning": "사람들이 그렇게 속 좁아서 그 청원에 서명할 거라고는 도저히 생각할 수 없다는 뜻이다.",
    "step_by_step": {
      "structure": "(I) can't possibly think + (that) people would be so small-minded as to sign it.",
      "expressions": "'so ~ as to 동사'는 '~할 정도로 ~하다'라는 비교적 격식 있는 표현이다.",
      "native_interpretation": "사람들이 그 청원에 서명할 만큼 그렇게 속 좁을 거라고는 도저히 믿을 수 없다는 의미다."
    },
    "natural_korean": "사람들이 그렇게 속 좁아서 그 청원에까지 서명할 거라고는 도저히 생각할 수가 없다.",
    "keyExpression": "so ~ as to"
  }
];

