// API Key and Base URL
const API_KEY = '312ade627b28432bb9903380b86f7bc0';
const BASE_URL = 'https://newsapi.org/v2';
const proxyUrl = 'https://racan.vercel.app/News.html';
const response = await fetch(`${proxyUrl}${BASE_URL}/everything?...`);



// DOM Elements
const featuredContainer = document.getElementById('featured-container');
const newsContainer = document.getElementById('news-container');
const loadMoreBtn = document.getElementById('load-more');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const savedArticlesContainer = document.getElementById('saved-articles-container');
const modal = document.getElementById('article-modal');
const modalContentContainer = document.getElementById('modal-content-container');
const closeModal = document.querySelector('.close-modal');
const navLinks = document.querySelectorAll('nav ul li a');
const filterBtns = document.querySelectorAll('.filter-btn');
const newsletterForm = document.getElementById('newsletter-form');

// State variables
let currentPage = 1;
let currentCategory = 'fashion';
let currentQuery = '';
let savedArticles = JSON.parse(localStorage.getItem('savedArticles')) || [];
let articles = [];

// Fashion-related domains for better filtering
const FASHION_DOMAINS = 'vogue.com,elle.com,harpersbazaar.com,wwd.com,fashionista.com,glamour.com,instyle.com,cosmopolitan.com,allure.com,gq.com,highsnobiety.com,hypebeast.com,complex.com,nytimes.com/section/fashion,net-a-porter.com,farfetch.com,businessoffashion.com';

// Fashion keywords for content validation - expanded with brand, e-commerce and lifestyle terms
const FASHION_KEYWORDS = [
    // Original fashion keywords
    'fashion', 'style', 'beauty', 'clothes', 'trend','outfit', 'skincare', 
    'makeup', 'accessory', 'accessories', 'collection', 'apparel', 'dress', 'wardrobe',
    'indian fashion', 'saree', 'lehenga', 'kurta', 'salwar kameez', 'ethnic wear', 'manyavar', 'fabindia', 'biba', 'anita dongre', 'sabyasachi',

    // Fashion brands
    'chanel', 'dior', 'gucci', 'prada', 'versace', 'louis vuitton', 'hermes', 'burberry', 'balenciaga',
    'valentino', 'fendi', 'ralph lauren', 'armani', 'nike', 'adidas', 'zara', 'h&m', 'uniqlo',
    // E-commerce
    'fashion retail', 'e-commerce', 'online shop', 'shopping', 'fashion store', 'sustainable fashion',
    'direct-to-consumer', 'dtc', 'fashion marketplace', 'luxury retail', 'fashion sales', 
    // Lifestyle
    'lifestyle', 'home decor', 'wellness', 'fitness', 'travel style', 'celebrity style', 'street style',
    'fashion week', 'red carpet', 'interior design', 'living', 'culture', 'art', 'entertainment'
];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Load initial news
    fetchFeaturedNews();
    fetchNews();
    
    // Load saved articles
    renderSavedArticles();
    
    // Event listeners
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            link.parentElement.classList.add('active');
            currentCategory = link.dataset.category;
            currentPage = 1;
            fetchNews();
        });
    });
    
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            filterArticles(filter);
        });
    });
    
    // Load more button
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        fetchNews(true);
    });
    
    // Search functionality
    searchBtn.addEventListener('click', () => {
        currentQuery = searchInput.value.trim();
        if (currentQuery) {
            currentPage = 1;
            fetchNews();
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentQuery = searchInput.value.trim();
            if (currentQuery) {
                currentPage = 1;
                fetchNews();
            }
        }
    });
    
    // Modal close button
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Newsletter form
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input').value;
        if (email) {
            alert(`Thank you for subscribing with ${email}! You'll receive our latest fashion, brand, e-commerce, and lifestyle updates.`);
            e.target.reset();
        }
    });
    
    // Open saved articles sidebar
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('save-article-btn')) {
            const savedArticles = document.querySelector('.saved-articles');
            savedArticles.classList.add('active');
        }
    });

    // Close saved articles sidebar
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('close-saved-btn')) {
            const savedArticles = document.querySelector('.saved-articles');
            savedArticles.classList.remove('active');
        }
    });

}

