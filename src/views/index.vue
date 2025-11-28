<template>
	<div class="app-wrapper">
		
		<!-- 返回顶部 -->
		<el-backtop :right="40" :bottom="40" />
		
		<!-- Hero 区域：展示大标题、描述和统计 (随页面滚动划走) -->
		<section class="hero-section">
			<h1 class="hero-title">Icon 图标库</h1>
			<p class="hero-desc">
				提供在线图标链接，用于个人NAS设备显示使用，禁止用于商业用途
			</p>
			<div class="hero-stats">
				<span class="stat-item">共 {{ totalCategories }} 个分类</span>
				<span class="divider">·</span>
				<span class="stat-item">{{ totalIcons }} 个图标</span>
				
				<!-- 只有在筛选状态下才显示“当前显示” -->
				<template v-if="isFiltered">
					<span class="divider">·</span>
					<span class="stat-highlight">当前显示 {{ currentIcons }} 个</span>
				</template>
			</div>
		</section>
		
		<!-- 顶部悬浮岛 Header (搜索/控制栏) - 自动显隐 -->
		<!-- ref 用于获取高度，辅助计算 -->
		<header class="site-header" :class="{ 'header-hidden': isHeaderHidden }" ref="headerRef">
			<div class="glass-island">
				<!-- 品牌 Logo (点击刷新页面) -->
				<div class="brand-section" @click="reloadPage" title="重置页面">
					<div class="brand-logo">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<rect x="3" y="3" width="7" height="7"></rect>
							<rect x="14" y="3" width="7" height="7"></rect>
							<rect x="14" y="14" width="7" height="7"></rect>
							<rect x="3" y="14" width="7" height="7"></rect>
						</svg>
					</div>
					<!-- 移动端或小屏时，Header 上也保留一个小标题，方便识别 -->
					<h1 class="brand-title-small">Icon Hub</h1>
				</div>
				
				<!-- 控制栏 -->
				<div class="controls-wrapper">
					<!-- 搜索框 -->
					<div class="search-group">
						<i class="search-icon">
							<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
						</i>
						<input
							type="text"
							:value="searchInput"
							@input="handleSearchInput"
							class="modern-input"
							placeholder="搜索图标..."
							autocomplete="off"
						/>
						<!-- 清空按钮 -->
						<button v-if="searchInput" class="clear-btn" @click="clearSearch">
							<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
						</button>
					</div>
					
					<!-- 分类筛选下拉 -->
					<div class="filter-group">
						<select v-model="selectedCategory" class="modern-select">
							<option value="">全部分类</option>
							<option v-for="cat in uniqueCategories" :key="cat" :value="cat">
								{{ cat }}
							</option>
						</select>
					</div>
					
					<!-- Theme Toggle (主题切换) -->
					<button
						class="theme-toggle-btn"
						@click="cycleTheme"
						:title="themeTitle"
					>
						<!-- Auto Icon (System) -->
						<svg v-if="themeMode === 'auto'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
						<!-- Light Icon (Sun) -->
						<svg v-if="themeMode === 'light'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
						<!-- Dark Icon (Moon) -->
						<svg v-if="themeMode === 'dark'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
					</button>
					
					<!-- CDN 切换开关 -->
					<div class="toggle-group" title="切换 CDN 链接复制">
						<label class="switch">
							<input type="checkbox" v-model="cdnValue">
							<span class="slider round"></span>
						</label>
						<span class="toggle-label">CDN</span>
					</div>
				</div>
			</div>
		</header>
		
		<!-- 主内容区 -->
		<main class="content-wrapper">
			<!-- Loading 状态 -->
			<div v-if="loading" class="state-container">
				<div class="spinner"></div>
				<p>正在加载图标资源...</p>
			</div>
			
			<!-- 空状态 -->
			<div v-else-if="Object.keys(groupedIcons).length === 0" class="state-container empty-state">
				<div class="empty-icon">🔭</div>
				<h3>未找到相关图标</h3>
				<p>尝试搜索其他关键词或切换分类</p>
			</div>
			
			<!-- 图标列表 -->
			<section
				v-else
				v-for="(items, categoryName) in groupedIcons"
				:key="categoryName"
				class="category-section"
			>
				<!-- 分类标题 -->
				<div class="category-header">
					<h2 class="category-title">
						<span class="hash">#</span> {{ formatCategoryTitle(categoryName) }}
					</h2>
					<span class="badge">{{ items.length }} Icons</span>
				</div>
				
				<!-- Bento Grid 网格 -->
				<div class="bento-grid">
					<div
						v-for="item in items"
						:key="item.name"
						class="bento-card"
						@click="copyIconUrl(getIconRelativePath(categoryName, item))"
					>
						<!-- 格式标签 (Format Badge) -->
						<span
							class="format-badge"
							:class="item.type"
							title="文件格式"
						>
							 {{ item.type.toUpperCase() }}
						</span>
						
						<!-- 卡片主体：图片与名称 -->
						<div class="card-main">
							<div class="card-visual">
								<img
									:src="getIconPath(categoryName, item)"
									:alt="item.name"
									loading="lazy"
									@error="handleImageError"
								>
							</div>
							<div class="card-info">
								<h3 class="card-name" :title="item.name">{{ item.name }}</h3>
							</div>
						</div>
						
						<!-- 2. 操作层 (鼠标移入显示) -->
						<div class="action-layer">
							
							<!-- 左侧：放大查看 -->
							<div class="action-btn-wrapper">
								<button
									class="icon-btn zoom-btn"
									@click.stop="handlePreview(categoryName, item)"
								>
									<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
								</button>
								<!-- 悬浮提示 Tooltip -->
								<span class="tooltip-text">预览图片</span>
							</div>
							
							<!-- 中间：复制链接 (Copy) -->
							<div class="action-btn-wrapper">
								<button class="icon-btn copy-btn primary-action">
									<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
								</button>
								<!-- 悬浮提示 Tooltip -->
								<span class="tooltip-text">复制链接</span>
							</div>
							
							<!-- 右侧：刷新缓存 (带 Loading) -->
							<div class="action-btn-wrapper">
								<button
									class="icon-btn refresh-btn"
									:class="{ 'is-loading': refreshingItems.has(`${categoryName}/${item.name}`) }"
									@click.stop="purgeSingleIcon(categoryName, item)"
									:disabled="refreshingItems.has(`${categoryName}/${item.name}`)"
								>
									<!-- 正常状态图标 -->
									<svg v-if="!refreshingItems.has(`${categoryName}/${item.name}`)" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
									
									<!-- Loading 状态图标 -->
									<svg v-else class="spinner-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
								</button>
								<!-- 悬浮提示 Tooltip -->
								<span class="tooltip-text">
									{{ refreshingItems.has(`${categoryName}/${item.name}`) ? '刷新中...' : '刷新缓存' }}
								</span>
							</div>
						
						</div>
						<div class="card-glow"></div>
					</div>
				</div>
			</section>
		</main>
		
		<!-- 页脚 -->
		<footer class="site-footer">
			<p>© 2025 Icon Hub - Personal NAS Dashboard</p>
		</footer>
		
		<!-- 图片查看器 -->
		<el-image-viewer
			v-if="showViewer"
			@close="closeViewer"
			:url-list="previewList"
			:hide-on-click-modal="true"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { ElMessage, ElImageViewer, ElBacktop } from "element-plus";
