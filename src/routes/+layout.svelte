<script lang="ts">
	import '../app.css';

	
	let { children, data } = $props();
	
	let session = $derived(data.session);
</script>

<div class="min-h-screen bg-base-100">
	<!-- 导航栏 -->
	<div class="navbar bg-base-100 border-b border-base-300">
		<div class="navbar-start">
			<a href="/" class="btn btn-ghost text-xl font-bold">
				<span class="text-primary">Intui</span>Pay
			</a>
		</div>
		
		<div class="navbar-end">
			{#if session?.user}
				<div class="dropdown dropdown-end">
					<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
						<div class="w-10 rounded-full">
							<img 
								alt="User avatar" 
								src={session.user.image || '/favicon.png'} 
							/>
						</div>
					</div>
					<ul class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
						<li><span class="font-medium">{session.user.name}</span></li>
						<li><span class="text-sm opacity-70">{session.user.email}</span></li>
						<li><hr class="my-2"></li>
						<li><a href="/wallets">我的钱包</a></li>
						<li><a href="/settings">设置</a></li>
						<li>
							<form method="POST" action="/auth/signout">
								<button type="submit" class="w-full text-left">登出</button>
							</form>
						</li>
					</ul>
				</div>
			{:else}
				<form method="POST" action="/auth/signin/google">
					<button type="submit" class="btn btn-primary">
						<svg class="w-5 h-5" viewBox="0 0 24 24">
							<path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
							<path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
							<path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
							<path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
						</svg>
						Google 登录
					</button>
				</form>
			{/if}
		</div>
	</div>

	<!-- 主要内容 -->
	<main>
		{@render children()}
	</main>

	<!-- 页脚 -->
	<footer class="footer footer-center p-10 bg-base-200 text-base-content">
		<aside>
			<p class="font-bold">
				<span class="text-primary">Intui</span>Pay
			</p>
			<p>基于 Circle Wallet 的 Web3 钱包解决方案</p>
			<p>Copyright © 2025 - All rights reserved</p>
		</aside>
	</footer>
</div>
