import React from 'react';
import { FileAttachmentWrapper } from './FileAttachments';

export default function HtmlRenderer({ content, className = '' }) {
    if (!content) return null;

    const rendererStyles = `
        .html-content {
            color: var(--text-primary);
        }
        .html-content p {
            margin: 0.5em 0;
            min-height: 1.5em;
        }
        .html-content p:first-child {
            margin-top: 0;
        }
        .html-content p:last-child {
            margin-bottom: 0;
        }
        .html-content h1, .html-content h2, .html-content h3, .html-content h4, .html-content h5, .html-content h6 {
            margin: 1em 0 0.5em 0;
            color: var(--text-primary);
            font-weight: 600;
        }
        .html-content ul {
            margin: 0.5em 0;
            padding-left: 1.5em;
            list-style-type: disc !important;
        }
        .html-content ol {
            margin: 0.5em 0;
            padding-left: 1.5em;
            list-style-type: decimal !important;
        }
        .html-content li {
            margin: 0.25em 0;
            display: list-item !important;
        }
        .html-content li > ul {
            list-style-type: circle !important;
        }
        .html-content li > ol {
            list-style-type: lower-alpha !important;
        }
        .html-content li > ul > li > ul {
            list-style-type: square !important;
        }
        .html-content li > ol > li > ol {
            list-style-type: lower-roman !important;
        }
        .html-content blockquote {
            margin: 1em 0;
            padding-left: 1em;
            border-left: 3px solid var(--border-color);
            font-style: italic;
            color: var(--text-muted);
            background-color: var(--blockquote-bg, rgba(0, 0, 0, 0.03));
        }
        .html-content code {
            background-color: var(--code-bg, #f3f4f6);
            color: var(--text-primary);
            padding: 0.125em 0.25em;
            border-radius: 0.25em;
            font-family: monospace;
        }
        .html-content pre {
            background-color: var(--pre-bg, #1f2937);
            color: var(--pre-text, #f9fafb);
            padding: 1em;
            border-radius: 0.5em;
            overflow-x: auto;
            margin: 1em 0;
        }
        .html-content pre code {
            background-color: transparent;
            color: inherit;
            padding: 0;
        }
        .html-content img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5em;
            margin: 1em 0;
        }
        .html-content a {
            color: var(--accent-blue, #3b82f6);
            text-decoration: underline;
        }
        .html-content a:hover {
            color: var(--accent-blue-hover, #2563eb);
        }

        /* Темная тема */
        :root[data-theme="dark"] .html-content {
            --code-bg: #374151;
            --pre-bg: #111827;
            --pre-text: #f9fafb;
            --blockquote-bg: rgba(255, 255, 255, 0.05);
        }
        /* Светлая тема */
        :root[data-theme="light"] .html-content {
            --code-bg: #f3f4f6;
        }
    `;

    return (
        <>
            <style>{rendererStyles}</style>
            <FileAttachmentWrapper 
                content={content}
                className={`prose prose-sm max-w-none html-content ${className}`}
            />
        </>
    );
}