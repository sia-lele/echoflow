import type { Expression } from '../types';

export interface GenericExpression {
  text: string;
  meaning: string;
  example: string;
  prompt: string; // active speaking question
}

// A bank of common, reusable English expressions for practice.
// These are generic daily-life expressions (not from any show).
export const genericExpressions: GenericExpression[] = [
  {
    text: "I didn't get the chance.",
    meaning: 'You wanted to do something, but there was no opportunity.',
    example: "I wanted to talk to her, but I didn't get the chance.",
    prompt: 'What did you want to do yesterday but didn\'t get the chance to?',
  },
  {
    text: 'I was about to say the same thing.',
    meaning: 'You were just going to express the same thought.',
    example: 'I was about to say the same thing when you interrupted me.',
    prompt: 'Tell me about a time you agreed with someone strongly.',
  },
  {
    text: "It's not a big deal.",
    meaning: 'The situation is not important or serious.',
    example: "Don't worry about the delay. It's not a big deal.",
    prompt: 'Describe something that seemed serious but was actually no big deal.',
  },
  {
    text: 'I owe you one.',
    meaning: 'I am grateful and will return the favor.',
    example: 'Thanks for helping me move. I owe you one.',
    prompt: 'Who helped you recently, and how would you thank them?',
  },
  {
    text: "Let me know if you need anything.",
    meaning: 'I am offering help whenever you need it.',
    example: 'If you have any questions, let me know if you need anything.',
    prompt: 'How would you offer help to a friend who is busy?',
  },
  {
    text: "I've been meaning to call you.",
    meaning: 'I intended to call you for a while but did not get to it.',
    example: "Sorry for the delay — I've been meaning to call you.",
    prompt: 'What is something you have been meaning to do lately?',
  },
  {
    text: 'No wonder you look tired.',
    meaning: 'It is not surprising that you look tired.',
    example: 'You worked until midnight? No wonder you look tired.',
    prompt: 'Describe something that explains why you felt a certain way.',
  },
  {
    text: "That makes sense.",
    meaning: 'I understand the logic or reason.',
    example: 'Oh, that makes sense now that you explain it.',
    prompt: 'Share something you learned recently that made sense to you.',
  },
  {
    text: 'I could use a break.',
    meaning: 'I feel tired and would benefit from rest.',
    example: "I've been studying all day. I could use a break.",
    prompt: 'When was the last time you felt you needed a break?',
  },
  {
    text: "I'm not sure yet.",
    meaning: 'I have not decided or do not know for certain.',
    example: "I'm not sure yet if I will go to the party.",
    prompt: 'What is something you are still unsure about these days?',
  },
  {
    text: 'It slipped my mind.',
    meaning: 'I forgot about it.',
    example: "I'm sorry I missed the meeting — it completely slipped my mind.",
    prompt: 'Tell me about something that recently slipped your mind.',
  },
  {
    text: 'That sounds great.',
    meaning: 'I think the idea or plan is good.',
    example: 'Going hiking this weekend? That sounds great.',
    prompt: 'Share a plan you heard recently that sounded great.',
  },
  {
    text: "I'm on my way.",
    meaning: 'I am leaving now / traveling to the place.',
    example: 'Sorry I am late. I am on my way.',
    prompt: 'How would you let someone know you are coming?',
  },
  {
    text: 'Take your time.',
    meaning: 'Do not rush; there is no hurry.',
    example: 'Finish your work first. Take your time.',
    prompt: 'When is it appropriate to tell someone to take their time?',
  },
  {
    text: 'I see what you mean.',
    meaning: 'I understand your point of view.',
    example: 'I see what you mean now that you put it that way.',
    prompt: 'Describe a moment when someone\'s opinion became clear to you.',
  },
];

export function randomGenericExpression(): GenericExpression {
  return genericExpressions[Math.floor(Math.random() * genericExpressions.length)];
}

export function expressionToGeneric(expr: GenericExpression, showId: string, episodeId: string): Omit<Expression, 'id' | 'createdAt'> {
  return {
    text: expr.text,
    meaning: expr.meaning,
    example: expr.example,
    sourceType: 'generic',
    showId,
    episodeId,
  };
}
