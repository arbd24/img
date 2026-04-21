    (function() {
        // ফাংশন: যেকোনো টেক্সট নোডের ভিতর থেকে লিংক ও ইমেইল খুঁজে রূপান্তর করবে
        function convertTextToLinks(node) {
            // শুধু টেক্সট নোড নিয়েই কাজ করব
            if (node.nodeType === Node.TEXT_NODE) {
                let text = node.textContent;
                if (!text.trim()) return;
                
                // রেগুলার এক্সপ্রেশন দিয়ে সব ধরনের লিংক খোঁজা
                // প্যাটার্ন: http://, https://, www., ডোমেইন (example.com), ইমেইল
                const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(([a-zA-Z0-9][a-zA-Z0-9\-]*\.[a-zA-Z]{2,}(\/[^\s]*)?))|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
                
                let match;
                let lastIndex = 0;
                let parts = [];
                let hasMatch = false;
                
                // রি-জেক্স দিয়ে সব ম্যাচ খুঁজে বের করা
                const regex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9][a-zA-Z0-9\-]*\.[a-zA-Z]{2,}(\/[^\s]*)?|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
                
                let result = '';
                let currentPos = 0;
                let matches = [];
                let matchItem;
                
                // সব ম্যাচ কালেক্ট করা
                while ((matchItem = regex.exec(text)) !== null) {
                    matches.push({
                        start: matchItem.index,
                        end: matchItem.index + matchItem[0].length,
                        url: matchItem[0]
                    });
                }
                
                if (matches.length === 0) return;
                
                // ম্যাচ অনুযায়ী HTML তৈরি
                for (let i = 0; i < matches.length; i++) {
                    const match = matches[i];
                    // আগের অংশ (টেক্সট)
                    if (currentPos < match.start) {
                        result += escapeHtml(text.substring(currentPos, match.start));
                    }
                    
                    // বর্তমান ম্যাচকে লিংকে রূপান্তর
                    let url = match.url;
                    let href = url;
                    let isEmail = false;
                    
                    // ইমেইল চেক
                    if (url.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
                        href = 'mailto:' + url;
                        isEmail = true;
                    }
                    // www. দিয়ে শুরু হলে http যোগ
                    else if (url.match(/^www\./i)) {
                        href = 'http://' + url;
                    }
                    // সাধারণ ডোমেইন (প্রোটোকল ছাড়া) কিন্তু ইমেইল না
                    else if (!url.match(/^https?:\/\//i) && !isEmail) {
                        href = 'http://' + url;
                    }
                    
                    result += `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>`;
                    currentPos = match.end;
                }
                
                // বাকি অংশ যোগ
                if (currentPos < text.length) {
                    result += escapeHtml(text.substring(currentPos));
                }
                
                if (result) {
                    const span = document.createElement('span');
                    span.innerHTML = result;
                    node.parentNode.replaceChild(span, node);
                }
            }
            // চাইল্ড নোডগুলোর জন্য রিকার্সিভ কল
            else if (node.nodeType === Node.ELEMENT_NODE) {
                // <a> ট্যাগের ভিতরে আর কনভার্ট না করা (যাতে ইতিমধ্যে লিংক নষ্ট না হয়)
                if (node.tagName === 'A' || node.tagName === 'SCRIPT' || node.tagName === 'STYLE') {
                    return;
                }
                // সব চাইল্ড নোড ঘুরে দেখা
                const children = Array.from(node.childNodes);
                for (let child of children) {
                    convertTextToLinks(child);
                }
            }
        }
        
        // HTML এস্কেপ ফাংশন (সিকিউরিটি জন্য)
        function escapeHtml(str) {
            if (!str) return '';
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }
        
        // পেজ লোড হলে পুরো কন্টেন্ট কনভার্ট করা
        function initAutoLink() {
            const container = document.getElementById('mainContent');
            if (container) {
                convertTextToLinks(container);
            }
        }
        
        // ডোম লোড হলে রান করবে
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAutoLink);
        } else {
            initAutoLink();
        }
    })();