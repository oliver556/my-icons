<template>
	<div class="index">
		<div class="head">
			<h1 class="head_title">My Icon</h1>
			<h4 class="head_txt">
				提供在线图标链接，用于个人NAS设备显示使用，禁止用于商业用途
			</h4>
			<!--<h4 class="head_txt">开源项目，By Siriling</h4>-->
			<div class="use">
				<el-image class="use_img" :src="require('../assets/docker.png')" />
				<div class="use_txt">Docker容器</div>
				<el-divider direction="vertical" />
				<el-image class="use_img" :src="require('../assets/router.png')" />
				<div class="use_txt">路由器</div>
				<el-divider direction="vertical" />
				<el-image class="use_img" :src="require('../assets/vms.png')" />
				<div class="use_txt">虚拟机</div>
				<el-divider direction="vertical" />
				<el-image class="use_img" :src="require('../assets/project.png')" />
				<div class="use_txt">项目</div>
				<el-divider direction="vertical" />
				<el-image class="use_img" :src="require('../assets/other.png')" />
				<div class="use_txt">其他</div>
				<el-divider direction="vertical" />
				<el-image class="use_img" :src="require('../assets/uncategorized.png')" />
				<div class="use_txt">未分类</div>
			</div>
			<el-input
				v-model="data.search"
				placeholder="搜索图标"
				class="search"
				size="large"
				@keyup.enter="handleSearch"
			>
				<template #prepend>
					<el-select
						class="select"
						@change="handleSelect"
						v-model="data.selectvalue"
						placeholder="全部"
						style="width: 115px"
						size="large"
						clearable
					>
						<el-option label="容器" value="1" />
						<el-option label="路由器" value="2" />
						<el-option label="虚拟机" value="3" />
						<el-option label="项目" value="4" />
						<el-option label="技术栈" value="5" />
						<el-option label="其他" value="98" />
						<el-option label="未分类" value="99" />
					</el-select>
				</template>
			</el-input>
			
			<el-button
				class="bt_search"
				:icon="Search"
				@click="handleSearch"
				round
				size="large"
				color="#dcab78"
			/>
		</div>
		
		<div class="content">
			<div class="content_head">
				<div class="content_title">{{ data.selectlabel }}</div>
				<div class="content_sum">{{ data.icondata.length }}</div>
				<el-switch class="cdn" v-model="value1" active-text="CDN"/>
			</div>
			<el-space wrap>
				<div
					v-for="(item, index) in data.icondata"
					:key="index"
					class="card"
					@click="handleClick(item.name + (item.type === 'svg' ? '.svg' : '.png'))"
				>
					<el-tooltip class="item" effect="dark" :content=getItemContent(item) placement="top">
						<el-image
							v-if="item.type === 'svg'"
							lazy
							class="card_img"
							alt="SVG Image"
							:src="data.publicPath + 'icon/' + item.name + '.svg'"
						/>
						<el-image
							v-else
							lazy
							class="card_img"
							:src="data.publicPath + 'icon/' + item.name + '.png'"
						/>
					</el-tooltip>
					<div class="card_txt" @click="openUrl(item.course)">
						{{ item.name }}
					</div>
				</div>
			</el-space>
		</div>
		
		<div class="foot">
			<div class="foot_txt">© 2024.12.05 | By Jamison Lee</div>
			<div class="foot_url">
				<!--微信-->
				<!--<el-popover placement="top" :width="150">-->
				<!--  <template #reference>-->
				<!--    <el-image class="foot_img" :src="require('../assets/wechat.png')" />-->
				<!--  </template>-->
				<!--  <el-image class="qrcode_img" :src="require('../assets/qrcode.png')" />-->
				<!--</el-popover>-->
				
				<!--Gitee-->
				<!--<el-image-->
				<!--  class="foot_img"-->
				<!--  :src="require('../assets/gitee.png')"-->
				<!--  @click="openUrl('https://gitee.com/Siriling/my-icon')"-->
				<!--/>-->
				
				<!-- GitHub -->
				<el-image
					class="foot_img"
					:src="require('../assets/github.png')"
					@click="openUrl('https://github.com/oliver556/my-icons')"
				/>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted } from "vue";
