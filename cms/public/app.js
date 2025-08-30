// Public Site JavaScript
class CMSApp {
    constructor() {
        this.currentTab = 'gallery';
        this.mediaPage = 1;
        this.articlesPage = 1;
        this.searchPage = 1;
        this.searchQuery = '';
        this.filters = {
            category: '',
            tag: '',
            type: ''
        };
        this.eventSource = null;
        
        this.init();
    }
    
    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.setupSSE();
        this.loadInitialData();
        this.updateConnectionStatus('connecting');
    }
    
    setupTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = themeToggle.querySelector('.theme-icon');
        const html = document.documentElement;
        
        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        html.setAttribute('data-theme', savedTheme);
        themeIcon.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-theme', newTheme);
            themeIcon.textContent = newTheme === 'dark' ? '🌙' : '☀️';
            localStorage.setItem('theme', newTheme);
            
            this.showMessage('Theme changed to ' + newTheme + ' mode', 'info');
        });
    }
    
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });
        
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        searchBtn.addEventListener('click', () => this.performSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // Filter changes
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('tagFilter').addEventListener('change', (e) => {
            this.filters.tag = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('typeFilter').addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.applyFilters();
        });
        
        // Load more buttons
        document.getElementById('loadMoreMedia').addEventListener('click', () => this.loadMoreMedia());
        document.getElementById('loadMoreArticles').addEventListener('click', () => this.loadMoreArticles());
        document.getElementById('loadMoreSearch').addEventListener('click', () => this.loadMoreSearch());
        
        // Modal close functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('modal-close')) {
                this.closeModal();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }
    
    setupSSE() {
        try {
            this.eventSource = new EventSource('/api/events');
            
            this.eventSource.onopen = () => {
                this.updateConnectionStatus('connected');
            };
            
            this.eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleSSEEvent(data);
                } catch (error) {
                    console.error('SSE message parse error:', error);
                }
            };
            
            this.eventSource.onerror = () => {
                this.updateConnectionStatus('disconnected');
                setTimeout(() => this.setupSSE(), 5000); // Retry in 5 seconds
            };
        } catch (error) {
            console.error('SSE setup error:', error);
            this.updateConnectionStatus('error');
        }
    }
    
    handleSSEEvent(event) {
        const { type, data } = event;
        
        switch (type) {
            case 'connected':
                this.updateConnectionStatus('connected');
                break;
                
            case 'media:new':
            case 'media:publish':
                this.showMessage(`New media: ${data.title}`, 'info');
                if (this.currentTab === 'gallery') {
                    this.refreshCurrentTab();
                }
                break;
                
            case 'media:delete':
                this.showMessage(`Media deleted: ${data.title}`, 'info');
                this.removeMediaFromDOM(data.id);
                break;
                
            case 'media:restore':
                this.showMessage(`Media restored: ${data.title}`, 'info');
                if (this.currentTab === 'gallery') {
                    this.refreshCurrentTab();
                }
                break;
                
            case 'article:new':
            case 'article:publish':
                this.showMessage(`New article: ${data.title}`, 'info');
                if (this.currentTab === 'articles') {
                    this.refreshCurrentTab();
                }
                break;
                
            case 'article:delete':
                this.showMessage(`Article deleted: ${data.title}`, 'info');
                this.removeArticleFromDOM(data.id);
                break;
                
            case 'article:restore':
                this.showMessage(`Article restored: ${data.title}`, 'info');
                if (this.currentTab === 'articles') {
                    this.refreshCurrentTab();
                }
                break;
        }
    }
    
    updateConnectionStatus(status) {
        const indicator = document.getElementById('statusIndicator');
        const text = document.getElementById('statusText');
        
        switch (status) {
            case 'connected':
                indicator.textContent = '🟢';
                text.textContent = 'Connected';
                break;
            case 'connecting':
                indicator.textContent = '🟡';
                text.textContent = 'Connecting...';
                break;
            case 'disconnected':
                indicator.textContent = '🔴';
                text.textContent = 'Disconnected';
                break;
            case 'error':
                indicator.textContent = '❌';
                text.textContent = 'Error';
                break;
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadMedia(),
            this.loadArticles(),
            this.loadFilterOptions()
        ]);
    }
    
    async loadFilterOptions() {
        try {
            const [categoriesRes, tagsRes] = await Promise.all([
                fetch('/api/meta/categories'),
                fetch('/api/meta/tags')
            ]);
            
            const categories = await categoriesRes.json();
            const tags = await tagsRes.json();
            
            this.populateFilterSelect('categoryFilter', categories.categories);
            this.populateFilterSelect('tagFilter', tags.tags);
        } catch (error) {
            console.error('Error loading filter options:', error);
        }
    }
    
    populateFilterSelect(selectId, options) {
        const select = document.getElementById(selectId);
        const currentValue = select.value;
        
        // Clear existing options (except first)
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Add new options
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
        
        // Restore selection if still valid
        if (options.includes(currentValue)) {
            select.value = currentValue;
        }
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        this.currentTab = tabName;
        
        // Load data if needed
        if (tabName === 'gallery' && document.getElementById('mediaGrid').children.length === 0) {
            this.loadMedia();
        } else if (tabName === 'articles' && document.getElementById('articlesList').children.length === 0) {
            this.loadArticles();
        }
    }
    
    async loadMedia(append = false) {
        try {
            const page = append ? this.mediaPage + 1 : 1;
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20'
            });
            
            if (this.filters.category) params.append('category', this.filters.category);
            if (this.filters.tag) params.append('tag', this.filters.tag);
            
            const response = await fetch(`/api/media?${params}`);
            const data = await response.json();
            
            if (response.ok) {
                if (append) {
                    this.appendMedia(data.media);
                    this.mediaPage = page;
                } else {
                    this.displayMedia(data.media);
                    this.mediaPage = 1;
                }
                
                this.updateLoadMoreButton('loadMoreMedia', data.pagination);
            } else {
                this.showMessage(data.error || 'Failed to load media', 'error');
            }
        } catch (error) {
            console.error('Error loading media:', error);
            this.showMessage('Network error loading media', 'error');
        }
    }
    
    async loadArticles(append = false) {
        try {
            const page = append ? this.articlesPage + 1 : 1;
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10'
            });
            
            if (this.filters.category) params.append('category', this.filters.category);
            if (this.filters.tag) params.append('tag', this.filters.tag);
            
            const response = await fetch(`/api/articles?${params}`);
            const data = await response.json();
            
            if (response.ok) {
                if (append) {
                    this.appendArticles(data.articles);
                    this.articlesPage = page;
                } else {
                    this.displayArticles(data.articles);
                    this.articlesPage = 1;
                }
                
                this.updateLoadMoreButton('loadMoreArticles', data.pagination);
            } else {
                this.showMessage(data.error || 'Failed to load articles', 'error');
            }
        } catch (error) {
            console.error('Error loading articles:', error);
            this.showMessage('Network error loading articles', 'error');
        }
    }
    
    displayMedia(media) {
        const grid = document.getElementById('mediaGrid');
        grid.innerHTML = '';
        this.appendMedia(media);
    }
    
    appendMedia(media) {
        const grid = document.getElementById('mediaGrid');
        
        media.forEach(item => {
            const card = this.createMediaCard(item);
            grid.appendChild(card);
        });
    }
    
    createMediaCard(item) {
        const card = document.createElement('div');
        card.className = 'media-card fade-in';
        card.setAttribute('data-media-id', item.id);
        card.addEventListener('click', () => this.showMediaModal(item));
        
        let imageHtml = '';
        if (item.type === 'youtube') {
            imageHtml = `<div class="media-image">📺</div>`;
        } else if (item.thumbPath) {
            imageHtml = `<img src="${item.thumbPath}" alt="${item.title}" class="media-image" loading="lazy">`;
        } else if (item.filePath) {
            imageHtml = `<img src="${item.filePath}" alt="${item.title}" class="media-image" loading="lazy">`;
        } else {
            const icon = item.type === 'video' ? '🎬' : '🖼️';
            imageHtml = `<div class="media-image">${icon}</div>`;
        }
        
        const tags = item.tags ? item.tags.split(',').map(tag => 
            `<span class="tag">${tag.trim()}</span>`
        ).join('') : '';
        
        const date = new Date(item.createdAt * 1000).toLocaleDateString();
        
        card.innerHTML = `
            ${imageHtml}
            <div class="media-info">
                <h3 class="media-title">${this.escapeHtml(item.title)}</h3>
                ${item.description ? `<p class="media-description">${this.escapeHtml(item.description)}</p>` : ''}
                <div class="media-meta">
                    <span class="media-type">${item.type}</span>
                    <span class="media-date">${date}</span>
                </div>
                ${tags ? `<div class="media-tags">${tags}</div>` : ''}
            </div>
        `;
        
        return card;
    }
    
    displayArticles(articles) {
        const list = document.getElementById('articlesList');
        list.innerHTML = '';
        this.appendArticles(articles);
    }
    
    appendArticles(articles) {
        const list = document.getElementById('articlesList');
        
        articles.forEach(article => {
            const card = this.createArticleCard(article);
            list.appendChild(card);
        });
    }
    
    createArticleCard(article) {
        const card = document.createElement('div');
        card.className = 'article-card fade-in';
        card.setAttribute('data-article-id', article.id);
        card.addEventListener('click', () => this.showArticleModal(article));
        
        const excerpt = this.stripHtml(article.body).substring(0, 300) + '...';
        const tags = article.tags ? article.tags.split(',').map(tag => 
            `<span class="tag">${tag.trim()}</span>`
        ).join('') : '';
        
        const date = new Date(article.createdAt * 1000).toLocaleDateString();
        
        card.innerHTML = `
            <div class="article-header">
                <div>
                    <h3 class="article-title">${this.escapeHtml(article.title)}</h3>
                    ${article.category ? `<span class="tag">${article.category}</span>` : ''}
                </div>
            </div>
            <p class="article-excerpt">${this.escapeHtml(excerpt)}</p>
            <div class="article-meta">
                <span class="article-date">${date}</span>
                ${tags ? `<div class="media-tags">${tags}</div>` : ''}
            </div>
        `;
        
        return card;
    }
    
    async performSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput.value.trim();
        
        if (query.length < 2) {
            this.showMessage('Search query must be at least 2 characters', 'error');
            return;
        }
        
        this.searchQuery = query;
        this.searchPage = 1;
        
        try {
            const response = await fetch(`/api/search/articles?q=${encodeURIComponent(query)}&page=1&limit=10`);
            const data = await response.json();
            
            if (response.ok) {
                this.displaySearchResults(data.articles);
                this.updateLoadMoreButton('loadMoreSearch', data.pagination);
                
                // Show search tab
                document.getElementById('searchTab').style.display = 'block';
                this.switchTab('search');
                
                // Update search header
                this.updateSearchHeader(query, data.pagination.total);
            } else {
                this.showMessage(data.error || 'Search failed', 'error');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showMessage('Network error during search', 'error');
        }
    }
    
    displaySearchResults(results) {
        const container = document.getElementById('searchResults');
        container.innerHTML = '';
        this.appendSearchResults(results);
    }
    
    appendSearchResults(results) {
        const container = document.getElementById('searchResults');
        
        results.forEach(result => {
            const card = this.createSearchResultCard(result);
            container.appendChild(card);
        });
    }
    
    createSearchResultCard(result) {
        const card = document.createElement('div');
        card.className = 'search-result fade-in';
        card.addEventListener('click', () => this.showArticleModal(result));
        
        const date = new Date(result.createdAt * 1000).toLocaleDateString();
        
        card.innerHTML = `
            <h3 class="search-result-title">${this.escapeHtml(result.title)}</h3>
            <div class="search-result-snippet">${result.snippet || 'No preview available'}</div>
            <div class="article-meta">
                <span class="article-date">${date}</span>
                ${result.category ? `<span class="tag">${result.category}</span>` : ''}
            </div>
        `;
        
        return card;
    }
    
    updateSearchHeader(query, total) {
        const container = document.getElementById('searchResults');
        
        let header = container.querySelector('.search-header');
        if (!header) {
            header = document.createElement('div');
            header.className = 'search-header';
            container.prepend(header);
        }
        
        header.innerHTML = `
            <h2>Search Results for "<span class="search-query">${this.escapeHtml(query)}</span>"</h2>
            <p>${total} result${total !== 1 ? 's' : ''} found</p>
        `;
    }
    
    showMediaModal(media) {
        const modal = document.getElementById('mediaModal');
        const modalBody = document.getElementById('modalBody');
        
        let content = '';
        
        if (media.type === 'youtube') {
            content = `
                <div class="modal-youtube">
                    <iframe src="https://www.youtube.com/embed/${media.youtubeId}" 
                            allowfullscreen></iframe>
                </div>
            `;
        } else if (media.type === 'video') {
            content = `
                <video class="modal-video" controls>
                    <source src="${media.filePath}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            `;
        } else {
            content = `
                <img src="${media.webpPath || media.filePath}" 
                     alt="${media.title}" 
                     class="modal-image">
            `;
        }
        
        const tags = media.tags ? media.tags.split(',').map(tag => 
            `<span class="tag">${tag.trim()}</span>`
        ).join('') : '';
        
        const date = new Date(media.createdAt * 1000).toLocaleDateString();
        
        modalBody.innerHTML = `
            ${content}
            <div style="margin-top: 1rem;">
                <h2>${this.escapeHtml(media.title)}</h2>
                ${media.description ? `<p style="margin: 0.5rem 0; color: var(--text-secondary);">${this.escapeHtml(media.description)}</p>` : ''}
                <div style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <span class="media-type">${media.type}</span>
                        ${media.category ? `<span class="tag" style="margin-left: 0.5rem;">${media.category}</span>` : ''}
                    </div>
                    <span style="color: var(--text-muted); font-size: 0.875rem;">${date}</span>
                </div>
                ${tags ? `<div style="margin-top: 0.5rem;">${tags}</div>` : ''}
            </div>
        `;
        
        modal.classList.add('show');
    }
    
    showArticleModal(article) {
        const modal = document.getElementById('articleModal');
        const modalBody = document.getElementById('articleModalBody');
        
        const tags = article.tags ? article.tags.split(',').map(tag => 
            `<span class="tag">${tag.trim()}</span>`
        ).join('') : '';
        
        const date = new Date(article.createdAt * 1000).toLocaleDateString();
        
        // Convert markdown to HTML if needed
        let bodyHtml = article.body;
        if (window.marked) {
            try {
                bodyHtml = marked.parse(bodyHtml);
            } catch (error) {
                console.error('Markdown parsing error:', error);
            }
        }
        
        modalBody.innerHTML = `
            <article>
                <header style="margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
                    <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-primary);">
                        ${this.escapeHtml(article.title)}
                    </h1>
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; color: var(--text-muted);">
                        <div>
                            <span>${date}</span>
                            ${article.category ? `<span class="tag" style="margin-left: 0.5rem;">${article.category}</span>` : ''}
                        </div>
                        ${tags ? `<div>${tags}</div>` : ''}
                    </div>
                </header>
                <div class="article-content" style="line-height: 1.8; color: var(--text-primary);">
                    ${bodyHtml}
                </div>
            </article>
        `;
        
        modal.classList.add('show');
    }
    
    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }
    
    async loadMoreMedia() {
        await this.loadMedia(true);
    }
    
    async loadMoreArticles() {
        await this.loadArticles(true);
    }
    
    async loadMoreSearch() {
        if (!this.searchQuery) return;
        
        try {
            const page = this.searchPage + 1;
            const response = await fetch(`/api/search/articles?q=${encodeURIComponent(this.searchQuery)}&page=${page}&limit=10`);
            const data = await response.json();
            
            if (response.ok) {
                this.appendSearchResults(data.articles);
                this.searchPage = page;
                this.updateLoadMoreButton('loadMoreSearch', data.pagination);
            } else {
                this.showMessage(data.error || 'Failed to load more results', 'error');
            }
        } catch (error) {
            console.error('Load more search error:', error);
            this.showMessage('Network error loading more results', 'error');
        }
    }
    
    updateLoadMoreButton(buttonId, pagination) {
        const button = document.getElementById(buttonId);
        if (pagination.page >= pagination.pages) {
            button.style.display = 'none';
        } else {
            button.style.display = 'block';
        }
    }
    
    applyFilters() {
        // Reset pages
        this.mediaPage = 1;
        this.articlesPage = 1;
        
        // Reload current tab data
        if (this.currentTab === 'gallery') {
            this.loadMedia();
        } else if (this.currentTab === 'articles') {
            this.loadArticles();
        }
    }
    
    refreshCurrentTab() {
        if (this.currentTab === 'gallery') {
            this.loadMedia();
        } else if (this.currentTab === 'articles') {
            this.loadArticles();
        }
    }
    
    removeMediaFromDOM(mediaId) {
        const mediaCard = document.querySelector(`[data-media-id="${mediaId}"]`);
        if (mediaCard) {
            mediaCard.remove();
        }
    }
    
    removeArticleFromDOM(articleId) {
        const articleCard = document.querySelector(`[data-article-id="${articleId}"]`);
        if (articleCard) {
            articleCard.remove();
        }
    }
    
    showMessage(message, type = 'info') {
        const container = document.getElementById('statusContainer');
        const messageEl = document.createElement('div');
        messageEl.className = `status-message ${type}`;
        messageEl.textContent = message;
        
        container.appendChild(messageEl);
        
        // Trigger animation
        requestAnimationFrame(() => {
            messageEl.classList.add('show');
        });
        
        // Remove after delay
        setTimeout(() => {
            messageEl.classList.remove('show');
            setTimeout(() => {
                if (container.contains(messageEl)) {
                    container.removeChild(messageEl);
                }
            }, 300);
        }, 5000);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cmsApp = new CMSApp();
});

// Load marked.js as fallback if CDN fails
if (!window.marked) {
    const script = document.createElement('script');
    script.src = '/markdown.js';
    script.onload = () => {
        console.log('Fallback markdown parser loaded');
    };
    document.head.appendChild(script);
}