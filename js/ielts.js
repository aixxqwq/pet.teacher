/*
  IELTS: пробные задания для Speaking и Writing.

  Это НЕ настоящие экзаменационные вопросы (они секретные и принадлежат British Council, IDP и Cambridge).
  Это тренировочные задания в формате экзамена на темы, которые постоянно встречаются на IELTS.
  Speaking: Part 1 — короткие вопросы о себе, Part 2 — карточка (1 мин подготовки, до 2 мин речи), Part 3 — обсуждение.
  Writing: Task 1 — описать график (Academic) или написать письмо (General Training), Task 2 — эссе.
*/
const IELTS = (() => {
  // ---------- Speaking Part 1: темы и вопросы ----------
  const PART1 = [
    { topic: "Work or studies", q: ["Do you work or are you a student?", "What do you like most about your studies?", "Is there anything you would like to change about your course?", "What do you plan to do after you finish your studies?"] },
    { topic: "Hometown", q: ["Where is your hometown?", "What do you like about it?", "Has your hometown changed much in recent years?", "Would you like to live there in the future?"] },
    { topic: "Home", q: ["Do you live in a house or a flat?", "Which room do you spend the most time in?", "What would you like to change about your home?", "Do you plan to live there for a long time?"] },
    { topic: "Free time", q: ["What do you usually do in your free time?", "Do you prefer spending free time alone or with others?", "Did you have the same hobbies when you were a child?", "Is there a new hobby you would like to try?"] },
    { topic: "Music", q: ["What kind of music do you like?", "Do you listen to music while studying?", "Have you ever learned to play a musical instrument?", "Is live music popular in your country?"] },
    { topic: "Reading", q: ["Do you like reading?", "What kinds of books do you read?", "Do you prefer paper books or e-books?", "Did you read a lot when you were a child?"] },
    { topic: "Mobile phones", q: ["How often do you use your phone?", "What do you mostly use it for?", "Could you live without a smartphone for a week?", "Do you think children should have phones?"] },
    { topic: "Weather", q: ["What is the weather usually like where you live?", "What is your favourite season? Why?", "Does the weather affect your mood?", "Do you check the weather forecast?"] },
    { topic: "Food", q: ["What is your favourite food?", "Do you like cooking?", "Is there any food you didn't like as a child but like now?", "Do you prefer eating at home or in restaurants?"] },
    { topic: "Friends", q: ["Do you have many friends?", "How do you usually spend time with your friends?", "Is it easy for you to make new friends?", "What makes someone a good friend?"] },
    { topic: "Sport", q: ["Do you play any sports?", "What sports are popular in your country?", "Did you do sports at school?", "Do you prefer watching or playing sports?"] },
    { topic: "Travel", q: ["Do you like travelling?", "Where did you go on your last trip?", "Do you prefer travelling alone or with others?", "Which country would you like to visit and why?"] },
    { topic: "Social media", q: ["Which social media apps do you use?", "How much time do you spend on social media every day?", "What do you like to post?", "Do you think social media has changed the way people communicate?"] },
    { topic: "Sleep", q: ["How many hours do you usually sleep?", "Do you ever take naps during the day?", "What do you do if you can't fall asleep?", "Do you think young people get enough sleep?"] },
    { topic: "Shopping", q: ["Do you enjoy shopping?", "Do you prefer shopping online or in shops?", "What was the last thing you bought?", "Do you usually compare prices before buying something?"] },
  ];

  // ---------- Speaking Part 2 (карточки) + Part 3 (обсуждение) ----------
  const PART2 = [
    { card: "Describe a person who has influenced you.", say: ["who this person is", "how you know them", "what they have done", "and explain how they have influenced you"],
      part3: ["Who has more influence on young people: parents or friends?", "Why do some celebrities become role models?", "Is it good for children to have famous people as role models?"] },
    { card: "Describe a skill you would like to learn.", say: ["what the skill is", "why you want to learn it", "how you would learn it", "and explain how this skill would help you"],
      part3: ["What skills are most important for young people today?", "Is it better to learn skills from a teacher or online?", "Should schools teach more practical skills?"] },
    { card: "Describe a place in your country you would recommend to visitors.", say: ["where it is", "what people can do there", "when is the best time to go", "and explain why you would recommend it"],
      part3: ["How does tourism affect local people?", "Should governments spend money to protect historical places?", "How will travel change in the future?"] },
    { card: "Describe a book you read that you found useful.", say: ["what the book was", "when you read it", "what it was about", "and explain why it was useful for you"],
      part3: ["Do people read less now than in the past?", "What are the advantages of reading over watching films?", "Should children be made to read classic literature?"] },
    { card: "Describe a time when you helped someone.", say: ["who you helped", "how you helped them", "why they needed help", "and explain how you felt about it"],
      part3: ["Why do some people prefer not to ask for help?", "Should helping others be taught at school?", "Do people help each other less in big cities?"] },
    { card: "Describe a piece of technology you find difficult to use.", say: ["what it is", "when you use it", "what makes it difficult", "and explain how you feel when you use it"],
      part3: ["Why do older people often find new technology difficult?", "Does technology make our lives simpler or more complicated?", "Should companies make their products easier to use?"] },
    { card: "Describe a goal you hope to achieve in the future.", say: ["what the goal is", "when you set it", "what you are doing to achieve it", "and explain why it is important to you"],
      part3: ["Is it important for children to set goals?", "Why do some people give up on their goals?", "Are young people today more ambitious than before?"] },
    { card: "Describe an important decision you made.", say: ["what the decision was", "when you made it", "who helped you decide", "and explain why it was important"],
      part3: ["What decisions do teenagers make on their own?", "Is it better to make decisions quickly or slowly?", "Should parents make important decisions for their children?"] },
    { card: "Describe a memorable trip you have taken.", say: ["where you went", "who you went with", "what you did there", "and explain why it was memorable"],
      part3: ["Why do people like to travel?", "Is it better to travel with a group or independently?", "What problems can tourism cause for the environment?"] },
    { card: "Describe a teacher who you remember well.", say: ["who the teacher was", "what subject they taught", "what they were like", "and explain why you remember them"],
      part3: ["What makes a good teacher?", "Can online lessons replace teachers?", "Should teachers be paid more?"] },
    { card: "Describe a time you were very busy.", say: ["when it was", "what you had to do", "how you managed your time", "and explain how you felt"],
      part3: ["Why are people busier today than in the past?", "How can people manage stress at work or school?", "Is being busy always a bad thing?"] },
    { card: "Describe an app you use often.", say: ["what the app is", "how you found it", "what you use it for", "and explain why you like it"],
      part3: ["Do apps make people lazy?", "How do apps help with education?", "Should there be limits on how much time children spend on apps?"] },
    { card: "Describe a festival or celebration in your country.", say: ["what it is called", "when it takes place", "what people do", "and explain why it is important"],
      part3: ["Why are traditional festivals important?", "Are festivals becoming too commercial?", "How have celebrations changed in your country?"] },
    { card: "Describe a time you learned something new from the internet.", say: ["what you learned", "which website or video it was", "why you looked for it", "and explain how useful it was"],
      part3: ["Is information on the internet always reliable?", "How can young people check if information is true?", "Will the internet replace libraries?"] },
    { card: "Describe a sport or activity you enjoy.", say: ["what it is", "when you started doing it", "who you do it with", "and explain why you enjoy it"],
      part3: ["Why is physical activity important for young people?", "Should physical education be compulsory at school?", "Do professional athletes earn too much money?"] },
    { card: "Describe a city you would like to live in.", say: ["which city it is", "how you know about it", "what it is like", "and explain why you would like to live there"],
      part3: ["What are the advantages of living in a big city?", "Why do people move from villages to cities?", "How can cities become better places to live?"] },
  ];

  // ---------- Writing Task 2 (эссе, 250+ слов, 40 минут) ----------
  const TASK2 = [
    { type: "Opinion", text: "Some people believe that university education should be free for all students. To what extent do you agree or disagree?" },
    { type: "Opinion", text: "Children today spend too much time on smartphones and computers. Parents should strictly limit screen time. To what extent do you agree or disagree?" },
    { type: "Discussion", text: "Some people think that students should study subjects they are interested in, while others believe they should study subjects that will be useful in the future, such as science and technology. Discuss both views and give your own opinion." },
    { type: "Discussion", text: "Some believe that online learning is as effective as classroom learning, while others think it can never replace face-to-face teaching. Discuss both views and give your opinion." },
    { type: "Advantages / Disadvantages", text: "More and more people are choosing to work from home. Do the advantages of this trend outweigh the disadvantages?" },
    { type: "Advantages / Disadvantages", text: "Many young people today take a gap year between finishing school and starting university. What are the advantages and disadvantages of this?" },
    { type: "Problem / Solution", text: "In many cities, traffic congestion is becoming a serious problem. What are the causes of this problem, and what solutions can you suggest?" },
    { type: "Problem / Solution", text: "Many young people do not get enough physical exercise. Why is this happening, and what can be done to solve this problem?" },
    { type: "Two-part question", text: "Nowadays many people buy products online rather than in shops. Why is this the case? Is this a positive or negative development?" },
    { type: "Opinion", text: "Artificial intelligence will soon replace teachers in schools. To what extent do you agree or disagree?" },
    { type: "Discussion", text: "Some people think that governments should spend money on protecting the environment, while others believe the money should be spent on healthcare and education. Discuss both views and give your opinion." },
    { type: "Opinion", text: "Learning a foreign language at primary school is more effective than learning it at secondary school. To what extent do you agree or disagree?" },
    { type: "Advantages / Disadvantages", text: "Tourism has become one of the largest industries in many countries. Do the advantages of international tourism outweigh the disadvantages?" },
    { type: "Problem / Solution", text: "Plastic pollution in oceans is a growing problem. What are the causes, and what measures can be taken to reduce it?" },
    { type: "Two-part question", text: "Many people now get their news from social media rather than newspapers or television. Why is this? What problems can this cause?" },
    { type: "Opinion", text: "Success in life depends more on hard work than on talent. To what extent do you agree or disagree?" },
    { type: "Discussion", text: "Some believe that children should be given homework every day, while others think homework is unnecessary. Discuss both views and give your opinion." },
    { type: "Opinion", text: "Older people should be encouraged to continue working after retirement age. To what extent do you agree or disagree?" },
    { type: "Advantages / Disadvantages", text: "Some families choose to live in the countryside rather than in a city. What are the advantages and disadvantages of this?" },
    { type: "Two-part question", text: "In many countries, the number of people living alone is increasing. Why is this happening? Is this a positive or negative trend?" },
  ];

  // ---------- Writing Task 1 Academic (график, 150+ слов, 20 минут) ----------
  // данные выдуманные — это тренировка, а не реальная статистика
  const TASK1 = [
    { text: "The bar chart shows the number of students (in thousands) studying four foreign languages at a university in 2010 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
      chart: { kind: "bar", unit: "thousand students", labels: ["English", "Chinese", "German", "Spanish"], series: [{ name: "2010", data: [12, 2, 5, 4] }, { name: "2020", data: [15, 7, 3, 6] }] } },
    { text: "The line graph shows the percentage of households with internet access in three countries between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
      chart: { kind: "line", unit: "%", labels: ["2000", "2005", "2010", "2015", "2020"], series: [{ name: "Country A", data: [20, 45, 70, 85, 95] }, { name: "Country B", data: [5, 15, 35, 60, 80] }, { name: "Country C", data: [40, 55, 65, 70, 75] }] } },
    { text: "The pie charts show how an average family spent its monthly income in 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
      chart: { kind: "pie", labels: ["Housing", "Food", "Transport", "Entertainment", "Other"], series: [{ name: "2000", data: [30, 35, 10, 5, 20] }, { name: "2020", data: [40, 20, 15, 12, 13] }] } },
    { text: "The bar chart shows the average number of hours per week that teenagers spent on different activities in 2023. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
      chart: { kind: "bar", unit: "hours per week", labels: ["Social media", "Homework", "Sport", "Reading"], series: [{ name: "Boys", data: [14, 8, 6, 2] }, { name: "Girls", data: [18, 10, 3, 4] }] } },
    { text: "The line graph shows the average monthly temperature in two cities over one year. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
      chart: { kind: "line", unit: "°C", labels: ["Jan", "Mar", "May", "Jul", "Sep", "Nov"], series: [{ name: "City X", data: [-12, 0, 16, 24, 14, -4] }, { name: "City Y", data: [8, 12, 18, 26, 21, 11] }] } },
    { text: "The table shows the number of visitors (in millions) to three museums in 2015, 2018 and 2021. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
      chart: { kind: "table", labels: ["2015", "2018", "2021"], series: [{ name: "Science Museum", data: [3.2, 3.8, 2.1] }, { name: "History Museum", data: [2.5, 2.4, 1.6] }, { name: "Art Gallery", data: [1.1, 1.9, 1.4] }] } },
  ];

  // ---------- Writing Task 1 General Training (письмо, 150+ слов, 20 минут) ----------
  const LETTERS = [
    { text: "You recently bought a laptop online, but it arrived damaged. Write a letter to the company. In your letter: describe what you bought; explain what is wrong with it; say what you would like the company to do." },
    { text: "A friend from another country is planning to visit your city. Write a letter to your friend. In your letter: suggest the best time to visit; describe places they should see; offer to help during their stay." },
    { text: "You want to join an evening English course at a local college. Write a letter to the course organiser. In your letter: introduce yourself; explain why you want to take the course; ask for information about the course." },
    { text: "You live in a rented flat and the heating has stopped working. Write a letter to your landlord. In your letter: describe the problem; explain how it is affecting you; say what you want the landlord to do." },
    { text: "You have just finished a summer job. Write a letter to your manager. In your letter: thank them for the opportunity; describe what you learned; ask if you could work there again next year." },
  ];

  // ---------- рисуем график к Task 1 (SVG) ----------
  const COLORS = ["#7B61FF", "#FF7EB6", "#3CC8FF", "#FFB36B", "#22A06B"];
  const T = (x, y, s, o = "") => `<text x="${x}" y="${y}" font-size="11" fill="#3B3566" font-family="Onest, sans-serif" ${o}>${s}</text>`;

  function chartSVG(c) {
    const W = 520, H = 300, L = 46, R = 16, Tp = 20, B = 52;
    if (c.kind === "table") {
      const colW = (W - 160) / c.labels.length;
      let s = `<rect x="0" y="0" width="${W}" height="${40 + c.series.length * 40}" fill="#fff"/>`;
      c.labels.forEach((l, i) => { s += T(170 + colW * i + colW / 2, 26, l, 'text-anchor="middle" font-weight="700"'); });
      c.series.forEach((sr, r) => {
        const y = 40 + r * 40;
        s += `<rect x="0" y="${y}" width="${W}" height="40" fill="${r % 2 ? "#fff" : "#F5F2FF"}"/>`;
        s += T(12, y + 25, sr.name, 'font-weight="600"');
        sr.data.forEach((v, i) => { s += T(170 + colW * i + colW / 2, y + 25, v, 'text-anchor="middle"'); });
      });
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${40 + c.series.length * 40}">${s}</svg>`;
    }
    if (c.kind === "pie") {
      let s = "";
      c.series.forEach((sr, k) => {
        const cx = 130 + k * 260, cy = 130, r = 90;
        let a0 = -Math.PI / 2;
        const total = sr.data.reduce((p, v) => p + v, 0);
        sr.data.forEach((v, i) => {
          const a1 = a0 + (v / total) * Math.PI * 2;
          const big = a1 - a0 > Math.PI ? 1 : 0;
          s += `<path d="M${cx} ${cy}L${(cx + r * Math.cos(a0)).toFixed(1)} ${(cy + r * Math.sin(a0)).toFixed(1)}A${r} ${r} 0 ${big} 1 ${(cx + r * Math.cos(a1)).toFixed(1)} ${(cy + r * Math.sin(a1)).toFixed(1)}Z" fill="${COLORS[i]}" stroke="#fff" stroke-width="2"/>`;
          const am = (a0 + a1) / 2;
          s += T((cx + r * 0.62 * Math.cos(am)).toFixed(1), (cy + r * 0.62 * Math.sin(am) + 4).toFixed(1), v + "%", 'text-anchor="middle" fill="#fff" font-weight="700"');
          a0 = a1;
        });
        s += T(cx, 238, sr.name, 'text-anchor="middle" font-weight="700" font-size="13"');
      });
      c.labels.forEach((l, i) => {
        const x = 20 + i * 100;
        s += `<rect x="${x}" y="258" width="12" height="12" rx="3" fill="${COLORS[i]}"/>` + T(x + 17, 268, l);
      });
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 280">${s}</svg>`;
    }
    const all = c.series.flatMap((s) => s.data);
    let lo = Math.min(0, ...all), hi = Math.max(...all);
    const step = niceStep((hi - lo) / 5);
    lo = Math.floor(lo / step) * step;
    hi = Math.ceil(hi / step) * step;
    const Y = (v) => H - B - ((v - lo) / (hi - lo)) * (H - Tp - B);
    const n = c.labels.length;
    let s = "";
    for (let v = lo; v <= hi + 1e-9; v += step) {
      s += `<line x1="${L}" y1="${Y(v).toFixed(1)}" x2="${W - R}" y2="${Y(v).toFixed(1)}" stroke="${v === 0 ? "#3B3566" : "#ECE8FB"}"/>`;
      s += T(L - 6, (Y(v) + 4).toFixed(1), +v.toFixed(1), 'text-anchor="end" fill="#6D6790"');
    }
    const slot = (W - L - R) / n;
    if (c.kind === "bar") {
      const bw = Math.min(28, (slot * 0.7) / c.series.length);
      c.labels.forEach((l, i) => {
        c.series.forEach((sr, k) => {
          const x = L + slot * i + slot / 2 - (bw * c.series.length) / 2 + k * bw;
          const v = sr.data[i];
          s += `<rect x="${x.toFixed(1)}" y="${Y(Math.max(v, 0)).toFixed(1)}" width="${(bw - 3).toFixed(1)}" height="${Math.abs(Y(v) - Y(0)).toFixed(1)}" rx="3" fill="${COLORS[k]}"/>`;
        });
        s += T((L + slot * i + slot / 2).toFixed(1), H - B + 18, l, 'text-anchor="middle"');
      });
    } else {
      c.labels.forEach((l, i) => { s += T((L + slot * i + slot / 2).toFixed(1), H - B + 18, l, 'text-anchor="middle"'); });
      c.series.forEach((sr, k) => {
        const pts = sr.data.map((v, i) => `${(L + slot * i + slot / 2).toFixed(1)},${Y(v).toFixed(1)}`);
        s += `<polyline points="${pts.join(" ")}" fill="none" stroke="${COLORS[k]}" stroke-width="3" stroke-linejoin="round"/>`;
        pts.forEach((p) => { const [x, y] = p.split(","); s += `<circle cx="${x}" cy="${y}" r="3.5" fill="${COLORS[k]}"/>`; });
      });
    }
    s += T(L, 12, c.unit, 'fill="#6D6790"');
    c.series.forEach((sr, k) => {
      const x = L + k * 120;
      s += `<rect x="${x}" y="${H - 20}" width="12" height="12" rx="3" fill="${COLORS[k]}"/>` + T(x + 17, H - 10, sr.name);
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${s}</svg>`;
  }
  function niceStep(raw) {
    const p = Math.pow(10, Math.floor(Math.log10(raw || 1)));
    const m = raw / p;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
  }

  // Критерии оценки (кратко, по официальным band descriptors)
  const CRITERIA = {
    speaking: [
      ["Fluency and Coherence", "Говоришь без долгих пауз, мысли связаны (firstly, however, for example)."],
      ["Lexical Resource", "Разнообразная лексика, идиомы к месту, перефразируешь, если не знаешь слово."],
      ["Grammatical Range and Accuracy", "Смешиваешь простые и сложные предложения, мало ошибок."],
      ["Pronunciation", "Тебя легко понять: ударения, интонация, чёткие звуки."],
    ],
    writing: [
      ["Task Response / Achievement", "Ответила на все части задания, позиция ясна, есть примеры."],
      ["Coherence and Cohesion", "Абзацы, логичный порядок, связки без перебора."],
      ["Lexical Resource", "Точная и разнообразная лексика, без повторов одного слова."],
      ["Grammatical Range and Accuracy", "Разные конструкции, мало ошибок."],
    ],
  };

  return { PART1, PART2, TASK2, TASK1, LETTERS, CRITERIA, chartSVG };
})();