// Fetch featured news
async function fetchFeaturedNews() {
    try {
        // Use a specific query to ensure fashion content for featured articles
        // Increased pageSize to 8 for more featured articles
        const response = await fetch(`${BASE_URL}/everything?q=fashion , Indian fashion AND (trends OR designer OR Amazon OR ZARA OR brands OR "luxury brands" OR lifestyle)&domains=${FASHION_DOMAINS}&language=en&pageSize=8&sortBy=popularity&apiKey=${API_KEY}`);
        const data = await response.json();
        
        if (data.status === 'ok') {
            // Validate that articles are fashion-related
            const fashionArticles = filterFashionArticles(data.articles);
            renderFeaturedNews(fashionArticles.length > 0 ? fashionArticles : data.articles);
        } else {
            throw new Error(data.message || 'Failed to fetch featured news');
        }
    } catch (error) {
        console.error('Error fetching featured news:', error);
        featuredContainer.innerHTML = `<p class="error-message">Failed to load featured news. Please try again later.</p>`;
    }
}

// Fetch news articles - removed article limit by increasing pageSize to maximum allowed by API
async function fetchNews(append = false) {
    try {
        // Show loading spinner if not appending
        if (!append) {
            newsContainer.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading fashion news...</p>
                </div>
            `;
        }
        
        // Build the query URL with improved fashion filtering
        let url = `${BASE_URL}/everything?`;
        
        if (currentQuery) {
            // Make fashion the primary search term with expanded categories
            url += `q=(fashion OR beauty OR skincare OR style OR runway OR brands OR "fashion brands" OR lifestyle OR "e-commerce")`;
            
            // Add user query
            url += ` AND ${currentQuery}`;
        } else {
            // Use category as the main search term with expanded fashion qualifiers
            switch (currentCategory) {
                case 'indian fashion':
                    url += `q=(fashion OR beauty OR style OR runway OR "indian fashion" OR "indian wear" OR "traditional wear")`;
                    break;

                case 'brands':
                    url += `q=("fashion brands" OR "luxury brands" OR chanel OR dior OR gucci OR prada OR versace OR "louis vuitton" OR hermes OR balenciaga)`;
                    break;
                case 'ecommerce':
                    url += `q=("fashion e-commerce" OR "online shopping" OR "fashion retail" OR "sustainable fashion" OR "direct-to-consumer" OR dtc OR "fashion marketplace")`;
                    break;
                case 'lifestyle':
                    url += `q=(fashion AND (lifestyle OR "home decor" OR wellness OR "celebrity style" OR "street style" OR culture))`;
                    break;
                default:
                    url += `q=${currentCategory} AND (fashion OR beauty OR style OR runway OR trends OR "fashion brands" OR lifestyle OR "e-commerce" OR "indian fashion" OR "sarees" OR "lehenga" OR "kurta" OR "salwar kameez")`;
            }
        }
        
        // Add fashion-specific domains to get better results
        url += `&domains=${FASHION_DOMAINS}`;
        
        // Finish the URL construction
        // Increased to maximum pageSize (100) to load more articles and remove limits
        url += `&language=en&pageSize=100&page=${currentPage}&sortBy=publishedAt&apiKey=${API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'ok') {
            // Filter articles to ensure they're fashion-related
            const fashionArticles = filterFashionArticles(data.articles);
            
            // If no fashion articles found, try a broader search
            if (fashionArticles.length === 0 && !append) {
                console.log('No fashion articles found, trying broader search...');
                retryWithBroaderSearch();
                return;
            }
            
            if (append) {
                articles = [...articles, ...fashionArticles];
            } else {
                articles = fashionArticles;
            }
            
            renderNews(fashionArticles, append);
            
            // Always show load more button unless we've hit the API limit
            if (fashionArticles.length < 100) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
            }
        } else {
            throw new Error(data.message || 'Failed to fetch news');
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        if (!append) {
            newsContainer.innerHTML = `<p class="error-message">Failed to load fashion news. Please try again later.</p>`;
        }
        loadMoreBtn.style.display = 'none';
    }
}

// Retry with a broader search if specific fashion search returns no results
async function retryWithBroaderSearch() {
    try {
        // Create a broader query without domain restrictions
        let url = `${BASE_URL}/everything?q=fashion OR beauty OR style OR trends OR "fashion brands" OR lifestyle OR "fashion retail"`;
        // Increased to maximum pageSize (100) to load more articles and remove limits
        url += `&language=en&pageSize=100&page=${currentPage}&sortBy=publishedAt&apiKey=${API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'ok') {
            // Filter articles to ensure they're fashion-related
            const fashionArticles = filterFashionArticles(data.articles);
            articles = fashionArticles;
            
            renderNews(fashionArticles, false);
            
            // Always show load more button unless we've hit the API limit
            if (fashionArticles.length < 100) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
            }
        } else {
            throw new Error(data.message || 'Failed to fetch news');
        }
    } catch (error) {
        console.error('Error in broader search:', error);
        newsContainer.innerHTML = `<p class="error-message">Failed to load fashion news. Please try again later.</p>`;
        loadMoreBtn.style.display = 'none';
    }
}

// Filter articles to ensure they're fashion-related
function filterFashionArticles(articlesList) {
    return articlesList.filter(article => {
        const title = article.title?.toLowerCase() || '';
        const description = article.description?.toLowerCase() || '';
        const content = article.content?.toLowerCase() || '';
        
        // Check if any fashion keyword is in the title, description or content
        return FASHION_KEYWORDS.some(keyword => 
            title.includes(keyword) || description.includes(keyword) || content.includes(keyword)
        );
    });
}

// Render featured news
function renderFeaturedNews(articles) {
    featuredContainer.innerHTML = '';
    
    articles.forEach(article => {
        const card = createArticleCard(article, true);
        featuredContainer.appendChild(card);
    });
}

// Render news articles
function renderNews(articles, append = false) {
    if (!append) {
        newsContainer.innerHTML = '';
    }
    
    if (articles.length === 0) {
        newsContainer.innerHTML = `<p class="empty-message">No fashion articles found. Try a different search.</p>`;
        return;
    }
    
    articles.forEach(article => {
        const card = createArticleCard(article);
        newsContainer.appendChild(card);
    });
}

// Create article card
function createArticleCard(article, isFeatured = false) {
    const card = document.createElement('div');
    card.className = isFeatured ? 'article-card featured' : 'article-card';
    
    // Determine category with enhanced categorization logic
    let category = determineArticleCategory(article);
    
    // Format date
    const publishedDate = new Date(article.publishedAt);
    const formattedDate = publishedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Check if article is saved
    const isSaved = savedArticles.some(savedArticle => savedArticle.url === article.url);
    
    card.innerHTML = `
        <div class="article-image">
            <img src="${article.urlToImage || 'https://via.placeholder.com/300x200?text=Fashion+News'}" alt="${article.title || 'Fashion article image'}">
        </div>
        <div class="article-content">
            <span class="article-category">${category}</span>
            <h3 class="article-title">${article.title || 'No title available'}</h3>
            <p class="article-description">${article.description || 'No description available'}</p>
            <div class="article-meta">
                <span class="article-source">${article.source.name || 'Unknown source'}</span>
                <span class="article-date">${formattedDate}</span>
            </div>
            <div class="article-actions">
                <button class="read-more-btn" data-article='${JSON.stringify(article).replace(/'/g, "&apos;")}'>
                    <i class="fas fa-book-open"></i> Read More
                </button>
                <button class="save-article-btn ${isSaved ? 'saved' : ''}" data-article='${JSON.stringify(article).replace(/'/g, "&apos;")}'>
                    <i class="fas ${isSaved ? 'fa-bookmark' : 'fa-bookmark-o'}"></i> ${isSaved ? 'Saved' : 'Save'}
                </button>
                <button class="share-article-btn" data-url="${article.url}">
                    <i class="fas fa-share-alt"></i> Share
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    card.querySelector('.read-more-btn').addEventListener('click', (e) => {
        const articleData = JSON.parse(e.target.dataset.article || e.target.parentElement.dataset.article);
        openArticleModal(articleData);
    });
    
    card.querySelector('.save-article-btn').addEventListener('click', (e) => {
        const articleData = JSON.parse(e.target.dataset.article || e.target.parentElement.dataset.article);
        toggleSaveArticle(articleData, e.target);
    });
    
    card.querySelector('.share-article-btn').addEventListener('click', (e) => {
        const url = e.target.dataset.url || e.target.parentElement.dataset.url;
        shareArticle(url);
    });
    
    return card;
}

