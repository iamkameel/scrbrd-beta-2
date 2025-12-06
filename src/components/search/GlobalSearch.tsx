"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, User, Shield, Briefcase, ChevronRight } from "lucide-react";
import { searchGlobalAction, SearchResult } from "@/lib/actions/searchActions";

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();

  // Handle keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search effect
  React.useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const data = await searchGlobalAction(query);
        setResults(data);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'team': return <Shield className="h-4 w-4" />;
      case 'player': return <User className="h-4 w-4" />;
      case 'equipment': return <Briefcase className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-xl overflow-hidden">
          <DialogHeader className="px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                placeholder="Type to search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            <DialogTitle className="sr-only">Search</DialogTitle>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto p-2">
            {results.length === 0 && query.length >= 2 && !isPending && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </div>
            )}
            {results.length === 0 && query.length < 2 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Search teams, players, and equipment...
              </div>
            )}
            {results.length > 0 && (
              <div className="space-y-1">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result.url)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-left transition-colors group"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted group-hover:bg-background">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="truncate font-medium">{result.title}</div>
                      {result.subtitle && (
                        <div className="truncate text-xs text-muted-foreground">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="p-2 border-t bg-muted/50 text-[10px] text-muted-foreground text-center">
            Press <kbd className="font-mono bg-background border rounded px-1">Esc</kbd> to close
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
