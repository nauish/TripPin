import { Request, Response } from 'express';
import OpenAI from 'openai';
import { insertChat } from '../models/chat.js';
import getSocketIOInstance from './socket.js';
import { selectCompleteTripInfo } from '../models/trip.js';

export async function getChatCompletion(req: Request, res: Response) {
  const { tripId } = req.params;
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const additionalInformation = await selectCompleteTripInfo(+tripId);

  const systemContent = `
    You're a trip planner that
    help users plan trips efficiently, use Traditional Chinese. 
    The current trip arrangement user made is as followed: ${JSON.stringify(additionalInformation)}
    List out other fun and popular attractions.
    `;

  console.log(systemContent);

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
      max_tokens: 2000,
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
