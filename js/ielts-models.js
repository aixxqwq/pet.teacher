/*
  IELTS: образцы сильных ответов (уровень band 8–9) для заданий из этого сайта.
  Написаны специально для Bilim Buddy. В «why» — почему такой ответ получает высокий балл.
  Не заучивай их наизусть: экзаменаторы легко узнают выученный текст. Смотри на структуру и приёмы.
*/
const IELTS_MODELS = (() => {
  const WRITING = [
    {
      kind: "Task 2 · Opinion", band: "8–9",
      prompt: "Some people believe that university education should be free for all students. To what extent do you agree or disagree?",
      text: `In many countries, the cost of a degree has risen so sharply that higher education is increasingly seen as a privilege rather than a right. While I accept that free tuition for everyone would place a heavy burden on public budgets, I largely agree that university education should be free, provided that access is based on merit.

The strongest argument for free university education is that it gives talented students an equal chance regardless of their family's income. When tuition fees are high, capable young people from low-income households often choose not to apply, or they graduate with debts that limit their choices for years. A society that loses these people loses future doctors, engineers and teachers. Free education, therefore, is not simply generous; it is an investment that pays for itself through a more skilled workforce and higher tax revenue in the long term.

Critics argue that taxpayers should not fund degrees that bring large private benefits to graduates, and that free places may encourage students to enrol without real commitment. These concerns are valid, but they can be addressed. Places could be allocated through competitive entrance exams, as is the case with state grants in some countries, and students who repeatedly fail their courses could be required to start paying fees. In this way, the system rewards effort rather than wealth.

In conclusion, although making university free for everyone is costly, I believe the benefits for both individuals and society outweigh the drawbacks, as long as places are awarded on the basis of ability and students remain accountable for their progress.`,
      why: [
        "Позиция ясна с первого абзаца («I largely agree… provided that…») и не меняется до конца — это важно для Task Response.",
        "Каждый абзац — одна главная мысль + объяснение + последствие. Есть контраргумент и его опровержение.",
        "Связки разнообразные и естественные: therefore, These concerns are valid, but…, In this way.",
        "Лексика точная: a heavy burden on public budgets, allocated through competitive entrance exams, accountable.",
        "Около 260 слов: чуть больше минимума (250), тема раскрыта без «воды».",
      ],
    },
    {
      kind: "Task 2 · Advantages / Disadvantages", band: "8–9",
      prompt: "More and more people are choosing to work from home. Do the advantages of this trend outweigh the disadvantages?",
      text: `Since the pandemic, working from home has changed from a rare privilege into a normal arrangement for millions of office workers. Although this trend has some significant drawbacks, I believe its advantages are greater, particularly for employees.

The most obvious benefit is the time and money saved on commuting. In large cities, workers can spend two hours a day travelling, which is not only exhausting but also expensive. Working from home gives this time back, allowing people to sleep longer, exercise or spend more time with their families. In addition, many people find that they can concentrate better at home, away from the constant interruptions of an open-plan office, which can lead to higher productivity.

On the other hand, remote work can make people feel isolated. Without casual conversations in the corridor, employees may lose a sense of belonging, and younger workers in particular miss the chance to learn by watching experienced colleagues. There is also a risk that the boundary between work and private life disappears, so that people answer emails late into the evening and find it difficult to switch off.

However, these problems can largely be solved through sensible policies. Many companies now use a hybrid model, in which staff come to the office two or three days a week for meetings and teamwork, and work from home for tasks that require focus. Clear rules about working hours can also protect employees' free time.

Overall, while working from home is not ideal for everyone, its benefits in terms of time, cost and concentration outweigh its disadvantages, especially when it is combined with regular time in the office.`,
      why: [
        "Вопрос «outweigh?» требует сравнения — ответ даётся во введении и в заключении.",
        "Сначала плюсы, потом минусы, затем абзац, который объясняет, почему минусы можно решить. Это и есть аргумент «плюсы перевешивают».",
        "Конкретные примеры вместо общих слов: two hours a day travelling, hybrid model, two or three days a week.",
        "Сложные предложения с which/in which/so that без ошибок — высокий балл за грамматику.",
      ],
    },
    {
      kind: "Task 2 · Problem / Solution", band: "8",
      prompt: "In many cities, traffic congestion is becoming a serious problem. What are the causes of this problem, and what solutions can you suggest?",
      text: `Traffic jams have become a daily reality in cities from Almaty to London, wasting time, polluting the air and raising stress levels. This essay will examine the main reasons for this situation and suggest several measures that could improve it.

The primary cause of congestion is the rapid growth in car ownership. As incomes rise, more families can afford a car, and in many cities owning one is seen as a symbol of status. At the same time, public transport has often failed to keep pace with the growth of the population. When buses are overcrowded, slow or unreliable, people naturally choose to drive, even for short journeys. Poor urban planning makes matters worse: new residential districts are frequently built far from workplaces and schools, which forces residents to travel long distances every day.

Several solutions could ease the problem. First and foremost, governments should invest in fast and comfortable public transport, such as metro lines and dedicated bus lanes, so that it becomes a genuine alternative to the car. Secondly, cities could introduce congestion charges, which require drivers to pay for entering the city centre at peak times. This approach has successfully reduced traffic in cities such as Stockholm and Singapore. Finally, planners should design neighbourhoods where shops, schools and offices are within walking or cycling distance, reducing the need for daily car journeys.

In conclusion, traffic congestion is caused mainly by rising car ownership, inadequate public transport and poor planning. A combination of better public transport, road charges and smarter city design offers the best chance of solving it.`,
      why: [
        "Обе части вопроса (causes и solutions) раскрыты в отдельных абзацах — частая ошибка учеников в том, что одну часть забывают.",
        "Решения прямо отвечают причинам: машины → платный въезд, слабый транспорт → метро и выделенные полосы, планировка → районы «всё рядом».",
        "Местный пример (Almaty) и реальные города (Stockholm, Singapore) делают аргументы убедительнее.",
        "Порядок решений показан связками: First and foremost, Secondly, Finally.",
      ],
    },
    {
      kind: "Task 2 · Two-part question", band: "8–9",
      prompt: "Nowadays many people buy products online rather than in shops. Why is this the case? Is this a positive or negative development?",
      text: `Online shopping has grown enormously over the past decade, and for many people a marketplace app has replaced the weekly trip to the shops. In my opinion, this shift is driven mainly by convenience and price, and it is largely a positive development, although it creates challenges for local businesses.

There are two key reasons why consumers prefer to buy online. The first is convenience: customers can order almost anything at any time of day and have it delivered to their door, often within a day or two. This is particularly valuable for busy parents and for people living in small towns with a limited choice of shops. The second reason is price. Because online retailers do not need to rent expensive shop space, they can offer lower prices, and customers can compare dozens of sellers in seconds before making a decision.

I believe this development is mostly positive. Consumers save both time and money, and small producers, such as craftspeople or farmers, can now sell their goods across the whole country without opening a physical store. Online reviews also make it easier to avoid poor-quality products.

Nevertheless, the trend has a negative side. Traditional shops are closing, which can leave town centres empty and cause job losses. The growth in deliveries also increases packaging waste and traffic. These problems, however, could be reduced by supporting local high streets and encouraging retailers to use recyclable packaging.

To sum up, people shop online because it is quicker, easier and cheaper. Despite some drawbacks for traditional retailers and the environment, I consider it a positive change overall.`,
      why: [
        "Два вопроса → два ответа. Во введении сразу сказано: причины — удобство и цена, оценка — скорее положительная.",
        "Мнение аргументировано и показано, что автор видит обратную сторону (Nevertheless…), но вывод не противоречит позиции.",
        "Хорошая collocation-лексика: physical store, high streets, recyclable packaging, compare dozens of sellers.",
      ],
    },
    {
      kind: "Task 1 · Letter (General Training)", band: "8–9",
      prompt: "You recently bought a laptop online, but it arrived damaged. Write a letter to the company. In your letter: describe what you bought; explain what is wrong with it; say what you would like the company to do.",
      text: `Dear Sir or Madam,

I am writing to complain about a laptop that I ordered from your website on 3 March (order number 58214). Unfortunately, the item arrived in an unacceptable condition.

The laptop I purchased was a 15-inch TechPro X5 in silver, which cost £649. Although the outer box looked undamaged, when I opened it I discovered that the screen had a long crack running across the top right corner. In addition, two of the keys on the keyboard were loose, and the laptop shuts down without warning after a few minutes of use. As I bought the computer specifically for my university course, which starts next week, this is extremely inconvenient.

I would therefore be grateful if you could arrange for a replacement to be delivered as soon as possible, ideally before Monday. If this is not possible, I would like a full refund, including the delivery charge. I would also appreciate it if you could collect the damaged laptop from my address, as I do not have a car to take it to a post office.

I have attached photographs of the damage for your reference. I look forward to hearing from you at your earliest convenience.

Yours faithfully,
Aigerim Sadykova`,
      why: [
        "Все три пункта задания раскрыты, каждый в своём абзаце — это главное требование Task 1.",
        "Тон официальный и вежливый: Dear Sir or Madam → Yours faithfully, I would be grateful if…, I would appreciate it if…",
        "Конкретные детали (номер заказа, модель, цена, дата) делают письмо правдоподобным.",
        "Есть запасной вариант (If this is not possible…) — это показывает зрелое владение языком.",
      ],
    },
  ];

  const SPEAKING = [
    {
      kind: "Part 1 · Hometown", band: "8",
      items: [
        ["Where is your hometown?", "I'm from Almaty, which is the largest city in Kazakhstan. It's in the south-east of the country, right at the foot of the mountains, so you can see snowy peaks from almost anywhere in the city."],
        ["What do you like about it?", "Mostly the mix of city life and nature. In the morning you can be in a busy café downtown, and an hour later you can be hiking in the mountains. Not many big cities give you that."],
        ["Has your hometown changed much in recent years?", "Yes, quite dramatically. There are far more cafés and co-working spaces than when I was a child, and the metro has been extended. The downside is that traffic has got much worse."],
        ["Would you like to live there in the future?", "Probably, yes, although I'd like to spend a few years abroad first to get some international experience. I think I'd always come back eventually, because my family and friends are there."],
      ],
      why: [
        "Ответ — 2–3 предложения: прямой ответ + причина + деталь. Не одно слово и не монолог.",
        "Естественные разговорные обороты: right at the foot of, quite dramatically, The downside is…",
        "Разные времена: present, present perfect (has got worse), conditionals (I'd like to…).",
      ],
    },
    {
      kind: "Part 2 · Describe a person who has influenced you", band: "8–9",
      items: [
        ["Long turn (около 2 минут)", `I'd like to talk about my grandmother, who has probably had a bigger influence on me than anyone else.

She worked as a maths teacher in a small town for almost forty years, and I spent every summer at her house when I was a child. Even though she was retired by then, she still had former students knocking on her door to ask for advice, which tells you a lot about the kind of teacher she was.

What I remember most is how patient she was. When I struggled with a problem, she never gave me the answer. Instead, she'd ask me questions until I worked it out myself. At the time I found it slightly annoying, to be honest, but now I realise she was teaching me to think rather than to memorise.

She also showed me that learning doesn't stop when you leave school. In her seventies she taught herself to use a smartphone and started learning English from an app, just so that she could talk to her cousin's family in Canada.

I think her biggest influence on me is my attitude to difficulties. Whenever something seems too hard, like preparing for IELTS, actually, I remember her saying that a problem is just a question you haven't answered yet. That's helped me a lot, and it's one of the reasons I'd like to work in education myself one day.`],
      ],
      why: [
        "Все пункты карточки раскрыты по порядку: кто, откуда знаешь, что делал, как повлиял.",
        "История с деталями (40 лет, бывшие ученики у двери, смартфон в 70 лет) звучит живо и легко растягивается на 2 минуты.",
        "Естественные «заполнители» вместо пауз: to be honest, actually, which tells you a lot about…",
        "Чёткое завершение: последний абзац отвечает на «explain how they have influenced you».",
      ],
    },
    {
      kind: "Part 2 · Describe a place in your country you would recommend to visitors", band: "8",
      items: [
        ["Long turn (около 2 минут)", `The place I'd recommend is Charyn Canyon, which is about three hours' drive east of Almaty.

It's a huge canyon, more than a hundred and fifty kilometres long, and one part of it is called the Valley of Castles, because the red rock formations really do look like ruined towers and walls. People often compare it to the Grand Canyon in the USA. It's smaller, of course, but it's much less crowded, which I think makes it more special.

There's quite a lot to do there. Most visitors walk along the bottom of the canyon to the river, which takes about an hour and isn't too difficult. If you're more adventurous, you can stay overnight in one of the eco-lodges by the river, and the sky at night is absolutely full of stars because there's no light pollution.

As for the best time to go, I'd say either late spring or early autumn. In summer it gets unbearably hot, sometimes over forty degrees, and in winter some of the roads can be closed.

The main reason I'd recommend it is that it shows a completely different side of Kazakhstan. A lot of foreigners imagine our country as endless flat steppe, so the colours and shapes of the canyon really surprise them. Every time I've taken guests there, they've said it was the highlight of their trip.`],
      ],
      why: [
        "Структура совпадает с пунктами карточки, поэтому экзаменатору легко следить.",
        "Точные детали (150 км, Valley of Castles, 40 градусов) и сравнение (Grand Canyon) показывают богатый словарь.",
        "Идиоматичные выражения: light pollution, the highlight of their trip, a completely different side of…",
      ],
    },
    {
      kind: "Part 3 · Tourism (discussion)", band: "8–9",
      items: [
        ["How does tourism affect local people?", "It's a mixed picture. On the positive side, tourism creates jobs, not just in hotels but also for guides, drivers and people selling local crafts, so money flows into areas that might otherwise be quite poor. On the other hand, if there are too many visitors, prices go up, and local people can be pushed out of their own neighbourhoods. You see this in some European cities, where whole streets have been turned into short-term rentals."],
        ["Should governments spend money to protect historical places?", "I'd say definitely, yes. Historical sites are a kind of shared memory, and once they're destroyed, they can't be replaced. There's also a practical argument: well-preserved sites attract tourists, so the money spent on them often comes back through tourism. That said, I think governments should also involve local communities, because people tend to look after places they feel connected to."],
        ["How will travel change in the future?", "I suspect it'll become more expensive, especially flying, because of the pressure to cut carbon emissions. As a result, people might travel less often but stay longer in one place. I also think we'll see much more travel closer to home. Even now, a lot of young people in Kazakhstan are discovering places in their own country that their parents never visited."],
      ],
      why: [
        "Каждый ответ: позиция → объяснение → пример или уточнение. Длина 40–60 секунд.",
        "Взвешенность: It's a mixed picture, That said… — это то, что экзаменаторы ждут в Part 3.",
        "Абстрактная лексика: shared memory, carbon emissions, short-term rentals.",
        "Осторожные предположения о будущем: I suspect, might, I think we'll see…",
      ],
    },
  ];

  return { WRITING, SPEAKING };
})();
