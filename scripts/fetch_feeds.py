#!/usr/bin/env python3
"""Fetch configured RSS feeds and write a combined JSON file.

Usage: python scripts/fetch_feeds.py --out assets/data/rss.json
"""
import argparse
import json
import time
from datetime import datetime
import re
import html

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
            def to_text(v):
                if v is None:
                    return ''
                if isinstance(v, str):
                    # remove HTML tags and unescape entities
                    t = re.sub(r'<[^>]+>', '', v)
                    return html.unescape(t).strip()
                if isinstance(v, dict):
                    for key in ('value', 'text', '#text'):
                        if key in v:
                            return to_text(v[key])
                    # fallback to string representation
                    return to_text(str(v))
                if isinstance(v, (list, tuple)):
                    for item in v:
                        t = to_text(item)
                        if t:
                            return t
                    return ''
                # objects: try common attributes
                if hasattr(v, 'value'):
                    return to_text(getattr(v, 'value'))
                if hasattr(v, 'text'):
                    return to_text(getattr(v, 'text'))
                return to_text(str(v))

            # robust title extraction: prefer title, then title_detail.value, then content[0].value, then summary
            raw_title = e.get('title')
            if not raw_title or (isinstance(raw_title, str) and raw_title.strip() == '') or raw_title == 'System.Xml.XmlElement':
                raw_title = None
                if 'title_detail' in e and isinstance(e.title_detail, dict):
                    raw_title = e.title_detail.get('value')
                if not raw_title and 'content' in e and isinstance(e.content, (list, tuple)) and len(e.content) > 0:
                    raw_title = e.content[0].get('value')
                if not raw_title:
                    raw_title = e.get('summary', e.get('description', ''))

            title = to_text(raw_title)
            link = to_text(e.get('link', ''))
            published = e.get('published', e.get('updated', ''))
            # prefer content value if present for description
            summary_src = e.get('summary', '')
            if 'content' in e and isinstance(e.content, (list, tuple)) and len(e.content) > 0:
                summary_src = e.content[0].get('value', summary_src)
            summary = to_text(summary_src)
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
