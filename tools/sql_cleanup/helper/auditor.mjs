import OpenAI from 'openai';
import fs from 'fs/promises';
import { preparePrompts } from './generate-prompts.mjs';
// must install
const openai = new OpenAI();

/**
 * --------------------------------------------------
 * 1️⃣ Run prompts with requested changes
 * --------------------------------------------------
 */
const batches = await preparePrompts();
// const prompt = JSON.parse(await fs.readFile(secondGroup.promptPath, "utf8"));
// const completion = await openai.chat.completions.create(prompt);
// console.log(completion.choices[0].message.content);

for (const b of batches) {
  // console.log("Ready to send:", b.promptPath, "=> procedures:", b.procedures);
  const prompt = JSON.parse(await fs.readFile(b.promptPath, 'utf8'));
  const completion = await openai.chat.completions.create(prompt);
  console.log(completion.choices[0].message.content);
}
