'use client';

import React from 'react';

interface FormattedNotesViewProps {
  markdown: string;
}

export default function FormattedNotesView({ markdown }: FormattedNotesViewProps) {
  if (!markdown || !markdown.trim()) {
    return (
      <div className="empty-formatted-notes">
        <p>No notes written yet. Switch to Edit Mode or click &quot;Load Master Notes&quot; to begin.</p>
      </div>
    );
  }

  // Parse lines into tokens
  const lines = markdown.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = '';

  const formatInline = (text: string): React.ReactNode => {
    // Regex for:
    // 1. links: [text](url)
    // 2. bold: **text**
    // 3. inline code: `text`
    // 4. inline math: $text$
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Find earliest match among link, bold, code, math
      const linkMatch = remaining.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
      const codeMatch = remaining.match(/`([^`]+)`/);
      const mathMatch = remaining.match(/\$([^$]+)\$/);

      // Collect match positions
      const matches = [
        { type: 'link', match: linkMatch, index: linkMatch?.index ?? -1 },
        { type: 'bold', match: boldMatch, index: boldMatch?.index ?? -1 },
        { type: 'code', match: codeMatch, index: codeMatch?.index ?? -1 },
        { type: 'math', match: mathMatch, index: mathMatch?.index ?? -1 }
      ].filter((m) => m.index !== -1);

      if (matches.length === 0) {
        parts.push(remaining);
        break;
      }

      // Pick earliest match
      matches.sort((a, b) => a.index - b.index);
      const first = matches[0];

      if (first.index > 0) {
        parts.push(remaining.substring(0, first.index));
      }

      const matchObj = first.match!;
      if (first.type === 'link') {
        const label = matchObj[1];
        const url = matchObj[2];
        parts.push(
          <a
            key={`link-${keyIdx++}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="notes-preview-link"
          >
            {label} ↗
          </a>
        );
      } else if (first.type === 'bold') {
        parts.push(<strong key={`bold-${keyIdx++}`}>{matchObj[1]}</strong>);
      } else if (first.type === 'code') {
        parts.push(
          <code key={`code-${keyIdx++}`} className="notes-inline-code">
            {matchObj[1]}
          </code>
        );
      } else if (first.type === 'math') {
        parts.push(
          <code key={`math-${keyIdx++}`} className="notes-inline-math">
            {matchObj[1]}
          </code>
        );
      }

      remaining = remaining.substring(first.index + matchObj[0].length);
    }

    return <>{parts}</>;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        renderedElements.push(
          <div key={`codeblock-${i}`} className="notes-preview-codeblock">
            {codeBlockLang && <div className="codeblock-lang-tag">{codeBlockLang}</div>}
            <pre>
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockContent = [];
        codeBlockLang = '';
      } else {
        inCodeBlock = true;
        codeBlockLang = trimmed.replace('```', '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(rawLine);
      continue;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      renderedElements.push(<hr key={`hr-${i}`} className="notes-preview-divider" />);
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      renderedElements.push(
        <h2 key={`h1-${i}`} className="notes-preview-h1">
          {formatInline(trimmed.replace(/^#\s+/, ''))}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      renderedElements.push(
        <h3 key={`h2-${i}`} className="notes-preview-h2">
          {formatInline(trimmed.replace(/^##\s+/, ''))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('### ')) {
      renderedElements.push(
        <h4 key={`h3-${i}`} className="notes-preview-h3">
          {formatInline(trimmed.replace(/^###\s+/, ''))}
        </h4>
      );
      continue;
    }

    // Callout / Blockquote
    if (trimmed.startsWith('> ')) {
      renderedElements.push(
        <blockquote key={`quote-${i}`} className="notes-preview-callout">
          {formatInline(trimmed.replace(/^>\s+/, ''))}
        </blockquote>
      );
      continue;
    }

    // Bullet Lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      renderedElements.push(
        <li key={`li-${i}`} className="notes-preview-bullet">
          {formatInline(trimmed.replace(/^[-*]\s+/, ''))}
        </li>
      );
      continue;
    }

    // Numbered Lists
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      renderedElements.push(
        <div key={`num-${i}`} className="notes-preview-num-item">
          <span className="num-prefix">{numMatch[1]}.</span>
          <span className="num-body">{formatInline(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Math block ($$ ... $$)
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
      const mathContent = trimmed.slice(2, -2).trim();
      renderedElements.push(
        <div key={`mathblock-${i}`} className="notes-preview-mathblock">
          <code>{mathContent}</code>
        </div>
      );
      continue;
    }

    // Paragraph or empty spacing
    if (trimmed === '') {
      renderedElements.push(<div key={`empty-${i}`} className="notes-preview-gap" />);
      continue;
    }

    renderedElements.push(
      <p key={`p-${i}`} className="notes-preview-para">
        {formatInline(rawLine)}
      </p>
    );
  }

  return <div className="formatted-notes-canvas">{renderedElements}</div>;
}