// Enhanced article category determination with new categories
function determineArticleCategory(article) {
    const title = article.title?.toLowerCase() || '';
    const description = article.description?.toLowerCase() || '';
    const content = article.content?.toLowerCase() || '';
    const fullText = title + ' ' + description + ' ' + content;
    
    // Check for brand keywords
    const brandKeywords = ['Zara','H&M' ,'Nike', 'Adidas', 'Zudio' , 'Puma', 'Reebok', 'Levi\'s', 'Tommy Hilfiger', 'Calvin Klein', 'Under Armour', 'Lululemon']
    if (brandKeywords.some(keyword => fullText.includes(keyword))) {
        return 'Brands';
    }

    const IndianFashionKeywords = ['indian fashion', 'indian wear', 'traditional wear',
        'lehenga', 'saree', 'salwar kameez', 'kurt']
    if (IndianFashionKeywords.some(keyword => fullText.includes(keyword))) {
        return 'Indian Fashion';
    }

    const fashionKeywords = ['fashion', 'style', 'beauty', 'clothes', 'trend','outfit', 'skincare',
        'makeup', 'accessory', 'accessories', 'collection', 'apparel', 'dress', 'wardrobe'];
    if (fashionKeywords.some(keyword => fullText.includes(keyword))) {
        return 'Fashion';
    }   
    
    // Check for e-commerce keywords
    const ecommerceKeywords = ['e-commerce', 'online shop', 'fashion retail', 'shopping', 'Amazon', 'eBay', 'fashion store', 'sustainable fashion', 'direct-to-consumer',
                             'dtc', 'sustainable fashion', 'marketplace', 'buy', 'purchase', 'store'];
    if (ecommerceKeywords.some(keyword => fullText.includes(keyword))) {
        return 'E-commerce';
    }
    
    // Check for lifestyle keywords
    const lifestyleKeywords = [ 'home decor', 'wellness', 'fitness', 'travel style', 
                             'interior design', 'living', 'culture', 'art', 'entertainment'];
    if (lifestyleKeywords.some(keyword => fullText.includes(keyword))) {
        return 'Lifestyle';
    }
    
    // Check for beauty keywords
    if (fullText.includes('beauty') || fullText.includes('makeup') || fullText.includes('cosmetic')) {
        return 'Beauty';
    }
    
    // Check for style keywords
    if (fullText.includes('style') || fullText.includes('outfit') || fullText.includes('wardrobe')) {
        return 'Style';
    }
    
    // Check for Indian fashion keywords
    const indianFashionKeywords = ['indian fashion', 'indian wear', 'traditional wear',
        'lehenga', 'saree', 'salwar kameez', 'kurt']
        if (indianFashionKeywords.some(keyword => fullText.includes(keyword))) {
            return 'Indian Fashion';
        }
    
    // Default to Fashion
    return 'Fashion';
}