import useClipboard from "vue-clipboard3";

// --- 状态定义 ---
const { toClipboard } = useClipboard();
const loading = ref(true);

// 搜索相关的状态
const searchInput = ref(""); // 输入框绑定的原始值
const searchQuery = ref(""); // 用于过滤的实际值 (经过防抖)

const selectedCategory = ref("");
const rawData = ref<Record<string, any>>({});
const cdnValue = ref(true);
const showViewer = ref(false);
const previewList = ref<string[]>([]);
const isHeaderHidden = ref(false);
const headerRef = ref<HTMLElement | null>(null); // 获取 Header 元素

// 主题模式: 'auto' | 'light' | 'dark'
const themeMode = ref<'auto' | 'light' | 'dark'>('auto');

// 记录正在刷新的图标 ID 集合 (避免全局 loading，实现单个图标 loading)
const refreshingItems = ref(new Set<string>());

let lastScrollPosition = 0;
let debounceTimer: ReturnType<typeof setTimeout> | null = null; // 防抖定时器

const publicPath = '/';

// --- 初始化与主题逻辑 ---

onMounted(() => {
	fetchData();
	window.addEventListener('scroll', handleScroll);
	
	// 1. 读取本地存储的主题设置
	const savedTheme = localStorage.getItem('icon-hub-theme');
	if (savedTheme && ['auto', 'light', 'dark'].includes(savedTheme)) {
		themeMode.value = savedTheme as any;
	}
	
	// 2. 应用主题
	applyTheme();
});

