import { Request, Response } from 'express';
import OpenAI from 'openai';
import { insertChat } from '../models/chat.js';
import getSocketIOInstance from '../socketServer.js';

export async function getChatCompletion(req: Request, res: Response) {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const systemContent = `
    You're a trip planner that
    help users plan trips efficiently, use concise Taiwanese Chinese. 
    List out non-repetitive attraction names.
    `;

  try {
    const stream = await client.chat.completions.create({
      model: 'gpt-3.5-turbo-1106',
      messages: [
        {
          role: 'system',
          content: systemContent,
        },
        { role: 'user', content: req.body?.userPrompt || 'Hi' },
      ],
      temperature: 0,
      max_tokens: 150,
      n: 1,
      stream: true,
    });

    const chunk = [];
    // eslint-disable-next-line no-restricted-syntax
    for await (const part of stream) {
      const completion = part.choices[0]?.delta.content || '';
      chunk.push(completion);
      res.write(completion);
    }

    res.end();
    const fullMessage = chunk.join('');

    const io = getSocketIOInstance();
    io.sockets
      .to(req.params.tripId)
      .emit('newChatMessage', { name: 'AI小助手', message: fullMessage });

    await insertChat(fullMessage, +req.params.tripId, 4);
  } catch (error) {
    console.log(error);
  }
}

export default getChatCompletion;
