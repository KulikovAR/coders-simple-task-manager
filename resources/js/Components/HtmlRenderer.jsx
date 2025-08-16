import React from 'react';

export default function HtmlRenderer({ content, className = '' }) {
    if (!content) return null;

    return (
        <div 
            className={`prose prose-sm max-w-none ${className}`}
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
}
