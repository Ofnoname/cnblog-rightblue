(() => {
    const $ = window.jQuery;
    if (!$) return;

    // ===== RightBlue theme config (edit these) =====
    const CONFIG = {
        cnblogsUser: 'ofnoname',
        displayName: 'Ofnoname',
        themeRepo: 'https://github.com/Ofnoname/cnblog-rightblue',
        navHome: 'https://cnblogs.com',
        navHomeIcon: 'https://common.cnblogs.com/favicon.svg',
        debug: false,
    };

    // Derived URLs
    const USER_HOME = `https://cnblogs.com/${CONFIG.cnblogsUser}`;
    const USER_PROFILE = `https://home.cnblogs.com/u/${CONFIG.cnblogsUser}`;
    const THEME_REPO = CONFIG.themeRepo;

    const qs = (sel, root = document) => root.querySelector(sel);
    const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    const SELECTORS = {
        nav: '.nav',
        sideBar: '#sideBar',
        postPageRoot: '.post',
        mainContent: '#mainContent',
        postTitle: '.postTitle',
        postDesc: '.postDesc',
        nextPrev: '#post_next_prev',
        tocContainer: '#ec',
        tocContent: '#ec .econtent',
        recentCommentTitle: '.recent_comment_title a',
        recentCommentAuthor: '.recent_comment_author',
        underPostCard: '.under-post-card',
        feedbackItem: '.feedbackItem',
        feedbackCon: '.feedbackCon',
        layer: '.layer',
        footer: '#footer',
        blogStats: '.blogStats',
    };

    const logDebug = (...args) => {
        if (CONFIG.debug) console.debug('[rightblue]', ...args);
    };

    const safe = (name, fn) => {
        try {
            fn();
        } catch (e) {
            logDebug(`${name} failed`, e);
        }
    };

    const once = (el, name) => {
        if (!el) return false;
        const attr = `data-rb-${name}`;
        if (el.hasAttribute(attr)) return false;
        el.setAttribute(attr, '1');
        return true;
    };

    const parsePostDesc = (text) => {
        const date = (text.match(/\d{4}-\d\d-\d\d\s+\d\d:\d\d/) || [null])[0];
        const read = (text.match(/\u9605\u8bfb\(\d+\)/) || [null])[0];
        const comt = (text.match(/\u8bc4\u8bba\(\d+\)/) || [null])[0];

        const readCount = read ? (read.match(/\d+/) || [null])[0] : null;
        const comtCount = comt ? (comt.match(/\d+/) || [null])[0] : null;
        return { date, readCount, comtCount };
    };

    // Adapter: isolate DOM assumptions about CNBlogs
    const adapter = {
        isPostPage: () => $(SELECTORS.postPageRoot).length !== 0,
        getHomePostTitles: () => qsa(SELECTORS.postTitle).filter((t) => !t.closest('.postGeneral')),
        getPostTitleEl: () => qs(SELECTORS.postTitle),
        getPostDescEl: () => qs(SELECTORS.postDesc),
        getSideBarEl: () => qs(SELECTORS.sideBar),
        getNextPrevEl: () => qs(SELECTORS.nextPrev),
        ensureTocContainer: () => {
            const sideBar = qs(SELECTORS.sideBar);
            if (sideBar && !qs(SELECTORS.tocContainer)) {
                const ec = document.createElement('div');
                ec.id = 'ec';
                ec.innerHTML = `<h3 class="catListTitle">\u76ee\u5f55</h3><div class="econtent"></div>`;
                sideBar.appendChild(ec);
            }
            return qs(SELECTORS.tocContent);
        },
        getPostContentRoot: () => qs(SELECTORS.postPageRoot) || qs(SELECTORS.mainContent),
        // Build a safe node group for a list-page post card.
        // Returns null when DOM doesn't match expected CNBlogs list layout.
        getHomePostGroup: (title) => {
            if (!title || !title.parentElement) return null;
            if (title.closest('.postGeneral')) return null;
            const link = title.querySelector('a');
            if (!link) return null;

            const parent = title.parentElement;
            const nodes = [];

            let node = title;
            let steps = 0;
            while (node && steps < 12) {
                steps += 1;
                if (node.parentElement !== parent) break;
                nodes.push(node);

                const next = node.nextElementSibling;
                if (!next) break;
                if (next.classList.contains('postTitle')) break;
                if (next.classList.contains('dayTitle')) break;
                node = next;
            }

            const hasMeta = nodes.some((n) => n.classList?.contains('postDesc'));
            const hasSummary = nodes.some((n) => n.classList?.contains('postCon'));
            if (!hasMeta && !hasSummary) return null;

            return { parent, title, link, nodes };
        },
    };

    // Enhance: visual/UX enhancements built on top of adapter
    const enhance = {};

    enhance.nav = () => {
        if (qs(SELECTORS.nav)) return;
        const headers = $(
            `<div class="nav">` +
            `<a href="${CONFIG.navHome}"><img src="${CONFIG.navHomeIcon}"/></a>` +
            `<a href="${USER_HOME}">\u9996\u9875</a>` +
            `<a href="${USER_PROFILE}">\u4fe1\u606f</a>` +
            `<a href="${THEME_REPO}">\u4e3b\u9898</a>` +
            `</div>`
        );
        $('body').append(headers);
    };

    enhance.recentComments = () => {
        $(SELECTORS.recentCommentTitle).each((_, a) => {
            if (!once(a, 'rc-title')) return;
            const t = $(a).text();
            $(a).text(t.replace(/\d?\d\.\s*Re:\s*/i, ''));
        });
        $(SELECTORS.recentCommentAuthor).each((_, el) => {
            if (!once(el, 'rc-author')) return;
            const t = $(el).text();
            $(el).text(t.replace(/\s*--\s*/g, ''));
        });
    };

    enhance.postDesc = () => {
        $(SELECTORS.postDesc).each((_, el) => {
            if (!once(el, 'postDesc')) return;
            const origText = $(el).text();
            const { date, readCount, comtCount } = parsePostDesc(origText);
            if (!date || readCount == null || comtCount == null) return;

            $(el).html(
                `<span class="postDescDate"> ${date} </span>` +
                `<span class="postInformation">` +
                `<span class="postDescRead"> ${readCount} </span>` +
                `<span class="postDescComt"> ${comtCount} </span>` +
                `</span>`
            );
        });
    };

    enhance.homeRestructure = () => {
        if (adapter.isPostPage()) return; // only home/list pages
        const titles = adapter.getHomePostTitles();
        for (const title of titles) {
            const group = adapter.getHomePostGroup(title);
            if (!group) continue;

            const wrapper = document.createElement('div');
            wrapper.className = 'postGeneral';
            group.parent.insertBefore(wrapper, group.nodes[0]);

            for (const n of group.nodes) {
                wrapper.appendChild(n);
            }

            wrapper.addEventListener('click', (ev) => {
                const target = ev.target;
                if (target && target.closest && target.closest('a, button, input, textarea, select, label')) return;
                group.link.click();
            });
        }
    };

    const buildTocDom = (headings) => {
        const rootUl = document.createElement('ul');
        const stack = [{ level: 1, ul: rootUl }];

        for (const h of headings) {
            const level = Number(h.getAttribute('data-hlevel')) || 1;

            while (stack.length > 1 && level < stack[stack.length - 1].level) {
                stack.pop();
            }
            while (level > stack[stack.length - 1].level) {
                const parentUl = stack[stack.length - 1].ul;
                const lastLi = parentUl.lastElementChild;
                if (!lastLi) break;
                const newUl = document.createElement('ul');
                lastLi.appendChild(newUl);
                stack.push({ level: stack[stack.length - 1].level + 1, ul: newUl });
            }

            const li = document.createElement('li');
            const a = document.createElement('a');
            a.rel = 'nofollow noopener';
            a.href = `#${h.id}`;
            a.textContent = h.textContent || '';
            li.appendChild(a);
            stack[stack.length - 1].ul.appendChild(li);
        }
        return rootUl;
    };

    enhance.postPage = () => {
        if (!adapter.isPostPage()) return;

        // Move postDesc under title
        const postTitle = adapter.getPostTitleEl();
        const postDesc = adapter.getPostDescEl();
        if (postTitle && postDesc && once(postDesc, 'movedPostDesc')) {
            $(postTitle).after($(postDesc));
        }

        // Next/prev links
        const np = adapter.getNextPrevEl();
        if (np && once(np, 'nextPrev')) {
            $(`${SELECTORS.nextPrev} br`).remove();
            $(`${SELECTORS.nextPrev} .p_n_p_prefix`).remove();

            const links = qsa(`${SELECTORS.nextPrev} a`);
            if (links.length > 0 && !qs('.post_my_next_prev')) {
                const container = document.createElement('div');
                container.className = 'post_my_next_prev';
                for (const a of links) container.appendChild(a);
                const host = np.parentElement;
                if (host) host.appendChild(container);
            }
        }

        // TOC in sidebar
        const contentRoot = adapter.getPostContentRoot();
        const tocRoot = adapter.ensureTocContainer();
        if (!contentRoot || !tocRoot) return;
        if (tocRoot.hasAttribute('data-rb-toc')) return;

        const allHeadings = qsa('h1,h2,h3,h4,h5,h6', contentRoot);
        const headings = [];
        let idIndex = 0;
        for (const h of allHeadings) {
            const tag = (h.tagName || '').toLowerCase();
            const m = tag.match(/^h([1-6])$/);
            if (!m) continue;
            const level = Number(m[1]);
            h.classList.add('isTitle');
            h.setAttribute('data-hlevel', String(level));
            if (!h.id) h.id = `tp${idIndex++}`;
            headings.push(h);
        }

        if (headings.length === 0) return;

        tocRoot.innerHTML = '';
        tocRoot.appendChild(buildTocDom(headings));
        tocRoot.setAttribute('data-rb-toc', '1');

        // fold toggles
        $(`${SELECTORS.tocContent} li > ul`).each((_, ul) => {
            const li = ul.parentElement;
            if (!li) return;
            const a = li.querySelector('a');
            if (!a) return;
            if (li.querySelector(':scope > .foldable')) return;
            const span = document.createElement('span');
            span.className = 'foldable';
            span.textContent = '▶';
            li.insertBefore(span, a);
        });
        $('#ec .foldable').off('click').on('click', function () {
            const $ul = $(this).parent().children('ul').first();
            $ul.slideToggle(200);
            $(this).toggleClass('collapsed');
        });
    };

    enhance.underPostCard = () => {
        const cards = qsa(SELECTORS.underPostCard);
        for (const card of cards) {
            if (!once(card, 'underPostCard')) continue;
            $(card).find('b').remove();
            const raw = $(card).html();
            if (!raw) continue;
            $(card).html(raw.replace(/\u00b7/g, '').replace(/<br\s*\/?>/g, ''));
        }
    };

    enhance.comments = () => {
        $(SELECTORS.layer).each((_, el) => {
            if (!once(el, 'layer')) return;
            const t = $(el).text();
            if (t && /\u697c\s*$/.test(t)) $(el).text(t.replace(/\u697c\s*$/, ''));
        });
        $(SELECTORS.feedbackItem).each((_, el) => {
            if (!once(el, 'feedbackItem')) return;
            if ($(el).find('.louzhu').length > 0) $(el).addClass('lz-comment');
        });
        $(SELECTORS.feedbackCon).each((_, el) => {
            if (!once(el, 'feedbackCon')) return;
            $(el).addClass('cnblogs-markdown');
        });
    };

    enhance.footer = () => {
        const ft = qs(SELECTORS.footer);
        if (!ft) return;

        const $ft = $(ft);
        if (!qs('#footer .footerdec')) {
            $ft.html(
                `<span class="footerdec">` +
                `<span style="color:red;">${CONFIG.displayName}</span> @ <span style="color:purple;">Cnblogs</span><br>` +
                `</span>`
            );
        }

        const stats = qs(SELECTORS.blogStats);
        if (stats && !ft.contains(stats)) {
            $ft.append($(stats));
        }

        for (const key of ['_post_', '_article_', '-comment_', '-total-view-']) {
            const ele = qs(`#stats${key}count`);
            if (!ele) continue;
            const m = (ele.textContent || '').match(/\d+/);
            if (m) ele.textContent = m[0];
        }
    };

    enhance.searchBoxes = () => {
        const boxes = qsa('.div_my_zzk');
        if (boxes.length === 0) return;

        for (const box of boxes) {
            if (box.hasAttribute('data-rb-search')) continue;

            const btn = qs('.btn_my_zzk', box);
            const btnLabel = (
                btn?.getAttribute('value') ||
                btn?.getAttribute('aria-label') ||
                btn?.textContent ||
                ''
            ).trim();

            const form = box.tagName === 'FORM' ? box : box.closest('form') || qs('form', box);
            const action = (form?.getAttribute('action') || '').toLowerCase();

            const isGoogle = /google|\u8c37\u6b4c/i.test(btnLabel) || action.includes('google');
            box.setAttribute('data-rb-search', isGoogle ? 'google' : 'site');
        }
    };

    const runAll = () => {
        safe('nav', enhance.nav);
        safe('recent-comments', enhance.recentComments);
        safe('post-desc', enhance.postDesc);
        safe('home-restructure', enhance.homeRestructure);
        safe('post-page', enhance.postPage);
        safe('under-post-card', enhance.underPostCard);
        safe('comments', enhance.comments);
        safe('footer', enhance.footer);
        safe('search-boxes', enhance.searchBoxes);
    };

    // Initial run
    $(runAll);

    // Handle async-loaded blocks (recent comments / ads / comments)
    let scheduled = false;
    const schedule = () => {
        if (scheduled) return;
        scheduled = true;
        window.setTimeout(() => {
            scheduled = false;
            runAll();
        }, 50);
    };

    const RELEVANT_SELECTOR =
        `${SELECTORS.recentCommentTitle},${SELECTORS.recentCommentAuthor},` +
        `${SELECTORS.postDesc},${SELECTORS.postTitle},${SELECTORS.nextPrev},` +
        `${SELECTORS.underPostCard},${SELECTORS.feedbackItem},${SELECTORS.feedbackCon},` +
        `${SELECTORS.layer},${SELECTORS.footer},${SELECTORS.sideBar}`;

    const isRelevantMutation = (mutations) => {
        for (const m of mutations) {
            if (m.type !== 'childList') continue;
            const nodes = [...m.addedNodes, ...m.removedNodes];
            for (const n of nodes) {
                if (!n || n.nodeType !== 1) continue;
                const el = /** @type {Element} */ (n);
                if (
                    el.matches?.(
                        RELEVANT_SELECTOR
                    )
                ) {
                    return true;
                }
                if (
                    el.querySelector?.(
                        RELEVANT_SELECTOR
                    )
                ) {
                    return true;
                }
            }
        }
        return false;
    };

    const observer = new MutationObserver((mutations) => {
        if (isRelevantMutation(mutations)) schedule();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // Stop observing after page becomes stable
    window.setTimeout(() => observer.disconnect(), 10000);
})();