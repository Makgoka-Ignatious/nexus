import { AlertTriangle, X } from "lucide-react";

interface DisclaimerBannerProps {
  onDismiss: () => void;
}

export function DisclaimerBanner({ onDismiss }: DisclaimerBannerProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 h-10 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1400px] items-center gap-3 px-4">
        <AlertTriangle className="size-4 shrink-0 text-signal" aria-hidden="true" />
        <p className="truncate text-[13px] text-muted-foreground">
          AI-generated content. Verify before use. Nexus does not store your data.
        </p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss disclaimer"
          className="press ml-auto grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
