import { Search, Filter } from "lucide-react";
import { Input } from "../../ui/input";

interface ConversationSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ConversationSearch({ value, onChange }: ConversationSearchProps) {
  return (
    <div className="px-3 py-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tìm kiếm khách hàng..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 h-9 bg-muted/50 border-none text-sm placeholder:text-muted-foreground/60 rounded-lg"
        />
      </div>
    </div>
  );
}