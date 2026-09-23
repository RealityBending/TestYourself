/* Written by docs/build_slides.py out of the app's own content files.
   Do not edit by hand: run the script again instead.

   One entry per row of the Content table, holding that instrument's
   items as they are asked, flattened to plain text. Read by deck.js,
   which shows them beside the row. */

const ITEMS = {
    "r0": [
        "How old are you?",
        "In which month were you born?",
        "On which day of January were you born? [worded from an earlier answer]",
        "I am...",
        "I was born...",
        "But I identify as..."
    ],
    "r1": [
        "I see myself as extraverted, enthusiastic That is: sociable, assertive, talkative, active, NOT reserved or shy",
        "I see myself as agreeable, kind That is: trusting, generous, sympathetic, cooperative, NOT aggressive or cold",
        "I see myself as dependable, organized That is: hard-working, responsible, self-disciplined, thorough, NOT careless or impulsive",
        "I see myself as emotionally stable, calm That is: relaxed, self-confident, NOT anxious, moody, easily upset or easily stressed",
        "I see myself as open to experience, imaginative That is: curious, reflective, creative, deep, open-minded, NOT conventional"
    ],
    "r2": [
        "I am a narcissist Narcissist, here, means egotistical, self-focused and vain."
    ],
    "r3": [
        "In general, would you say your health is... Health, here, refers to your physical health."
    ],
    "r4": [
        "Do you feel this kind of stress these days? Stress, here, means a situation in which a person feels tense, restless, nervous or anxious or is unable to sleep at night because his/her mind is troubled all the time."
    ],
    "r5": [
        "I have high self-esteem"
    ],
    "r6": [
        "In general, I have a clear sense of who I am and what I am"
    ],
    "r7": [
        "I am seeking a purpose or mission for my life"
    ],
    "r8": [
        "I am confident that I can perform effectively on many different tasks"
    ],
    "r9": [
        "I value beautiful things and I go out of my way to seek out beauty Beauty, here, means in art, music, nature, design or the world around you."
    ],
    "r10": [
        "All things considered, how satisfied are you with your life as a whole?"
    ],
    "r11": [
        "I am typically more intelligent than... Intelligent, here, refers to reasoning, problem-solving and how quickly you learn or understand things. It does not refer to emotional intelligence, social skills, wisdom or creativity.",
        "I am typically more attractive than... Attractive, here, refers to your overall desirability as a romantic or sexual partner. Not just physical appearance, but also personality, charm and other qualities that make someone appealing to others."
    ],
    "r12": [
        "What is your highest completed education level?",
        "Your highest completed education level is...",
        "What is your discipline?",
        "Your discipline is...",
        "Are you currently a student?",
        "How would you describe your ethnicity?",
        "You would describe your ethnicity as...",
        "In which country are you currently living?",
        "You are currently living in..."
    ],
    "r13": [
        "I can always accurately feel when I am about to fart",
        "I can always accurately feel when I am about to sneeze",
        "I can always accurately feel when I am about to burp",
        "I always feel in my body if I am relaxed",
        "I always know when I am relaxed",
        "My body is always in the same specific state when I am relaxed",
        "During sex or masturbation, I often feel very strong sensations coming from my genital areas",
        "My genital organs are very sensitive to pleasant stimulations",
        "When I am sexually aroused, I often notice specific sensations in my genital area (e.g., tingling, warmth, wetness, stiffness, pulsations)",
        "Sometimes my breathing becomes erratic or shallow and I often don't know why",
        "I often feel like I can't get enough oxygen by breathing normally",
        "Sometimes my heart starts racing and I often don't know why",
        "I sometimes feel like I need to urinate or defecate but when I go to the bathroom I produce less than I expected",
        "I often feel the need to urinate even when my bladder is not full",
        "Sometimes I am not sure whether I need to go to the toilet or not (to urinate or defecate)",
        "In general, my skin is very sensitive",
        "My skin is susceptible to itchy fabrics and materials",
        "I can notice even very subtle stimulations to my skin (e.g., very light touches)",
        "I don't always feel the need to eat until I am really hungry",
        "Sometimes I don't realise I was hungry until I ate something",
        "I don't always feel the need to drink until I am really thirsty",
        "I often check the smell of my armpits",
        "I often check the smell of my own breath",
        "I often check the smell of my farts",
        "In general, I am very sensitive to changes in my breathing",
        "I can notice even very subtle changes in my breathing",
        "I am always very aware of how I am breathing, even when I am calm",
        "In general, I am very sensitive to changes in my heart rate",
        "I often notice changes in my heart rate",
        "I can notice even very subtle changes in the way my heart beats",
        "I can notice even very subtle changes in what my stomach is doing",
        "In general, I am very sensitive to what my stomach is doing",
        "I am always very aware of what my stomach is doing, even when I am calm",
        "I can always accurately answer to the extreme left on this question to show that I am reading it [attention check]"
    ],
    "r14": [
        "How knowledgeable do you consider yourself about Artificial Intelligence (AI) technology?",
        "How well do you understand the way modern AI systems actually work, technically? For instance, how large language models (LLMs) and generative AI produce the text or images they do.",
        "How frequently do you use Artificial Intelligence (AI) tools or technologies in your daily life? This includes tools like ChatGPT, image or art generators and AI assistants.",
        "Current AI algorithms can generate very realistic images",
        "Images of faces or people generated by AI always contain errors and artifacts",
        "Videos generated by AI have obvious problems that make them easy to spot as fake",
        "Current AI algorithms can generate very realistic videos",
        "Computer-Generated Images (CGI) are capable of perfectly imitating reality",
        "Technology allows the creation of environments that seem just as real as reality",
        "AI assistants can write texts that are indistinguishable from those written by humans",
        "Documents and paragraphs written by AI usually read differently compared to Human productions",
        "AI is dangerous",
        "I am worried about future uses of AI",
        "AI is exciting",
        "Much of society will benefit from a future full of AI",
        "I can easily distinguish between real and AI-generated images",
        "I am bad at telling if images are real or AI-generated",
        "I often find it challenging to differentiate between AI-generated and human-written text",
        "I can accurately detect subtle differences between AI from human-created content",
        "Human creators bring a unique perspective that AI cannot replicate",
        "AI-generated art can sometimes surpass human creativity and artistic value",
        "AI-generated content often feels impersonal compared to human-generated media",
        "AI-generated content tends to be more interesting and engaging than human-generated content",
        "Human-made art evokes stronger emotional responses than AI-generated art",
        "I am more likely to appreciate content when I know it is created by humans rather than AI",
        "I am more likely to trust content when I know it is created by a human rather than AI",
        "I can show that I am Human and not an AI by answering all the way to the right [attention check]"
    ],
    "r15": [
        "Which of these descriptions comes closest to how you feel about your household's financial situation today?"
    ],
    "r16": [
        "Think of the ladder below as showing where people stand relative to other people in your country. At the top are people who have the most money, the most education and the most respected jobs. At the bottom are people who have the least money, the least education and the least respected jobs. Where would you place yourself on this ladder?"
    ],
    "r17": [
        "Feeling nervous, anxious or on edge",
        "Not being able to stop or control worrying",
        "Feeling down, depressed or hopeless",
        "Little interest or pleasure in doing things"
    ],
    "r18": [
        "During the past 7 days, how would you rate your sleep quality overall?"
    ],
    "r19": [
        "Are you currently living with any of the following, as diagnosed by a professional?",
        "Are you currently receiving any of the following?"
    ],
    "r20": [
        "I found it easy to deceive others",
        "I deserved special treatment",
        "I saw things that were not really there",
        "My fantasies felt very real to me",
        "I liked having power",
        "I felt something was wrong with my body",
        "When I had the chance, I chose to be alone rather than with other people",
        "My moods were intense and unpredictable",
        "My mind was flooded with troubling images of a bad experience",
        "I had pains in several parts of my body",
        "I felt like I was outside of my body",
        "I was happiest when I was alone",
        "I found it easy to manipulate others",
        "I was bothered by several bodily symptoms (e.g., headache, fatigue or stomach problems) for which there was no clear or sufficient medical explanation",
        "I had trouble planning and keeping to schedules",
        "I lost things that I needed",
        "I was frustrated with having to convince others I had a real illness",
        "Even when I was very careful, I worried whether I had done something correctly",
        "Reading articles about disease made me worry about my health",
        "I paid my bills late or missed other important deadlines",
        "I could feel changes in my body",
        "I was disgusted with myself",
        "I felt on guard and on edge",
        "I was a messy person",
        "I did things to get others to notice me",
        "I noticed small changes to how my body feels",
        "Things went best when I told others what to do",
        "I heard things that no one else could hear",
        "I was never on time",
        "I had no interest in romantic relationships",
        "Romantic relationships seemed like a hassle to me",
        "I said things without thinking",
        "People told me I was coldhearted",
        "I made decisions quickly without thinking them through",
        "I quit tasks that became too challenging",
        "I had a hard time asserting myself to others",
        "I felt that I did not want to be in a close relationship",
        "I had trouble telling whether something really happened or I just imagined it",
        "I felt that things around me were not real",
        "I liked attracting the attention of others",
        "I was afraid that I might suffer from a serious illness",
        "I thought a lot about death",
        "I bought much more than I needed",
        "I was overwhelmed by anxiety",
        "I expected to get treated better than others",
        "I read each of these statements carefully, and will answer \"A lot\" to this one [attention check]"
    ],
    "r21": [
        "I wouldn't pretend to like someone just to get that person to do favors for me",
        "I would like to be seen driving around in a very expensive car",
        "I want people to know that I am an important person of high status",
        "Even in an emergency I wouldn't feel like panicking",
        "When I suffer from a painful experience, I need someone to make me feel comfortable",
        "I sometimes can't help worrying about little things",
        "I feel that I am an unpopular person",
        "I rarely express my opinions in group meetings",
        "Most people are more upbeat and dynamic than I generally am",
        "I rarely hold a grudge, even against people who have badly wronged me",
        "I generally accept people's faults without complaining about them",
        "I find it hard to keep my temper when people insult me",
        "Often when I set a goal, I end up quitting without having reached it",
        "I make a lot of mistakes because I don't think before I act",
        "When working, I sometimes have difficulties due to being disorganized",
        "I think that paying attention to radical ideas is a waste of time",
        "If I had the opportunity, I would like to attend a classical music concert",
        "I would enjoy creating a work of art, such as a novel, a song, or a painting",
        "To show that I am reading these statements, I will answer \"Strongly disagree\" to this one [attention check]"
    ],
    "r22": [
        "In an argument, I always remain objective and stick to the facts",
        "Even if I am feeling stressed, I am always friendly and polite to others",
        "When talking to someone, I always listen carefully to what the other person says",
        "It has happened that I have taken advantage of someone in the past",
        "I have occasionally thrown litter away in the countryside or on to the road",
        "Sometimes I only help people if I expect to get something in return"
    ],
    "r23": [
        "Even when things look bad, I trust that they will ultimately work out for the best",
        "I stay loyal to the people and places I have always belonged to",
        "I tend to assume that people mean well",
        "I am driven to understand the underlying truth of any situation, even if it is uncomfortable",
        "I question claims until I have seen the evidence for them",
        "I look at my own life from a detached, objective distance",
        "I keep seeking out new experiences to find out who I really am",
        "I need the freedom to chart my own course in life",
        "I get restless whenever my life starts to feel settled and predictable",
        "I am willing to dismantle what no longer serves me so that something new can emerge",
        "I would rather tear something down and start again than keep patching it",
        "I can accept the end of things, such as plans, roles or relationships, once their time has passed",
        "When I change my own attitude, things around me tend to shift as well",
        "When I want something around me to change, I start by working on myself",
        "I see myself as a catalyst: things tend to transform when I get involved",
        "I meet challenges head-on rather than avoiding them",
        "I have the discipline to push through adversity until I achieve what I set out to do",
        "When I compete, I am in it to win",
        "I take life as it comes, hard parts and all, rather than expecting it to be fair",
        "I know I cannot get through life without relying on other people",
        "I feel a kinship with people who have known hard times",
        "I get through hard times by finding what is funny in them",
        "I love bringing playfulness, laughter and lightness into any situation I am in",
        "Nothing is too sacred to joke about",
        "I feel truly alive when I am deeply connected to someone or something I love",
        "When I care about something, I give myself to it completely",
        "I savour beauty and pleasure wherever I find them, in people, places or things",
        "I feel most alive when I am inventing, designing or bringing a new idea into the world",
        "I am always making something, whether anyone asked for it or not",
        "I feel a need to make something that will outlast me",
        "I am at my best when I am in charge",
        "I naturally step up to bring order and direction when things are chaotic",
        "I take responsibility for how things turn out for the people I lead",
        "I feel most fulfilled when I am taking care of someone who needs my support",
        "I feel responsible for easing other people's suffering",
        "When I see someone struggling, I step in to help before they have to ask",
        "To show that I am reading these statements, I will answer 2 on this one [attention check]"
    ],
    "r24": [
        "In life, there's way more beauty than ugliness",
        "It often feels like events are happening in order to help me in some way",
        "I tend to see the world as pretty safe",
        "What happens in the world is meant to happen",
        "While some things are worth checking out or exploring further, most things probably aren't worth the effort",
        "Most things in life are kind of boring",
        "The world is an abundant place with tons and tons to offer",
        "No matter where we are or what the topic might be, the world is fascinating",
        "The world is a somewhat dull place where plenty of things are not that interesting",
        "On the whole, the world is a dangerous place",
        "Instead of being cooperative, the world is a cut-throat and competitive place",
        "Events seem to lack any cosmic or bigger purpose",
        "Most things have a habit of getting worse",
        "The universe needs me for something important",
        "Most things in the world are good",
        "Everything happens for a reason and on purpose",
        "Most things and situations are harmless and totally safe",
        "No matter where we are, incredible beauty is always around us",
        "The world needs to be continually improved rather than accepted",
        "Most situations in life need to be improved, not accepted",
        "Rather than accepting things as they are, the world needs to be improved as much as possible",
        "It's usually better to accept a situation than try to change it",
        "Everything feels like it's shifting and changing",
        "I feel like everything changes all the time",
        "Everything feels like a whirl of constant change",
        "The world is a place where most things stay pretty much the same",
        "Everything feels like it's constantly moving, changing, and up in the air",
        "Most things in the world could be ranked in order of importance",
        "Humans, animals, plants, and pretty much everything else can be organized by how important or good they are",
        "Most things can be organized into hierarchies, rankings, or pecking orders that reflect true differences among things",
        "Most things aren't better or worse. It's hard to organize the world into hierarchies, rankings, or pecking orders that reflect true differences",
        "Things are rarely equal. Most plants and animals, and even people, are better or worse than one another",
        "Every single thing is connected to everything else",
        "The world is a place where everything is completely interconnected",
        "Though things can appear separate and independent, they really aren't. Instead, all is one",
        "Most things are basically unconnected and independent from each other",
        "Most everything is easy enough to understand",
        "The world is easy enough to understand",
        "Lots of things in the world are too confusing and difficult to understand",
        "The world is a confusing place where many skills and subjects are too hard to figure out",
        "Please mark this statement \"slightly disagree.\" [attention check]"
    ],
    "r25": [
        "What number is one fifth of one fourth of one ninth of 900?",
        "Zach is taller than Matt and Richard is shorter than Zach. Which of the following statements would be most accurate?",
        "Joshua is 12 years old and his sister is three times as old as he. When Joshua is 23 years old, how old will his sister be?",
        "If the day after tomorrow is two days before Thursday then what day is it today?",
        "In the following alphanumeric series, what letter comes next?K N P S U",
        "In the following alphanumeric series, what letter comes next?V Q M J H",
        "In the following alphanumeric series, what letter comes next?I J L O S",
        "In the following alphanumeric series, what letter comes next?Q S N P L",
        "Please indicate which is the best answer to complete the figure below [with a figure]",
        "Please indicate which is the best answer to complete the figure below [with a figure]",
        "Please indicate which is the best answer to complete the figure below [with a figure]",
        "Please indicate which is the best answer to complete the figure below [with a figure]",
        "All the cubes below have a different image on each side. Select the choice that could represent a rotation of the following cube [with a figure]",
        "All the cubes below have a different image on each side. Select the choice that could represent a rotation of the following cube [with a figure]",
        "All the cubes below have a different image on each side. Select the choice that could represent a rotation of the following cube [with a figure]",
        "All the cubes below have a different image on each side. Select the choice that could represent a rotation of the following cube [with a figure]"
    ],
    "r26": [
        "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?",
        "How often do you have difficulty getting things in order when you have to do a task that requires organization?"
    ],
    "r27": [
        "Do you find you forget what you came to the shops to buy?",
        "Do you start doing one thing at home and get distracted into doing something else (unintentionally)?"
    ],
    "r28": [
        "I find my thoughts wandering spontaneously",
        "I mind-wander even when I'm supposed to be doing something else"
    ],
    "r29": [
        "I am good at resisting temptation",
        "I have a hard time breaking bad habits"
    ],
    "r30": [
        "Even the littlest things make me emotional",
        "I tend to get very emotional very easily",
        "I often get so upset it's hard for me to think straight",
        "My moods are very strong and powerful",
        "When I am angry/upset, it takes me much longer than most people to calm down",
        "When I feel emotional, it's hard for me to imagine feeling any other way"
    ],
    "r31": [
        "I feel that I am the one who is responsible for what has happened",
        "I think that basically the cause must lie within myself",
        "I think that I have to accept that this has happened",
        "I think that I have to accept the situation",
        "I often think about how I feel about what I have experienced",
        "I am preoccupied with what I think and feel about what I have experienced",
        "I think of pleasant things that have nothing to do with it",
        "I think of something nice instead of what has happened",
        "I think about how to change the situation",
        "I think about a plan of what I can do best",
        "I think I can learn something from the situation",
        "I think that I can become a stronger person as a result of what has happened",
        "I think that it hasn't been too bad compared to other things",
        "I tell myself that there are worse things in life",
        "I keep thinking about how terrible it is what I have experienced",
        "I continually think how horrible the situation has been",
        "I feel that others are responsible for what has happened",
        "I feel that basically the cause lies with others",
        "To show that I am reading these statements, I will answer 2 on this one [attention check]"
    ],
    "r32": [
        "In politics people sometimes talk of \"left\" and \"right\". Where would you place yourself on this scale, where 0 means the left and 10 means the right?"
    ],
    "r33": [
        "Many very important things happen in the world which the public is never informed about",
        "Many events which seem unrelated or accidental are in fact the result of secret activities",
        "There are secret organizations that greatly influence political decisions"
    ],
    "r34": [
        "The government should do more to redistribute income from the better off to those who are less well off",
        "Ordinary working people do not get their fair share of the country's wealth",
        "Businesses should be free to make as much profit as they can, with as little interference from government as possible",
        "How people choose to live, marry or raise a family is their own business, even when it goes against my country's tradition and culture",
        "People who break the law should be given stiffer sentences",
        "The law should always be obeyed, even if I think a particular law is wrong",
        "The police should have more power to monitor people's activities to prevent crime, even at the cost of privacy"
    ],
    "r35": [
        "A fair society is one where men and women, and people of every background, end up equally well off, not just one where they have the same chances",
        "When a group, such as women or minorities, is under-represented in top jobs, in parliament or at university, steps should be taken until it is represented in proportion to its size",
        "As long as everyone has the same chances, it is fair for some groups to end up doing better than others",
        "Opportunities such as jobs or university places should go to the best-qualified candidates, whatever their background, even if that leaves some groups under-represented",
        "When choosing the members of a body such as a parliament, a company board or a panel of experts, which matters more to you: that they bring a range of different views, or that they come from a range of different backgrounds?"
    ],
    "r36": [
        "If it were safe, I would take a treatment that made me more intelligent",
        "It is good that we try to develop technology that would let people live for ever",
        "There is something wrong with using technology to improve on human nature",
        "Parents should not be allowed to choose their children's traits, even if the technology were safe and available to everyone",
        "Differences in intelligence between people are mostly down to their genes",
        "A person's character is largely there from birth",
        "The differences in how people behave are mostly the result of how they were raised"
    ],
    "r37": [
        "Tackling climate change should come first, even if it means slower economic growth",
        "I would accept paying more for fuel, flights and heating if it helped cut carbon emissions",
        "Jobs and cheap energy should come before cutting carbon emissions",
        "New technology will deal with climate change without people having to change how they live",
        "It is wrong to kill animals for food when people can live healthily without meat",
        "Using animals in medical research is acceptable if it might help people",
        "People matter more than animals, and it is right to put our needs first",
        "The country I live in should build more nuclear power stations",
        "Which best describes what you eat?"
    ],
    "r38": [
        "New public buildings should be beautiful, even if that makes them cost more",
        "It is right to fund beautiful things with no practical use, such as art or monuments, even at the expense of things that are useful",
        "How well a thing works matters more than how it looks"
    ],
    "r39": [
        "One last thing. Did you take the test seriously? (This won't impact your results, but will help us improve the test.)",
        "Is there anything you would like to share? Any feedback or thoughts about the test, or about what it told you, are very welcome. Please note that whatever you write here may be made publicly available (for instance as part of the published data), so do not include anything that could identify you or anybody else unless you are happy for it to be public."
    ]
}
