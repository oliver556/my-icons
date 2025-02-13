<template>
	<div class="index">
		<div class="head">
			<h1 class="head_title">My Icon</h1>
			<h4 class="head_txt">
				提供在线图标链接，用于个人NAS设备显示使用，禁止用于商业用途
			</h4>
			
			<!-- 分类导航 -->
			<!--<div class="use">-->
			<!--	<el-image class="use_img" :src="require('../assets/docker.png')" />-->
			<!--	<div class="use_txt">Docker容器</div>-->
			<!--	<el-divider direction="vertical" />-->
			<!--	<el-image class="use_img" :src="require('../assets/router.png')" />-->
			<!--	<div class="use_txt">路由器</div>-->
			<!--	<el-divider direction="vertical" />-->
			<!--	<el-image class="use_img" :src="require('../assets/vms.png')" />-->
			<!--	<div class="use_txt">虚拟机</div>-->
			<!--	<el-divider direction="vertical" />-->
			<!--	<el-image class="use_img" :src="require('../assets/project.png')" />-->
			<!--	<div class="use_txt">项目</div>-->
			<!--	<el-divider direction="vertical" />-->
			<!--	<el-image class="use_img" :src="require('../assets/other.png')" />-->
			<!--	<div class="use_txt">其他</div>-->
			<!--	<el-divider direction="vertical" />-->
			<!--	<el-image class="use_img" :src="require('../assets/uncategorized.png')" />-->
			<!--	<div class="use_txt">未分类</div>-->
			<!--</div>-->
			
			<!-- 搜索区域 -->
			<div class="search-container">
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
					color="#6366f1"
				/>
			</div>
		</div>
		
		<!-- 内容区域 -->
		<div class="content">
			<div class="content_head">
				<div class="content_title">{{ data.selectlabel }}</div>
				<div class="content_sum">{{ data.icondata.length }}</div>
				<el-switch class="cdn" v-model="value1" active-text="CDN"/>
			</div>
			
			<!-- 骨架屏 -->
			<el-space wrap v-if="isLoading">
				<div
					v-for="n in 12"
					:key="n"
					class="skeleton-card"
				/>
			</el-space>
			
			<!-- 图标卡片 -->
			<el-space wrap v-else>
				<div
					v-for="(item, index) in data.icondata"
					:key="改版1"
					class="card"
					@click="handleClick(item.name + (item.type === 'svg' ? '.svg' : '.png'))"
				>
					<el-tooltip class="item" effect="dark" :content="getItemContent(item)" placement="top">
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
		
		<!-- 页脚 -->
		<div class="foot">
			<div class="foot_txt">© 2024.12.05 | By Jamison Lee</div>
			<div class="foot_url">
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
import { defineComponent, reactive, onMounted, ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import clipboard3 from "vue-clipboard3";
import { ElMessage } from "element-plus";

export default defineComponent({
  setup() {
    const { toClipboard } = clipboard3();
    const value1 = ref(false);
		const isLoading = ref(true);
    const data = reactive({
      selectlabel: "全部",
      selectvalue: "",
      search: "",
      icondata: [] as any,
      publicPath: process.env.BASE_URL,
    });

    // 加载数据
    onMounted(async () => {
			try {
				let arr = await readLocalFile();
				data.icondata = arr;
			} finally {
				isLoading.value = false;
			}
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
			isLoading,
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
/* 颜色变量 */
$primary-color: #6366f1;
$secondary-color: #4f46e5;
$bg-color: #f8fafc;
$text-dark: #1e293b;
$text-light: #64748b;

* {
	box-sizing: border-box;
	margin: 0;
	padding: 0;
	font-family: 'Inter', system-ui, sans-serif;
}

.index {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	background: $bg-color;
}

.head {
	padding: 2rem 1.5rem;
	background: linear-gradient(135deg, $primary-color, $secondary-color);
	color: white;
	box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	
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
		margin: 0 auto 2rem;
		text-align: center;
	}
}

.use {
	margin: 2rem auto 0;
	max-width: 1200px;
	padding: 1rem;
	background: rgba(255,255,255,0.1);
	border-radius: 1rem;
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	justify-content: center;
	
	&_item {
		display: flex;
		align-items: center;
		padding: 0.5rem 1rem;
		border-radius: 999px;
		background: rgba(255,255,255,0.15);
		transition: all 0.3s ease;
		cursor: pointer;
		
		&:hover {
			background: rgba(255,255,255,0.25);
			transform: translateY(-2px);
		}
	}
	&_img {
		width:  30px;
		height: 30px;
	}
	
	@media (max-width: 768px) {
		overflow-x: auto;
		justify-content: flex-start;
		padding: 1rem 0.5rem;
		
		&_item {
			flex-shrink: 0;
		}
	}
}

.search-container {
	max-width: 800px;
	margin: 2rem auto 0;
	display: flex;
	gap: 1rem;
	
	.search {
		flex: 1;
		
		.el-input__wrapper {
			border-radius: 999px !important;
			padding: 0 1.5rem;
			box-shadow: 0 1px 3px rgba(0,0,0,0.1);
		}
	}
	
	.bt_search {
		border-radius: 999px;
		padding: 0 2rem;
		transition: all 0.3s ease;
		
		&:hover {
			transform: scale(1.05);
		}
	}
	
	@media (max-width: 640px) {
		flex-direction: column;
		
		.select {
			width: 100% !important;
		}
	}
}

.content {
	flex: 1;
	padding: 2rem 1.5rem;
	max-width: 1400px;
	margin: 0 auto;
	
	&_head {
		margin-bottom: 2rem;
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	
	.card {
		width: 160px;
		height: 160px;
		border-radius: 1.5rem;
		background: white;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		
		&:hover {
			transform: translateY(-4px);
			box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
		}
		
		&_img {
			width: 64px;
			height: 64px;
			margin-bottom: 1rem;
			transition: transform 0.3s ease;
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
	
	@media (max-width: 768px) {
		.card {
			width: 140px;
			height: 140px;
			padding: 1rem;
		}
	}
	
	@media (max-width: 480px) {
		.card {
			width: calc(50% - 0.5rem);
			height: auto;
			aspect-ratio: 1;
		}
	}
}

.skeleton-card {
	width: 160px;
	height: 160px;
	border-radius: 1.5rem;
	background: linear-gradient(
			90deg,
			rgba(241, 245, 249, 0.5) 25%,
			rgba(241, 245, 249, 1) 50%,
			rgba(241, 245, 249, 0.5) 75%
	);
	background-size: 400% 100%;
	animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
	0% { background-position: 100% 50%; }
	100% { background-position: 0 50%; }
}

.foot {
	padding: 2rem 1.5rem;
	background: $text-dark;
	color: rgba(255,255,255,0.8);
	margin-top: auto;
	
	&_txt {
		text-align: center;
		margin-bottom: 1rem;
	}
	
	&_url {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		
		.foot_img {
			width: 24px;
			height: 24px;
			transition: transform 0.3s ease;
			cursor: pointer;
			
			&:hover {
				transform: scale(1.2);
			}
		}
	}
}
</style>
