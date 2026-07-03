import { MessageCircleQuestion } from "lucide-react";

interface FollowUpChipsProps {
  suggestions: string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export function FollowUpChips({ suggestions, onSelect, disabled }: FollowUpChipsProps) {
  if (!suggestions.length) return null;

  return (
    <div className="w-full space-y-2 pt-1">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <MessageCircleQuestion className="h-3.5 w-3.5" />
        Follow-up questions
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(s.replace(/`/g, ""))}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-left text-xs transition-colors hover:border-primary/40 hover:bg-primary/10 disabled:opacity-50"
          >
            {s.replace(/`/g, "")}
          </button>
        ))}
      </div>
    </div>
  );
}