// Open article modal
function openArticleModal(article) {
    // Format date
    const publishedDate = new Date(article.publishedAt);
    const formattedDate = publishedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Determine category with improved logic
    let category = determineArticleCategory(article);
    
    // Check if article is saved
    const isSaved = savedArticles.some(savedArticle => savedArticle.url === article.url);
    
    modalContentContainer.innerHTML = `
        <article class="modal-article">
            <header class="modal-article-header">
                <span class="modal-article-category">${category}</span>
                <h2 class="modal-article-title">${article.title || 'No title available'}</h2>
                <div class="modal-article-meta">
                    <span class="modal-article-source">${article.source.name || 'Unknown source'}</span>
                    <span class="modal-article-date">${formattedDate}</span>
                </div>
            </header>
            <div class="modal-article-image">
                <img src="${article.urlToImage || 'https://via.placeholder.com/800x400?text=Fashion+News'}" alt="${article.title || 'Fashion article image'}">
            </div>
            <div class="modal-article-content">
                <p>${article.content || article.description || 'No content available'}</p>
                <p>Read the full article on <a href="${article.url}" target="_blank">${article.source.name}</a></p>
            </div>
            <div class="modal-article-actions">
                <button class="save-article-btn ${isSaved ? 'saved' : ''}" data-article='${JSON.stringify(article).replace(/'/g, "&apos;")}'>
                    <i class="fas ${isSaved ? 'fa-bookmark' : 'fa-bookmark-o'}"></i> ${isSaved ? 'Saved' : 'Save Article'}
                </button>
                <button class="share-article-btn" data-url="${article.url}">
                    <i class="fas fa-share-alt"></i> Share Article
                </button>
                <button class="visit-source-btn" data-url="${article.url}">
                    <i class="fas fa-external-link-alt"></i> Visit Source
                </button>
            </div>
        </article>
    `;
    
    // Add event listeners
    modalContentContainer.querySelector('.save-article-btn').addEventListener('click', (e) => {
        const articleData = JSON.parse(e.target.dataset.article || e.target.parentElement.dataset.article);
        toggleSaveArticle(articleData, e.target);
    });
    
    modalContentContainer.querySelector('.share-article-btn').addEventListener('click', (e) => {
        const url = e.target.dataset.url || e.target.parentElement.dataset.url;
        shareArticle(url);
    });
    
    modalContentContainer.querySelector('.visit-source-btn').addEventListener('click', (e) => {
        const url = e.target.dataset.url || e.target.parentElement.dataset.url;
        window.open(url, '_blank');
    });
    
    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Toggle save article
function toggleSaveArticle(article, button) {
    const index = savedArticles.findIndex(savedArticle => savedArticle.url === article.url);
    
    if (index === -1) {
        // Save article
        savedArticles.push(article);
        button.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
        button.classList.add('saved');
    } else {
        // Remove article
        savedArticles.splice(index, 1);
        button.innerHTML = '<i class="fas fa-bookmark-o"></i> Save';
        button.classList.remove('saved');
    }
    
    // Update localStorage
    localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
    
    // Update saved articles sidebar
    renderSavedArticles();
    
    // Update all instances of this article's save button
    updateSaveButtons(article);
}

// Update all save buttons for an article
function updateSaveButtons(article) {
    const isSaved = savedArticles.some(savedArticle => savedArticle.url === article.url);
    
    // Update buttons in article cards
    document.querySelectorAll('.save-article-btn').forEach(button => {
        try {
            const buttonArticle = JSON.parse(button.dataset.article);
            if (buttonArticle.url === article.url) {
                button.innerHTML = `<i class="fas ${isSaved ? 'fa-bookmark' : 'fa-bookmark-o'}"></i> ${isSaved ? 'Saved' : 'Save'}`;
                if (isSaved) {
                    button.classList.add('saved');
                } else {
                    button.classList.remove('saved');
                }
            }
        } catch (error) {
            console.error('Error parsing article data:', error);
        }
    });
}

// Render saved articles
function renderSavedArticles() {
    if (savedArticles.length === 0) {
        savedArticlesContainer.innerHTML = '<p class="empty-message">No saved articles yet</p>';
        return;
    }
    
    savedArticlesContainer.innerHTML = '';
    
    savedArticles.forEach(article => {
        const savedArticle = document.createElement('div');
        savedArticle.className = 'saved-article';
        
        savedArticle.innerHTML = `
            <div class="saved-article-image">
                <img src="${article.urlToImage || 'https://via.placeholder.com/80x80?text=Fashion'}" alt="${article.title || 'Fashion article image'}">
            </div>
            <div class="saved-article-content">
                <h4>${article.title || 'No title available'}</h4>
                <p>${article.source.name || 'Unknown source'}</p>
                <button class="remove-saved-btn" data-url="${article.url}">
                    <i class="fas fa-times"></i> Remove
                </button>
            </div>
        `;
        
        savedArticle.addEventListener('click', (e) => {
            if (!e.target.classList.contains('remove-saved-btn') && !e.target.parentElement.classList.contains('remove-saved-btn')) {
                openArticleModal(article);
            }
        });
        
        savedArticle.querySelector('.remove-saved-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const url = e.target.dataset.url || e.target.parentElement.dataset.url;
            removeSavedArticle(url);
        });
        
        savedArticlesContainer.appendChild(savedArticle);
    });
}

