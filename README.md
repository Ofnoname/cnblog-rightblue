# cnblog-rightblue

一个用于博客园（CNBlogs）的轻量主题：浅蓝主色、简约排版、偏“阅读优先”。仓库只包含你需要粘贴到博客园设置里的三份文件：CSS、JS 和说明文档。

**包含什么**
- [custom.css](custom.css)：主题样式（配色、排版、目录/搜索/打印等细节优化）
- [myscript.js](myscript.js)：少量 DOM 增强（让侧栏/页脚/目录等细节更稳定）

**使用方式（博客园后台）**
- 代码高亮：建议选择 `Fira Code`
- 页面定制 CSS：禁用模板默认 CSS，并使用 [custom.css](custom.css)
- 页脚 HTML：将 [myscript.js](myscript.js) 内容放入 `<script>` 中

**简单自定义**
- 如需改个人信息链接/页脚展示名等：在 [myscript.js](myscript.js) 顶部 `CONFIG` 中修改对应项即可。

**注意事项**
- 博客园页面结构可能会变化：如果某些增强不生效，通常需要更新选择器或关闭对应增强。
- 标题艺术字体已做本地内嵌（不依赖外链）；若你修改了博客标题文字，可能需要同步更新字体子集。

示例：<https://www.cnblogs.com/ofnoname>