import { Search } from "@element-plus/icons-vue";
import clipboard3 from "vue-clipboard3";
import { ElMessage } from "element-plus";
import { ref } from 'vue';

export default defineComponent({
	setup() {
		const { toClipboard } = clipboard3();
		const value1 = ref(false);
		const data = reactive({
			selectlabel: "全部",
			selectvalue: "",
			search: "",
			icondata: [] as any,
			publicPath: process.env.BASE_URL,
		});
		
		// 加载数据
		onMounted(async () => {
			let arr = await readLocalFile();
			data.icondata = arr;
		});
		
		// 读取本地的图片
		function readLocalFile() {
			return new Promise((resolve, reject) => {
				fetch(data.publicPath + "db.json?"+ new Date().getTime() )
					.then((response) => response.json())
					.then((data) => {
						// 进行排序操作
						function sortprice(a, b) {
							return a.name.localeCompare(b.name);
						}
						data.sort(sortprice);
						resolve(data);
					})
					.catch((error) => {
						reject(error);
					});
			});
		}
		
		// 选择,获取分类数据
		async function handleSelect(value) {
			let filteredData;
			let tempdata = (await readLocalFile()) as any;
			if (value == 1) {
				data.selectlabel = "容器";
				filteredData = tempdata.filter((item) => item.sort == "docker");
			} else if (value == 2) {
				data.selectlabel = "路由器";
				filteredData = tempdata.filter((item) => item.sort == "router");
			} else if (value == 3) {
				data.selectlabel = "虚拟机";
				filteredData = tempdata.filter((item) => item.sort == "vms");
			} else if (value == 4) {
				data.selectlabel = "项目";
				filteredData = tempdata.filter((item) => item.sort == "project");
			} else if (value == 5) {
				data.selectlabel = "技术栈";
				filteredData = tempdata.filter((item) => item.sort == "technology");
			} else if (value == 98) {
				data.selectlabel = "其他";
				filteredData = tempdata.filter((item) => item.sort == "other");
			} else if (value == 99) {
				data.selectlabel = "未分类";
				filteredData = tempdata.filter((item) => item.sort == "uncategorized");
			} else {
				data.selectlabel = "全部";
				filteredData = tempdata;
			}
			data.icondata = filteredData;
		}
		
		// 搜索
		async function handleSearch() {
			let keyword = data.search;
			let filteredData;
			let sort = data.selectvalue as any;
			let tempdata = (await readLocalFile()) as any;
			if (sort == 1) {
				filteredData = tempdata.filter((item) => item.sort == "docker");
			} else if (sort == 2) {
				filteredData = tempdata.filter((item) => item.sort == "router");
			} else if (sort == 3) {
				filteredData = tempdata.filter((item) => item.sort == "vms");
			} else if (sort == 4) {
				filteredData = tempdata.filter((item) => item.sort == "project");
			} else if (sort == 5) {
				filteredData = tempdata.filter((item) => item.sort == "technology");
			} else if (sort == 98) {
				filteredData = tempdata.filter((item) => item.sort == "other");
			} if (sort == 99) {
				filteredData = tempdata.filter((item) => item.sort == "uncategorized");
			} else {
				filteredData = tempdata;
			}
			let arr = [] as any;
			for (var i = 0; i < filteredData.length; i++) {
				if (filteredData[i].name.toLocaleLowerCase().indexOf(keyword.toLocaleLowerCase()) >= 0) {
					arr.push(filteredData[i]);
				}
			}
			data.icondata = arr;
		}
		
		// 按钮
		async function handleClick(url) {
			// 获取图片 url
			let currenturl = window.location.href;
			let iconurl = data.publicPath + "icon/" + url;
			let iconurlCdn = "https://cdn.jsdelivr.net/gh/oliver556/my-icons@main/dist/" + "icon/" + url; // CDN Url
			let fullurl = currenturl.substr(0, currenturl.length - 2) + iconurl; // 本地 Url
			
			console.log('图片文件全称(url): ', url);
			console.log('当前环境路径(本地) currenturl: ', currenturl);
			console.log('图片文件路径(iconurl): ', iconurl);
			console.log('CDN 拼接后的路径(iconurlCdn): ', iconurlCdn);
			console.log('当前环境拼接后的路径(fullurl): ', fullurl);
			await toClipboard(value1.value ? iconurlCdn : fullurl);
			ElMessage({
				message: "图标链接复制成功",
				type: "success",
			});
		}
		
		// 打开url
		function openUrl(url) {
			window.open(url, "_blank");
		}
		
		function getItemContent(item: { name: any; type: string; }) {
			return `${item.name}${item.type === 'svg' ? '.svg' : '.png'}`;
		}
		
		return {
			data,
			value1,
			handleClick,
			handleSearch,
			handleSelect,
			openUrl,
			getItemContent,
			//图标
			Search,
		};
	},
});
</script>
<style lang="scss">
.index {
	height: 100%;
}
.head {
	padding: 20px 50px 50px;
	background-color: #f5f7fc;
}

