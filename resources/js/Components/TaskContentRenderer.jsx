import React from 'react';
import { FileAttachmentWrapper } from './FileAttachments';

export default function TaskContentRenderer({ content, className = '' }) {
    if (!content) return null;

    const contentStyles = `
        .task-content {
            color: var(--text-primary);
            font-size: 0.875rem;
            line-height: 1.5;
        }
        .task-content p {
            margin: 0.75em 0;
            min-height: 1.5em;
        }
        .task-content p:first-child {
            margin-top: 0;
        }
        .task-content p:last-child {
            margin-bottom: 0;
        }
        .task-content h1, .task-content h2, .task-content h3, .task-content h4, .task-content h5, .task-content h6 {
            margin: 1.5em 0 0.75em 0;
            color: var(--text-primary);
            font-weight: 600;
            line-height: 1.25;
        }
        .task-content h1:first-child, .task-content h2:first-child, .task-content h3:first-child,
        .task-content h4:first-child, .task-content h5:first-child, .task-content h6:first-child {
            margin-top: 0;
        }
        .task-content ul {
            margin: 0.75em 0;
            padding-left: 1.5em;
            list-style-type: disc !important;
        }
        .task-content ol {
            margin: 0.75em 0;
            padding-left: 1.5em;
            list-style-type: decimal !important;
        }
        .task-content li {
            margin: 0.375em 0;
            display: list-item !important;
        }
        .task-content li > ul {
            list-style-type: circle !important;
            margin: 0.25em 0;
        }
        .task-content li > ol {
            list-style-type: lower-alpha !important;
            margin: 0.25em 0;
        }
        .task-content li > ul > li > ul {
            list-style-type: square !important;
        }
        .task-content li > ol > li > ol {
            list-style-type: lower-roman !important;
        }
        .task-content blockquote {
            margin: 1em 0;
            padding: 0.75em 1.25em;
            border-left: 3px solid var(--border-color);
            font-style: italic;
            color: var(--text-muted);
            background-color: var(--blockquote-bg, rgba(0, 0, 0, 0.03));
            border-radius: 0.375rem;
        }
        .task-content code {
            background-color: var(--code-bg, #f3f4f6);
            color: var(--text-primary);
            padding: 0.125em 0.25em;
            border-radius: 0.25em;
            font-family: monospace;
            font-size: 0.875em;
        }
        .task-content pre {
            background-color: var(--pre-bg, #1f2937);
            color: var(--pre-text, #f9fafb);
            padding: 1em 1.25em;
            border-radius: 0.5em;
            overflow-x: auto;
            margin: 1em 0;
            font-size: 0.875em;
            line-height: 1.5;
        }
        .task-content pre code {
            background-color: transparent;
            color: inherit;
            padding: 0;
            font-size: inherit;
        }
        .task-content img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5em;
            margin: 1em 0;
        }
        .task-content a {
            color: var(--accent-blue, #3b82f6);
            text-decoration: underline;
            transition: color 0.2s ease;
        }
        .task-content a:hover {
            color: var(--accent-blue-hover, #2563eb);
        }
        .task-content .mention {
            display: inline-flex;
            align-items: center;
            background-color: rgba(var(--accent-blue-rgb), 0.1);
            color: var(--accent-blue);
            padding: 0.125rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: default;
            white-space: nowrap;
            margin: 0 0.125rem;
        }
        .task-content .mention:hover {
            background-color: rgba(var(--accent-blue-rgb), 0.15);
        }
        .task-content .mention::after {
            content: attr(data-user-email);
            margin-left: 0.375rem;
            font-size: 0.75rem;
            opacity: 0.75;
        }

        /* Темная тема */
        :root[data-theme="dark"] .task-content {
            --code-bg: #374151;
            --pre-bg: #111827;
            --pre-text: #f9fafb;
            --blockquote-bg: rgba(255, 255, 255, 0.05);
        }
        /* Светлая тема */
        :root[data-theme="light"] .task-content {
            --code-bg: #f3f4f6;
            --pre-bg: #1f2937;
            --pre-text: #f9fafb;
            --blockquote-bg: rgba(0, 0, 0, 0.03);
        }
    `;

    return (
        <>
            <style>{contentStyles}</style>
            <FileAttachmentWrapper 
                content={content}
                className={`task-content ${className}`}
            />
        </>
    );
}
