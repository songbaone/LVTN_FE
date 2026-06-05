import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { MessageCircle, X, Send, Sparkles, Package, MapPin, Tag } from "lucide-react";
import { cn } from "../ui/utils";

interface AIChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function AIChatbot({ isOpen, onToggle }: AIChatbotProps) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hello! I'm your AI shopping assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");

  const suggestedQuestions = [
    "Find products under 500,000 VND",
    "Recommend products for 2-year-old",
    "Track my order",
    "Show current promotions"
  ];

  const productRecommendations = [
    { id: 1, name: "Organic Cotton Onesie Set", price: 450000, image: "🧸" },
    { id: 2, name: "Baby Feeding Set", price: 320000, image: "🍽️" },
  ];

  const handleSend = () => {
    if (!inputText.trim()) return;

    setMessages(prev => [
      ...prev,
      {
        id: prev.length + 1,
        type: "user",
        text: inputText,
        timestamp: new Date()
      },
      {
        id: prev.length + 2,
        type: "bot",
        text: "I found some great products for you! Here are my recommendations based on your query.",
        timestamp: new Date()
      }
    ]);
    setInputText("");
  };

  const handleSuggestionClick = (question: string) => {
    setInputText(question);
    handleSend();
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 size-14 rounded-full bg-accent hover:bg-accent/90 shadow-lg z-50"
      >
        <Sparkles className="size-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent to-primary p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="size-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Shopping Assistant</h3>
            <p className="text-xs text-white/80">Online • Instant replies</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-white hover:bg-white/20"
        >
          <X className="size-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.type === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.type === "bot" && (
              <Avatar className="size-8 flex-shrink-0">
                <AvatarFallback className="bg-accent text-accent-foreground">
                  <Sparkles className="size-4" />
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                "rounded-2xl px-4 py-2 max-w-[80%]",
                message.type === "user"
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary"
              )}
            >
              <p className="text-sm">{message.text}</p>
            </div>
            {message.type === "user" && (
              <Avatar className="size-8 flex-shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  U
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {/* Product Recommendations */}
        {messages.length > 2 && (
          <div className="space-y-2">
            {productRecommendations.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-lg bg-secondary flex items-center justify-center text-2xl flex-shrink-0">
                      {product.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                      <p className="text-sm text-accent font-semibold">
                        {product.price.toLocaleString()} ₫
                      </p>
                    </div>
                    <Button size="sm" className="bg-accent hover:bg-accent/90 flex-shrink-0">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="p-4 border-t border-border bg-card">
          <p className="text-xs font-medium text-muted-foreground mb-2">Suggested Questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleSuggestionClick(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-3 border-t border-border bg-card">
        <div className="flex gap-2 mb-3">
          <Button variant="outline" size="sm" className="flex-1">
            <MapPin className="size-3 mr-1" />
            Track Order
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Tag className="size-3 mr-1" />
            Promotions
          </Button>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            size="icon"
            className="bg-accent hover:bg-accent/90"
          >
            <Send className="size-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Powered by AI • Instant product recommendations
        </p>
      </div>
    </div>
  );
}