onUnmounted(() => {
	window.removeEventListener('scroll', handleScroll);
});

// 切换主题模式: Auto -> Light -> Dark -> Auto
const cycleTheme = () => {
	if (themeMode.value === 'auto') {
		themeMode.value = 'light';
	} else if (themeMode.value === 'light') {
		themeMode.value = 'dark';
	} else {
		themeMode.value = 'auto';
	}
	
	// 保存并应用
	localStorage.setItem('icon-hub-theme', themeMode.value);
	applyTheme();
	
	ElMessage.success(`${themeTitle.value}`);
};

// 执行主题切换：通过在 html 标签上设置 data-theme 属性
const applyTheme = () => {
	const root = document.documentElement;
	if (themeMode.value === 'auto') {
		root.removeAttribute('data-theme'); // 移除属性，让 CSS @media 生效
	} else {
		root.setAttribute('data-theme', themeMode.value); // 强制设置 light 或 dark
	}
};

const themeTitle = computed(() => {
	const map = {
		'auto': '跟随系统',
		'light': '明亮模式',
		'dark': '暗黑模式'
	};
	return map[themeMode.value];
});

// --- 核心逻辑 ---

const fetchData = async () => {
	try {
		loading.value = true;
		const response = await fetch('db.json');
		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
		const jsonData = await response.json();
		
		// 排序逻辑
		const sortedCategories = Object.keys(jsonData).sort((a, b) => {
			return a.localeCompare(b, undefined, { numeric: true, caseFirst: 'upper' });
		});
		
		const sortedData: Record<string, any> = {};
		sortedCategories.forEach(category => {
			sortedData[category] = jsonData[category].sort((a: any, b: any) => {
				return a.name.localeCompare(b.name, undefined, { numeric: true, caseFirst: 'upper' });
			});
		});
		
		rawData.value = sortedData;
	} catch (error) {
		console.error('Error fetching JSON:', error);
		ElMessage.error('数据加载失败，请检查 db.json');
	} finally {
		loading.value = false;
	}
};

// --- 滚动 & 搜索 ---
const handleScroll = () => {
	const currentScrollPosition = window.scrollY || document.documentElement.scrollTop;
	if (currentScrollPosition < 0) return;
	
	// 阈值判断：必须滚动超过一定距离才触发隐藏逻辑
	const HEADER_STICKY_THRESHOLD = 350;
	
	if (Math.abs(currentScrollPosition - lastScrollPosition) < 50) return;
	
	if (currentScrollPosition > HEADER_STICKY_THRESHOLD) {
		// 向下滚动 -> 隐藏
		isHeaderHidden.value = currentScrollPosition > lastScrollPosition;
	} else {
		// 如果在顶部区域，始终显示
		isHeaderHidden.value = false;
	}
	
	lastScrollPosition = currentScrollPosition;
};

