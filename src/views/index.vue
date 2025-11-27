<template>
	<div class="icon-wrapper">
		<!-- 返回顶部 -->
		<el-backtop target=".icon-wrapper" :right="100" :bottom="100"/>
		
		<!-- 头部 -->
		<div class="icon-head">
			<h1 class="icon-head_title">Icon 图标库</h1>
			<h4 class="icon-head_txt">
				提供在线图标链接，用于个人NAS设备显示使用，禁止用于商业用途
			</h4>
			<div class="icon-head_stats">
				共 {{ totalCategories }} 个分类 · {{ totalIcons }} 个图标
				<span v-if="currentCategories !== totalCategories">
      		· 当前显示 {{ currentCategories }} 个分类 · {{ currentIcons }} 个图标
    		</span>
			</div>
			
			<!--<div class="icon-head_stats">-->
			<!--	</div>-->
			<!--	-->
			<!--	<div style="text-align: center; margin-bottom: 1rem;">-->
			<!--		<el-button-->
			<!--			type="warning"-->
			<!--			size="small"-->
			<!--			round-->
			<!--			:loading="isPurging"-->
			<!--			@click="purgeAllIcons"-->
			<!--		>-->
			<!--			{{ isPurging ? purgeProgress : '🚀 强制刷新 CDN 缓存 (修复旧图)' }}-->
			<!--		</el-button>-->
			<!--	</div>-->
		</div>
		
		<!-- 搜索部分 -->
		<div class="icon-search-wrapper">
			<div class="icon-search-content">
				<el-input
					v-model="data.search"
					class="icon-search"
					clearable
					placeholder="搜索图标"
					size="large"
				>
					<!--@keyup.enter="iconSearch"-->
					<template #prepend>
						<el-select
							class="icon-select"
							v-model="data.selectValue"
							placeholder="全部"
							size="large"
							filterable
							clearable
						>
							<!--@change="selectSearch"-->
							<el-option
								v-for="(item, index) in selectData"
								:key="index"
								:label="item.label"
								:value="item.value"
							></el-option>
						</el-select>
					</template>
				</el-input>
			</div>
		</div>
		
		<!-- 图片展示 -->
		<div class="icon-show-wrapper">
			<!-- 外层分类 -->
			<div
				class="icon-show-block"
				v-for="(items, category) in data.iconData"
				:key="category"
			>
				<!-- 分类标题 -->
				<div class="icon-show-header">
					<div class="icon-show-header_title">{{ formatCategoryTitle(category) }}</div>
					<div class="icon-show-header_num">{{ items.length }} {{ pluralize(items.length) }}</div>
					<div class="icon-show-header_line"></div>
				</div>
				
				<div class="card">
					<!-- 内层当前分类下的项目 -->
					<div
						v-for="item in items"
						:key="item.name"
						class="card_content"
						@click="copyIconUrl(category + '/' + item.name + (item.type === 'svg' ? '.svg' : '.png'))"
					>
						<div
							class="card_refresh_btn"
							@click.stop="purgeSingleIcon(category, item)"
							title="强制刷新此图标缓存"
						>
							🔄
						</div>
						<el-tooltip
							class="item"
							effect="light"
							placement="top"
						>
							<template #content> {{ getItemContent(item) }}</template>
							<!--<template #content>-->
							<el-image
								v-if="item.type === 'svg'"
								class="card_img"
								:src="data.publicPath + 'icon/' + category + '/' + item.name + '.svg'"
								lazy
								fit="contain"
							/>
							<el-image
								v-else
								class="card_img"
								:src="data.publicPath + 'icon/' + category + '/' + item.name + '.png'"
								lazy
								fit="contain"
							/>
						</el-tooltip>
						<div class="card_content_txt" @click="openUrl(item.course)" :class="item.course !== '' ? 'card_content_course' : ''">
							{{ item.name }}
						</div>
					</div>
				</div>
			
			
			</div>
			
			<div v-if="Object.keys(data.iconData).length === 0" class="no-result">
				暂未收录相对应的图标哦 ~~~
			</div>
		</div>
		
		<!-- 页脚 -->
		<div class="icon-footer">
			<p>© 2024.12.05 | By Jamison Lee</p>
		</div>
	
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import clipboard3 from "vue-clipboard3";

