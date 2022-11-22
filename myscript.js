// 左侧栏
let sl = $('<div></div>').attr('id', 'sideBarLeft')
$('#main').prepend(sl)

// 导航
let navbar = $('<div></div>').attr('id', 'navbar').append($('<h3>导航</h3>').attr('class', 'catListTitle'))
sl.append(navbar)

let navlist = [{
	target: "https://www.cnblogs.com",
	bgClass: "navicon1",
	name: "博客园"
},{
	target: "https://www.cnblogs.com/ofnoname",
	bgClass: "navicon2",
	name: "首页"		
},{
	target: "https://www.cnblogs.com",
	bgClass: "navicon3",
	name: "未解锁"		
}
]
function genNav(nav, list){
	for (i of list) nav.append($(`<a href="${i.target}" class="navtag"><div class="${i.bgClass}"></div><span>${i.name}</span></a>`))
}
genNav(navbar, navlist)

// 目录
let cnt = 0;
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
			t.attr('id', 'tp'+(++cnt))
			ele += `<li>
						<a rel="nofollow noopener"  href="#tp${cnt}"> ${ t.text() } </a>
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
	$('.econtent li ul').parent().prev().before($('<span class="foldable">&gt;</span>'))
	$('.foldable').on("click", function(){
		$(this).next().next().slideToggle(200)
		$(this).toggleClass('collapsed')
	})
}

// 开始修改样式
let trytime = 0, cd = 0

const modifier = setInterval(function() {	
	trytime++;
	if (trytime > 150) {
		clearInterval(modifier)
	}
		
	// 右侧栏 
	if ($('.RecentCommentBlock ul').length === 0) return;
	if ($('.postDesc').length === 0 && $('.post').length === 0) return;
	$('.recent_comment_title a').text((id, origText) => {
		return origText.replace(/\d?\d.\sRe:/, '')
	})
	$('.recent_comment_author').text((id, origText) => {
		return origText.replace('--', '——')
	})
	$('.catListTitle').last().html('最新评论');
	
	
	// 切换postDesc样式
	if (cd == 0) {
		cd = 1
		$('.postDesc').html((id, orightml) => {
			const origText = $('.postDesc').eq(id).text()
			return `<span class='postDescDate'> ${origText.match(/\d{4}-\d\d-\d\d \d\d:\d\d/)} </span>
					<span class='postInformation'>
					<span class='postDescRead'> ${origText.match(/阅读\(\d+\)/)[0].match(/\d+/)[0]} </span>
					<span class='postDescComt'> ${origText.match(/评论\(\d+\)/)[0].match(/\d+/)[0]} </span>
					</span>
				   `
		})		
	}

	
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
		let ec = $('<div></div>').attr('id', 'ec').append($('<h3>目录</h3>').attr('class', 'catListTitle')).append($('<div></div>').attr('class', 'econtent'))
		sl.append(ec)
		makeEssayContent($('.post'), $('.econtent'))
	}
	// footer
	$('#footer').html('<span class="footerdec"><span style="color:#ff4d00;">Ofnoname</span> @ <span style="color:#9265ff;">Cnblogs</span> 2022<br>Powered by .NET 6 on <span style="color:#6a5acd;">Kubernetes</span></span>')
	$('#footer').append($('.blogStats'))	
	$('#stats_post_count').html($('#stats_post_count').html().match(/\d+/)[0])
	$('#stats_article_count').html($('#stats_article_count').html().match(/\d+/)[0])
	$('#stats-comment_count').html($('#stats-comment_count').html().match(/\d+/)[0])
	$('#stats-total-view-count').html($('#stats-total-view-count').html().match(/\d+/)[0])

	// 完毕后显示
	clearInterval(modifier)
	$('.RecentCommentBlock ul').css('visibility', 'visible')
	$('.forFlow').css('visibility', 'visible')
}, 100)