// 防抖搜索处理
const handleSearchInput = (e: Event) => {
	const value = (e.target as HTMLInputElement).value;
	searchInput.value = value;
	
	// 清除上一次的定时器
	if (debounceTimer) clearTimeout(debounceTimer);
	
	// 延迟 300ms 更新实际搜索词
	debounceTimer = setTimeout(() => {
		searchQuery.value = value;
	}, 300);
};

// 清空搜索
const clearSearch = () => {
	searchInput.value = "";
	searchQuery.value = "";
};

// --- 计算属性 (统计数据) ---
const uniqueCategories = computed(() => Object.keys(rawData.value));

// 总统计
const totalCategories = computed(() => Object.keys(rawData.value).length);
const totalIcons = computed(() => {
	return Object.values(rawData.value).reduce((total: number, items: any) => total + items.length, 0);
});

// 筛选后的数据
const groupedIcons = computed(() => {
	// 使用经过防抖的 searchQuery
	const term = searchQuery.value.toLowerCase().trim();
	const cat = selectedCategory.value;
	const result: Record<string, any> = {};
	
	Object.entries(rawData.value).forEach(([category, items]) => {
		if (cat && category !== cat) return;
		
		const filteredItems = (items as any).filter((item: any) =>
			item.name.toLowerCase().includes(term)
		);
		
		if (filteredItems.length > 0) {
			result[category] = filteredItems;
		}
	});
	
	return result;
});

// 当前显示统计
const currentIcons = computed(() => {
	return Object.values(groupedIcons.value).reduce((total: number, items: any) => total + items.length, 0);
});

const isFiltered = computed(() => {
	return searchQuery.value !== "" || selectedCategory.value !== "";
});

// --- 功能函数 ---

const reloadPage = () => window.location.reload();

const formatCategoryTitle = (category: string) => {
	const titles: Record<string, string> = {
		'Z_all_png': 'Z_all_png -【SVG → PNG】',
		'Z_all_png_other': 'Z_all_png_other【其它图】',
		'Z_all_svg': 'Z_all_svg -【SVG】'
	};
	return titles[category] || category;
};

const getIconRelativePath = (category: string, item: any) => {
	const ext = item.type === 'svg' ? '.svg' : '.png';
	return `${category}/${item.name}${ext}`;
};

const getIconPath = (category: string, item: any) => {
	return `${publicPath}icon/${getIconRelativePath(category, item)}`;
};

const handleImageError = (e: Event) => {
	const target = e.target as HTMLImageElement;
	target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='none' d='M0 0h24v24H0z'/%3E%3Cpath fill='%23ccc' d='M16 16l-4-4-4 4V6h8v10zm-4-6l3 3h-6l3-3zM4 22v-2h16v2H4zm2-4h12V4H6v14z'/%3E%3C/svg%3E";
};

const copyIconUrl = async (relativePath: string) => {
	try {
		// const baseUrl = window.location.origin + window.location.pathname;
		// const cleanBaseUrl = baseUrl.replace(/\/$/, '');
		// const localUrl = `${cleanBaseUrl}/icon/${relativePath}`;
		const rawUrl = `https://raw.githubusercontent.com/oliver556/my-icons/gh-pages/icon/${relativePath}`;
		const cdnUrl = `https://cdn.jsdelivr.net/gh/oliver556/my-icons@gh-pages/icon/${relativePath}`;
		const textToCopy = cdnValue.value ? cdnUrl : rawUrl;
		
		await toClipboard(textToCopy);
		// ElMessage.success({ message: `链接已复制`, duration: 2000 });
		ElMessage.success({ message: `链接已复制 (${cdnValue.value ? 'CDN' : 'Raw'})`, duration: 2000 });
	} catch (e) {
		ElMessage.error('复制失败');
	}
};

