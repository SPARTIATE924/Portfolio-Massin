#!/usr/bin/env python3
"""Fetch configured RSS feeds and write a combined JSON file.

Usage: python scripts/fetch_feeds.py --out assets/data/rss.json
"""
import argparse
import json
import time
from datetime import datetime

import feedparser
import requests

FEEDS = {
    "zdnet": {"title": "ZDNet Security", "url": "https://www.zdnet.com/topic/security/rss.xml"},
    "thehackernews": {"title": "The Hacker News", "url": "https://thehackernews.com/rss"},
    "krebsonsecurity": {"title": "KrebsOnSecurity", "url": "https://krebsonsecurity.com/feed/"},
    "arstechnica": {"title": "Ars Technica Security", "url": "https://feeds.arstechnica.com/arstechnica/security"},
}


def fetch_feed(url):
    try:
        resp = requests.get(url, timeout=15, headers={"User-Agent": "rss-fetcher/1.0"})
        resp.raise_for_status()
        parsed = feedparser.parse(resp.text)
        items = []
        for e in parsed.entries:
            title = e.get('title', '')
            link = e.get('link', '')
            published = e.get('published', e.get('updated', ''))
            summary = e.get('summary', e.get('description', ''))
            items.append({
                'title': title,
                'link': link,
                'pubDate': published,
                'description': summary,
            })
        return items
    except Exception as exc:
        print('Failed to fetch', url, exc)
        return []


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--out', default='assets/data/rss.json')
    parser.add_argument('--max', type=int, default=40)
    args = parser.parse_args()

    all_items = []
    for fid, f in FEEDS.items():
        items = fetch_feed(f['url'])
        for it in items:
            it['_source'] = f['title']
            all_items.append(it)

    # sort by date if possible, fallback to insertion order
    def parse_date(s):
        try:
            return datetime.strptime(s, '%a, %d %b %Y %H:%M:%S %Z')
        except Exception:
            try:
                return datetime.fromisoformat(s)
            except Exception:
                return datetime.fromtimestamp(0)

    all_items.sort(key=lambda x: parse_date(x.get('pubDate', '')), reverse=True)
    all_items = all_items[: args.max]

    out = {
        'fetchedAt': int(time.time()),
        'items': all_items,
    }

    out_path = args.out
    # ensure folder exists
    import os
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as fh:
        json.dump(out, fh, ensure_ascii=False, indent=2)
    print('Wrote', out_path)


if __name__ == '__main__':
    main()
