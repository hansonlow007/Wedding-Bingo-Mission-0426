// Initialize Firebase first
const firebaseConfig = {
    apiKey: "AIzaSyACJN9nTs9CAa9bMFsIp9qDGDF85mgJ7iw",
    authDomain: "wedding-wishes-369f7.firebaseapp.com",
    projectId: "wedding-wishes-369f7",
    storageBucket: "wedding-wishes-369f7.firebasestorage.app",
    messagingSenderId: "737208113511",
    appId: "1:737208113511:web:30a125993d952339f937c2",
    measurementId: "G-2R282XC1SQ"
};

// Initialize Firebase globally
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 當頁面加載完成時自動播放音樂
function initMusic() {
    const music = document.getElementById('bgMusic');
    if (!music) return;
    music.volume = 1;
    
    // 嘗試播放音樂
    try {
        const playPromise = music.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log("Autoplay started successfully");
                updateMusicButtonStyle(true);
            }).catch((error) => {
                console.log("Autoplay prevented:", error);
                const events = ['click', 'touchstart', 'touchend'];
                
                function handleInteraction() {
                    music.play()
                        .then(() => {
                            console.log("Music started after user interaction");
                            updateMusicButtonStyle(true);
                            events.forEach(event => {
                                document.removeEventListener(event, handleInteraction);
                            });
                        })
                        .catch(e => console.log("Play failed:", e));
                }
                
                events.forEach(event => {
                    document.addEventListener(event, handleInteraction, { once: true });
                });
            });
        }
    } catch (error) {
        console.log("Autoplay error:", error);
        updateMusicButtonStyle(false);
    }
}

// Slideshow functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

function showSlide(n) {
    // Remove active class from current slide
    const currentActiveSlide = document.querySelector('.slide.active');
    if (currentActiveSlide) {
        currentActiveSlide.classList.remove('active');
        // Wait for the fade out transition
        setTimeout(() => {
            currentActiveSlide.style.display = 'none';
        }, 800);
    }

    // Calculate the new slide index
    currentSlide = (n + slides.length) % slides.length;
    
    // Show and activate the new slide
    setTimeout(() => {
        slides[currentSlide].style.display = 'block';
        // Force a reflow
        slides[currentSlide].offsetHeight;
        slides[currentSlide].classList.add('active');
    }, 50);
}

if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
        showSlide(currentSlide - 1);
    });
    nextBtn.addEventListener('click', () => {
        showSlide(currentSlide + 1);
    });
}

// Auto advance slides every 5 seconds
let slideInterval = setInterval(() => showSlide(currentSlide + 1), 5000);

// Pause auto-advance when user interacts with controls
[prevBtn, nextBtn].forEach(btn => {
    if (btn) {
        btn.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        btn.addEventListener('mouseleave', () => {
            slideInterval = setInterval(() => showSlide(currentSlide + 1), 5000);
        });
    }
});

// 語言切換功能
function toggleLanguage() {
    const enElements = document.querySelectorAll('.en');
    const zhElements = document.querySelectorAll('.zh');
    const langTexts = document.querySelectorAll('.lang-text');
    
    // 檢查當前是否為英文
    const isCurrentlyEnglish = langTexts[1].classList.contains('active');
    
    // 切換語言文字的顯示
    langTexts.forEach(text => text.classList.toggle('active'));
    
    // 切換內容的顯示
    if (isCurrentlyEnglish) {
        // 切換到中文
        enElements.forEach(el => el.style.display = 'none');
        zhElements.forEach(el => el.style.display = 'inline-block');
    } else {
        // 切換到英文
        zhElements.forEach(el => el.style.display = 'none');
        enElements.forEach(el => el.style.display = 'inline-block');
    }
}

// 音樂控制
function toggleMusic() {
    const music = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicToggle');
    if (!music || !musicBtn) return;
    
    if (music.paused) {
        music.play().then(() => {
            musicBtn.classList.add('playing');
            musicBtn.innerHTML = '♪';
        }).catch(error => {
            console.log("Play failed:", error);
            musicBtn.classList.remove('playing');
        });
    } else {
        music.pause();
        musicBtn.classList.remove('playing');
        musicBtn.innerHTML = '♪';
    }
}

function updateMusicButtonStyle(isPlaying) {
    const musicBtn = document.getElementById('musicToggle');
    if (!musicBtn) return;
    
    if (isPlaying) {
        musicBtn.classList.add('playing');
        musicBtn.innerHTML = '♪';
    } else {
        musicBtn.classList.remove('playing');
        musicBtn.innerHTML = '♪';
    }
}