// 刷新 CDN 缓存 (带 Loading)
const purgeSingleIcon = async (category: string, item: any) => {
	const itemId = `${category}/${item.name}`;
	
	// 如果已经在刷新中，直接返回
	if (refreshingItems.value.has(itemId)) return;
	
	const path = getIconRelativePath(category, item);
	const url = `https://purge.jsdelivr.net/gh/oliver556/my-icons@gh-pages/icon/${path}`;
	
	// 开始 Loading
	refreshingItems.value.add(itemId);
	
	try {
		// 使用 Promise.all 确保至少展示 800ms 的 Loading，避免闪烁
		const minLoadingTime = new Promise(resolve => setTimeout(resolve, 800));
		const fetchRequest = fetch(url, { mode: 'no-cors' });
		
		await Promise.all([fetchRequest, minLoadingTime]);
		
		ElMessage.success('已刷新图片CDN缓存，请等待几分钟后生效。');
	} catch (error) {
		console.error('Purge error:', error);
		ElMessage.error('刷新请求发送失败，请稍后重试。');
	} finally {
		// 结束 Loading
		refreshingItems.value.delete(itemId);
	}
};

const handlePreview = (category: string, item: any) => {
	const path = getIconPath(category, item);
	previewList.value = [path];
	showViewer.value = true;
};
const closeViewer = () => { showViewer.value = false; };
</script>

<style>
/* --- 全局变量 --- */
:root {
	/* 默认亮色模式变量 */
	--color-primary: #6366f1;
	--color-primary-light: rgba(99, 102, 241, 0.1);
	--color-bg: #f8fafc;
	--color-bg-island: rgba(255, 255, 255, 0.85);
	--color-card: #ffffff;
	--color-text-main: #0f172a;
	--color-text-sub: #64748b;
	--color-border: #e2e8f0;
	--color-tooltip: #1e293b;
	
	--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
	--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
	--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
	--radius-lg: 16px;
}

/* 自动暗黑 (系统偏好为暗，且未手动设置为亮) */
@media (prefers-color-scheme: dark) {
	:root:not([data-theme="light"]) {
		--color-bg: #0f172a;
		--color-bg-island: rgba(30, 41, 59, 0.85);
		--color-card: #1e293b;
		--color-text-main: #f1f5f9;
		--color-text-sub: #94a3b8;
		--color-border: rgba(255, 255, 255, 0.1);
		--color-tooltip: #f8fafc;
		
		--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.5);
		--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.5);
	}
}

/* 强制暗黑 (手动设置为暗) */
:root[data-theme="dark"] {
	--color-bg: #0f172a;
	--color-bg-island: rgba(30, 41, 59, 0.85);
	--color-card: #1e293b;
	--color-text-main: #f1f5f9;
	--color-text-sub: #94a3b8;
	--color-border: rgba(255, 255, 255, 0.1);
	--color-tooltip: #f8fafc;
	
	--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.5);
	--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.5);
}

body {
	margin: 0;
	background-color: var(--color-bg);
	color: var(--color-text-main);
	font-family: 'Inter', system-ui, sans-serif;
	-webkit-font-smoothing: antialiased;
	transition: background-color 0.3s, color 0.3s;
}

* {
	box-sizing: border-box;
}

.app-wrapper {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
}

/* --- Hero --- */
.hero-section {
	text-align: center;
	padding: 60px 20px 40px;
	max-width: 800px;
	margin: 0 auto;
	animation: fadeIn 0.8s ease-out;
}