export default defineComponent({
	setup() {
		const {toClipboard} = clipboard3();
		const cdnValue = ref(true);
		
		// 搜索数据
		const data = reactive({
			search: "", // 搜索框的值
			selectValue: "", // 下拉框的值
			publicPath: process.env.BASE_URL,
			get iconData() { // 改为计算属性
				return this.search || this.selectValue ? filteredData.value : rawData.value;
			}
		})
		
		// 下拉框数据
		const selectData = ref<{ label: string; value: string }[]>([]);		// const selectData = reactive([
		
		// 原始数据存储
		const rawData = ref<any>({}); // 新增：存储原始数据

		// 总分类数（所有分类的数量）
		const totalCategories = computed(() => Object.keys(rawData.value).length);

		// 总图标数（所有分类下的图标总数）
		const totalIcons = computed(() => {
			return Object.values(rawData.value).reduce((total: number, items: any) =>
				total + items.length, 0
			);
		});

		// 当前显示分类数（过滤后的分类数量）
		const currentCategories = computed(() => Object.keys(data.iconData).length);

		// 当前显示图标数（过滤后的图标总数）
		const currentIcons = computed(() => {
			return Object.values(data.iconData).reduce((total: number, items: any) =>
				total + items.length, 0
			);
		});

		
		/**
		 * @Description 处理单复数形式
		 */
		const pluralize = (count: number) => {
			return count === 1 ? 'Icon' : 'Icons'
		}
		
		// 修改后的计算属性
		const filteredData = computed(() => {
			const searchTerm = data.search.toLowerCase();
			const selectedCategory = data.selectValue;
			
			return Object.entries(rawData.value).reduce((acc, [category, items]) => {
				// 分类过滤
				if (selectedCategory && category !== selectedCategory) return acc;
				
				// 搜索过滤
				const filteredItems = (items as any[]).filter(item =>
					item.name.toLowerCase().includes(searchTerm)
				);
				
				if (filteredItems.length > 0) {
					acc[category] = filteredItems;
				}
				return acc;
			}, {} as Record<string, any>);
		});
		
		/**
		 * @Description 读取本地图片数据
		 */
		const fetchData = async () => {
			try {
				const response = await fetch('/db.json');
				if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
				const jsonData = await response.json();
				
				// 对分类键进行排序
				const sortedCategories = Object.keys(jsonData).sort((a, b) => {
					return a.localeCompare(b, undefined, {
						numeric: true,
						caseFirst: 'upper'
					});
				});
				
				// 对分类下的子类进行排序
				const sortedData: Record<string, any> = {};
				sortedCategories.forEach(category => {
					sortedData[category] = jsonData[category].sort((a, b) => {
						return a.name.localeCompare(b.name, undefined, {
							numeric: true,
							caseFirst: 'upper'
						});
					});
				});
				
				rawData.value = sortedData; // 使用排序后的数据
				selectData.value = extractAndTransformData(sortedData);
			} catch (error) {
				console.error('Error fetching JSON:', error);
			}
		};
		
		/**
		 * @Description 提取并转换数据，给下拉框用的数据
		 */
		const extractAndTransformData = (data) => {
			let extractedData: { label: string; value: string }[] = [];
			
			for (const key in data) {
				if (data.hasOwnProperty(key)) {
					extractedData.push({
						label: key,
						value: key
					});
				}
			}
			return extractedData;
		}
		
		/**
		 * @Description 文图标显示文字提示
		 */
		function getItemContent(item: { name: any; type: string; }) {
			return `${item.name}${item.type === 'svg' ? '.svg' : '.png'}`;
		}
		
		// 分类标题格式化方法
		const formatCategoryTitle = (category) => {
			const titles = {
				// 'AI': 'AI - 人工智能（AI）',
				// 'Analytics': 'Analytics - 数据分析平台',
				// 'Automation': 'Automation - 自动化工具链',
				// 'Bookmarks': 'Bookmarks - 书签管理系统',
				// "Cloud Protection Services": "Cloud Protection Services - 云防护服务",
				// 'CMS': 'CMS - 内容管理系统（CMS）',
				// 'Document Management': 'Document Management - 文档协同平台',
				// 'Database Management': 'Database Management - 数据库运维套件',
				// 'DNS': 'DNS - 域名解析系统（DNS）',
				// 'Downloader': 'Downloader - 下载任务管理器',
				// 'Feed Readers': 'Feed Readers - 信息流订阅器',
				// 'File Transfer': 'File Transfer - 文件传输中间件',
				// 'Google': 'Google - 谷歌（技术规范保留原文）',
				// 'Financial Management': 'Financial Management - 财务管理系统',
				// 'Games': 'Games - 游戏服务器',
				// 'Internet of Things (IoT)': 'Internet of Things (IoT) - 物联网（IoT）管理平台',
				// 'Linux Server Operation and Management Panel': 'Linux Server Operation and Management Panel - Linux 服务器运维面板',
				// 'Media Streaming': 'Media Streaming - 流媒体服务器',
				// 'Note-taking & Editors & Wikis': 'Note-taking & Editors & Wikis - 笔记-编辑器-维基三合一平台',
				// 'Personal Dashboards': 'Personal Dashboards - 个人数据仪表盘',
				// 'Password Managers': 'Password Managers - 密码保险库',
				// 'Photo and Video Galleries': 'Photo and Video Galleries - 多媒体资源库',
				// 'Project Management & To-do List': 'Project Management & To-do List - 敏捷项目管理套件（含任务看板）',
				// 'PT': 'PT - 私有追踪器（Private Tracker）',
				// 'Remote Access': 'Remote Access - 远程运维通道',
				// 'Router & VPN': 'Router & VPN - 智能路由与VPN网关',
				// 'Software Containers': 'Software Containers - 软件容器引擎',
				// 'Software Development': 'Software Development - 软件开发工具链',
				// 'Synology NAS': 'Synology NAS - 群晖 NAS 管理套件',
				// 'Status & Uptime pages': 'Status & Uptime pages - 服务状态监控页',
				// 'Streaming Service Platform': 'Streaming Service Platform - 流媒体服务平台',
				// 'Social Networking and Forum Software': 'Social Networking and Forum Software - 社交化论坛系统',
				// 'Self-hosting Solutions & OS': 'Self-hosting Solutions & OS - 自托管解决方案与操作系统',
				// 'URL Shorteners': 'URL Shorteners - 短链生成器',
				// 'VPS': 'VPS - 虚拟专用服务器（VPS）',
				// 'Instant Messaging': 'Instant Messaging - 即时通讯',
				// 'Uncategorized': 'Uncategorized - 未分类项目',
				'Z_all_png': 'Z_all_png - 1024【SVG → PNG】',
				'Z_all_png_other': 'Z_all_png_other【其它图】',
				'Z_all_svg': 'Z_all_svg - 1024【SVG】'
			};
			return titles[category] || category;
		};
		
		/**
		 * @Description 复制图标链接
		 */
		async function copyIconUrl(url: string) {
			let currenturl = window.location.href;
			let iconurl = data.publicPath + "icon/" + url;
			// let iconurlCdn = "https://cdn.jsdelivr.net/gh/oliver556/my-icons@main/dist/" + "icon/" + url; // CDN Url
			let iconurlCdn = "https://cdn.jsdelivr.net/gh/oliver556/my-icons@gh-pages/" + "icon/" + url; // CDN Url
			// let iconurlCdn = "https://github.viplee.top/https://raw.githubusercontent.com/oliver556/my-icons/refs/heads/main/dist/icon/" + url; // 套 CF
			// 备用 CDN Url
			// fastly.jsdelivr.net
			// gcore.jsdelivr.net
			// testingcf.jsdelivr.net
			// 自建 CF 加速转发
			// https://github.viplee.top/https://raw.githubusercontent.com/oliver556/my-icons/refs/heads/main/dist/icon/ + url
			// https://github.viplee.top/https://raw.githubusercontent.com/oliver556/my-icons/refs/heads/main/dist/icon/CMS/Halo_E.png
			let fullurl = currenturl.substr(0, currenturl.length - 2) + iconurl; // 本地 Url
			
			// console.log('图片文件全称(url): ', url);
			// console.log('当前环境路径(本地) currenturl: ', currenturl);
			// console.log('图片文件路径(iconurl): ', iconurl);
			// console.log('CDN 拼接后的路径(iconurlCdn): ', iconurlCdn);
			// console.log('当前环境拼接后的路径(fullurl): ', fullurl);
			await toClipboard(cdnValue.value ? iconurlCdn : fullurl);
			ElMessage({
				message: "图标链接复制成功",
				type: "success",
			});
		}
		
		/**
		 * @Description 打开相关链接
		 */
		function openUrl(url: string | URL | undefined) {
			window.open(url, "_blank");
		}
		
		onMounted(async () => {
			await fetchData();
		});
		
		/**
		 * @Description 暴力刷新所有 CDN 缓存
		 * 警告：这会向 jsDelivr 发送大量请求，请勿频繁点击
		 */
		const isPurging = ref(false); // 控制按钮加载状态
		const purgeProgress = ref(''); // 显示进度文字
		
		const purgeAllIcons = async () => {
			if (!confirm('确定要强制刷新所有图标的 CDN 缓存吗？\n这一步不需要修改 Sun-Panel 的链接，但需要几分钟生效。')) {
				return;
			}
			
			isPurging.value = true;
			const allItems: string[] = [];
			
			// 1. 扁平化所有图标数据，拿到完整路径
			// 遍历 rawData (你的原始数据)
			for (const category in rawData.value) {
				const items = rawData.value[category];
				items.forEach((item: any) => {
					// 拼接文件名: Category/Name.png
					const ext = item.type === 'svg' ? '.svg' : '.png';
					const path = `${category}/${item.name}${ext}`;
					allItems.push(path);
				});
			}
			
			const total = allItems.length;
			let count = 0;
			
			// 2. 循环发送 Purge 请求
			for (const filePath of allItems) {
				// 构造 Purge URL
				// 你的 CDN 结构是: .../my-icons@gh-pages/icon/...
				const purgeUrl = `https://purge.jsdelivr.net/gh/oliver556/my-icons@gh-pages/icon/${filePath}`;
				
				try {
					// mode: 'no-cors' 是关键，允许浏览器向 CDN 发送跨域请求
					// 虽然拿不到返回结果，但服务器会执行清除操作
					await fetch(purgeUrl, { mode: 'no-cors' });
				} catch (e) {
					console.error(`Purge error: ${filePath}`);
				}
				
				count++;
				purgeProgress.value = `正在刷新: ${count} / ${total}`;
				
				// 关键：限流，每张图停顿 100ms，防止被 CDN 封锁 IP
				await new Promise(resolve => setTimeout(resolve, 100));
			}
			
			isPurging.value = false;
			purgeProgress.value = '';
			ElMessage.success(`指令发送完毕！共刷新 ${total} 个图标。请等待约 5-10 分钟让全球节点生效。`);
		};
		
		/**
		 * @Description 刷新单张图片的 CDN 缓存
		 * @param category 分类名
		 * @param item 图标对象
		 */
		const purgeSingleIcon = async (category: string, item: any) => {
			// 1. 获取文件后缀和路径
			const ext = item.type === 'svg' ? '.svg' : '.png';
			const filename = `${item.name}${ext}`;
			const filePath = `${category}/${filename}`;
			debugger
			// 2. 构造 Purge URL
			const purgeUrl = `https://purge.jsdelivr.net/gh/oliver556/my-icons@gh-pages/icon/${filePath}`;
			
			try {
				// 3. 执行请求
				await fetch(purgeUrl, { mode: 'no-cors' });
				
				// 4. 成功提示
				// ElMessage.success(`已发送刷新指令: ${filename} \n请等待几分钟后生效。`);
				ElMessage.success(`已发送刷新指令: \n请等待几分钟后生效。`);
				
				// 【可选高阶技巧】如果你想让当前页面的这张图也立刻变，
				// 你需要在这里修改 img 的 src 加个时间戳，但这需要改动数据结构，
				// 鉴于你主要是为了 Sun-Panel，这里只做 CDN 清除足够了。
				
			} catch (e) {
				ElMessage.error(`刷新失败: ${filename}`);
				console.error(e);
			}
		};
		
		return {
			data,
			selectData,
			cdnValue,
			totalCategories,
			totalIcons,
			currentIcons,
			currentCategories,
			pluralize,
			getItemContent,
			formatCategoryTitle,
			copyIconUrl,
			openUrl,
			isPurging,
			purgeProgress,
			purgeAllIcons,
			purgeSingleIcon
		}
	}
})
</script>

