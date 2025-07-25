import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, MapPin, Stethoscope } from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your medical AI assistant. I can help you with:\n\n• Questions about your medical records\n• Finding nearby doctors\n• General medical consultations\n• Medication information\n\nHow can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (replace with actual webhook call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I understand your question. In a real implementation, this would be processed by our medical AI through webhooks and provide you with accurate medical information based on your records.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const quickPrompts = [
    "What did the doctor prescribe on March 12?",
    "Find me a general physician near Dhanmondi",
    "Summarize my last two reports",
    "When should I take my medications?"
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Medical AI Assistant</h1>
            <p className="text-sm text-muted-foreground">Ask me anything about your health</p>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="p-4 bg-muted/30">
        <div className="flex gap-2 overflow-x-auto">
          <Button variant="outline" size="sm" className="flex items-center gap-2 whitespace-nowrap">
            <MapPin className="h-4 w-4" />
            Find Doctors
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2 whitespace-nowrap">
            <Stethoscope className="h-4 w-4" />
            My Records
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2 whitespace-nowrap">
            <Bot className="h-4 w-4" />
            Health Tips
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.type === 'ai' && (
                <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                <Card className={message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'}>
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
              {message.type === 'user' && (
                <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0 order-2">
                  <User className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <Bot className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <Card className="bg-card max-w-[80%]">
                <CardContent className="p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="p-4 bg-muted/30">
          <p className="text-sm font-medium text-muted-foreground mb-3">Try asking:</p>
          <div className="grid grid-cols-1 gap-2">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="justify-start text-left h-auto p-3"
                onClick={() => setInput(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about your health..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            size="icon"
            variant="medical"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};