.hero-title {
	font-size: 2.5rem;
	font-weight: 800;
	margin: 0 0 16px;
	background: linear-gradient(135deg, var(--color-primary), #a855f7);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	letter-spacing: -1px;
}

.hero-desc {
	font-size: 1rem;
	color: var(--color-text-sub);
	margin: 0 0 24px;
	line-height: 1.6;
}

.hero-stats {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	background: rgba(99, 102, 241, 0.05);
	padding: 8px 16px;
	border-radius: 99px;
	border: 1px solid var(--color-border);
	font-size: 0.9rem;
	color: var(--color-text-sub);
}

.divider {
	opacity: 0.3;
}

.stat-highlight {
	color: var(--color-primary);
	font-weight: 600;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* --- Header --- */
.site-header {
	position: sticky;
	top: 16px;
	z-index: 100;
	padding: 0 20px;
	display: flex;
	justify-content: center;
	pointer-events: none;
	transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.site-header.header-hidden {
	transform: translateY(-200%);
}

.glass-island {
	pointer-events: auto;
	width: 100%;
	padding: 10px 20px;
	background: var(--color-bg-island);
	backdrop-filter: blur(16px);
	-webkit-backdrop-filter: blur(16px);
	border: 1px solid var(--color-border);
	border-radius: 20px;
	box-shadow: var(--shadow-lg);
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20px;
}

.brand-section {
	display: flex;
	align-items: center;
	gap: 12px;
	cursor: pointer;
}

.brand-logo {
	width: 36px;
	height: 36px;
	color: var(--color-primary);
	background: var(--color-primary-light);
	border-radius: 10px;
	padding: 7px;
}

.brand-title-small {
	font-size: 1rem;
	font-weight: 700;
	margin: 0;
	display: none;
}

.search-group {
	position: relative;
	width: 100%;
	max-width: 240px;
}

.search-icon {
	position: absolute;
	left: 10px;
	top: 50%;
	transform: translateY(-50%);
	color: var(--color-text-sub);
	display: flex;
}

.clear-btn {
	position: absolute;
	right: 8px;
	top: 50%;
	transform: translateY(-50%);
	background: none;
	border: none;
	color: var(--color-text-sub);
	cursor: pointer;
	padding: 2px;
	display: flex;
	border-radius: 50%;
}

.clear-btn:hover {
	background: rgba(0, 0, 0, 0.05);
	color: var(--color-text-main);
}

.modern-input {
	width: 100%;
	padding: 8px 30px 8px 34px;
	border-radius: 8px;
	border: 1px solid transparent;
	background: var(--color-bg);
	color: var(--color-text-main);
	font-size: 0.9rem;
	outline: none;
	transition: all 0.2s;
}

.modern-input:focus {
	background: var(--color-card);
	border-color: var(--color-primary);
	box-shadow: 0 0 0 2px var(--color-primary-light);
}

.controls-wrapper {
	display: flex;
	align-items: center;
	gap: 12px;
	flex: 1;
	justify-content: flex-end;
}

.modern-select {
	padding: 8px 12px;
	border-radius: 8px;
	border: 1px solid transparent;
	background: var(--color-bg);
	color: var(--color-text-main);
	font-size: 0.9rem;
	outline: none;
	cursor: pointer;
	max-width: 160px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.modern-select:hover {
	background: var(--color-card);
	border-color: var(--color-border);
}

.theme-toggle-btn {
	width: 34px;
	height: 34px;
	border-radius: 8px;
	border: 1px solid transparent;
	background: var(--color-bg);
	color: var(--color-text-sub);
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s;
}

.theme-toggle-btn:hover {
	background: var(--color-card);
	border-color: var(--color-border);
	color: var(--color-text-main);
}

/* Switch */
.toggle-group {
	display: flex;
	align-items: center;
	gap: 8px;
	padding-left: 10px;
	border-left: 1px solid var(--color-border);
}

.switch {
	position: relative;
	display: inline-block;
	width: 34px;
	height: 20px;
}

.switch input {
	opacity: 0;
	width: 0;
	height: 0;
}

.slider {
	position: absolute;
	cursor: pointer;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: var(--color-text-sub);
	opacity: 0.3;
	transition: .4s;
	border-radius: 34px;
}

.slider:before {
	position: absolute;
	content: "";
	height: 16px;
	width: 16px;
	left: 2px;
	bottom: 2px;
	background-color: white;
	transition: .4s;
	border-radius: 50%;
}

input:checked + .slider {
	background-color: var(--color-primary);
	opacity: 1;
}

input:checked + .slider:before {
	transform: translateX(14px);
}

.toggle-label {
	font-size: 0.75rem;
	font-weight: 600;
	color: var(--color-text-sub);
}

/* --- Content --- */
.content-wrapper {
	flex: 1;
	width: 100%;
	margin: 0 auto;
	padding: 40px 20px 80px;
}

.state-container {
	text-align: center;
	padding: 60px 0;
	color: var(--color-text-sub);
}

.spinner {
	width: 40px;
	height: 40px;
	border: 3px solid var(--color-border);
	border-top-color: var(--color-primary);
	border-radius: 50%;
	margin: 0 auto 20px;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.empty-icon {
	font-size: 3rem;
	margin-bottom: 10px;
}

.category-section {
	margin-bottom: 40px;
}

.category-header {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 20px;
	padding-bottom: 10px;
	border-bottom: 1px solid var(--color-border);
}

.category-title {
	font-size: 1.2rem;
	margin: 0;
	color: var(--color-text-main);
}

.category-title .hash {
	color: var(--color-primary);
	margin-right: 5px;
}

.badge {
	background: var(--color-bg-island);
	border: 1px solid var(--color-border);
	color: var(--color-text-sub);
	font-size: 0.75rem;
	padding: 2px 8px;
	border-radius: 10px;
}

.bento-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
	gap: 16px;
}

.bento-card {
	position: relative;
	background: var(--color-card);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	padding: 16px;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
	overflow: hidden;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
}

.bento-card:hover {
	transform: translateY(-5px);
	box-shadow: var(--shadow-md);
	border-color: var(--color-primary);
}

.card-main {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
}

.card-visual {
	width: 56px;
	height: 56px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
}

/* 丝滑的图片放大效果 */
.card-visual img {
	width: 100%;
	height: 100%;
	object-fit: contain;
	border-radius: 4px;
	transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), border-radius 0.3s ease, filter 0.3s ease;
}

.bento-card:hover .card-visual img {
	transform: scale(1.2);
	border-radius: 12px;
	filter: drop-shadow(0 8px 12px rgba(99, 102, 241, 0.15));
}

.card-name {
	font-size: 0.9rem;
	font-weight: 500;
	margin: 0;
	color: var(--color-text-main);
	width: 100%;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

/* 格式标签 Badge */
.format-badge {
	position: absolute;
	top: 8px;
	left: 8px;
	font-size: 0.65rem;
	font-weight: 700;
	padding: 2px 6px;
	border-radius: 6px;
	opacity: 0;
	transform: translateY(-5px);
	transition: all 0.3s ease;
	z-index: 20;
	pointer-events: none;
}

.bento-card:hover .format-badge {
	opacity: 1;
	transform: translateY(0);
}

/* 区分颜色 */
.format-badge.svg {
	background: rgba(168, 85, 247, 0.1);
	color: #a855f7;
	border: 1px solid rgba(168, 85, 247, 0.2);
}

.format-badge.png {
	background: rgba(59, 130, 246, 0.1);
	color: #3b82f6;
	border: 1px solid rgba(59, 130, 246, 0.2);
}

/* Action Layer */
.action-layer {
	position: absolute;
	inset: 0;
	background: rgba(255, 255, 255, 0.9); /* 保持一定透明度 */
	backdrop-filter: blur(2px); /* 轻微模糊，增加层次感 */
	display: flex;
	align-items: center;
	justify-content: space-evenly;
	padding: 0 10px;
	opacity: 0;
	transform: translateY(10px);
	transition: all 0.2s ease;
	pointer-events: none;
}

@media (prefers-color-scheme: dark) {
	.action-layer {
		background: rgba(30, 41, 59, 0.9);
	}
}

.bento-card:hover .action-layer {
	opacity: 1;
	transform: translateY(0);
	pointer-events: auto;
}

.action-btn-wrapper {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

.tooltip-text {
	position: absolute;
	bottom: -30px;
	background: var(--color-tooltip);
	color: var(--color-bg);
	font-size: 0.75rem;
	padding: 4px 8px;
	border-radius: 4px;
	white-space: nowrap;
	pointer-events: none;
	opacity: 0;
	transform: translateY(-5px);
	transition: all 0.2s ease;
	z-index: 10;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.action-btn-wrapper:hover .tooltip-text {
	opacity: 1;
	transform: translateY(0);
}

.icon-btn {
	width: 38px;
	height: 38px;
	border-radius: 50%;
	border: 1px solid var(--color-border);
	background: var(--color-bg);
	color: var(--color-text-sub);
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s;
	box-shadow: var(--shadow-sm);
	position: relative;
}

.icon-btn:hover {
	background: var(--color-card);
	color: var(--color-primary);
	border-color: var(--color-primary);
	transform: scale(1.1);
	box-shadow: var(--shadow-md);
}

.spinner-icon {
	animation: spin 1s linear infinite;
}

.card-glow {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: radial-gradient(circle at 50% 0%, var(--color-primary-light) 0%, transparent 60%);
	opacity: 0;
	pointer-events: none;
	transition: opacity 0.3s;
}

.bento-card:hover .card-glow {
	opacity: 1;
}

.site-footer {
	text-align: center;
	padding: 40px;
	color: var(--color-text-sub);
	font-size: 0.8rem;
	border-top: 1px solid var(--color-border);
	margin-top: auto;
}

/* --- Mobile --- */
@media (max-width: 768px) {
	.hero-title {
		font-size: 1.8rem;
	}
	
	.hero-stats {
		font-size: 0.8rem;
		padding: 6px 12px;
		flex-wrap: wrap;
		justify-content: center;
	}
	
	.site-header {
		top: 0;
		padding: 0;
	}
	
	.site-header.header-hidden {
		transform: translateY(-100%);
	}
	
	.glass-island {
		border-radius: 0;
		border: none;
		border-bottom: 1px solid var(--color-border);
		flex-direction: column;
		align-items: stretch;
		gap: 12px;
		padding: 12px 16px;
	}
	
	.brand-title-small {
		display: block;
		text-align: center;
	}
	
	.controls-wrapper {
		flex-wrap: wrap;
		justify-content: space-between;
	}
	
	.search-group {
		width: 100%;
		max-width: none;
		order: 1;
	}
	
	.filter-group {
		flex: 1;
		order: 2;
		margin-right: 8px;
	}
	
	.theme-toggle-btn {
		order: 3;
	}
	
	.toggle-group {
		order: 4;
	}
	
	.modern-select {
		max-width: none;
		width: 100%;
	}
	
	.content-wrapper {
		padding: 20px 16px;
	}
	
	.bento-grid {
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}
	
	.bento-card {
		padding: 12px;
		min-height: auto;
	}
	
	/* 移动端: 按钮常驻, 标签隐藏, 图片默认无圆角变化(节省性能) */
	.action-layer {
		position: static;
		opacity: 1;
		transform: none;
		background: transparent;
		padding: 10px 0 0;
		margin-top: 4px;
		border-top: 1px solid var(--color-border);
		width: 100%;
		pointer-events: auto;
		justify-content: space-between;
	}
	
	.tooltip-text {
		display: none !important;
	}
	
	.format-badge {
		display: none;
	}
	
	/* 移动端隐藏格式标签，保持清爽 */
	.icon-btn {
		width: 32px;
		height: 32px;
		background: transparent;
		border: none;
		box-shadow: none;
	}
	
	.copy-btn.primary-action {
		width: 48px;
		height: 36px;
		border-radius: 20px;
		background-color: var(--color-primary);
		color: #ffffff;
		box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
		border: none;
	}
	
	.copy-btn.primary-action:active {
		transform: scale(0.95);
	}
}
</style>
