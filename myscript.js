const sideBar = $('#sideBar')

/* 生成目录 */
function genFromTitle(hLevel, index){
    let ele = ''
    while (index < $('.isTitle').length) {
        let t = $('.isTitle').eq(index)
        if (t.attr('hLevel') > hLevel) {
            let nt = genFromTitle(t.attr('hLevel'), index)
            ele += `<li>${nt.ele}</li>`
            index = nt.index
        }
        else if (t.attr('hLevel') < hLevel) break
        else {
            t.attr('id', 'tp'+index)
            ele += `<li>
						<a rel="nofollow noopener"   href="#tp${index}"> ${ t.text() } </a>
					</li>`;
            index ++;
        }
    }
    ele = `<ul>${ele}</ul>`
    return {ele, index}
}

function makeEssayContent(elEssay, elContent) {
    for (let i = 1; i <= 6; i++) {
        elEssay.find('h'+i).addClass('isTitle').attr('hLevel', i)
    }
    elContent.html(genFromTitle(1, 0).ele);
    $('.econtent li ul').parent().prev().before($('<span class="foldable">▶</span>'))
    $('.foldable').on("click", function(){
        $(this).next().next().slideToggle(200)
        $(this).toggleClass('collapsed')
    })
}

// 开始修改样式
let everytime = 0

const modifier = setInterval(function() {
    everytime++;
    if (everytime > 150) {
        clearInterval(modifier)
    }

    // 确保加载完成
    if ($('.RecentCommentBlock ul').length === 0) return;
    if ($('.postDesc').length === 0 && $('.post').length === 0) return;
    if ($('.under-post-card').html() === "") return;

    $('.recent_comment_title a').text((id, origText) => {
        return origText.replace(/\d?\d.\sRe:/, '')
    })
    $('.recent_comment_author').text((id, origText) => {
        return origText.replace('--', '')
    })

    // 切换postDesc样式
    $('.postDesc').html((id, orightml) => {
        const origText = $('.postDesc').eq(id).text()
        return `<span class='postDescDate'> ${origText.match(/\d{4}-\d\d-\d\d \d\d:\d\d/)} </span>
                <span class='postInformation'>
                <span class='postDescRead'> ${origText.match(/阅读\(\d+\)/)[0].match(/\d+/)[0]} </span>
                <span class='postDescComt'> ${origText.match(/评论\(\d+\)/)[0].match(/\d+/)[0]} </span>
                </span>
               `
    })

    // 首页文章界面
    if ($('.post').length === 0) {
        // 重拍文章结构
        for (const title of document.querySelectorAll('.postTitle')) {
            let postGroup = [title];
            for (let i = 1; i < 5; i++)
                postGroup[i] = postGroup[i-1].nextElementSibling;
            let post = document.createElement('DIV')
            post.classList.add('postGeneral')
            title.parentNode.appendChild(post)
            for (const i of postGroup)
                post.appendChild(i)
            post.onclick = function(){
                title.children[0].click()
            }
        }
    }

    // 文章界面
    else {
        $('.postTitle').after($('.postDesc'))
        $('#post_next_prev br').remove()
        $('#post_next_prev .p_n_p_prefix').remove()

        let post_mynextprev = document.createElement('DIV')
        post_mynextprev.classList.add('post_my_next_prev')
        for (const l of document.querySelectorAll('#post_next_prev a')) post_mynextprev.appendChild(l)
        document.querySelector('#post_next_prev').parentNode.appendChild(post_mynextprev)

        // 广告区
        $('.under-post-card b').remove()
        $('.under-post-card').html((index, rawHTML)=>{
            return rawHTML.replaceAll('·', '').replace('<br>','')
        })

        // 目录
        const ec = $('<div></div>').attr('id', 'ec')
            .append($('<h3>目录</h3>').attr('class', 'catListTitle'))
            .append($('<div></div>').attr('class', 'econtent'))
        sideBar.append(ec)
        makeEssayContent($('.post'), $('.econtent'))
    }

    // 页脚
    let ft = $('#footer')
    ft.html(`<span class="footerdec">
                <span style="color:red;">Ofnoname</span> @ <span style="color:purple;">Cnblogs</span><br>
             </span>`)
    ft.append($('.blogStats'))
    for (const i of ['_post_', '_article_', '-comment_', '-total-view-']) {
        const ele = $(`#stats${i}count`) // 四个元素
        ele.html(ele.html().match(/\d+/)[0])
    }
    clearInterval(modifier)
}, 100)

const cm_modifier = setInterval(function() {
    if (everytime > 150) {
        clearInterval(cm_modifier)
    }
    if ($('.post').length !== 0 && $('.feedbackItem').length === 0) return;
    // 处理评论
    $('.layer').html((id, ori)=>{
        return ori.substring(0, ori.length-1)
    })
    $('.feedbackItem:has(.louzhu)').addClass('lz-comment')
    $('.feedbackCon').addClass('cnblogs-markdown')
    clearInterval(cm_modifier)
}, 100)

/* 导航栏 */
const headers = $(`
    <div class="nav">
        <a href="https://cnblogs.com">
            <img src="https://common.cnblogs.com/favicon.svg"/>
        </a>
        <a href="https://cnblogs.com/ofnoname">首页</a>
        <a href="https://home.cnblogs.com/u/ofnoname">信息</a>
        <a href="https://github.com/Ofnoname/cnblog-rightblue">主题</a>
<!--        <span class="site-collection">-->
<!--            <a href="https://vagbear.cn">主站</a>-->
<!--        </span>-->
    </div>
`)

$('body').append(headers)