// Remove saved article
function removeSavedArticle(url) {
    const index = savedArticles.findIndex(article => article.url === url);
    
    if (index !== -1) {
        const removedArticle = savedArticles[index];
        savedArticles.splice(index, 1);
        
        // Update localStorage
        localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
        
        // Update saved articles sidebar
        renderSavedArticles();
        
        // Update all instances of this article's save button
        updateSaveButtons(removedArticle);
    }
}

// Share article
function shareArticle(url) {
    if (navigator.share) {
        navigator.share({
            title: 'Check out this fashion article',
            url: url
        }).catch(error => {
            console.error('Error sharing:', error);
            fallbackShare(url);
        });
    } else {
        fallbackShare(url);
    }
}

// Fallback share method
function fallbackShare(url) {
    // Create a temporary input to copy the URL
    const tempInput = document.createElement('input');
    tempInput.value = url;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    alert('Fashion article link copied to clipboard!');
}

// Filter articles
function filterArticles(filter) {
    if (filter === 'all') {
        // Show all articles
        document.querySelectorAll('.article-card').forEach(card => {
            card.style.display = 'block';
        });
    } else {
        // Filter by category
        document.querySelectorAll('.article-card').forEach(card => {
            const category = card.querySelector('.article-category').textContent.toLowerCase();
            if (category === filter.toLowerCase()) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }


}
