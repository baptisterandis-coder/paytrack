"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Newspaper, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface NewsItem {
  date: string;
  title: string;
  summary: string;
  url: string;
  source: string;
}

const RSS_FEEDS = [
  { source: "Service-Public", url: "https://api.rss2json.com/v1/api.json?rss_url=https://www.service-public.fr/rss/particuliers.xml" },
  { source: "URSSAF", url: "https://api.rss2json.com/v1/api.json?rss_url=https://www.urssaf.fr/portail/home/actualites/toute-lactualite.rss.html" },
];

const KEYWORDS = ["salaire", "paie", "smic", "cotisation", "prélèvement", "retraite", "emploi", "travail", "fiscal", "impôt", "rémunération", "charges", "agirc", "arrco"];

function filterRelevant(items: any[], source: string): NewsItem[] {
  return items
    .filter(item => {
      const text = `${item.title} ${item.description}`.toLowerCase();
      return KEYWORDS.some(k => text.includes(k));
    })
    .slice(0, 5)
    .map(item => ({
      date: new Date(item.pubDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }),
      title: item.title.replace(/<[^>]*>/g, "").trim(),
      summary: (item.description ?? "").replace(/<[^>]*>/g, "").trim().slice(0, 150) + "...",
      url: item.link,
      source,
    }));
}

export function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [dailySummary, setDailySummary] = useState<string | null>(null);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const results = await Promise.allSettled(
          RSS_FEEDS.map(feed =>
            fetch(feed.url)
              .then(r => r.json())
              .then(data => filterRelevant(data.items ?? [], feed.source))
          )
        );
        const allNews = results
          .filter(r => r.status === "fulfilled")
          .flatMap(r => (r as PromiseFulfilledResult<NewsItem[]>).value)
          .sort((a, b) => b.date.split("/").reverse().join("-").localeCompare(a.date.split("/").reverse().join("-")))
          .slice(0, 8);
        setNews(allNews);
      } catch (e) {
        console.error("RSS error:", e);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    const fetchOrGenerateSummary = async () => {
      const today = new Date().toISOString().split("T")[0];

      const { data: existing } = await supabase
        .from("daily_news")
        .select("summary")
        .eq("date", today)
        .single();

      if (existing?.summary) {
        setDailySummary(existing.summary);
        return;
      }

      if (news.length === 0) return;
      setLoadingSummary(true);

      try {
        const ANTHROPIC_API_KEY = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
        if (!ANTHROPIC_API_KEY) return;

        const newsText = news.slice(0, 5).map(n => `- ${n.title} : ${n.summary}`).join("\n");

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 512,
            messages: [{
              role: "user",
              content: `Tu es un expert en droit du travail et paie française. Voici les actualités du jour :\n\n${newsText}\n\nGénère une synthèse quotidienne claire et concise (4-5 phrases max) des informations les plus importantes pour un salarié français. Si aucune info n'est vraiment importante, dis simplement "Pas d'actualité majeure aujourd'hui." Sans markdown, sans titre, juste le texte.`,
            }],
          }),
        });

        const data = await response.json();
        const summary = data.content?.[0]?.text ?? "";

        if (summary) {
          await supabase.from("daily_news").upsert({ date: today, summary });
          setDailySummary(summary);
        }
      } catch (e) {
        console.error("Summary error:", e);
      } finally {
        setLoadingSummary(false);
      }
    };

    if (!loadingNews) fetchOrGenerateSummary();
  }, [news, loadingNews]);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
          <span className="text-base">📰</span>
          <h3 className="font-semibold text-sm">Synthèse du jour</h3>
          {loadingSummary && <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground ml-auto" />}
        </div>
        {loadingSummary ? (
          <div className="space-y-2">
            <div className="h-3 bg-muted/30 rounded animate-pulse" />
            <div className="h-3 bg-muted/30 rounded animate-pulse w-4/5" />
            <div className="h-3 bg-muted/30 rounded animate-pulse w-3/5" />
          </div>
        ) : dailySummary ? (
          <p className="text-sm text-foreground leading-relaxed">{dailySummary}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Chargement de la synthèse...</p>
        )}
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
          <Newspaper className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Actu Paie & Emploi</h3>
        </div>
        {loadingNews ? (
          <div className="space-y-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 bg-muted/30 rounded animate-pulse w-24" />
                <div className="h-4 bg-muted/20 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune actualité disponible.</p>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {news.map((item, i) => (
              <div key={i} className="border-b border-border/30 pb-3 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-primary font-medium">{item.date}</p>
                  <span className="text-xs text-muted-foreground bg-muted/20 px-2 py-0.5 rounded-full">{item.source}</span>
                </div>
                <button
                  onClick={() => setSelectedNews(item)}
                  className="text-sm font-medium text-left hover:text-primary transition-colors leading-snug"
                >
                  {item.title}
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {selectedNews && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedNews(null)}>
          <div className="bg-card border border-border/50 rounded-2xl p-6 max-w-lg w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs text-primary font-medium mb-1">{selectedNews.date} · {selectedNews.source}</p>
                <h4 className="font-semibold text-foreground leading-snug">{selectedNews.title}</h4>
              </div>
              <button onClick={() => setSelectedNews(null)} className="text-muted-foreground hover:text-foreground text-lg flex-shrink-0">✕</button>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{selectedNews.summary}</p>
            <a href={selectedNews.url} target="_blank" rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1">
              Lire l'article complet →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}