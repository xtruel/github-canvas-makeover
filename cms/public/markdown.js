// Fallback Markdown Parser
// Simple markdown parser for when CDN marked.js fails to load
(function() {
    'use strict';
    
    const marked = {
        parse: function(markdown) {
            if (!markdown) return '';
            
            let html = markdown;
            
            // Headers
            html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
            html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
            html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
            
            // Bold
            html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
            html = html.replace(/\_\_(.*?)\_\_/gim, '<strong>$1</strong>');
            
            // Italic
            html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
            html = html.replace(/\_(.*?)\_/gim, '<em>$1</em>');
            
            // Code inline
            html = html.replace(/`(.*?)`/gim, '<code>$1</code>');
            
            // Code blocks
            html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
            
            // Links
            html = html.replace(/\[([^\]]*?)\]\(([^\)]*?)\)/gim, '<a href="$2">$1</a>');
            
            // Images
            html = html.replace(/!\[([^\]]*?)\]\(([^\)]*?)\)/gim, '<img alt="$1" src="$2" />');
            
            // Line breaks
            html = html.replace(/\n\n/gim, '</p><p>');
            html = html.replace(/\n/gim, '<br />');
            
            // Wrap in paragraphs
            html = '<p>' + html + '</p>';
            
            // Clean up empty paragraphs
            html = html.replace(/<p><\/p>/gim, '');
            html = html.replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/gim, '$1');
            html = html.replace(/<p>(<pre>.*?<\/pre>)<\/p>/gims, '$1');
            
            // Lists
            html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
            html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
            html = html.replace(/^([0-9]+)\. (.*$)/gim, '<li>$1</li>');
            
            // Wrap lists
            html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');
            html = html.replace(/<\/ul>\s*<ul>/gim, '');
            
            // Blockquotes
            html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
            html = html.replace(/<\/blockquote>\s*<blockquote>/gim, ' ');
            
            // Horizontal rules
            html = html.replace(/^---$/gim, '<hr>');
            html = html.replace(/^\*\*\*$/gim, '<hr>');
            
            return html;
        }
    };
    
    // Export to global scope
    window.marked = marked;
    
})();