<style lang="scss">
/* 颜色变量 */
$primary-color: #6366f1;
$secondary-color: #4f46e5;
$primary-1-color: #0d0f8c;
$secondary-2-color: #1d169c;
$bg-color: #f8fafc;
$text-dark: #1e293b;
$text-light: #64748b;
$white: #fff;
$bg: #F7F9FD;
$bg1: #000000;
$--g0: #1c2226;
$--g1: #4f5d69;
$--g4: #bcc9d2;
$--g5: #e0e6eb;
$--g6: #ecf0f4;
$--g7: #f8fafd;
// 暗黑
$dark-bg: #1a1a1a;
$dark-bg-2: #f0f0f0;
$dark-txt: #d4d4d8;
$dark-txt-2: #333;

* {
	box-sizing: border-box;
	margin: 0;
	padding: 0;
	font-family: 'Inter', system-ui, sans-serif;
}

html, body {
	overflow-x: hidden; // 禁止横向滚动
	max-width: 100vw;
	min-height: 100vh;
	//background: $dark-bg;
}

.icon-wrapper {
	
	display: flex;
	flex-direction: column;
	min-height: 100%;
	//height: 100%;
	overflow: auto; // 防止内容溢出
	position: relative;
	
	// 头部
	.icon-head {
		position: relative;
		padding: 2rem 1.5rem;
		background: linear-gradient(135deg, $primary-color, $secondary-color);
		//background: linear-gradient(135deg, $primary-1-color, $secondary-2-color);
		//background-color: $dark-bg;
		color: white;
		//box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		//border-bottom: 1px solid $dark-txt;
		
		&_title {
			font-size: 2.5rem;
			font-weight: 700;
			margin-bottom: 1rem;
			text-align: center;
		}
		
		&_txt {
			font-size: 1rem;
			opacity: 0.9;
			max-width: 800px;
			margin: 0 auto;
			//margin: 0 auto 1rem;
			text-align: center;
		}
		
		&_switch {
			flex-shrink: 0;
			width: auto;
			position: absolute;
			top: 2.8rem;
			right: 1rem;
			
			.el-switch {
				--el-switch-button-size: 20px;
				--el-switch-height: 26px;
			}
		}
		
		
		&_stats {
			text-align: center;
			font-size: 0.9rem;
			color: rgba(255, 255, 255, 0.8);
			margin-bottom: 1rem;
			
			span {
				display: inline-block;
				margin-left: 0.5rem;
				padding-left: 0.5rem;
				border-left: 1px solid rgba(255, 255, 255, 0.3);
			}
			
			@media (max-width: 768px) {
				font-size: 0.8rem;
				span {
					display: block;
					border-left: none;
					margin-left: 0;
					padding-left: 0;
					margin-top: 0.3rem;
				}
			}
		}
	}
	
	// 搜索区域
	.icon-search-wrapper {
		padding: 1.5rem 1.5rem 0;
		display: flex;
		gap: 1rem;
		align-items: center;
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
		
		//.icon-head_switch {
		//	flex-shrink: 0;
		//	width: auto;
		//
		//	.el-switch {
		//		--el-switch-button-size: 20px;
		//		--el-switch-height: 26px;
		//	}
		//}
		
		.icon-search-content {
			flex: 1;
			min-width: 0;
			
			.el-input {
				//display: flex;
				
				.el-input__inner {
					//background: $dark-bg;
					//color: $dark-txt;
				}
				
				.el-input__wrapper {
					//background-color: $dark-bg;
				}
				
				.el-input-group__prepend {
					//padding: 0;
					//border: none;
					background: transparent;
				}
				
				.el-select {
					//width: auto;
					//min-width: 100px;
					
					.el-input__wrapper {
						//padding: 0 15px;
					}
				}
				
				.el-input__wrapper {
					//border-radius: 8px !important;
				}
			}
		}
		
		@media (max-width: 768px) {
			flex-direction: column;
			padding: 1rem;
			
			.icon-search-wrapper {
				flex-direction: column-reverse;
			}
			
			.icon-search-content {
				width: 100%;
			}
			
			.el-select {
				width: 100% !important;
			}
			
			.el-input {
				.el-input-group__prepend {
					padding: 0;
				}
			}
		}
	}
	
	// 图片展示区域
	.icon-show-wrapper {
		padding: 2rem 1.5rem;
		flex: 1;
		width: 100%;
		overflow: hidden;
		min-height: 100%;
		
		.icon-show-block {
			margin-bottom: 2rem;
			width: 100%;
			background: $bg;
			//border-radius: .75rem;
			padding: 0.5rem 0.5rem 1rem;
			//border: 1px solid #ccc;
			border-radius: 20px;
			
			.icon-show-header {
				margin-bottom: 10px;
				display: flex;
				align-items: center;
				width: 100%;
				flex-wrap: wrap;
				
				> :not(:last-child) {
					margin-right: 10px;
				}
				
				&_title {
					font-weight: 700;
					color: $--g0;
					background-color: $--g6;
					border-radius: 8px;
					padding: 6px 10px;
					margin-bottom: 5px;
				}
				
				&_num {
					font-size: 15px;
					color: $--g1;
					//color: $dark-txt;
					margin-bottom: 5px;
				}
				
				&_line {
					height: 1px;
					flex: 1;
					min-width: 30%;
					background: $--g6;
					margin-bottom: 5px;
				}
			}
			
			.card {
				display: flex;
				flex-wrap: wrap;
				justify-content: flex-start;
				gap: 10px;
				width: 100%;
				
				&_content {
					width: 160px;
					//height: 100px;
					border-radius: 1.5rem;
					// todo
					//background-color: rgba(30, 128, 255, 0.1);
					background-color: #f8f9fa;
					border: 1px solid rgba(0, 0, 0, .1);
					box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
					transition: all 0.3s ease;
					padding: 1rem;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					cursor: pointer;
					position: relative;
					
					&:hover {
						//transform: translateY(-4px);
						//box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
					}
					
					&_txt {
						text-align: center;
						font-size: 0.7rem;
						color: #333;
						font-weight: bold;
					}
					
					.card_refresh_btn {
						position: absolute;
						top: 5px;
						right: 5px;
						width: 24px;
						height: 24px;
						line-height: 24px;
						text-align: center;
						background: rgba(255, 255, 255, 0.9);
						border-radius: 50%;
						font-size: 12px;
						cursor: pointer;
						box-shadow: 0 2px 4px rgba(0,0,0,0.1);
						color: #666;
						opacity: 0;           // 默认隐藏
						transform: scale(0.8);
						transition: all 0.2s ease;
						z-index: 10;          // 保证在图片上面
						
						&:hover {
							background: #fff;
							color: $primary-color; // 使用你的主色调
							transform: scale(1.1) rotate(180deg); // 悬停时稍微放大并旋转一下
						}
					}
					
					// 当鼠标悬停在卡片整体上时，显示按钮
					&:hover {
						.card_refresh_btn {
							opacity: 1;
							transform: scale(1);
						}
					}
				}
				
				.card_content_course {
					color: #79C576;
				}
				
				&_img {
					width: 64px;
					height: 64px;
					margin-bottom: 1rem;
					object-fit: contain;
					transition: all 0.3s ease;
					
					&:hover {
						transform: translateY(-4px);
						border-radius: 13px;
						box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
					}
				}
				
				&_txt {
					font-size: 0.9rem;
					color: $text-light;
					font-weight: 500;
					width: 100%;
					text-align: center;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}
		}
		
		.no-result {
			text-align: center;
			//color: $--g1;
			color: $dark-txt;
			padding: 2rem;
		}
		
		// 移动端适配 图片卡片部分
		@media (max-width: 768px) {
			padding: 0 1rem;
			
			.card {
				justify-content: center;
				gap: 0;
				
				&_content {
					width: calc(21% - 20px);
					height: auto;
					aspect-ratio: 1;
					padding: 0.5rem !important;
					margin: 5px;
				}
				
				&_img {
					width: 56px;
					height: 56px;
				}
			}
			
			.icon-show-header {
				&_title {
					font-size: 0.9rem;
				}
				
				&_num {
					font-size: 0.8rem;
				}
			}
		}
		
		@media (max-width: 480px) {
			.card {
				
				&_content {
					width: calc(33% - 10px);
				}
				
				&_txt {
					font-size: 0.8rem;
				}
			}
		}
	}
}

// Element Plus 组件样式覆盖
.el-select-dropdown {
	.el-select-dropdown__item {
		//white-space: nowrap;
		//overflow: hidden;
		//text-overflow: ellipsis;
		//padding: 0 20px;
	}
}

.icon-footer {
	margin-top: auto; // 关键：自动顶部边距使页脚始终在底部
	padding: 1.5rem;
	text-align: center;
	background: rgba($--g6, 0.8);
	backdrop-filter: blur(5px); // 毛玻璃效果
	border-top: 1px solid $--g5;
	z-index: 10;
	
	p {
		color: $--g1;
		font-size: 0.9rem;
		margin: 0;
		letter-spacing: 0.5px;
		line-height: 1.5;
		
		// 响应式调整
		@media (max-width: 768px) {
			font-size: 0.85rem;
		}
	}
	
	// 动画效果（可选）
	transition: all 0.3s ease;
	
	&:hover {
		background: rgba($--g6, 0.9);
	}
}

// 响应式断点处理
@media (max-width: 1200px) {
	.icon-wrapper {
		.icon-head {
			&_title {
				font-size: 2rem;
			}
			
			//&_txt {
			//	font-size: 0.8rem;
			//}
			
			&_switch {
				top: 2.5rem !important;
				right: 1rem;
			}
		}
	}
}

@media (max-width: 768px) {
	.card {
		gap: 0 !important;
	}
	
	.icon-wrapper {
		.icon-head {
			&_switch {
				top: 2.4rem !important;
				right: 1rem;
			}
		}
	}
}

@media (max-width: 480px) {
	.card {
		gap: 0 !important;
	}
	
	.icon-wrapper {
		.icon-head {
			padding: 1.5rem 1rem;
			
			&_title {
				font-size: 1.5rem;
			}
			
			&_txt {
				font-size: 0.9rem;
				margin: 0 auto;
				//margin: 0 auto 0.5rem;
			}
			
			&_switch {
				top: 1.5rem !important;
				right: 1rem;
			}
		}
	}
}

</style>
