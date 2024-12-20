import React, { useState, useEffect, useCallback } from 'react';
import { Mic, Loader2 } from 'lucide-react';

export function AIChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecordingSupported, setIsRecordingSupported] = useState(true);

  const demoResponses = {
    'demo': 'This is a demo response. In a real application, this could be a pre-defined message or a complex interaction flow.'
  };

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsRecordingSupported(false);
      alert("Speech Recognition Unavailable: Your browser doesn't support speech recognition.");
    }
  }, []);

  const startListening = useCallback(() => {
    if (!isRecordingSupported) return;

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      alert("Error: Failed to recognize speech. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [isRecordingSupported]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsTyping(true);
    setMessages(prevMessages => [...prevMessages, { role: 'user', content: input }]);
    setInput('');

    try {
      if (input.toLowerCase() === 'demo') {
        setTimeout(() => {
          setMessages(prevMessages => [
            ...prevMessages,
            { role: 'assistant', content: demoResponses['demo'] }
          ]);
          setIsTyping(false);
        }, 1000);
      } else {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [...messages, { role: 'user', content: input }] }),
        });
        const data = await response.json();
        setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: data.content }]);
      }
    } catch (error) {
      console.error('Error:', error);
      alert("Error: Failed to get a response. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md">
        <div className="flex flex-row items-center space-x-2 p-4 border-b">
          <img
            src="/ai-assistant-logo.png"
            alt="AI Assistant Logo"
            width={32}
            height={32}
            className="dark:invert"
          />
          <h2 className="text-xl font-bold">AI Chatbot</h2>
        </div>
        <div className="h-[60vh] overflow-y-auto p-4">
          {messages.map((m, index) => (
            <div key={index} className={`mb-4 flex items-start ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="mr-2 bg-white rounded-full p-1 shadow-sm">
                  <img
                    src="/ai-assistant-logo.png"
                    alt="AI"
                    width={24}
                    height={24}
                    className="dark:invert"
                  />
                </div>
              )}
              <span className={`inline-block p-2 rounded-lg ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                {m.content}
              </span>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-start justify-start">
              <div className="mr-2 bg-white rounded-full p-1 shadow-sm">
                <img
                  src="/ai-assistant-logo.png"
                  alt="AI"
                  width={24}
                  height={24}
                  className="dark:invert"
                />
              </div>
              <span className="inline-block p-2 rounded-lg bg-gray-200 text-black">
                AI is typing...
              </span>
            </div>
          )}
        </div>
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex w-full space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow p-2 border rounded-md"
            />
            {isRecordingSupported && (
              <button
                type="button"
                className={`relative p-2 rounded-md ${isListening ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-100 hover:bg-gray-200'}`}
                onClick={startListening}
                disabled={isListening}
              >
                <span className={`absolute inset-0 flex items-center justify-center transition-opacity ${isListening ? 'opacity-100' : 'opacity-0'}`}>
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                </span>
                <span className={`absolute inset-0 flex items-center justify-center transition-opacity ${isListening ? 'opacity-0' : 'opacity-100'}`}>
                  <Mic className="h-4 w-4 text-black" />
                </span>
                <span className="sr-only">
                  {isListening ? 'Listening...' : 'Start recording'}
                </span>
              </button>
            )}
            <button
              type="submit"
              disabled={isTyping}
              className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

