"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Newspaper } from "lucide-react";
import { KpiFeed } from "@/components/dashboard/KpiFeed";

interface NewsItem {
  date: string;
  title: string;
  summary: string;
  url: string;
  source: string;
}

const RSS_FEEDS = [
  { source: "Le Monde", url: "https://api.rss2json.com/v1/api.json?rss_url=https://www.lemonde.fr/economie/rss_full.xml" },
  { source: "Challenges", url: "https://api.rss2json.com/v1/api.json?rss_url=https://www.challenges.fr/rss.xml" },
  { source: "L'Express", url: "https://api.rss2json.com/v1/api.json?rss_url=https://www.lexpress.fr/rss/alaune.xml" },
  { source: "Le Figaro", url: "https://api.rss2json.com/v1/api.json?rss_url=https://www.lefigaro.fr/rss/figaro_economie.xml" },
  { source: "20 Minutes", url: "https://api.rss2json.com/v1/api.json?rss_url=https://www.20minutes.fr/feeds/rss-economie.xml" },
];

const KEYWORDS = ["salaire", "paie", "smic", "cotisation", "prélèvement", "retraite", "emploi", "travail", "fiscal", "impôt", "rémunération", "charges", "agirc", "arrco", "convention collective", "code du travail", "bulletin", "net", "brut", "pouvoir d'achat"];

function filterRelevant(items: any[], source: string): NewsItem[] {
  return items
    .filter(item => {
      const text = `${item.title} ${item.description}`.toLowerCase();
      return KEYWORDS.some(k => text.includes(k));
    })
    .slice(0, 3)
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
  const [loadingNews, setLoadingNews] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

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
          .slice(0, 10);
        setNews(allNews);
      } catch (e) {
        console.error("RSS error:", e);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="space-y-4">
      <KpiFeed />

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
          <p className="text-sm text-muted-foreground">Pas d'actualité majeure aujourd'hui.</p>
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
              className="text-sm text-primary hover:underline">
              Lire l'article complet →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}