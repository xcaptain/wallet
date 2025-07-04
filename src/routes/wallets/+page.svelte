<script lang="ts">
    let { data } = $props();
    
    let wallets = $derived(data.wallets);
    
    // 创建钱包的模态框状态
    let showCreateModal = $state(false);
    let isCreating = $state(false);
    
    // 创建钱包的函数
    async function createWallet() {
        isCreating = true;
        try {
            // TODO: 调用 Circle API 创建钱包
            console.log('创建钱包...');
            
            // 模拟创建过程
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 成功后关闭模态框并刷新页面
            showCreateModal = false;
            window.location.reload();
        } catch (error) {
            console.error('创建钱包失败:', error);
            alert('创建钱包失败，请重试');
        } finally {
            isCreating = false;
        }
    }
</script>

<svelte:head>
    <title>我的钱包 - IntuiPay</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
    <!-- 页面头部 -->
    <div class="flex justify-between items-center mb-8">
        <div>
            <h1 class="text-3xl font-bold">我的钱包</h1>
            <p class="text-base-content/70 mt-2">管理您的数字资产</p>
        </div>
        
        <button 
            class="btn btn-primary"
            onclick={() => showCreateModal = true}
        >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            创建钱包
        </button>
    </div>

    <!-- 钱包列表 -->
    {#if wallets.length === 0}
        <!-- 空状态 -->
        <div class="text-center py-16">
            <div class="mx-auto w-24 h-24 bg-base-200 rounded-full flex items-center justify-center mb-6">
                <svg class="w-12 h-12 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">还没有钱包</h3>
            <p class="text-base-content/70 mb-6">创建您的第一个钱包开始管理数字资产</p>
            <button 
                class="btn btn-primary btn-lg"
                onclick={() => showCreateModal = true}
            >
                创建我的第一个钱包
            </button>
        </div>
    {:else}
        <!-- 钱包网格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each wallets as wallet}
                <div class="card bg-base-200 shadow-xl">
                    <div class="card-body">
                        <h3 class="card-title">{wallet.name}</h3>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-sm opacity-70">余额</span>
                                <span class="font-semibold">{wallet.balance} {wallet.currency}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm opacity-70">地址</span>
                                <span class="text-sm font-mono">{wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}</span>
                            </div>
                        </div>
                        <div class="card-actions justify-end mt-4">
                            <button class="btn btn-sm btn-outline">查看详情</button>
                            <button class="btn btn-sm btn-primary">发送</button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<!-- 创建钱包模态框 -->
{#if showCreateModal}
    <div class="modal modal-open">
        <div class="modal-box">
            <h3 class="font-bold text-lg mb-4">创建新钱包</h3>
            
            <div class="space-y-4">
                <div class="alert alert-info">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>我们将为您创建一个基于 Circle Wallet 的安全钱包</span>
                </div>
                
                <div class="form-control">
                    <label class="label" for="wallet-name">
                        <span class="label-text">钱包名称</span>
                    </label>
                    <input 
                        id="wallet-name"
                        type="text" 
                        placeholder="输入钱包名称" 
                        class="input input-bordered"
                        value="我的钱包"
                    />
                </div>
                
                <div class="form-control">
                    <label class="label" for="blockchain-select">
                        <span class="label-text">选择区块链</span>
                    </label>
                    <select id="blockchain-select" class="select select-bordered">
                        <option>Ethereum</option>
                        <option>Polygon</option>
                        <option>Arbitrum</option>
                    </select>
                </div>
            </div>
            
            <div class="modal-action">
                <button 
                    class="btn btn-ghost" 
                    onclick={() => showCreateModal = false}
                    disabled={isCreating}
                >
                    取消
                </button>
                <button 
                    class="btn btn-primary" 
                    onclick={createWallet}
                    disabled={isCreating}
                >
                    {#if isCreating}
                        <span class="loading loading-spinner loading-sm"></span>
                        创建中...
                    {:else}
                        创建钱包
                    {/if}
                </button>
            </div>
        </div>
    </div>
{/if}
