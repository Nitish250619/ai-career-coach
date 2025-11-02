import { useCallback, useMemo, useRef, useState } from 'react';

// Lazy import so apps without the SDK still work (fallback will be used)
let GoogleGenerativeAI = null;
try {
  // eslint-disable-next-line no-undef
  GoogleGenerativeAI = (await import('@google/generative-ai')).GoogleGenerativeAI;
} catch (e) {
  // optional dependency
}

const SYSTEM_PROMPT = `You are an expert interviewer for HTML, CSS, JavaScript, and React.
Return JSON only. For multiple-choice quizzes, produce an array of objects: {prompt, options[4], answer}.
Use concise wording and safe inline HTML (e.g., <code>, <strong> allowed).
For machine coding, produce array of objects: {title, statement, acceptance[], hints[], starter?}.
Difficulty may be beginner/intermediate/advanced. Keep options plausible and unambiguous. Avoid trick questions.`;

const seedQuestions = {
  html: [
    { prompt: 'Which tag defines the document type?', options: ['<doctype>', '<!doctype html>', '<document>', '<html doctype>'], answer: '<!doctype html>' },
    { prompt: 'Which attribute is used to provide alt text for images?', options: ['title', 'label', 'alt', 'desc'], answer: 'alt' },
  ],
  css: [
    { prompt: 'Which property controls the stacking order?', options: ['stack', 'z-index', 'order', 'layer'], answer: 'z-index' },
    { prompt: 'Which unit is relative to the root font size?', options: ['em', 'rem', 'px', '%'], answer: 'rem' },
  ],
  react: [
    { prompt: 'Which hook memoizes expensive calculations?', options: ['useMemo', 'useEffect', 'useCallback', 'useRef'], answer: 'useMemo' },
    { prompt: 'What prop does React list rendering require for each child?', options: ['id', 'name', 'key', 'index'], answer: 'key' },
  ],
  js: [
    { prompt: 'Which method converts JSON string to object?', options: ['JSON.parse', 'JSON.stringify', 'Object.from', 'parse.json'], answer: 'JSON.parse' },
    { prompt: 'What is the value of typeof null?', options: ['"null"', '"object"', '"undefined"', '"number"'], answer: '"object"' },
  ],
};

function buildQuizPrompt({ topic, difficulty, count }) {
  return `${SYSTEM_PROMPT}\nGenerate ${count} ${difficulty} ${topic.toUpperCase()} multiple-choice questions.`;
}

function buildMachinePrompt({ topic, difficulty, count }) {
  return `${SYSTEM_PROMPT}\nGenerate ${count} ${difficulty} ${topic.toUpperCase()} machine coding scenarios for interviews.`;
}

