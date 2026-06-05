import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { MessageCircle, X, Send, Paperclip, Smile } from "lucide-react";
import { cn } from "../ui/utils";

interface LiveSupportChatProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function LiveSupportChat({ isOpen, onToggle }: LiveSupportChatProps) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "staff",
      sender: "Sarah - Support Team",
      text: "Hello! Welcome to BabyStore support. How can I help you today?",
      timestamp: new Date(),
      avatar: "S"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;

    setMessages(prev => [
      ...prev,
      {
        id: prev.length + 1,
        type: "customer",
        sender: "You",
        text: inputText,
        timestamp: new Date(),
        avatar: "Y"
      }
    ]);
    setInputText("");

    // Simulate staff typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 2,
          type: "staff",
          sender: "Sarah - Support Team",
          text: "Thank you for your message. Let me check that for you right away!",
          timestamp: new Date(),
          avatar: "S"
        }
      ]);
    }, 2000);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-24 right-6 size-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg z-50"
      >
        <MessageCircle className="size-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 border-2 border-white">
            <AvatarImage src="" />
            <AvatarFallback className="bg-white text-primary">S</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-white">Customer Support</h3>
            <p className="text-xs text-white/80 flex items-center gap-1">
              <span className="size-2 rounded-full bg-success"></span>
              Sarah is online
            </p>
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

      {/* Staff Info */}
      <div className="p-3 bg-secondary border-b border-border">
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="secondary" className="bg-success/10 text-success border-success">
            Active
          </Badge>
          <span className="text-muted-foreground text-xs">Average response time: 2 minutes</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.type === "customer" ? "justify-end" : "justify-start"
            )}
          >
            {message.type === "staff" && (
              <Avatar className="size-8 flex-shrink-0">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {message.avatar}
                </AvatarFallback>
              </Avatar>
            )}
            <div className={cn("flex flex-col", message.type === "customer" ? "items-end" : "items-start")}>
              {message.type === "staff" && (
                <p className="text-xs text-muted-foreground mb-1">{message.sender}</p>
              )}
              <div
                className={cn(
                  "rounded-2xl px-4 py-2 max-w-[80%]",
                  message.type === "customer"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                )}
              >
                <p className="text-sm">{message.text}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {message.type === "customer" && (
              <Avatar className="size-8 flex-shrink-0">
                <AvatarFallback className="bg-accent text-accent-foreground">
                  {message.avatar}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <Avatar className="size-8 flex-shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground">S</AvatarFallback>
            </Avatar>
            <div className="bg-secondary rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="size-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="size-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="size-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Replies */}
      <div className="p-3 border-t border-border bg-card">
        <p className="text-xs font-medium text-muted-foreground mb-2">Quick Replies:</p>
        <div className="flex gap-2 overflow-x-auto">
          <Button variant="outline" size="sm" onClick={() => setInputText("I have a question about my order")}>
            Order Status
          </Button>
          <Button variant="outline" size="sm" onClick={() => setInputText("Product question")}>
            Product Info
          </Button>
          <Button variant="outline" size="sm" onClick={() => setInputText("I need a refund")}>
            Refund
          </Button>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="size-4" />
          </Button>
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button variant="ghost" size="icon">
            <Smile className="size-4" />
          </Button>
          <Button
            onClick={handleSend}
            size="icon"
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="size-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          We typically reply within 2 minutes
        </p>
      </div>
    </div>
  );
}
