// Admin Dashboard JavaScript
class AdminApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentUser = null;
        this.csrfToken = null;
        this.eventSource = null;
        this.sidebarCollapsed = false;
        this.pages = {
            media: 1,
            articles: 1,
            audit: 1
        };
        this.filters = {
            media: { type: '', includeDeleted: false },
            articles: { includeDeleted: false },
            recycle: { type: '' }
        };
        
        this.init();
    }
    
    async init() {
        await this.checkAuth();
        this.setupTheme();
        this.setupEventListeners();
        this.setupSSE();
        this.loadDashboardData();
        this.updateConnectionStatus('connecting');
    }
    
    async checkAuth() {
        try {
            const response = await fetch('/api/me');
            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.admin;
                this.csrfToken = data.csrfToken;
                this.updateUserInfo();
                this.updateAdminOnlyElements();
            } else {
                window.location.href = '/login.html';
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = '/login.html';
        }
    }
    
    updateUserInfo() {
        document.getElementById('userName').textContent = this.currentUser.username;
        document.getElementById('userRole').textContent = this.currentUser.role;
    }
    
    updateAdminOnlyElements() {
        const adminOnlyElements = document.querySelectorAll('.admin-only');
        adminOnlyElements.forEach(element => {
            if (this.currentUser.role === 'admin') {
                element.classList.add('show');
            }
        });
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
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.getAttribute('data-section');
                this.showSection(section);
            });
        });
        
        // Sidebar toggle
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            this.toggleSidebar();
        });
        
        document.getElementById('mobileMenuBtn').addEventListener('click', () => {
            this.toggleSidebar();
        });
        
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });
        
        // Filters
        document.getElementById('mediaTypeFilter').addEventListener('change', (e) => {
            this.filters.media.type = e.target.value;
            this.loadMedia();
        });
        
        document.getElementById('includeDeletedMedia').addEventListener('change', (e) => {
            this.filters.media.includeDeleted = e.target.checked;
            this.loadMedia();
        });
        
        document.getElementById('includeDeletedArticles').addEventListener('change', (e) => {
            this.filters.articles.includeDeleted = e.target.checked;
            this.loadArticles();
        });
        
        document.getElementById('recycleTypeFilter').addEventListener('change', (e) => {
            this.filters.recycle.type = e.target.value;
            this.loadRecycleItems();
        });
        
        // Load more buttons
        document.getElementById('loadMoreMedia').addEventListener('click', () => this.loadMoreMedia());
        document.getElementById('loadMoreArticles').addEventListener('click', () => this.loadMoreArticles());
        document.getElementById('loadMoreAudit').addEventListener('click', () => this.loadMoreAudit());
        
        // Close modals on click outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
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
                setTimeout(() => this.setupSSE(), 5000);
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
                this.refreshCurrentSection();
                this.updateDashboardStats();
                break;
                
            case 'media:delete':
                this.showMessage(`Media deleted: ${data.title}`, 'info');
                this.removeMediaFromDOM(data.id);
                this.updateDashboardStats();
                break;
                
            case 'media:restore':
                this.showMessage(`Media restored: ${data.title}`, 'info');
                this.refreshCurrentSection();
                this.updateDashboardStats();
                break;
                
            case 'media:purge':
                this.showMessage(`Media permanently deleted: ${data.title}`, 'info');
                this.removeMediaFromDOM(data.id);
                this.updateDashboardStats();
                break;
                
            case 'article:new':
            case 'article:publish':
                this.showMessage(`New article: ${data.title}`, 'info');
                this.refreshCurrentSection();
                this.updateDashboardStats();
                break;
                
            case 'article:delete':
                this.showMessage(`Article deleted: ${data.title}`, 'info');
                this.removeArticleFromDOM(data.id);
                this.updateDashboardStats();
                break;
                
            case 'article:restore':
                this.showMessage(`Article restored: ${data.title}`, 'info');
                this.refreshCurrentSection();
                this.updateDashboardStats();
                break;
                
            case 'article:purge':
                this.showMessage(`Article permanently deleted: ${data.title}`, 'info');
                this.removeArticleFromDOM(data.id);
                this.updateDashboardStats();
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
    
    toggleSidebar() {
        const sidebar = document.getElementById('adminSidebar');
        const main = document.getElementById('adminMain');
        
        if (window.innerWidth <= 1024) {
            sidebar.classList.toggle('show');
        } else {
            this.sidebarCollapsed = !this.sidebarCollapsed;
            sidebar.classList.toggle('collapsed');
            main.classList.toggle('expanded');
        }
    }
    
    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
        
        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');
        
        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            media: 'Media Management',
            articles: 'Articles Management',
            tags: 'Tags & Categories',
            'api-keys': 'API Keys',
            recycle: 'Recycle Bin',
            users: 'User Management',
            audit: 'Audit Log'
        };
        document.getElementById('pageTitle').textContent = titles[sectionName] || 'Dashboard';
        
        this.currentSection = sectionName;
        
        // Load section data
        this.loadSectionData(sectionName);
        
        // Hide mobile sidebar
        if (window.innerWidth <= 1024) {
            document.getElementById('adminSidebar').classList.remove('show');
        }
    }
    
    loadSectionData(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'media':
                this.loadMedia();
                break;
            case 'articles':
                this.loadArticles();
                break;
            case 'tags':
                this.loadTagsAndCategories();
                break;
            case 'api-keys':
                this.loadApiKeys();
                break;
            case 'recycle':
                this.loadRecycleItems();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'audit':
                this.loadAuditLog();
                break;
        }
    }
    
    async loadDashboardData() {
        await Promise.all([
            this.updateDashboardStats(),
            this.loadRecentActivity()
        ]);
    }
    
    async updateDashboardStats() {
        try {
            const [mediaRes, articlesRes, recycleRes, apiKeysRes] = await Promise.all([
                this.makeRequest('/api/admin/media?limit=1'),
                this.makeRequest('/api/admin/articles?limit=1'),
                this.makeRequest('/api/admin/recycle'),
                this.makeRequest('/api/admin/api-keys')
            ]);
            
            if (mediaRes.ok) {
                const mediaData = await mediaRes.json();
                document.getElementById('mediaCount').textContent = mediaData.pagination.total;
            }
            
            if (articlesRes.ok) {
                const articlesData = await articlesRes.json();
                document.getElementById('articlesCount').textContent = articlesData.pagination.total;
            }
            
            if (recycleRes.ok) {
                const recycleData = await recycleRes.json();
                document.getElementById('deletedCount').textContent = recycleData.items.length;
            }
            
            if (apiKeysRes.ok) {
                const apiKeysData = await apiKeysRes.json();
                document.getElementById('apiKeysCount').textContent = apiKeysData.length;
            }
        } catch (error) {
            console.error('Failed to update dashboard stats:', error);
        }
    }
    
    async loadRecentActivity() {
        try {
            const response = await this.makeRequest('/api/admin/audit?limit=10');
            if (response.ok) {
                const data = await response.json();
                this.displayRecentActivity(data.logs);
            }
        } catch (error) {
            console.error('Failed to load recent activity:', error);
        }
    }
    
    displayRecentActivity(activities) {
        const container = document.getElementById('recentActivity');
        
        if (activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-text">No recent activity</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-content">
                    <div class="activity-action">
                        <span class="audit-user">${this.escapeHtml(activity.admin)}</span>
                        ${this.formatAuditAction(activity.action)} ${activity.targetType}
                    </div>
                    <div class="activity-details">${this.escapeHtml(activity.details || '')}</div>
                </div>
                <div class="activity-time">${this.formatDate(activity.createdAt)}</div>
            </div>
        `).join('');
    }
    
    async loadMedia(append = false) {
        try {
            const page = append ? this.pages.media + 1 : 1;
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                includeDeleted: this.filters.media.includeDeleted ? 'true' : 'false'
            });
            
            if (this.filters.media.type) {
                // Note: This would need to be implemented in the backend
                // params.append('type', this.filters.media.type);
            }
            
            const response = await this.makeRequest(`/api/admin/media?${params}`);
            const data = await response.json();
            
            if (response.ok) {
                if (append) {
                    this.appendMedia(data.media);
                    this.pages.media = page;
                } else {
                    this.displayMedia(data.media);
                    this.pages.media = 1;
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
    
    displayMedia(media) {
        const grid = document.getElementById('mediaGrid');
        grid.innerHTML = '';
        this.appendMedia(media);
    }
    
    appendMedia(media) {
        const grid = document.getElementById('mediaGrid');
        
        if (media.length === 0 && grid.children.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🖼️</div>
                    <div class="empty-state-text">No media items found</div>
                    <div class="empty-state-subtitle">Upload some media to get started</div>
                </div>
            `;
            return;
        }
        
        media.forEach(item => {
            const card = this.createMediaCard(item);
            grid.appendChild(card);
        });
    }
    
    createMediaCard(item) {
        const card = document.createElement('div');
        card.className = `admin-media-card fade-in${item.deletedAt ? ' deleted' : ''}`;
        card.setAttribute('data-media-id', item.id);
        
        let imageHtml = '';
        if (item.type === 'youtube') {
            imageHtml = `<div class="media-card-image">📺</div>`;
        } else if (item.thumbPath) {
            imageHtml = `<img src="${item.thumbPath}" alt="${item.title}" class="media-card-image" loading="lazy">`;
        } else if (item.filePath) {
            imageHtml = `<img src="${item.filePath}" alt="${item.title}" class="media-card-image" loading="lazy">`;
        } else {
            const icon = item.type === 'video' ? '🎬' : '🖼️';
            imageHtml = `<div class="media-card-image">${icon}</div>`;
        }
        
        const isScheduled = item.publishAt && item.publishAt > Math.floor(Date.now() / 1000);
        const isPrivate = item.isPrivate;
        const isDeleted = item.deletedAt;
        
        card.innerHTML = `
            ${imageHtml}
            <div class="media-card-content">
                <h3 class="media-card-title">${this.escapeHtml(item.title)}</h3>
                <div class="media-card-meta">
                    <span class="media-type">${item.type}</span>
                    <span>${this.formatDate(item.createdAt)}</span>
                </div>
                ${item.description ? `<p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.5rem 0;">${this.escapeHtml(item.description.substring(0, 100))}${item.description.length > 100 ? '...' : ''}</p>` : ''}
                <div style="margin: 0.5rem 0; display: flex; gap: 0.25rem; flex-wrap: wrap;">
                    ${isScheduled ? '<span class="status-badge scheduled">Scheduled</span>' : ''}
                    ${isPrivate ? '<span class="status-badge">Private</span>' : ''}
                    ${isDeleted ? '<span class="status-badge deleted">Deleted</span>' : ''}
                </div>
                <div class="media-card-actions">
                    ${!isDeleted ? `
                        <button class="card-action-btn" onclick="adminApp.editMedia(${item.id})">Edit</button>
                        <button class="card-action-btn" onclick="adminApp.viewMedia(${item.id})">View</button>
                        <button class="card-action-btn danger" onclick="adminApp.deleteMedia(${item.id})">Delete</button>
                    ` : `
                        <button class="card-action-btn success" onclick="adminApp.restoreMedia(${item.id})">Restore</button>
                        <button class="card-action-btn danger" onclick="adminApp.purgeMedia(${item.id})">Purge</button>
                    `}
                </div>
            </div>
        `;
        
        return card;
    }
    
    async loadArticles(append = false) {
        try {
            const page = append ? this.pages.articles + 1 : 1;
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                includeDeleted: this.filters.articles.includeDeleted ? 'true' : 'false'
            });
            
            const response = await this.makeRequest(`/api/admin/articles?${params}`);
            const data = await response.json();
            
            if (response.ok) {
                if (append) {
                    this.appendArticles(data.articles);
                    this.pages.articles = page;
                } else {
                    this.displayArticles(data.articles);
                    this.pages.articles = 1;
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
    
    displayArticles(articles) {
        const list = document.getElementById('articlesList');
        list.innerHTML = '';
        this.appendArticles(articles);
    }
    
    appendArticles(articles) {
        const list = document.getElementById('articlesList');
        
        if (articles.length === 0 && list.children.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <div class="empty-state-text">No articles found</div>
                    <div class="empty-state-subtitle">Create your first article to get started</div>
                </div>
            `;
            return;
        }
        
        articles.forEach(article => {
            const card = this.createArticleCard(article);
            list.appendChild(card);
        });
    }
    
    createArticleCard(article) {
        const card = document.createElement('div');
        card.className = `admin-article-card fade-in${article.deletedAt ? ' deleted' : ''}`;
        card.setAttribute('data-article-id', article.id);
        
        const excerpt = this.stripHtml(article.body).substring(0, 200) + '...';
        const isScheduled = article.publishAt && article.publishAt > Math.floor(Date.now() / 1000);
        const isDeleted = article.deletedAt;
        
        let status = 'published';
        if (isDeleted) status = 'deleted';
        else if (isScheduled) status = 'scheduled';
        else if (!article.publishAt) status = 'draft';
        
        card.innerHTML = `
            <div class="article-card-header">
                <h3 class="article-card-title">${this.escapeHtml(article.title)}</h3>
                <div class="article-card-status">
                    <span class="status-badge ${status}">${status.toUpperCase()}</span>
                </div>
            </div>
            <p class="article-card-excerpt">${this.escapeHtml(excerpt)}</p>
            <div class="article-card-footer">
                <div class="article-card-meta">
                    <span>Created: ${this.formatDate(article.createdAt)}</span>
                    ${article.category ? `<span>Category: ${article.category}</span>` : ''}
                    ${isScheduled ? `<span>Publish: ${this.formatDate(article.publishAt)}</span>` : ''}
                </div>
                <div class="article-card-actions">
                    ${!isDeleted ? `
                        <button class="card-action-btn" onclick="adminApp.editArticle(${article.id})">Edit</button>
                        <button class="card-action-btn" onclick="adminApp.viewArticle('${article.slug}')">View</button>
                        <button class="card-action-btn danger" onclick="adminApp.deleteArticle(${article.id})">Delete</button>
                    ` : `
                        <button class="card-action-btn success" onclick="adminApp.restoreArticle(${article.id})">Restore</button>
                        <button class="card-action-btn danger" onclick="adminApp.purgeArticle(${article.id})">Purge</button>
                    `}
                </div>
            </div>
        `;
        
        return card;
    }
    
    async loadTagsAndCategories() {
        try {
            const [tagsRes, categoriesRes] = await Promise.all([
                this.makeRequest('/api/meta/tags'),
                this.makeRequest('/api/meta/categories')
            ]);
            
            if (tagsRes.ok && categoriesRes.ok) {
                const tagsData = await tagsRes.json();
                const categoriesData = await categoriesRes.json();
                
                this.displayTags('mediaTagsList', tagsData.mediaTags);
                this.displayTags('articleTagsList', tagsData.articleTags);
                this.displayTags('categoriesList', categoriesData.categories);
            }
        } catch (error) {
            console.error('Error loading tags and categories:', error);
            this.showMessage('Failed to load tags and categories', 'error');
        }
    }
    
    displayTags(containerId, tags) {
        const container = document.getElementById(containerId);
        
        if (tags.length === 0) {
            container.innerHTML = '<div class="empty-state-text">No tags found</div>';
            return;
        }
        
        container.innerHTML = tags.map(tag => `
            <div class="tag-item">
                <span class="tag-name">${this.escapeHtml(tag)}</span>
            </div>
        `).join('');
    }
    
    async renameTag() {
        const oldTag = document.getElementById('oldTagName').value.trim();
        const newTag = document.getElementById('newTagName').value.trim();
        const type = document.getElementById('renameTagType').value;
        
        if (!oldTag || !newTag) {
            this.showMessage('Both old and new tag names are required', 'error');
            return;
        }
        
        if (oldTag === newTag) {
            this.showMessage('Old and new tag names cannot be the same', 'error');
            return;
        }
        
        try {
            const response = await this.makeRequest('/api/admin/meta/tags/rename', {
                method: 'POST',
                body: JSON.stringify({ oldTag, newTag, type })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showMessage(`Tag "${oldTag}" renamed to "${newTag}"`, 'success');
                document.getElementById('oldTagName').value = '';
                document.getElementById('newTagName').value = '';
                this.loadTagsAndCategories();
            } else {
                this.showMessage(data.error || 'Failed to rename tag', 'error');
            }
        } catch (error) {
            console.error('Error renaming tag:', error);
            this.showMessage('Network error renaming tag', 'error');
        }
    }
    
    async loadApiKeys() {
        if (this.currentUser.role !== 'admin') {
            document.getElementById('api-keys-section').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔒</div>
                    <div class="empty-state-text">Access Denied</div>
                    <div class="empty-state-subtitle">Only administrators can manage API keys</div>
                </div>
            `;
            return;
        }
        
        try {
            const response = await this.makeRequest('/api/admin/api-keys');
            const data = await response.json();
            
            if (response.ok) {
                this.displayApiKeys(data);
            } else {
                this.showMessage(data.error || 'Failed to load API keys', 'error');
            }
        } catch (error) {
            console.error('Error loading API keys:', error);
            this.showMessage('Network error loading API keys', 'error');
        }
    }
    
    displayApiKeys(apiKeys) {
        const container = document.getElementById('apiKeysList');
        
        if (apiKeys.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔑</div>
                    <div class="empty-state-text">No API keys found</div>
                    <div class="empty-state-subtitle">Create an API key to access public endpoints</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = apiKeys.map(key => `
            <div class="api-key-card">
                <div class="api-key-header">
                    <div class="api-key-label">${this.escapeHtml(key.label)}</div>
                    <div class="api-key-status">
                        <span class="status-badge ${key.active ? 'published' : 'deleted'}">
                            ${key.active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
                <div class="api-key-key">${this.escapeHtml(key.apiKey)}</div>
                <div class="api-key-meta">
                    <span>Created: ${this.formatDate(key.createdAt)}</span>
                    <span>Last used: ${key.lastUsed ? this.formatDate(key.lastUsed) : 'Never'}</span>
                </div>
                <div class="api-key-actions">
                    <button class="action-btn secondary" onclick="adminApp.copyApiKey('${key.apiKey}')">Copy</button>
                    <button class="action-btn ${key.active ? 'danger' : 'success'}" 
                            onclick="adminApp.toggleApiKey(${key.id}, ${!key.active})">
                        ${key.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button class="action-btn danger" onclick="adminApp.deleteApiKey(${key.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }
    
    async loadRecycleItems() {
        try {
            const params = new URLSearchParams();
            if (this.filters.recycle.type) {
                params.append('type', this.filters.recycle.type);
            }
            
            const response = await this.makeRequest(`/api/admin/recycle?${params}`);
            const data = await response.json();
            
            if (response.ok) {
                this.displayRecycleItems(data.items);
            } else {
                this.showMessage(data.error || 'Failed to load recycle bin', 'error');
            }
        } catch (error) {
            console.error('Error loading recycle items:', error);
            this.showMessage('Network error loading recycle bin', 'error');
        }
    }
    
    displayRecycleItems(items) {
        const container = document.getElementById('recycleList');
        
        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🗑️</div>
                    <div class="empty-state-text">Recycle bin is empty</div>
                    <div class="empty-state-subtitle">Deleted items will appear here</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = items.map(item => `
            <div class="recycle-item">
                <div class="recycle-item-header">
                    <div class="recycle-item-title">${this.escapeHtml(item.title)}</div>
                    <div class="recycle-item-type">${item.itemType}</div>
                </div>
                <div class="recycle-item-meta">
                    <span>Deleted: ${this.formatDate(item.deletedAt)}</span>
                    <span>Originally created: ${this.formatDate(item.createdAt)}</span>
                </div>
                <div class="recycle-item-actions">
                    <button class="action-btn success" onclick="adminApp.restoreItem('${item.itemType}', ${item.id})">
                        Restore
                    </button>
                    <button class="action-btn danger" onclick="adminApp.purgeItem('${item.itemType}', ${item.id})">
                        Purge Forever
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    async loadUsers() {
        if (this.currentUser.role !== 'admin') {
            document.getElementById('users-section').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔒</div>
                    <div class="empty-state-text">Access Denied</div>
                    <div class="empty-state-subtitle">Only administrators can manage users</div>
                </div>
            `;
            return;
        }
        
        try {
            const response = await this.makeRequest('/api/admin/users');
            const data = await response.json();
            
            if (response.ok) {
                this.displayUsers(data);
            } else {
                this.showMessage(data.error || 'Failed to load users', 'error');
            }
        } catch (error) {
            console.error('Error loading users:', error);
            this.showMessage('Network error loading users', 'error');
        }
    }
    
    displayUsers(users) {
        const container = document.getElementById('usersList');
        
        container.innerHTML = users.map(user => `
            <div class="user-card">
                <div class="user-card-header">
                    <div class="user-card-info">
                        <div class="user-card-avatar">${user.username.charAt(0).toUpperCase()}</div>
                        <div class="user-card-details">
                            <div class="user-card-name">${this.escapeHtml(user.username)}</div>
                            <div class="user-card-role">${user.role}</div>
                        </div>
                    </div>
                </div>
                <div class="user-card-meta">
                    <span>Created: ${this.formatDate(user.createdAt)}</span>
                    <span>Role: ${user.role}</span>
                </div>
                <div class="user-card-actions">
                    ${user.id !== this.currentUser.id ? `
                        <button class="action-btn secondary" onclick="adminApp.editUser(${user.id})">Edit</button>
                        <button class="action-btn danger" onclick="adminApp.deleteUser(${user.id})">Delete</button>
                    ` : `
                        <span class="text-muted">Current user</span>
                    `}
                </div>
            </div>
        `).join('');
    }
    
    async loadAuditLog(append = false) {
        if (this.currentUser.role !== 'admin') {
            document.getElementById('audit-section').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔒</div>
                    <div class="empty-state-text">Access Denied</div>
                    <div class="empty-state-subtitle">Only administrators can view audit logs</div>
                </div>
            `;
            return;
        }
        
        try {
            const page = append ? this.pages.audit + 1 : 1;
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '50'
            });
            
            const response = await this.makeRequest(`/api/admin/audit?${params}`);
            const data = await response.json();
            
            if (response.ok) {
                if (append) {
                    this.appendAuditLogs(data.logs);
                    this.pages.audit = page;
                } else {
                    this.displayAuditLogs(data.logs);
                    this.pages.audit = 1;
                }
                
                this.updateLoadMoreButton('loadMoreAudit', data.pagination);
            } else {
                this.showMessage(data.error || 'Failed to load audit log', 'error');
            }
        } catch (error) {
            console.error('Error loading audit log:', error);
            this.showMessage('Network error loading audit log', 'error');
        }
    }
    
    displayAuditLogs(logs) {
        const container = document.getElementById('auditList');
        container.innerHTML = '';
        this.appendAuditLogs(logs);
    }
    
    appendAuditLogs(logs) {
        const container = document.getElementById('auditList');
        
        if (logs.length === 0 && container.children.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-text">No audit logs found</div>
                </div>
            `;
            return;
        }
        
        logs.forEach(log => {
            const item = document.createElement('div');
            item.className = 'audit-item';
            
            item.innerHTML = `
                <div class="audit-item-header">
                    <div class="audit-action">
                        <span class="audit-user">${this.escapeHtml(log.admin)}</span>
                        ${this.formatAuditAction(log.action)} ${log.targetType}
                        ${log.targetId ? ` (ID: ${log.targetId})` : ''}
                    </div>
                    <div class="audit-time">${this.formatDate(log.createdAt)}</div>
                </div>
                ${log.details ? `<div class="audit-details">${this.escapeHtml(log.details)}</div>` : ''}
            `;
            
            container.appendChild(item);
        });
    }
    
    // Action Methods
    showMediaUpload() {
        this.showModal('Upload Media', this.createMediaUploadForm(), {
            primary: { text: 'Upload', onclick: 'adminApp.handleMediaUpload()' },
            secondary: { text: 'Cancel', onclick: 'adminApp.closeModal()' }
        });
    }
    
    createMediaUploadForm() {
        return `
            <form id="mediaUploadForm" enctype="multipart/form-data">
                <div class="form-group">
                    <label class="form-label">Type</label>
                    <select id="mediaType" class="form-select" onchange="adminApp.toggleMediaFields()">
                        <option value="file">Upload File</option>
                        <option value="youtube">YouTube Video</option>
                    </select>
                </div>
                
                <div id="fileFields">
                    <div class="form-group">
                        <label class="form-label">File</label>
                        <input type="file" id="mediaFile" class="form-input" accept="image/*,video/*">
                    </div>
                </div>
                
                <div id="youtubeFields" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">YouTube Video ID</label>
                        <input type="text" id="youtubeId" class="form-input" placeholder="e.g., dQw4w9WgXcQ">
                        <small style="color: var(--text-muted);">Enter the video ID from the YouTube URL</small>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Title *</label>
                    <input type="text" id="mediaTitle" class="form-input" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea id="mediaDescription" class="form-textarea" rows="3"></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Category</label>
                        <input type="text" id="mediaCategory" class="form-input">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tags</label>
                        <input type="text" id="mediaTags" class="form-input" placeholder="tag1, tag2, tag3">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">
                            <input type="checkbox" id="mediaPrivate" style="margin-right: 0.5rem;">
                            Private (requires token access)
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Publish Date (optional)</label>
                        <input type="datetime-local" id="mediaPublishAt" class="form-input">
                    </div>
                </div>
            </form>
        `;
    }
    
    toggleMediaFields() {
        const type = document.getElementById('mediaType').value;
        const fileFields = document.getElementById('fileFields');
        const youtubeFields = document.getElementById('youtubeFields');
        
        if (type === 'youtube') {
            fileFields.style.display = 'none';
            youtubeFields.style.display = 'block';
        } else {
            fileFields.style.display = 'block';
            youtubeFields.style.display = 'none';
        }
    }
    
    async handleMediaUpload() {
        const form = document.getElementById('mediaUploadForm');
        const formData = new FormData();
        
        const type = document.getElementById('mediaType').value;
        const title = document.getElementById('mediaTitle').value.trim();
        
        if (!title) {
            this.showMessage('Title is required', 'error');
            return;
        }
        
        formData.append('title', title);
        formData.append('description', document.getElementById('mediaDescription').value);
        formData.append('category', document.getElementById('mediaCategory').value);
        formData.append('tags', document.getElementById('mediaTags').value);
        formData.append('isPrivate', document.getElementById('mediaPrivate').checked);
        
        const publishAt = document.getElementById('mediaPublishAt').value;
        if (publishAt) {
            formData.append('publishAt', publishAt);
        }
        
        if (type === 'youtube') {
            const youtubeId = document.getElementById('youtubeId').value.trim();
            if (!youtubeId) {
                this.showMessage('YouTube ID is required', 'error');
                return;
            }
            formData.append('youtubeId', youtubeId);
        } else {
            const file = document.getElementById('mediaFile').files[0];
            if (!file) {
                this.showMessage('File is required', 'error');
                return;
            }
            formData.append('file', file);
        }
        
        try {
            const response = await this.makeRequest('/api/admin/media', {
                method: 'POST',
                body: formData,
                skipContentType: true
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showMessage('Media uploaded successfully', 'success');
                this.closeModal();
                if (this.currentSection === 'media') {
                    this.loadMedia();
                }
            } else {
                this.showMessage(data.error || 'Upload failed', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.showMessage('Network error during upload', 'error');
        }
    }
    
    showArticleEditor(articleId = null) {
        if (articleId) {
            this.loadArticleForEdit(articleId);
        } else {
            this.showModal('Create Article', this.createArticleEditorForm(), {
                primary: { text: 'Save Article', onclick: 'adminApp.handleArticleSave()' },
                secondary: { text: 'Cancel', onclick: 'adminApp.closeModal()' }
            }, 'large');
        }
    }
    
    async loadArticleForEdit(articleId) {
        try {
            const response = await this.makeRequest(`/api/admin/articles/${articleId}`);
            const data = await response.json();
            
            if (response.ok) {
                this.showModal('Edit Article', this.createArticleEditorForm(data), {
                    primary: { text: 'Update Article', onclick: `adminApp.handleArticleUpdate(${articleId})` },
                    secondary: { text: 'Cancel', onclick: 'adminApp.closeModal()' }
                }, 'large');
            } else {
                this.showMessage(data.error || 'Failed to load article', 'error');
            }
        } catch (error) {
            console.error('Error loading article:', error);
            this.showMessage('Network error loading article', 'error');
        }
    }
    
    createArticleEditorForm(article = null) {
        const isEdit = article !== null;
        
        return `
            <form id="articleForm">
                <div class="form-group">
                    <label class="form-label">Title *</label>
                    <input type="text" id="articleTitle" class="form-input" value="${isEdit ? this.escapeHtml(article.title) : ''}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Category</label>
                        <input type="text" id="articleCategory" class="form-input" value="${isEdit ? this.escapeHtml(article.category || '') : ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tags</label>
                        <input type="text" id="articleTags" class="form-input" placeholder="tag1, tag2, tag3" value="${isEdit ? this.escapeHtml(article.tags || '') : ''}">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Cover Image Path (optional)</label>
                        <input type="text" id="articleCover" class="form-input" value="${isEdit ? this.escapeHtml(article.coverPath || '') : ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Publish Date (optional)</label>
                        <input type="datetime-local" id="articlePublishAt" class="form-input" value="${isEdit && article.publishAt ? new Date(article.publishAt * 1000).toISOString().slice(0, 16) : ''}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Content *</label>
                    <div class="editor-container">
                        <div class="editor-toolbar">
                            <button type="button" class="editor-btn" onclick="adminApp.toggleEditorMode()">
                                <span id="editorModeText">WYSIWYG</span>
                            </button>
                            <button type="button" class="editor-btn" onclick="adminApp.insertMarkdown('**', '**')">Bold</button>
                            <button type="button" class="editor-btn" onclick="adminApp.insertMarkdown('*', '*')">Italic</button>
                            <button type="button" class="editor-btn" onclick="adminApp.insertMarkdown('## ', '')">H2</button>
                            <button type="button" class="editor-btn" onclick="adminApp.insertMarkdown('### ', '')">H3</button>
                            <button type="button" class="editor-btn" onclick="adminApp.insertMarkdown('[', '](url)')">Link</button>
                            <button type="button" class="editor-btn" onclick="adminApp.insertMarkdown('![', '](image-url)')">Image</button>
                        </div>
                        <div class="editor-content">
                            <textarea id="articleBody" class="editor-textarea" required>${isEdit ? this.escapeHtml(article.body) : ''}</textarea>
                            <div id="articlePreview" class="editor-preview" style="display: none;"></div>
                        </div>
                    </div>
                </div>
            </form>
        `;
    }
    
    toggleEditorMode() {
        const textarea = document.getElementById('articleBody');
        const preview = document.getElementById('articlePreview');
        const modeText = document.getElementById('editorModeText');
        
        if (textarea.style.display === 'none') {
            // Switch to Markdown mode
            textarea.style.display = 'block';
            preview.style.display = 'none';
            modeText.textContent = 'WYSIWYG';
        } else {
            // Switch to Preview mode
            textarea.style.display = 'none';
            preview.style.display = 'block';
            modeText.textContent = 'Markdown';
            
            // Render markdown preview
            const markdown = textarea.value;
            if (window.marked) {
                preview.innerHTML = marked.parse(markdown);
            } else {
                preview.innerHTML = markdown.replace(/\n/g, '<br>');
            }
        }
    }
    
    insertMarkdown(before, after) {
        const textarea = document.getElementById('articleBody');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);
        
        const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
        textarea.value = newText;
        
        // Set cursor position
        const newCursorPos = start + before.length + selectedText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
    }
    
    async handleArticleSave() {
        const title = document.getElementById('articleTitle').value.trim();
        const body = document.getElementById('articleBody').value.trim();
        
        if (!title || !body) {
            this.showMessage('Title and content are required', 'error');
            return;
        }
        
        const articleData = {
            title,
            body,
            category: document.getElementById('articleCategory').value,
            tags: document.getElementById('articleTags').value,
            coverPath: document.getElementById('articleCover').value,
            publishAt: document.getElementById('articlePublishAt').value || null
        };
        
        try {
            const response = await this.makeRequest('/api/admin/articles', {
                method: 'POST',
                body: JSON.stringify(articleData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showMessage('Article created successfully', 'success');
                this.closeModal();
                if (this.currentSection === 'articles') {
                    this.loadArticles();
                }
            } else {
                this.showMessage(data.error || 'Failed to create article', 'error');
            }
        } catch (error) {
            console.error('Error creating article:', error);
            this.showMessage('Network error creating article', 'error');
        }
    }
    
    async handleArticleUpdate(articleId) {
        const title = document.getElementById('articleTitle').value.trim();
        const body = document.getElementById('articleBody').value.trim();
        
        if (!title || !body) {
            this.showMessage('Title and content are required', 'error');
            return;
        }
        
        const articleData = {
            title,
            body,
            category: document.getElementById('articleCategory').value,
            tags: document.getElementById('articleTags').value,
            coverPath: document.getElementById('articleCover').value,
            publishAt: document.getElementById('articlePublishAt').value || null
        };
        
        try {
            const response = await this.makeRequest(`/api/admin/articles/${articleId}`, {
                method: 'PUT',
                body: JSON.stringify(articleData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showMessage('Article updated successfully', 'success');
                this.closeModal();
                if (this.currentSection === 'articles') {
                    this.loadArticles();
                }
            } else {
                this.showMessage(data.error || 'Failed to update article', 'error');
            }
        } catch (error) {
            console.error('Error updating article:', error);
            this.showMessage('Network error updating article', 'error');
        }
    }
    
    // CRUD Operations
    async deleteMedia(id) {
        if (!confirm('Are you sure you want to delete this media item?')) return;
        
        try {
            const response = await this.makeRequest(`/api/admin/media/${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showMessage('Media deleted successfully', 'success');
                this.removeMediaFromDOM(id);
            } else {
                this.showMessage(data.error || 'Failed to delete media', 'error');
            }
        } catch (error) {
            console.error('Error deleting media:', error);
            this.showMessage('Network error deleting media', 'error');
        }
    }
    
    async restoreMedia(id) {
        try {
            const response = await this.makeRequest(`/api/admin/media/${id}/restore`, {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showMessage('Media restored successfully', 'success');
                this.loadMedia();
            } else {
                this.showMessage(data.error || 'Failed to restore media', 'error');
            }
        } catch (error) {
            console.error('Error restoring media:', error);
            this.showMessage('Network error restoring media', 'error');
        }
    }
    
    async purgeMedia(id) {
        if (!confirm('Are you sure you want to permanently delete this media item? This action cannot be undone.')) return;
        
        try {
            const response = await this.makeRequest(`/api/admin/media/${id}?permanent=true`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showMessage('Media purged successfully', 'success');
                this.removeMediaFromDOM(id);
            } else {
                this.showMessage(data.error || 'Failed to purge media', 'error');
            }
        } catch (error) {
            console.error('Error purging media:', error);
            this.showMessage('Network error purging media', 'error');
        }
    }
    
    async deleteArticle(id) {
        if (!confirm('Are you sure you want to delete this article?')) return;
        
        try {
            const response = await this.makeRequest(`/api/admin/articles/${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showMessage('Article deleted successfully', 'success');
                this.removeArticleFromDOM(id);
            } else {
                this.showMessage(data.error || 'Failed to delete article', 'error');
            }
        } catch (error) {
            console.error('Error deleting article:', error);
            this.showMessage('Network error deleting article', 'error');
        }
    }
    
    async restoreArticle(id) {
        try {
            const response = await this.makeRequest(`/api/admin/articles/${id}/restore`, {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showMessage('Article restored successfully', 'success');
                this.loadArticles();
            } else {
                this.showMessage(data.error || 'Failed to restore article', 'error');
            }
        } catch (error) {
            console.error('Error restoring article:', error);
            this.showMessage('Network error restoring article', 'error');
        }
    }
    
    async purgeArticle(id) {
        if (!confirm('Are you sure you want to permanently delete this article? This action cannot be undone.')) return;
        
        try {
            const response = await this.makeRequest(`/api/admin/articles/${id}?permanent=true`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showMessage('Article purged successfully', 'success');
                this.removeArticleFromDOM(id);
            } else {
                this.showMessage(data.error || 'Failed to purge article', 'error');
            }
        } catch (error) {
            console.error('Error purging article:', error);
            this.showMessage('Network error purging article', 'error');
        }
    }
    
    // Utility methods
    async makeRequest(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': this.csrfToken
            },
            credentials: 'same-origin'
        };
        
        if (options.skipContentType) {
            delete defaultOptions.headers['Content-Type'];
        }
        
        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };
        
        return fetch(url, mergedOptions);
    }
    
    showModal(title, content, actions = {}, size = 'normal') {
        const modal = document.createElement('div');
        modal.className = 'modal admin-modal show';
        modal.id = 'adminModal';
        
        const sizeClass = size === 'large' ? 'modal-content-large' : '';
        
        modal.innerHTML = `
            <div class="modal-content ${sizeClass}">
                <div class="modal-header">
                    <h2 class="modal-title">${title}</h2>
                    <button class="modal-close" onclick="adminApp.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${actions.primary || actions.secondary ? `
                    <div class="modal-footer">
                        ${actions.secondary ? `<button class="action-btn secondary" onclick="${actions.secondary.onclick}">${actions.secondary.text}</button>` : ''}
                        ${actions.primary ? `<button class="action-btn primary" onclick="${actions.primary.onclick}">${actions.primary.text}</button>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    closeModal() {
        const modal = document.getElementById('adminModal');
        if (modal) {
            modal.remove();
        }
    }
    
    showMessage(message, type = 'info') {
        const container = document.getElementById('statusContainer');
        const messageEl = document.createElement('div');
        messageEl.className = `status-message ${type}`;
        messageEl.textContent = message;
        
        container.appendChild(messageEl);
        
        requestAnimationFrame(() => {
            messageEl.classList.add('show');
        });
        
        setTimeout(() => {
            messageEl.classList.remove('show');
            setTimeout(() => {
                if (container.contains(messageEl)) {
                    container.removeChild(messageEl);
                }
            }, 300);
        }, 5000);
    }
    
    updateLoadMoreButton(buttonId, pagination) {
        const button = document.getElementById(buttonId);
        if (pagination.page >= pagination.pages) {
            button.style.display = 'none';
        } else {
            button.style.display = 'block';
        }
    }
    
    refreshCurrentSection() {
        this.loadSectionData(this.currentSection);
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
    
    formatDate(timestamp) {
        return new Date(timestamp * 1000).toLocaleString();
    }
    
    formatAuditAction(action) {
        const actionMap = {
            'create': 'created',
            'update': 'updated',
            'delete': 'deleted',
            'restore': 'restored',
            'purge': 'purged',
            'login_success': 'logged in',
            'login_failed': 'failed to log in',
            'logout': 'logged out'
        };
        
        return actionMap[action] || action;
    }
    
    async logout() {
        if (!confirm('Are you sure you want to logout?')) return;
        
        try {
            const response = await this.makeRequest('/api/logout', {
                method: 'POST'
            });
            
            if (response.ok) {
                window.location.href = '/login.html';
            } else {
                this.showMessage('Logout failed', 'error');
            }
        } catch (error) {
            console.error('Logout error:', error);
            this.showMessage('Network error during logout', 'error');
        }
    }
    
    // Load more methods
    async loadMoreMedia() {
        await this.loadMedia(true);
    }
    
    async loadMoreArticles() {
        await this.loadArticles(true);
    }
    
    async loadMoreAudit() {
        await this.loadAuditLog(true);
    }
}

// Initialize admin app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminApp = new AdminApp();
});

// Load marked.js for markdown parsing
if (!window.marked) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    script.onload = () => {
        console.log('Marked.js loaded');
    };
    script.onerror = () => {
        console.log('Loading fallback markdown parser');
        const fallbackScript = document.createElement('script');
        fallbackScript.src = '/markdown.js';
        document.head.appendChild(fallbackScript);
    };
    document.head.appendChild(script);
}