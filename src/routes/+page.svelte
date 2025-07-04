<script lang="ts">	
	let { data } = $props();
	
	let session = $derived(data.session);
</script>

<svelte:head>
	<title>IntuiPay - Web3 钱包解决方案</title>
	<meta name="description" content="基于 Circle Wallet 的下一代 Web3 钱包，提供安全、便捷的数字资产管理体验" />
</svelte:head>

<!-- Hero Section -->
<div class="hero min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">
				<span class="text-primary">Intui</span>Pay
			</h1>
			<p class="py-6 text-lg">
				基于 Circle Wallet 基础架构的下一代 Web3 钱包，让数字资产管理变得简单直观
			</p>
			{#if session?.user}
				<a href="/wallets" class="btn btn-primary btn-lg">
					进入钱包
					<svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
					</svg>
				</a>
			{:else}
				<form method="POST" action="/auth/signin/google">
					<button type="submit" class="btn btn-primary btn-lg">
						<svg class="w-5 h-5" viewBox="0 0 24 24">
							<path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
							<path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
							<path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
							<path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
						</svg>
						开始使用
					</button>
				</form>
			{/if}
		</div>
	</div>
</div>

<!-- Features Section -->
<div class="py-24 bg-base-100">
	<div class="container mx-auto px-4">
		<div class="text-center mb-16">
			<h2 class="text-3xl font-bold mb-4">为什么选择 IntuiPay？</h2>
			<p class="text-lg opacity-70">我们提供最安全、最便捷的 Web3 钱包体验</p>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body text-center">
					<div class="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
						<svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
						</svg>
					</div>
					<h3 class="card-title justify-center">安全可靠</h3>
					<p>基于 Circle Wallet 企业级安全架构，双重验证保护您的资产</p>
				</div>
			</div>
			
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body text-center">
					<div class="mx-auto w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
						<svg class="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
						</svg>
					</div>
					<h3 class="card-title justify-center">即时交易</h3>
					<p>快速便捷的交易体验，无需安装插件或扫描二维码</p>
				</div>
			</div>
			
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body text-center">
					<div class="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
						<svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
						</svg>
					</div>
					<h3 class="card-title justify-center">多应用集成</h3>
					<p>内置 dApp 市场，一站式访问各种去中心化应用</p>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- How it Works Section -->
<div class="py-24 bg-base-200">
	<div class="container mx-auto px-4">
		<div class="text-center mb-16">
			<h2 class="text-3xl font-bold mb-4">如何开始？</h2>
			<p class="text-lg opacity-70">三步即可开始使用您的数字钱包</p>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<div class="text-center">
				<div class="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6 text-white text-2xl font-bold">
					1
				</div>
				<h3 class="text-xl font-bold mb-2">登录授权</h3>
				<p class="opacity-70">使用 Google 账号快速登录，安全便捷</p>
			</div>
			
			<div class="text-center">
				<div class="mx-auto w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6 text-white text-2xl font-bold">
					2
				</div>
				<h3 class="text-xl font-bold mb-2">创建钱包</h3>
				<p class="opacity-70">自动创建您的专属钱包，设置安全 PIN 码</p>
			</div>
			
			<div class="text-center">
				<div class="mx-auto w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-6 text-white text-2xl font-bold">
					3
				</div>
				<h3 class="text-xl font-bold mb-2">开始交易</h3>
				<p class="opacity-70">通过 PIN 验证确认交易，安全管理您的资产</p>
			</div>
		</div>
	</div>
</div>

<!-- CTA Section -->
<div class="py-24 bg-gradient-to-r from-primary to-secondary">
	<div class="container mx-auto px-4 text-center text-white">
		<h2 class="text-3xl font-bold mb-4">准备好体验未来的钱包了吗？</h2>
		<p class="text-lg mb-8 opacity-90">加入我们，开启您的 Web3 之旅</p>
		{#if !session?.user}
			<form method="POST" action="/auth/signin/google">
				<button type="submit" class="btn btn-white btn-lg">
					<svg class="w-5 h-5" viewBox="0 0 24 24">
						<path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
						<path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
						<path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
						<path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
					</svg>
					立即开始
				</button>
			</form>
		{/if}
	</div>
</div>
