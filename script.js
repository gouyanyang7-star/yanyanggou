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

// ========== Cusdis 自定义留言板功能 ==========
document.addEventListener('DOMContentLoaded', function() {
    const guestbookComments = document.getElementById('guestbook-comments');
    const submitBtn = document.getElementById('guestbook-submit-btn');

    if (guestbookComments) {
        loadAllComments(guestbookComments);
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();

            const nickname = document.getElementById('guestbook-nickname').value.trim();
            const email = document.getElementById('guestbook-email').value.trim();
            const content = document.getElementById('guestbook-content').value.trim();

            if (!nickname) {
                showGuestbookMessage('请填写昵称', 'error');
                return;
            }

            if (!content) {
                showGuestbookMessage('请填写评论内容', 'error');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = '发送中...';

            saveLocalComment(nickname, email, content);

            submitCusdisComment(nickname, email, content, function(success) {
                submitBtn.disabled = false;
                submitBtn.textContent = '发 送';

                document.getElementById('guestbook-nickname').value = '';
                document.getElementById('guestbook-email').value = '';
                document.getElementById('guestbook-content').value = '';

                addCommentToList(guestbookComments, nickname, content);
                showGuestbookMessage('留言成功！感谢你的分享', 'success');
            });
        });
    }
});

function saveLocalComment(nickname, email, content) {
    const comments = JSON.parse(localStorage.getItem('guestbook_comments') || '[]');
    comments.unshift({
        nickname: nickname,
        email: email,
        content: content,
        created_at: new Date().toISOString()
    });
    localStorage.setItem('guestbook_comments', JSON.stringify(comments));
}

function loadAllComments(container) {
    container.innerHTML = '<p class="loading-text">评论加载中...</p>';

    const localComments = JSON.parse(localStorage.getItem('guestbook_comments') || '[]');

    fetch('https://cusdis.com/api/v1/comments?app_id=29c0f603-943a-4ab8-9eca-28270ae18704&page_id=home')
        .then(response => response.json())
        .then(data => {
            container.innerHTML = '';

            localComments.forEach(comment => renderComment(container, comment));

            if (data.data && data.data.length > 0) {
                data.data.forEach(comment => renderComment(container, comment));
            }

            if (container.children.length === 0) {
                container.innerHTML = '<p class="loading-text">暂无评论，来写下第一条留言吧~</p>';
            }
        })
        .catch(error => {
            console.error('Error loading Cusdis comments:', error);
            container.innerHTML = '';
            if (localComments.length > 0) {
                localComments.forEach(comment => renderComment(container, comment));
            } else {
                container.innerHTML = '<p class="loading-text">暂无评论，来写下第一条留言吧~</p>';
            }
        });
}

function renderComment(container, comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment-item';

    const date = new Date(comment.created_at || comment.createdAt);
    const dateStr = date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    commentDiv.innerHTML = `
        <div class="comment-header">
            <span class="comment-nickname">${escapeHtmlText(comment.nickname)}</span>
            <span class="comment-time">${dateStr}</span>
        </div>
        <div class="comment-content">${escapeHtmlText(comment.content)}</div>
    `;

    container.appendChild(commentDiv);
}

function addCommentToList(container, nickname, content) {
    const emptyMsg = container.querySelector('.loading-text');
    if (emptyMsg) {
        container.innerHTML = '';
    }

    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment-item';
    commentDiv.style.animation = 'fadeInUp 0.5s ease forwards';

    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    commentDiv.innerHTML = `
        <div class="comment-header">
            <span class="comment-nickname">${escapeHtmlText(nickname)}</span>
            <span class="comment-time">${dateStr}</span>
        </div>
        <div class="comment-content">${escapeHtmlText(content)}</div>
    `;

    container.insertBefore(commentDiv, container.firstChild);
}

function submitCusdisComment(nickname, email, content, callback) {
    const data = {
        appId: '29c0f603-943a-4ab8-9eca-28270ae18704',
        pageId: 'home',
        pageUrl: 'https://gouyanyang7-star.github.io/yanyanggou/',
        pageTitle: 'yanyanggou Home',
        nickname: nickname,
        email: email || '',
        content: content
    };

    fetch('https://cusdis.com/api/open/comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        console.log('Comment submitted to Cusdis:', result);
        callback(true);
    })
    .catch(error => {
        console.error('Cusdis API error:', error);
        callback(true);
    });
}

function showGuestbookMessage(message, type) {
    const msgDiv = document.getElementById('guestbook-message');
    if (!msgDiv) return;

    msgDiv.textContent = message;
    msgDiv.style.display = 'block';
    msgDiv.style.textAlign = 'center';
    msgDiv.style.padding = '10px';
    msgDiv.style.marginBottom = '15px';
    msgDiv.style.fontSize = '12px';
    msgDiv.style.borderRadius = '3px';

    if (type === 'success') {
        msgDiv.style.color = '#4A584A';
        msgDiv.style.backgroundColor = 'rgba(74, 88, 74, 0.1)';
    } else {
        msgDiv.style.color = '#8B4513';
        msgDiv.style.backgroundColor = 'rgba(139, 69, 19, 0.1)';
    }

    setTimeout(() => {
        msgDiv.style.display = 'none';
    }, 3000);
}

function escapeHtmlText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}