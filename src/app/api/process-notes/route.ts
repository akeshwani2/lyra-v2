import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (text.split(' ').length < 20) {
      return NextResponse.json({
        notes: `Quick Recording:\n\n${text}\n\n(Note: For best results, try recording at least a few sentences of lecture content)`
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Transform lecture transcriptions into well-structured notes using HTML formatting. Structure your response exactly like this:

<h2>Topic:</h2>
[Topic title]

<h2>Key Points:</h2>
[Write key points as clear, concise paragraphs. Each paragraph should focus on one main idea.]

<h2>Important Takeaways:</h2>
[Write takeaways as concise paragraphs, focusing on the most crucial insights and conclusions.]

Use HTML headers for sections and write in clear, well-structured paragraphs, and do not use bullet points.`
        },
        {
          role: "user",
          content: text
        }
      ],
    });

    return NextResponse.json({ notes: completion.choices[0].message.content });
  } catch (error) {
    console.error('Notes processing error:', error);
    return NextResponse.json({ error: 'Notes processing failed' }, { status: 500 });
  }
}