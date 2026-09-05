// ui.jsx — shared palette, fetch hook, and a dependency-free Markdown renderer.
// Extracted so every page (Harness, Diagnosis, Routing, State Machine, Case Walk,
// Loops) shares one look and one data-fetching helper. Plain Vite + React.
import React, { useEffect, useState } from 'react';

export const C = {
  pass: '#0a7d28',
  fail: '#c0282d',
  not_surfaced: '#b06a00',
  bgPass: '#eaf7ed',
  bgFail: '#fdeaea',
  bgNot: '#fdf4e3',
  border: '#dcdcdc',
  ink: '#222',
  sub: '#666',
  accent: '#1f5fae',
  bgAccent: '#eef4fc',
};

// Fetch JSON or text from the app's own API. Re-runs when `deps` change.
export function useFetch(path, deps = []) {
  const [s, setS] = useState({ loading: true, data: null, error: null });
  useEffect(() => {
    let alive = true;
    setS({ loading: true, data: null, error: null });
    fetch(path)
      .then(async (r) => {
        const ct = r.headers.get('content-type') || '';
        const body = ct.includes('json') ? await r.json() : await r.text();
        if (alive) setS({ loading: false, data: body, error: r.ok ? null : `HTTP ${r.status}` });
      })
      .catch((e) => alive && setS({ loading: false, data: null, error: String(e) }));
    return () => { alive = false; };
  }, deps); // eslint-disable-line
  return s;
}

// POST/PUT helper that returns parsed JSON (or throws).
export async function send(path, method, body) {
  const r = await fetch(path, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body == null ? undefined : JSON.stringify(body),
  });
  const ct = r.headers.get('content-type') || '';
  const data = ct.includes('json') ? await r.json() : await r.text();
  if (!r.ok) throw new Error(typeof data === 'object' ? JSON.stringify(data) : `HTTP ${r.status}`);
  return data;
}

// ---- Markdown (covers exactly what server/diagnosis.js emits) ---------------
function mdInline(text) {
  const parts = [];
  let i = 0;
  const re = /\*\*([^*]+)\*\*|`([^`]+)`/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > i) parts.push(text.slice(i, m.index));
    if (m[1] != null) parts.push(<strong key={parts.length}>{m[1]}</strong>);
    else parts.push(<code key={parts.length} style={{ background: '#f0f0f0', borderRadius: 3, padding: '0 4px', fontFamily: 'ui-monospace, monospace', fontSize: '0.92em' }}>{m[2]}</code>);
    i = m.index + m[0].length;
  }
  if (i < text.length) parts.push(text.slice(i));
  return parts;
}

export function Markdown({ source }) {
  const lines = String(source).split('\n');
  const blocks = [];
  let list = null;
  const flushList = () => {
    if (list) { blocks.push(<ul key={blocks.length} style={{ margin: '4px 0 10px', paddingLeft: 22 }}>{list}</ul>); list = null; }
  };
  for (let n = 0; n < lines.length; n++) {
    const line = lines[n];
    if (/^\s*\|/.test(line) && /^\s*\|[\s:|-]+\|?\s*$/.test(lines[n + 1] || '')) {
      flushList();
      const cell = (s) => s.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((c) => c.trim());
      const head = cell(line);
      const rows = [];
      n += 2;
      while (n < lines.length && /^\s*\|/.test(lines[n])) { rows.push(cell(lines[n])); n++; }
      n--;
      blocks.push(
        <table key={blocks.length} style={{ borderCollapse: 'collapse', margin: '8px 0', fontSize: 13 }}>
          <thead><tr>{head.map((h, j) => <th key={j} style={{ border: `1px solid ${C.border}`, padding: '4px 10px', textAlign: 'left', background: '#f5f5f5' }}>{mdInline(h)}</th>)}</tr></thead>
          <tbody>{rows.map((r, ri) => <tr key={ri}>{r.map((c, ci) => <td key={ci} style={{ border: `1px solid ${C.border}`, padding: '4px 10px' }}>{mdInline(c)}</td>)}</tr>)}</tbody>
        </table>,
      );
      continue;
    }
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      flushList();
      const level = h[1].length;
      const sz = level === 1 ? 24 : level === 2 ? 19 : 15.5;
      const Tag = `h${level}`;
      blocks.push(<Tag key={blocks.length} style={{ fontSize: sz, fontWeight: 700, margin: level === 1 ? '4px 0 10px' : '16px 0 6px', lineHeight: 1.25 }}>{mdInline(h[2])}</Tag>);
      continue;
    }
    if (/^>\s?/.test(line)) {
      flushList();
      blocks.push(<blockquote key={blocks.length} style={{ borderLeft: `3px solid ${C.border}`, margin: '6px 0', padding: '2px 12px', color: C.sub, fontStyle: 'italic' }}>{mdInline(line.replace(/^>\s?/, ''))}</blockquote>);
      continue;
    }
    if (/^\s*-\s+/.test(line)) {
      (list || (list = [])).push(<li key={list.length} style={{ margin: '2px 0' }}>{mdInline(line.replace(/^\s*-\s+/, ''))}</li>);
      continue;
    }
    flushList();
    if (/^\s*---\s*$/.test(line)) { blocks.push(<hr key={blocks.length} style={{ border: 'none', borderTop: `1px solid ${C.border}`, margin: '14px 0' }} />); continue; }
    if (line.trim() === '') { blocks.push(<div key={blocks.length} style={{ height: 6 }} />); continue; }
    blocks.push(<p key={blocks.length} style={{ margin: '6px 0', lineHeight: 1.5 }}>{mdInline(line)}</p>);
  }
  flushList();
  return <div style={{ color: C.ink, fontSize: 14 }}>{blocks}</div>;
}
