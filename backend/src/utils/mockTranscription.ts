// Mock transcription service for testing without OpenAI API
export function generateMockCaptions(duration: number = 10): any[] {
  const words = [
    'Hello', 'and', 'welcome', 'to', 'this', 'amazing', 'video',
    'We', 'are', 'going', 'to', 'show', 'you', 'something', 'incredible',
    'This', 'is', 'a', 'demonstration', 'of', 'automatic', 'captions',
    'The', 'captions', 'will', 'appear', 'at', 'the', 'bottom',
    'You', 'can', 'customize', 'the', 'style', 'as', 'you', 'like',
    'Thank', 'you', 'for', 'watching', 'this', 'demo'
  ];

  const captions: Array<{ text: string; start: number; end: number }> = [];
  const wordDuration = (duration * 1000) / words.length; // in ms

  words.forEach((word, index) => {
    captions.push({
      text: word,
      start: index * wordDuration,
      end: (index + 1) * wordDuration
    });
  });

  return captions;
}
