import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { scoreResume } from "@/lib/ai.functions";
import { resumeToText } from "@/lib/parse-resume";
import { useResumeStore } from "@/lib/resume-store";

type Score = {
  ats: number; readability: number; keyword: number; professionalism: number;
  missingKeywords: string[]; suggestions: string[]; matchPercent: number;
};

export function ScorePanel() {
  const { data } = useResumeStore();
  const score = useServerFn(scoreResume);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Score | null>(null);

  async function run() {
    setLoading(true);
    try {
      const text = resumeToText(data);
      const res = await score({ data: { resumeText: text, jobDescription: jd || undefined } });
      setResult(res);
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3 bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl">ATS & Job Match</h3>
            <p className="text-xs text-muted-foreground">Paste a job description for keyword match analysis.</p>
          </div>
          <Button onClick={run} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Target className="size-4" />}
            Analyze
          </Button>
        </div>
        <Textarea rows={4} value={jd} onChange={(e)=>setJd(e.target.value)} placeholder="Paste a job description (optional)…" />
      </Card>

      {result && (
        <Card className="p-4 space-y-4 bg-card">
          <ScoreBar label="ATS Compatibility" value={result.ats} />
          <ScoreBar label="Readability" value={result.readability} />
          <ScoreBar label="Keyword Match" value={result.keyword} />
          <ScoreBar label="Professionalism" value={result.professionalism} />
          {jd && (
            <div className="rule pt-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">JD Match</div>
              <div className="text-3xl font-display">{result.matchPercent}%</div>
            </div>
          )}
          {result.missingKeywords.length > 0 && (
            <div className="rule pt-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Missing keywords</div>
              <div className="flex flex-wrap gap-1.5">
                {result.missingKeywords.map((k, i) => <Badge key={i} variant="outline">{k}</Badge>)}
              </div>
            </div>
          )}
          {result.suggestions.length > 0 && (
            <div className="rule pt-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Suggestions</div>
              <ul className="text-sm space-y-1.5 list-disc ml-5">
                {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-mono">{value}/100</span>
      </div>
      <Progress value={value} />
    </div>
  );
}
