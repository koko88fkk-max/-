
import { GoogleGenAI, Chat, Modality } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

let chatSession: Chat | null = null;

export const initChat = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.8,
      topP: 0.95,
      topK: 40,
    },
  });
  return chatSession;
};

export const sendMessage = async (message: string, imageBase64?: string) => {
  if (!chatSession) {
    chatSession = initChat();
  }

  try {
    if (imageBase64) {
      const result = await chatSession.sendMessageStream({
        message: {
          parts: [
            { text: message || "ما هو حل هذا الخطأ التقني الظاهر في الصورة؟" },
            {
              inlineData: {
                data: imageBase64,
                mimeType: "image/jpeg",
              },
            },
          ],
        },
      });
      return result;
    } else {
      const result = await chatSession.sendMessageStream({ message });
      return result;
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const textToSpeech = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ 
        parts: [{ 
          text: `بصوت رجالي سعودي فزعة ومحترم، انطق النص التالي بلهجة أهل الرياض العامية: ${text}` 
        }] 
      }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            // Fenrir هو أفضل صوت رجالي متزن وفخم
            prebuiltVoiceConfig: { voiceName: 'Fenrir' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("لم يتم استلام بيانات صوتية");

    return base64Audio;
  } catch (error) {
    console.error("TTS Service Error:", error);
    throw error;
  }
};

/**
 * فك تشفير Base64 إلى Uint8Array يدوياً لضمان التوافقية
 */
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * تحويل بيانات PCM 16-bit الخام إلى AudioBuffer متوافق مع Web Audio API
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // تحويل من 16-bit signed integer إلى float (-1.0 to 1.0)
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
