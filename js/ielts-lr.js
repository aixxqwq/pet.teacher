/*
  IELTS: Listening, Reading и образцы ответов.

  Задания написаны специально для Bilim Buddy в точном формате экзамена: те же части, типы вопросов,
  инструкции и уровень сложности. Настоящие экзаменационные материалы British Council, IDP и Cambridge
  защищены авторским правом, а реальные вопросы экзамена секретные, поэтому копировать их сюда нельзя.
  Официальные бесплатные пробные тесты — по ссылкам в OFFICIAL.

  Listening озвучивает браузер (Web Speech API), поэтому аудиофайлы не нужны.

  Типы вопросов:
    gap  — вписать слово или число (answer: список допустимых ответов)
    mc   — выбрать A, B или C (answer: "B")
    tfng — TRUE / FALSE / NOT GIVEN или YES / NO / NOT GIVEN (answer: "TRUE")
    pick — выбрать вариант из общего списка группы (например, заголовок абзаца), answer: "iii"
*/
const IELTS_LR = (() => {
  const OFFICIAL = [
    { name: "IELTS.org — официальные примеры заданий (все 4 части)", url: "https://ielts.org/take-a-test/preparation-resources/sample-test-questions" },
    { name: "British Council — бесплатная подготовка и пробные тесты", url: "https://takeielts.britishcouncil.org/" },
  ];

  // =====================================================================
  //  LISTENING — 4 части, как на экзамене. По 10 вопросов.
  // =====================================================================
  const LISTENING = [
    {
      id: "L1", part: 1, title: "Joining a sports centre",
      about: "Разговор двух людей на бытовую тему. На экзамене — самая лёгкая часть: анкета или форма.",
      voices: { R: "female", D: "male" },
      script: [
        ["R", "Good morning, Riverside Sports Centre. How can I help?"],
        ["D", "Oh, hello. I'd like to become a member, please. Can I do that over the phone?"],
        ["R", "Yes, of course. I'll just take a few details. Could I have your name, please?"],
        ["D", "Yes, it's Daniel Morton."],
        ["R", "Is that M, O, R, T, O, N?"],
        ["D", "That's right."],
        ["R", "And your address?"],
        ["D", "It's 42 Mill Road. That's in Westbury."],
        ["R", "Mill Road, Westbury. Lovely. And what's the best number to contact you on?"],
        ["D", "My mobile, which is oh seven eight four one, two six six, three five oh."],
        ["R", "Thank you. Now, we have two types of membership. Standard membership lets you come in at any time, and that costs thirty-nine pounds a month."],
        ["D", "Hmm, that's a bit more than I wanted to spend. What's the other option?"],
        ["R", "The other one is off-peak membership. It's twenty-four pounds a month, but you can only use the centre at quieter times."],
        ["D", "When exactly is that?"],
        ["R", "On weekdays, you can come in any time before four in the afternoon, and at weekends there are no restrictions at all."],
        ["D", "Oh, that's perfect. I work evenings, so I'll go for off-peak."],
        ["R", "Great. And what are you mainly interested in doing here? Some people come for the pool, others for the gym or the classes."],
        ["D", "Well, I was thinking about swimming, but my knee has been giving me trouble, so my doctor actually recommended yoga. I'd like to try the yoga classes."],
        ["R", "Good choice, they're very popular. Now, on your first visit you'll need to collect your membership card. Please bring a photo with you, because we print it on the card."],
        ["D", "Do I need to bring any proof of address?"],
        ["R", "No, that's not necessary. Just the photo. We also ask all new members to attend a short induction session, where someone shows you around and explains the safety rules. The Tuesday session is already full, I'm afraid, but there's space on Thursday."],
        ["D", "Thursday is fine."],
        ["R", "Lovely. And one last question, just for our records. How did you hear about us? Was it from a friend, or online?"],
        ["D", "Actually, neither. A leaflet came through my door last week."],
        ["R", "Brilliant, that's good to know. You're all booked in, Daniel. See you on Thursday!"],
      ],
      groups: [
        {
          instr: "Questions 1–10. Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.",
          title: "Riverside Sports Centre — new member",
          qs: [
            { type: "gap", text: "Name: Daniel ___", answer: ["morton"] },
            { type: "gap", text: "Address: 42 ___ Road, Westbury", answer: ["mill"] },
            { type: "gap", text: "Mobile number: ___", answer: ["07841266350"] },
            { type: "gap", text: "Type of membership: ___", answer: ["off-peak", "off peak", "offpeak"] },
            { type: "gap", text: "Cost: £ ___ per month", answer: ["24", "twenty-four", "twenty four"] },
            { type: "gap", text: "On weekdays can use the centre before ___ pm", answer: ["4", "four", "4pm", "16:00"] },
            { type: "gap", text: "Main interest: ___ classes", answer: ["yoga"] },
            { type: "gap", text: "Bring a ___ on the first visit", answer: ["photo", "photograph"] },
            { type: "gap", text: "Induction session: on ___", answer: ["thursday"] },
            { type: "gap", text: "Heard about the centre from a ___", answer: ["leaflet"] },
          ],
        },
      ],
      tips: "Ловушки Part 1: сначала называют одно, потом исправляют (39 → 24 фунта, Tuesday → Thursday, swimming → yoga). Записывай последнее, что сказали.",
    },
    {
      id: "L2", part: 2, title: "Volunteering at a nature reserve",
      about: "Монолог на бытовую тему: экскурсия, инструктаж, объявление.",
      voices: { G: "female" },
      script: [
        ["G", "Good morning, everyone, and welcome to Greenfield Nature Reserve. I'm Helen, the volunteer coordinator, and I'd like to give you some information before you start working with us."],
        ["G", "First, a little history. Many visitors assume the reserve used to be farmland, because of the open fields you can see from the road. In fact, until the nineteen eighties this whole area was a sand and gravel quarry. When the digging stopped, the deep holes filled with water, and that's where our lakes come from."],
        ["G", "Today the reserve covers about one hundred and twenty hectares, so there's plenty of work to do. People often expect our volunteers to come mainly at weekends, but it's actually the other way round. Most of our volunteers come in on Wednesdays and Thursdays, and Saturdays are usually quite quiet."],
        ["G", "Now, before you do anything else, there's one thing every new volunteer must do. You've all registered online already, and you don't need to buy any special boots, because we provide those. But you must attend a safety training session before you pick up any tools. The next one is this afternoon."],
        ["G", "Each morning, volunteers meet at the old barn, which is just next to the main gate. You can't miss it. That's where we hand out the jobs for the day. The tools themselves are kept in the green container behind the barn. Please don't confuse it with the blue one, which belongs to the café."],
        ["G", "Talking of the café, it's not run by us or by the local council, as many people think. It's managed by a local charity, and all the money it makes goes to supporting people with disabilities in the area. So please do buy your coffee there!"],
        ["G", "As for our projects, we've just finished building a new bird hide on the north lake, and we'll be planting trees in the autumn. But our biggest project at the moment is restoring the old pond near the visitor centre. It was almost completely full of mud, and we're hoping to bring back frogs and dragonflies."],
        ["G", "A couple of rules. Many of you will meet our ponies, which we use to keep the grass short. They're very friendly, but please do not feed them. Human food makes them ill."],
        ["G", "And finally, the good news. To say thank you, we provide a free lunch for all volunteers on the last Friday of every month. Right, any questions before we start?"],
      ],
      groups: [
        {
          instr: "Questions 1–5. Choose the correct letter, A, B or C.",
          qs: [
            { type: "mc", text: "Before the 1980s, the reserve was", options: ["a farm.", "a quarry.", "a military site."], answer: "B" },
            { type: "mc", text: "Most volunteers come to the reserve", options: ["on Saturdays.", "on Sundays.", "on weekdays."], answer: "C" },
            { type: "mc", text: "Before starting work, new volunteers must", options: ["attend a safety training session.", "buy suitable boots.", "register online."], answer: "A" },
            { type: "mc", text: "The café is run by", options: ["the local council.", "a charity.", "the volunteers."], answer: "B" },
            { type: "mc", text: "The main project at the moment is", options: ["building a bird hide.", "restoring a pond.", "planting trees."], answer: "B" },
          ],
        },
        {
          instr: "Questions 6–10. Complete the sentences below. Write ONE WORD AND/OR A NUMBER for each answer.",
          qs: [
            { type: "gap", text: "The reserve covers about ___ hectares.", answer: ["120", "one hundred and twenty"] },
            { type: "gap", text: "Every morning, volunteers meet at the ___ near the main gate.", answer: ["barn", "old barn"] },
            { type: "gap", text: "The tools are kept in the ___ container.", answer: ["green"] },
            { type: "gap", text: "Volunteers must not feed the ___.", answer: ["ponies", "pony"] },
            { type: "gap", text: "There is a free lunch on the last ___ of every month.", answer: ["friday"] },
          ],
        },
      ],
      tips: "В Part 2 вопросы идут по порядку текста. Слова в вариантах A/B/C часто звучат все, но правильный только один: слушай, что подтверждают, а что отрицают (registered online, boots — «не нужно»).",
    },
    {
      id: "L3", part: 3, title: "A student research project",
      about: "Разговор 2–3 человек на учебную тему: студенты обсуждают проект с преподавателем.",
      voices: { T: "female2", M: "female", K: "male" },
      script: [
        ["T", "Come in, Maya, Kevin. So, how is the research project going? Remind me what it's about."],
        ["M", "We're looking at how students actually use the university library. We chose it because during exams last year I could never find a seat, and I wanted to understand why."],
        ["T", "A good reason. What method did you decide on in the end?"],
        ["K", "Well, originally we wanted to do interviews, because you get much more detail. But we realised it would take far too long to interview enough people. So we've gone with an online questionnaire instead."],
        ["T", "Sensible. How many responses have you had?"],
        ["M", "Last week it was only eighty-five, but it's gone up a lot since then. We've now got a hundred and fifty. We were hoping for two hundred, but I think a hundred and fifty is enough."],
        ["T", "It is. And has anything surprised you so far?"],
        ["K", "Yes, definitely. We assumed most people go to the library to study quietly on their own. But actually, most students say they go there to work in groups. That probably explains why the group rooms are always fully booked."],
        ["M", "We also expected nobody to borrow printed books any more, but quite a lot of people still do."],
        ["T", "Interesting. I do have one concern, though. When I looked at your data, I noticed that almost three quarters of the people who replied are first-year students. That might give you a rather one-sided picture."],
        ["K", "That's true. First-years probably use the library differently from final-year students."],
        ["T", "Exactly. So what's your plan?"],
        ["M", "We thought we'd do a few follow-up interviews with third-year students, to balance things out. Then we'll start writing."],
        ["T", "Good. Now, let me just remind you about the report. The deadline is the fourteenth of May. It should be about three thousand words. Please don't go much over that."],
        ["K", "Should we include the actual questionnaire?"],
        ["T", "Yes, put all the survey questions in an appendix at the end. And instead of a talk, this year you'll present your findings on a poster, at the poster session in June."],
        ["M", "Great, thank you."],
      ],
      groups: [
        {
          instr: "Questions 1–6. Choose the correct letter, A, B or C.",
          qs: [
            { type: "mc", text: "Why did the students choose this topic?", options: ["Their tutor suggested it.", "The library asked for research.", "Because of a personal experience."], answer: "C" },
            { type: "mc", text: "Which research method are they using?", options: ["an online questionnaire", "interviews", "observation"], answer: "A" },
            { type: "mc", text: "How many responses have they received?", options: ["85", "150", "200"], answer: "B" },
            { type: "mc", text: "What surprised the students most?", options: ["Most students prefer silent study areas.", "Most students use the library for group work.", "Nobody borrows printed books."], answer: "B" },
            { type: "mc", text: "The tutor is worried that", options: ["the sample is too small.", "too many first-year students replied.", "the questions are unclear."], answer: "B" },
            { type: "mc", text: "What will the students do next?", options: ["start writing the introduction", "carry out some interviews", "present to the library staff"], answer: "B" },
          ],
        },
        {
          instr: "Questions 7–10. Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
          title: "Project report",
          qs: [
            { type: "gap", text: "Deadline: ___ May", answer: ["14", "14th", "fourteenth"] },
            { type: "gap", text: "Length: about ___ words", answer: ["3000", "3,000", "three thousand"] },
            { type: "gap", text: "Survey questions go in an ___", answer: ["appendix"] },
            { type: "gap", text: "Findings presented on a ___", answer: ["poster"] },
          ],
        },
      ],
      tips: "В Part 3 говорят несколько человек и часто меняют мнение. Ответ — то, на чём сошлись в конце (интервью → анкета).",
    },
    {
      id: "L4", part: 4, title: "Lecture: sleep and memory",
      about: "Академическая лекция одного человека. Самая сложная часть: 10 пропусков подряд без пауз.",
      voices: { P: "male" },
      script: [
        ["P", "Good afternoon. Today's lecture is about something every student has an opinion on, but few take seriously: sleep, and in particular its role in memory."],
        ["P", "Let's start with how much sleep we need. Most adults need between seven and nine hours a night. Teenagers, however, need more, somewhere between eight and ten hours, so about nine hours on average. Surveys suggest that most teenagers get far less than this."],
        ["P", "So what happens to memory while we sleep? During the day, new information is stored temporarily in a part of the brain called the hippocampus. Then, during deep sleep, the brain replays the day's memories, almost like rewatching a video. Over the night, this information is gradually transferred to the cortex, where it can be stored for the long term."],
        ["P", "The evidence for this is quite strong. In one well-known type of study, students learn a list of words and are then tested twelve hours later. Those who slept during that time typically remember around twenty percent more than those who stayed awake."],
        ["P", "Deep sleep isn't the whole story, though. Another stage, called REM sleep, which is when most dreaming happens, seems to be linked to creativity and problem solving. People who are woken from REM sleep are often better at finding unusual connections between ideas."],
        ["P", "Now, some practical advice. Phones and laptops give out blue light, which reduces the production of melatonin, the hormone that tells your body it's time to sleep. So it's a good idea to stop using screens at least thirty minutes before bed. Caffeine is another problem. Many people don't realise that a cup of coffee can still affect their sleep up to six hours later."],
        ["P", "What about naps? A short nap can actually improve alertness and memory, but keep it short. Naps should last no longer than twenty minutes. Any longer, and you may wake up feeling worse."],
        ["P", "And finally, a word about exams. Many students stay up all night revising. Unfortunately, the research is clear: a night without sleep reduces attention the next day, and much of what you studied that night will not be stored properly. In other words, sleep is part of revision, not an alternative to it."],
      ],
      groups: [
        {
          instr: "Questions 1–10. Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
          title: "Sleep and memory",
          qs: [
            { type: "gap", text: "Teenagers need about ___ hours of sleep.", answer: ["9", "nine"] },
            { type: "gap", text: "During deep sleep, the brain replays the day's ___.", answer: ["memories"] },
            { type: "gap", text: "Information moves to the ___ for long-term storage.", answer: ["cortex"] },
            { type: "gap", text: "Students who slept remembered about ___ % more.", answer: ["20", "twenty"] },
            { type: "gap", text: "REM sleep is linked to ___ and problem solving.", answer: ["creativity"] },
            { type: "gap", text: "Blue light reduces the hormone ___.", answer: ["melatonin"] },
            { type: "gap", text: "Stop using screens at least ___ minutes before bed.", answer: ["30", "thirty"] },
            { type: "gap", text: "Coffee can affect sleep up to ___ hours later.", answer: ["6", "six"] },
            { type: "gap", text: "Naps should last no longer than ___ minutes.", answer: ["20", "twenty"] },
            { type: "gap", text: "A night without sleep reduces ___ the next day.", answer: ["attention"] },
          ],
        },
      ],
      tips: "В Part 4 нет паузы посередине. Заранее прочитай все пропуски и подумай, какое слово подойдёт: число, существительное, прилагательное.",
    },
  ];

  // =====================================================================
  //  READING — 3 текста, как в Academic. По 10 вопросов, 20 минут на текст.
  // =====================================================================
  const READING = [
    {
      id: "R1", title: "Cities that make their own weather", level: "Passage 1 · легче",
      paras: [
        ["A", "On a calm summer night, the centre of a large city can be several degrees warmer than the fields just outside it. This effect, known as the urban heat island, was first described more than two hundred years ago. In the early nineteenth century, the amateur scientist Luke Howard compared temperature records from central London with those from the surrounding countryside and noticed that the city was consistently warmer, especially after dark."],
        ["B", "The causes are now well understood. Dark surfaces such as asphalt roads and roofs absorb large amounts of sunlight during the day and release it slowly at night. In the countryside, plants cool the air by releasing water vapour through their leaves, a process called evapotranspiration, but in cities much of the ground is covered by concrete. Tall buildings also create narrow 'canyons' that trap heat and block the wind, while cars, factories and air conditioners add waste heat of their own."],
        ["C", "The consequences can be serious. During heatwaves, hospitals in cities often see a sharp rise in patients, particularly among elderly people, whose bodies are less able to cope with high temperatures. Warmer nights are especially dangerous, because the body has no chance to recover. Higher temperatures also increase the demand for air conditioning, which uses more electricity and, ironically, releases even more heat into the streets."],
        ["D", "Fortunately, cities can be cooled. One of the simplest methods is the 'cool roof': painting roofs white or covering them with reflective materials so that they absorb less sunlight. Green roofs, which are covered with plants, have a similar effect and also help to absorb rainwater. Planting trees is perhaps the most effective approach of all, because trees both shade the ground and cool the air around them."],
        ["E", "The Colombian city of Medellín offers a well-known example. Starting in 2016, the city created a network of 'green corridors', planting trees and plants along roads and streams. Studies suggest that temperatures in some of these areas fell by around two degrees. The project also created jobs for local residents, who were trained as gardeners. Experts point out, however, that there is no single solution: the right mix of methods depends on each city's climate and layout."],
      ],
      groups: [
        {
          instr: "Questions 1–5. Do the following statements agree with the information in the passage? Write TRUE if the statement agrees with the information, FALSE if it contradicts the information, NOT GIVEN if there is no information on this.",
          kind: "tfng",
          qs: [
            { type: "tfng", text: "The difference in temperature between a city and the countryside is greatest at night.", answer: "TRUE" },
            { type: "tfng", text: "Luke Howard was a professional scientist employed by the government.", answer: "FALSE" },
            { type: "tfng", text: "Concrete releases more water vapour than plants do.", answer: "FALSE" },
            { type: "tfng", text: "Air conditioning can make the urban heat island effect worse.", answer: "TRUE" },
            { type: "tfng", text: "Green roofs are more expensive to build than cool roofs.", answer: "NOT GIVEN" },
          ],
        },
        {
          instr: "Questions 6–7. Choose the correct letter, A, B or C.",
          qs: [
            { type: "mc", text: "According to the writer, the most effective way to cool a city is to", options: ["paint roofs white.", "plant trees.", "build green roofs."], answer: "B" },
            { type: "mc", text: "What does the writer say about the Medellín project?", options: ["It reduced temperatures by about two degrees in some places.", "It was copied by many other cities.", "It was paid for by local residents."], answer: "A" },
          ],
        },
        {
          instr: "Questions 8–10. Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
          qs: [
            { type: "gap", text: "Plants cool the air through a process called ___.", answer: ["evapotranspiration"] },
            { type: "gap", text: "Tall buildings form narrow ___ that trap heat.", answer: ["canyons"] },
            { type: "gap", text: "Warm nights are dangerous because the body cannot ___.", answer: ["recover"] },
          ],
        },
      ],
    },
    {
      id: "R2", title: "The return of the saiga", level: "Passage 2 · средне",
      paras: [
        ["A", "Few animals look as unusual as the saiga antelope. Its most striking feature is its large, soft nose, which hangs down over its mouth. Far from being a decoration, the nose has a practical job: in summer it filters out the dust raised by the herds as they move across the dry steppe, and in winter it warms the freezing air before it reaches the lungs. Most of the world's saigas live in Kazakhstan, with smaller populations in Russia and Mongolia."],
        ["B", "In the twentieth century, saigas were so numerous that they were hunted on a large scale. The situation changed dramatically after the collapse of the Soviet Union. With the economy in crisis and borders poorly controlled, poaching increased sharply. The main target was the males, whose horns were sold for use in traditional medicine. Within about ten years, the population fell by more than ninety-five percent, one of the fastest declines ever recorded for a large mammal."],
        ["C", "Because only males have horns, poaching also upset the balance of the herds. In some areas there were so few adult males left that many females were unable to breed. Scientists warned that the species could disappear completely, and in 2002 it was classified as critically endangered."],
        ["D", "Conservation efforts began to show results in the 2000s. A long-term programme supported by the government and international organisations created protected areas, trained rangers to stop poachers and used satellite collars to follow the herds' long migrations. Then, in 2015, disaster struck: more than two hundred thousand saigas died within a few weeks. Researchers later found that a normally harmless bacterium had become deadly, probably because of unusually warm and humid weather."],
        ["E", "Remarkably, the population recovered. Saigas breed quickly, and females often give birth to twins. By the early 2020s, aerial surveys counted well over a million animals in Kazakhstan, and in 2023 the species was moved from 'critically endangered' to 'near threatened'. Success has brought new challenges, however. Farmers complain that large herds damage their crops, and the authorities now face the difficult task of balancing the needs of people and wildlife."],
      ],
      groups: [
        {
          instr: "Questions 1–4. The passage has five paragraphs, A–E. Choose the correct heading for paragraphs B–E from the list below.",
          kind: "pick",
          list: [
            ["i", "An unexpected setback"],
            ["ii", "A surprising recovery and a new problem"],
            ["iii", "Why saigas need a large nose"],
            ["iv", "How hunting damaged the herds' structure"],
            ["v", "The economic value of saiga horns"],
            ["vi", "A rapid collapse in numbers"],
            ["vii", "Saigas in other countries"],
          ],
          example: "Example: Paragraph A — iii",
          qs: [
            { type: "pick", text: "Paragraph B", answer: "vi" },
            { type: "pick", text: "Paragraph C", answer: "iv" },
            { type: "pick", text: "Paragraph D", answer: "i" },
            { type: "pick", text: "Paragraph E", answer: "ii" },
          ],
        },
        {
          instr: "Questions 5–8. Do the following statements agree with the information in the passage? Write TRUE, FALSE or NOT GIVEN.",
          kind: "tfng",
          qs: [
            { type: "tfng", text: "The saiga's nose helps it cope with both dust and cold air.", answer: "TRUE" },
            { type: "tfng", text: "Poachers hunted male and female saigas equally.", answer: "FALSE" },
            { type: "tfng", text: "Satellite collars were used to follow the saigas' migrations.", answer: "TRUE" },
            { type: "tfng", text: "The 2015 deaths were caused by poachers.", answer: "FALSE" },
          ],
        },
        {
          instr: "Questions 9–10. Complete the summary. Choose ONE WORD ONLY from the passage for each answer.",
          qs: [
            { type: "gap", text: "Saigas recover quickly because females often give birth to ___.", answer: ["twins"] },
            { type: "gap", text: "Today, ___ complain that the herds damage their fields.", answer: ["farmers"] },
          ],
        },
      ],
    },
    {
      id: "R3", title: "Why we forget, and how to remember", level: "Passage 3 · сложнее",
      paras: [
        ["A", "In the 1880s, the German psychologist Hermann Ebbinghaus carried out one of the most patient experiments in the history of science. Using himself as the only participant, he memorised long lists of meaningless syllables such as 'DAX' and 'BOK', and then tested how much he could remember after different periods of time. He deliberately chose nonsense syllables because real words would have been linked to existing memories, which would have made his results harder to interpret."],
        ["B", "What Ebbinghaus discovered has become known as the forgetting curve. Forgetting, he found, is fastest immediately after learning: a large part of the material disappears within the first day. After that, the rate of forgetting slows down considerably. More than a century later, a team of researchers repeated his experiment and obtained a remarkably similar curve, suggesting that his findings were not simply the result of his unusual method."],
        ["C", "Ebbinghaus also noticed something more encouraging. Each time he relearned a list, he forgot it more slowly than before. This idea, that reviewing material at increasing intervals produces stronger memories than studying it many times in a row, is now called the spacing effect. It is one of the most reliable findings in psychology, yet it is often ignored by students, who tend to prefer last-minute revision. In my view, this is one of the most expensive mistakes in education."],
        ["D", "A related discovery concerns the way we review. In a well-known study published in 2006, Henry Roediger and Jeffrey Karpicke compared students who reread a text several times with students who read it once and then tried to recall it from memory. A week later, the second group remembered considerably more, even though they had felt less confident. Actively retrieving information, it seems, strengthens memory far more than passively looking at it again."],
        ["E", "These ideas were turned into a practical system long before computers. In the 1970s, the German journalist Sebastian Leitner proposed using a set of boxes for flashcards. Cards that were answered correctly moved to the next box, which was reviewed less often, while cards that were answered incorrectly went back to the first box. Modern spaced-repetition apps follow the same logic, but use algorithms to calculate the ideal moment for each review. Whether these apps will change the way schools teach remains to be seen, but the science behind them is hard to argue with."],
      ],
      groups: [
        {
          instr: "Questions 1–3. Choose the correct letter, A, B or C.",
          qs: [
            { type: "mc", text: "Why did Ebbinghaus use nonsense syllables?", options: ["They were easier to memorise.", "They were not connected to existing memories.", "Real words were too difficult to test."], answer: "B" },
            { type: "mc", text: "According to the forgetting curve, most forgetting happens", options: ["soon after learning.", "after about a week.", "at a steady rate over time."], answer: "A" },
            { type: "mc", text: "In the 2006 study, the students who tried to recall the text", options: ["felt more confident.", "remembered more a week later.", "read the text several times."], answer: "B" },
          ],
        },
        {
          instr: "Questions 4–7. Do the following statements agree with the views of the writer? Write YES if the statement agrees with the views of the writer, NO if it contradicts the views of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.",
          kind: "yng",
          qs: [
            { type: "tfng", text: "The modern repetition of Ebbinghaus's experiment supports his original results.", answer: "YES" },
            { type: "tfng", text: "Students are right to prefer last-minute revision.", answer: "NO" },
            { type: "tfng", text: "Spaced-repetition apps are more effective than paper flashcards.", answer: "NOT GIVEN" },
            { type: "tfng", text: "There is strong scientific support for spaced repetition.", answer: "YES" },
          ],
        },
        {
          instr: "Questions 8–10. Match each finding with the correct person or people. A Ebbinghaus   B Roediger and Karpicke   C Leitner",
          kind: "pick",
          list: [["A", "Ebbinghaus"], ["B", "Roediger and Karpicke"], ["C", "Leitner"]],
          qs: [
            { type: "pick", text: "Recalling information is more effective than rereading it.", answer: "B" },
            { type: "pick", text: "Material that is relearned is forgotten more slowly.", answer: "A" },
            { type: "pick", text: "Cards that are remembered should be reviewed less frequently.", answer: "C" },
          ],
        },
      ],
    },
  ];

  /** Примерный band по числу верных ответов из 40 (Academic Reading / Listening). */
  const BAND40 = [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [0, 3.5]];
  const band = (correct, total) => {
    const n = Math.round((correct / total) * 40);
    return BAND40.find(([min]) => n >= min)[1];
  };

  return { OFFICIAL, LISTENING, READING, band };
})();
