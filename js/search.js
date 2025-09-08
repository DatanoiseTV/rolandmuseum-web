// Search functionality
(function() {
    let searchIndex = [];
    let searchInput = document.getElementById('search-input');
    let searchResults = document.getElementById('search-results');
    
    if (!searchInput || !searchResults) return;
    
    // Load search index - use relative path
    const basePath = document.querySelector('link[rel="stylesheet"]').href.replace(/css\/style\.css$/, '');
    fetch(basePath + 'search-index.json')
        .then(response => response.json())
        .then(data => {
            searchIndex = data;
        })
        .catch(error => {
            console.error('Failed to load search index:', error);
        });
    
    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Search function
    function performSearch(query) {
        if (query.length < 2) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('active');
            return;
        }
        
        const lowerQuery = query.toLowerCase();
        const results = [];
        
        // Search through the index
        searchIndex.forEach(item => {
            let score = 0;
            
            // Check name (highest priority)
            if (item.name && item.name.toLowerCase().includes(lowerQuery)) {
                score += 10;
            }
            
            // Check manufacturer
            if (item.manufacturer && item.manufacturer.toLowerCase().includes(lowerQuery)) {
                score += 5;
            }
            
            // Check category
            if (item.category && item.category.toLowerCase().includes(lowerQuery)) {
                score += 3;
            }
            
            // Check description
            if (item.description && item.description.toLowerCase().includes(lowerQuery)) {
                score += 1;
            }
            
            // Check keywords
            if (item.keywords) {
                item.keywords.forEach(keyword => {
                    if (keyword.toLowerCase().includes(lowerQuery)) {
                        score += 2;
                    }
                });
            }
            
            if (score > 0) {
                results.push({ ...item, score });
            }
        });
        
        // Sort by score
        results.sort((a, b) => b.score - a.score);
        
        // Display results
        displayResults(results.slice(0, 10));
    }
    
    // Display search results
    function displayResults(results) {
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
            searchResults.classList.add('active');
            return;
        }
        
        let html = '';
        results.forEach(item => {
            html += `
                <a href="${item.url}" class="search-result-item">
                    <strong>${escapeHtml(item.name)}</strong>
                    <br>
                    <small>${escapeHtml(item.manufacturer)} - ${escapeHtml(item.category)}</small>
                </a>
            `;
        });
        
        searchResults.innerHTML = html;
        searchResults.classList.add('active');
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Event listeners
    const debouncedSearch = debounce(performSearch, 300);
    
    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });
    
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.length >= 2) {
            performSearch(searchInput.value);
        }
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });
    
    // Handle keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        const items = searchResults.querySelectorAll('.search-result-item');
        let currentIndex = Array.from(items).findIndex(item => item.classList.contains('selected'));
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentIndex < items.length - 1) {
                if (currentIndex >= 0) items[currentIndex].classList.remove('selected');
                items[currentIndex + 1].classList.add('selected');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentIndex > 0) {
                items[currentIndex].classList.remove('selected');
                items[currentIndex - 1].classList.add('selected');
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentIndex >= 0) {
                items[currentIndex].click();
            }
        } else if (e.key === 'Escape') {
            searchResults.classList.remove('active');
            searchInput.blur();
        }
    });
})();