export const useAIQuizGenerator = () => {
  // Optional: quick helper to list models in dev
  async function __listModels(devLog = false) {
    try {
      if (!GoogleGenerativeAI || !key) return;
      const genAI = new GoogleGenerativeAI(key);
      const list = await genAI.listModels?.();
      if (devLog) console.log('Gemini models available:', list?.models?.map(m => m.name));
      return list;
    } catch (e) {
      // ignore
    }
  }
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [questions, setQuestions] = useState([]);
  const [machinePrompts, setMachinePrompts] = useState([]);
  const [error, setError] = useState('');
  const modelRef = useRef(null);

  const key = import.meta.env.VITE_GEMINI_KEY;

  const ensureModel = useCallback(() => {
    if (!GoogleGenerativeAI || !key) return null;
    if (!modelRef.current) {
      const genAI = new GoogleGenerativeAI(key);
      const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
      modelRef.current = genAI.getGenerativeModel({ model: modelName });
    }
    return modelRef.current;
  }, [key]);

  const safeParseJSON = (raw) => {
    try {
      const text = typeof raw === 'string' ? raw : raw?.text?.() ?? '';
      const parsed = typeof text === 'string' ? JSON.parse(text) : JSON.parse(raw);
      return parsed;
    } catch (e) {
      return null;
    }
  };

  const callAI = useCallback(async (prompt) => {
    const model = ensureModel();
    if (!model) return null;
    const res = await model.generateContent(prompt);
    // SDK returns { response: { text() }}
    const text = await res.response.text();
    // Some models wrap JSON in code fences – strip them.
    const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/,'').trim();
    return safeParseJSON(cleaned);
  }, [ensureModel]);

  const generateQuiz = useCallback(async ({ topic = 'react', difficulty = 'intermediate', count = 10 } = {}) => {
    setStatus('loading');
    setError('');
    try {
      let out = await callAI(buildQuizPrompt({ topic, difficulty, count }));
      if (!out || !Array.isArray(out) || !out.length) {
        // fallback to seeds expanded to desired count
        const base = seedQuestions[topic] ?? seedQuestions.react;
        const pool = Array.from({ length: count }, (_, i) => base[i % base.length]);
        out = pool.map((q) => ({ ...q }));
      }
      setQuestions(out);
      setStatus('ready');
    } catch (e) {
      setError(e?.message ?? 'Failed to generate quiz');
      // Minimal fallback
      const base = seedQuestions[topic] ?? seedQuestions.react;
      const pool = Array.from({ length: count }, (_, i) => base[i % base.length]);
      setQuestions(pool);
      setStatus('ready');
    }
  }, [callAI]);

  const generateMachinePrompts = useCallback(async ({ topic = 'react', difficulty = 'intermediate', count = 6 } = {}) => {
    setStatus('loading');
    setError('');
    try {
      let out = await callAI(buildMachinePrompt({ topic, difficulty, count }));
      if (!out || !Array.isArray(out) || !out.length) {
        // simple deterministic fallback
        out = [
          {
            title: 'Build a Debounced Search (React)',
            statement: 'Create a search input that queries a mock API with 400ms debounce and shows a loading state and results list.',
            acceptance: [
              'Typing rapidly does not fire more than one request within 400ms window.',
              'Displays a spinner while request in flight.',
              'Keyboard navigation (ArrowUp/Down, Enter) works on results.',
              'Error state rendered for 500 responses.'
            ],
            hints: [
              'Use <code>useEffect</code> + <code>setTimeout</code> for debounce.',
              'Cancel stale requests via <code>AbortController</code>.',
            ],
            starter: `function useDebounce(value, delay = 400){\n  const [v, setV] = React.useState(value);\n  React.useEffect(()=>{\n    const id = setTimeout(()=> setV(value), delay);\n    return ()=> clearTimeout(id);\n  },[value, delay]);\n  return v;\n}`,
          },
          {
            title: 'Build a Paginated Table (JS/React)',
            statement: 'Render a table from a JSON array with client-side pagination, sortable headers, and per-page selector.',
            acceptance: [
              'Sorting toggles asc/desc on header click with indicator.',
              'Page size control: 5/10/20.',
              'Row count & page indicators update correctly.'
            ],
            hints: ['Use <code>useMemo</code> for sorted/paginated slices.', 'Keep sort state as {key, dir}.'],
          },
        ];
      }
      setMachinePrompts(out);
      setStatus('ready');
    } catch (e) {
      setError(e?.message ?? 'Failed to generate prompts');
      setMachinePrompts([]);
      setStatus('error');
    }
  }, [callAI]);

  const explain = useCallback(async (question) => {
    try {
      const model = ensureModel();
      if (!model) {
        return `Explanation unavailable (no AI key). Correct answer: <strong>${question.answer}</strong>`;
      }
      const prompt = `${SYSTEM_PROMPT}\nExplain why the correct answer is \"${question.answer}\" for: ${question.prompt}`;
      const res = await model.generateContent(prompt);
      const text = await res.response.text();
      return text;
    } catch (e) {
      return `Explanation unavailable. Correct answer: <strong>${question.answer}</strong>`;
    }
  }, [ensureModel]);

  return {
    status,
    questions,
    machinePrompts,
    error,
    generateQuiz,
    generateMachinePrompts,
    explain,
  };
};