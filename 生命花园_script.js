// ========== Enter 界面转场逻辑 ==========
document.addEventListener('DOMContentLoaded', function() {
    const enterScreen = document.getElementById('enter-screen');
    const enterBtn = document.getElementById('enter-btn');
    const homePage = document.getElementById('home-page');

    // 点击 Enter 按钮转场
    if (enterBtn) {
        enterBtn.addEventListener('click', function() {
            enterScreen.classList.add('fade-out');

            setTimeout(() => {
                enterScreen.style.display = 'none';
                homePage.classList.add('visible');
            }, 1200);
        });
    }

    // ========== 平滑滚动导航 ==========
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            // 如果是锚点链接，阻止默认行为并平滑滚动
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 60;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
            // 否则让链接正常跳转
        });
    });

    // ========== 首页留言板功能 ==========
    const homeMessageInput = document.getElementById('home-message-input');
    const homeMessageSend = document.getElementById('home-message-send');
    const homeMessageList = document.getElementById('home-message-list');

    // 从 localStorage 加载留言
    function loadHomeMessages() {
        const messages = getHomeMessages();
        messages.forEach(msg => displayHomeMessage(msg));
    }

    function getHomeMessages() {
        const stored = localStorage.getItem('home_guestbook_messages');
        return stored ? JSON.parse(stored) : [];
    }

    function addHomeMessage(text) {
        const messages = getHomeMessages();
        const message = {
            id: Date.now(),
            text: text,
            date: new Date().toLocaleString('zh-CN')
        };
        messages.push(message);
        localStorage.setItem('home_guestbook_messages', JSON.stringify(messages));
        displayHomeMessage(message);
    }

    function displayHomeMessage(message) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'guestbook-home-item';
        msgDiv.innerHTML = `
            <p class="guestbook-home-item-text">${message.text}</p>
            <p class="guestbook-home-item-date">${message.date}</p>
            <span class="guestbook-home-delete" onclick="deleteHomeMessage(${message.id})">删除</span>
        `;
        homeMessageList.insertBefore(msgDiv, homeMessageList.firstChild);
    }

    window.deleteHomeMessage = function(id) {
        let messages = getHomeMessages();
        messages = messages.filter(msg => msg.id !== id);
        localStorage.setItem('home_guestbook_messages', JSON.stringify(messages));
        // 重新渲染
        homeMessageList.innerHTML = '';
        messages.forEach(msg => displayHomeMessage(msg));
    };

    // 发送留言
    if (homeMessageSend) {
        homeMessageSend.addEventListener('click', function() {
            const text = homeMessageInput.value.trim();
            if (text) {
                addHomeMessage(text);
                homeMessageInput.value = '';
            }
        });
    }

    // 回车发送
    if (homeMessageInput) {
        homeMessageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                homeMessageSend.click();
            }
        });
    }

    // 加载留言
    loadHomeMessages();

    // ========== Lightbox 功能 ==========
    window.openLightbox = function(src) {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            const lightboxImg = document.getElementById('lightbox-img');
            lightboxImg.src = src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeLightbox = function() {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    // ESC 键关闭 lightbox
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    });
});

// ========== 页面滚动效果 ==========
window.addEventListener('scroll', function() {
    const scrolled = window.scrollY;
    const sections = document.querySelectorAll('.section');

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrolled > sectionTop - window.innerHeight / 2) {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }
    });
});

// ========== 图片加载失败处理 ==========
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        e.target.style.display = 'none';
    }
}, true);