.head_title {
	font-weight: 400;
	margin-bottom: 20px;
}
.head_txt {
	color: #5d667a;
	font-weight: 400;
	margin-bottom: -10px;
}
.use {
	margin-top: 50px;
	color: #5d667a;
	display: flex;
	align-items: center;
}
.use_img {
	width: 30px;
	height: 30px;
}
.use_txt {
	font-size: 16px;
	margin-left: 10px;
	margin-right: 20px;
	cursor: pointer;
}
.el-divider {
	margin-left: 10px;
	margin-right: 20px;
}
// 搜索
.search {
	margin-top: 50px;
	width: 400px;
}

.search .el-input__wrapper {
	border-radius: 0 50px 50px 0 !important;
}
.select .el-input__wrapper {
	border-radius: 50px 0 0 50px !important;
}

.el-input-group__prepend {
	box-shadow: none;
}
.bt_search {
	margin-top: 50px;
	margin-left: 10px;
	color: #ffffff;
}
.bt_search:hover {
	color: #ffffff;
}

//主体
.content {
	padding: 50px;
	min-height: calc(100% - 535px);
}
.content_head {
	display: flex;
	align-items: center;
	margin-bottom: 30px;
}
.content_title {
	font-weight: 600;
	font-size: 18px;
	color: #1a2947;
}
.content_sum {
	padding: 3px 5px;
	border-radius: 5px;
	font-size: 14px;
	margin-left: 8px;
	color: #5d667a;
	background-color: #f5f7fc;
}
.card {
	cursor: pointer;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 120px;
	width: 120px;
	border-radius: 10px;
	//border: 1px solid #f5f7fc;
	border: 1px solid rgba(42, 42, 42, 0.42);
}
.card:hover {
	// border: 1px solid #f5f7fc;
	box-shadow: 0 8px 24px #1a29470a, 0 2px 8px #1a294714;
}
.card_img {
	width: 45px;
	height: 45px;
}
.card_txt {
	text-align: center;
	color: #afb7c7;
	margin-top: 2px;
	font-size: 13px;
	//省略号
	width: 80px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

//底部
.foot {
	display: flex;
	justify-content: center;
	align-items: center;
	padding-bottom: 20px;
	font-size: 13px;
	color: #5d667a;
	// position: relative;
}
.foot_txt {
	margin-right: 50px;
	font-weight: lighter;
}
.foot_url {
	position: absolute;
	right: 80px;
}
.qrcode_img {
	width: 125px;
	height: 125px;
}
.foot_img {
	cursor: pointer;
	width: 18px;
	height: 18px;
	margin: 0 15px;
}
.cdn{
	padding-left: 25px;
}
</style>
