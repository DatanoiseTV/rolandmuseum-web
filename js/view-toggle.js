// View toggle functionality for grid/table views with sorting
(function() {
    // Get view preference from localStorage
    const savedView = localStorage.getItem('preferredView') || 'grid';
    const savedSort = localStorage.getItem('preferredSort') || 'name';
    const savedSortOrder = localStorage.getItem('preferredSortOrder') || 'asc';
    
    // Initialize view on page load
    document.addEventListener('DOMContentLoaded', function() {
        const container = document.getElementById('items-container');
        const toggleButtons = document.querySelectorAll('.view-toggle');
        
        if (!container || !toggleButtons.length) return;
        
        // Store original items for view switching
        const itemCards = Array.from(container.querySelectorAll('.item-card'));
        
        // Current sort state
        let currentSort = savedSort;
        let currentSortOrder = savedSortOrder;
        
        // Set initial view
        setView(savedView);
        
        // Add click handlers to toggle buttons
        toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const view = this.dataset.view;
                setView(view);
                localStorage.setItem('preferredView', view);
            });
        });
        
        function parseItemData(card) {
            const link = card.querySelector('a');
            const title = card.querySelector('h2, h3');
            const meta = card.querySelector('.item-meta');
            
            // Parse metadata
            let category = '', manufacturer = '', year = '';
            if (meta) {
                const metaText = meta.textContent;
                const categoryMatch = metaText.match(/Category: ([^|]+)/);
                const manufacturerMatch = metaText.match(/Manufacturer: ([^|]+)/);
                const yearMatch = metaText.match(/Year: (\d+)/);
                
                category = categoryMatch ? categoryMatch[1].trim() : '';
                manufacturer = manufacturerMatch ? manufacturerMatch[1].trim() : '';
                year = yearMatch ? yearMatch[1] : '';
            }
            
            return {
                card: card,
                link: link?.href || '',
                name: title?.textContent || '',
                category: category,
                manufacturer: manufacturer,
                year: year,
                yearNum: year ? parseInt(year) : 0
            };
        }
        
        function sortItems(items, sortBy, order) {
            return [...items].sort((a, b) => {
                const dataA = parseItemData(a);
                const dataB = parseItemData(b);
                
                let comparison = 0;
                
                switch(sortBy) {
                    case 'name':
                        comparison = dataA.name.localeCompare(dataB.name, undefined, { numeric: true, sensitivity: 'base' });
                        break;
                    case 'manufacturer':
                        comparison = dataA.manufacturer.localeCompare(dataB.manufacturer, undefined, { numeric: true, sensitivity: 'base' });
                        if (comparison === 0) {
                            comparison = dataA.name.localeCompare(dataB.name, undefined, { numeric: true, sensitivity: 'base' });
                        }
                        break;
                    case 'year':
                        comparison = dataA.yearNum - dataB.yearNum;
                        if (comparison === 0) {
                            comparison = dataA.name.localeCompare(dataB.name, undefined, { numeric: true, sensitivity: 'base' });
                        }
                        break;
                    case 'category':
                        comparison = dataA.category.localeCompare(dataB.category, undefined, { numeric: true, sensitivity: 'base' });
                        if (comparison === 0) {
                            comparison = dataA.name.localeCompare(dataB.name, undefined, { numeric: true, sensitivity: 'base' });
                        }
                        break;
                }
                
                return order === 'desc' ? -comparison : comparison;
            });
        }
        
        function setView(view) {
            // Remove any existing sort controls
            const existingControls = document.querySelector('.grid-sort-controls');
            if (existingControls) {
                existingControls.remove();
            }
            
            if (view === 'table') {
                // Create table view
                container.className = 'items-table';
                
                // Sort items
                const sortedCards = sortItems(itemCards, currentSort, currentSortOrder);
                
                // Build table HTML with sort indicators
                const tableHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th class="sortable" data-sort="manufacturer">
                                    Manufacturer
                                    <span class="sort-indicator">${currentSort === 'manufacturer' ? (currentSortOrder === 'asc' ? '↑' : '↓') : ''}</span>
                                </th>
                                <th class="sortable" data-sort="name">
                                    Name
                                    <span class="sort-indicator">${currentSort === 'name' ? (currentSortOrder === 'asc' ? '↑' : '↓') : ''}</span>
                                </th>
                                <th class="sortable" data-sort="year">
                                    Year
                                    <span class="sort-indicator">${currentSort === 'year' ? (currentSortOrder === 'asc' ? '↑' : '↓') : ''}</span>
                                </th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sortedCards.map(card => {
                                const data = parseItemData(card);
                                return `
                                    <tr>
                                        <td class="item-manufacturer">${data.manufacturer}</td>
                                        <td class="item-name">
                                            <a href="${data.link}">${data.name}</a>
                                        </td>
                                        <td class="item-year">${data.year || '-'}</td>
                                        <td class="item-link">
                                            <a href="${data.link}" class="detail-link">View →</a>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                `;
                
                container.innerHTML = tableHTML;
                
                // Add sort click handlers
                container.querySelectorAll('th.sortable').forEach(th => {
                    th.addEventListener('click', function() {
                        const sortBy = this.dataset.sort;
                        if (currentSort === sortBy) {
                            currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
                        } else {
                            currentSort = sortBy;
                            currentSortOrder = 'asc';
                        }
                        localStorage.setItem('preferredSort', currentSort);
                        localStorage.setItem('preferredSortOrder', currentSortOrder);
                        setView('table');
                    });
                });
                
            } else {
                // Restore grid view with sorting
                container.className = 'items-grid';
                container.innerHTML = '';
                
                // Add sort controls for grid view
                const sortControlsHTML = `
                    <div class="grid-sort-controls">
                        <label>Sort by:</label>
                        <select id="grid-sort-select">
                            <option value="name" ${currentSort === 'name' ? 'selected' : ''}>Name</option>
                            <option value="manufacturer" ${currentSort === 'manufacturer' ? 'selected' : ''}>Manufacturer</option>
                            <option value="year" ${currentSort === 'year' ? 'selected' : ''}>Year</option>
                            <option value="category" ${currentSort === 'category' ? 'selected' : ''}>Category</option>
                        </select>
                        <button id="grid-sort-order" class="sort-order-btn">
                            ${currentSortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                `;
                
                // Create wrapper for controls
                const controlsWrapper = document.createElement('div');
                controlsWrapper.innerHTML = sortControlsHTML;
                container.parentElement.insertBefore(controlsWrapper.firstElementChild, container);
                
                // Sort and display items
                const sortedCards = sortItems(itemCards, currentSort, currentSortOrder);
                sortedCards.forEach(card => container.appendChild(card));
                
                // Add event listeners for grid sort controls
                const sortSelect = document.getElementById('grid-sort-select');
                const sortOrderBtn = document.getElementById('grid-sort-order');
                
                if (sortSelect) {
                    sortSelect.addEventListener('change', function() {
                        currentSort = this.value;
                        localStorage.setItem('preferredSort', currentSort);
                        setView('grid');
                    });
                }
                
                if (sortOrderBtn) {
                    sortOrderBtn.addEventListener('click', function() {
                        currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
                        localStorage.setItem('preferredSortOrder', currentSortOrder);
                        setView('grid');
                    });
                }
            }
            
            // Update button states
            toggleButtons.forEach(btn => {
                if (btn.dataset.view === view) {
                    btn.classList.add('active');
                    btn.setAttribute('aria-pressed', 'true');
                } else {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                }
            });
        }
    });
})();