// 頁面加載時初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化幻燈片
    showSlide(currentSlide);
    
    // 初始化音樂
    initMusic();
    
    // 為音樂按鈕添加點擊事件
    const musicBtn = document.getElementById('musicToggle');
    if (musicBtn) {
        musicBtn.addEventListener('click', toggleMusic);
    }
    
    // 設置默認語言
    toggleLanguage();
    
    // 添加滾動動畫
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.fade-in').forEach((element) => {
        observer.observe(element);
    });

    // 添加切換留言顯示的功能
    const toggleButton = document.getElementById('toggleWishes');
    const wishesDisplay = document.querySelector('.wishes-display');
    const showTexts = document.querySelectorAll('.show-text');
    const hideTexts = document.querySelectorAll('.hide-text');
    let isVisible = false;

    toggleButton.addEventListener('click', function() {
        isVisible = !isVisible;
        wishesDisplay.style.display = isVisible ? 'block' : 'none';
        
        // 切換按鈕文字
        showTexts.forEach(text => text.style.display = isVisible ? 'none' : 'block');
        hideTexts.forEach(text => text.style.display = isVisible ? 'block' : 'none');
        
        // 如果顯示留言，滾動到留言區域
        if (isVisible) {
            wishesDisplay.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // 初始化模態框
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.close-modal');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // 點擊模態框外部時關閉
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // 防止圖片拖拽和右鍵點擊
    document.addEventListener('dragstart', function(e) {
        if (e.target.nodeName.toLowerCase() === 'img') {
            e.preventDefault();
        }
    });
    
    document.addEventListener('contextmenu', function(e) {
        if (e.target.nodeName.toLowerCase() === 'img') {
            e.preventDefault();
        }
    });

    // 按ESC鍵關閉模態框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });

    // 倒數計時功能
    updateCountdown();
    // 每小時更新一次倒數計時
    setInterval(updateCountdown, 60 * 60 * 1000);
});

// Handle form submission with debug logging
document.getElementById('wishesForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    
    const guestName = document.getElementById('guestName').value;
    const wishMessage = document.getElementById('wishMessage').value;
    console.log("Input values:", { guestName, wishMessage });
    
    if (!db) {
        console.error("Firestore not initialized");
        alert(currentLanguage === 'en' ? 'System error. Please try again later.' : '系統錯誤，請稍後再試。');
        return;
    }
    
    try {
        console.log("Attempting to add wish to Firestore...");
        const docRef = await db.collection('wishes').add({
            name: guestName,
            message: wishMessage,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log("Wish added successfully with ID:", docRef.id);
        
        document.getElementById('wishesForm').reset();
        alert(currentLanguage === 'en' ? 'Thank you for your wishes!' : '感謝您的祝福！');
        loadWishes();
    } catch (error) {
        console.error("Error adding wish:", error);
        console.error("Error details:", {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
        alert(currentLanguage === 'en' ? 
            `Failed to send wishes: ${error.message}` : 
            `送出失敗：${error.message}`);
    }
});

// Load wishes with debug logging
async function loadWishes() {
    console.log("Loading wishes...");
    const wishesList = document.getElementById('wishesList');
    wishesList.innerHTML = '';
    
    try {
        const snapshot = await db.collection('wishes')
            .orderBy('timestamp', 'desc')
            .get();
            
        console.log("Fetched wishes count:", snapshot.size);
        
        snapshot.forEach(doc => {
            const wish = doc.data();
            console.log("Processing wish:", wish);
            const wishElement = createWishElement(wish);
            wishesList.appendChild(wishElement);
        });
    } catch (error) {
        console.error("Error loading wishes:", error);
    }
}

// Call loadWishes when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing wishes...");
    loadWishes();
});

// 創建留言元素
function createWishElement(wish) {
    const div = document.createElement('div');
    div.className = 'wish-item';
    
    const timestamp = wish.timestamp ? wish.timestamp.toDate() : new Date();
    const formattedDate = timestamp.toLocaleDateString();
    const formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    div.innerHTML = `
        <div class="header">
            <div class="guest-name">${escapeHtml(wish.name)}</div>
            <div class="timestamp">${formattedDate} ${formattedTime}</div>
        </div>
        <div class="message">${escapeHtml(wish.message)}</div>
    `;
    
    return div;
}

// HTML 轉義函數
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 模態框功能
function openModal(element) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const img = element.querySelector('img');
    
    modal.style.display = 'block';
    modalImg.src = img.src;
    document.body.style.overflow = 'hidden'; // 防止背景滾動
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // 恢復背景滾動
}

// 倒數計時功能
function updateCountdown() {
    const weddingDate = new Date('2025-04-26T00:00:00');
    const now = new Date();
    const diffTime = weddingDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        countdownElement.textContent = diffDays;
    }
} 