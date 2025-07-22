<script lang="ts">
    import { enhance } from "$app/forms";
    import type { PageProps } from "./$types";
    import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
    import { onMount } from "svelte";

    // circle w3s sdk
    let sdk: W3SSdk | undefined;

    onMount(() => {
        // 初始化 SDK
        sdk = new W3SSdk({
            appSettings: {
                appId: "d0c6a643-72f9-5f52-a52d-edbbc51c3561",
            },
        });
    });

    let { data, form }: PageProps = $props();

    let wallets = $derived(data.wallets);
    
    // 当前选中的钱包（默认第一个）
    let currentWallet = $derived(wallets.length > 0 ? wallets[0] : null);
    let selectedWalletIndex = $state(0);

    // 更新当前钱包
    $effect(() => {
        if (wallets.length > 0 && selectedWalletIndex < wallets.length) {
            currentWallet = wallets[selectedWalletIndex];
        }
    });

    let isCreating = $state(false);

    // 表单字段
    let walletName = $state("我的钱包");
    let blockchain = $state("ETH-SEPOLIA");

    // 模态框引用
    let createWalletModal: HTMLDialogElement;
    
    // 网络选择下拉菜单状态
    let isNetworkDropdownOpen = $state(false);

    // 打开模态框
    function openCreateModal() {
        createWalletModal.showModal();
    }

    // 关闭模态框
    function closeCreateModal() {
        createWalletModal.close();
    }

    // 切换网络下拉菜单
    function toggleNetworkDropdown() {
        isNetworkDropdownOpen = !isNetworkDropdownOpen;
    }

    // 选择钱包/网络
    function selectWallet(index: number) {
        selectedWalletIndex = index;
        isNetworkDropdownOpen = false;
    }

    // 获取区块链显示名称
    function getBlockchainDisplayName(blockchain: string) {
        const blockchainNames: Record<string, string> = {
            'ETH': 'Ethereum',
            'ETH-SEPOLIA': 'Ethereum Sepolia',
            'MATIC': 'Polygon',
            'MATIC-AMOY': 'Polygon Amoy',
            'ARB': 'Arbitrum',
            'ARB-SEPOLIA': 'Arbitrum Sepolia',
            'AVAX': 'Avalanche',
            'AVAX-FUJI': 'Avalanche Fuji',
            'SOL': 'Solana',
            'SOL-DEVNET': 'Solana Devnet',
            'BASE': 'Base',
            'BASE-SEPOLIA': 'Base Sepolia',
            'OP': 'Optimism',
            'OP-SEPOLIA': 'Optimism Sepolia'
        };
        return blockchainNames[blockchain] || blockchain;
    }

    // 点击外部关闭下拉菜单
    function handleOutsideClick(event: Event) {
        if (isNetworkDropdownOpen && !(event.target as Element).closest('.network-dropdown')) {
            isNetworkDropdownOpen = false;
        }
    }
</script>

<svelte:head>
    <title>我的钱包 - IntuiPay</title>
</svelte:head>

<svelte:window on:click={handleOutsideClick} />

<div class="container mx-auto px-4 py-8 max-w-md">
    {#if wallets.length === 0}
        <!-- 空状态 -->
        <div class="text-center py-16">
            <div
                class="mx-auto w-24 h-24 bg-base-200 rounded-full flex items-center justify-center mb-6"
            >
                <svg
                    class="w-12 h-12 text-base-content/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">还没有钱包</h3>
            <p class="text-base-content/70 mb-6">
                添加您的第一个网络开始管理数字资产
            </p>
            <button class="btn btn-primary btn-lg" onclick={openCreateModal}>
                添加网络
            </button>
        </div>
    {:else}
        <!-- MetaMask 风格的钱包界面 -->
        <div class="card bg-base-100 shadow-xl border">
            <!-- 顶部导航栏 -->
            <div class="card-body p-0">
                <div class="flex items-center justify-between p-4 border-b">
                    <h1 class="text-lg font-semibold">钱包</h1>
                    
                    <!-- 网络选择器 -->
                    <div class="relative network-dropdown">
                        <button 
                            class="btn btn-ghost btn-sm flex items-center gap-2"
                            onclick={toggleNetworkDropdown}
                        >
                            <div class="w-3 h-3 rounded-full bg-success"></div>
                            <span class="text-sm">{getBlockchainDisplayName(currentWallet?.blockchain || '')}</span>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        
                        <!-- 网络选择下拉菜单 -->
                        {#if isNetworkDropdownOpen}
                            <div class="absolute right-0 top-full mt-1 w-64 bg-base-100 border rounded-lg shadow-lg z-50">
                                <div class="p-2">
                                    <div class="text-sm font-medium p-2">选择网络</div>
                                    {#each wallets as wallet, index}
                                        <button 
                                            class="w-full text-left p-2 hover:bg-base-200 rounded flex items-center gap-3"
                                            onclick={() => selectWallet(index)}
                                            class:bg-base-200={index === selectedWalletIndex}
                                        >
                                            <div class="w-3 h-3 rounded-full bg-success"></div>
                                            <div class="flex-1">
                                                <div class="text-sm font-medium">{getBlockchainDisplayName(wallet.blockchain)}</div>
                                                <div class="text-xs opacity-60">{wallet.name}</div>
                                            </div>
                                            {#if index === selectedWalletIndex}
                                                <svg class="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                                </svg>
                                            {/if}
                                        </button>
                                    {/each}
                                    
                                    <div class="border-t my-2"></div>
                                    <button 
                                        class="w-full text-left p-2 hover:bg-base-200 rounded flex items-center gap-3 text-primary"
                                        onclick={openCreateModal}
                                    >
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span class="text-sm">添加网络</span>
                                    </button>
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>

                {#if currentWallet}
                    <!-- 钱包信息区域 -->
                    <div class="p-6 text-center">
                        <!-- 头像/图标 -->
                        <div class="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>

                        <!-- 钱包名称 -->
                        <h2 class="text-xl font-semibold mb-2">{currentWallet.name}</h2>
                        
                        <!-- 地址 -->
                        <button class="btn btn-ghost btn-sm text-xs font-mono mb-6">
                            {currentWallet.address.slice(0, 6)}...{currentWallet.address.slice(-4)}
                            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>

                        <!-- 余额 -->
                        <div class="mb-8">
                            <div class="text-3xl font-bold mb-1">
                                -- <span class="text-lg text-base-content/70">余额</span>
                            </div>
                            <div class="text-sm text-base-content/50">正在加载余额信息...</div>
                        </div>

                        <!-- 操作按钮 -->
                        <div class="flex gap-4 justify-center">
                            <button class="btn btn-primary flex-1">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                发送
                            </button>
                            <button class="btn btn-outline flex-1">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                银行卡充值
                            </button>
                        </div>
                    </div>

                    <!-- 交易历史区域 -->
                    <div class="border-t">
                        <div class="p-4">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="font-medium">最近活动</h3>
                                <button class="text-sm text-primary">查看全部</button>
                            </div>
                            
                            <!-- 暂无交易 -->
                            <div class="text-center py-8">
                                <div class="w-12 h-12 bg-base-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                                    <svg class="w-6 h-6 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p class="text-sm text-base-content/60">暂无交易记录</p>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>

<!-- 创建钱包模态框 -->
<dialog bind:this={createWalletModal} class="modal">
    <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">添加新网络</h3>

        <!-- 显示错误信息 -->
        {#if form?.message && !form?.success}
            <div class="alert alert-error mb-4">
                <svg
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <span>{form.message}</span>
            </div>
        {/if}

        <!-- 显示成功信息 -->
        {#if form?.success}
            <div class="alert alert-success mb-4">
                <svg
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                    />
                </svg>
                <span>{form.message}</span>
            </div>
        {/if}

        <form
            method="POST"
            action="?/create"
            use:enhance={() => {
                isCreating = true;
                return async ({ result, update }) => {
                    await update();
                    isCreating = false;

                    // 如果成功，关闭模态框并重置表单
                    if (result.type === "success") {
                        const responseData = result.data;
                        console.log("Wallet created:", responseData);


                        sdk.setAuthentication({
                            userToken: responseData.userToken,
                            encryptionKey: responseData.encryptionKey,
                        });
                        sdk.execute(responseData.challengeId, (error, result) => {
                            if (error) {
                                console.error("Error executing challengeId:", error);
                                return;
                            }
                            if (result.data) {
                                console.log('data: ', result.data);

                                
                            }

                            console.log("Challenge ID executed successfully:", result);
                        });

                        // 此时返回了circle user 的：userToken 和 encryptionKey
                        // 通过这两个值，调用 circle sdk 为用户创建PIN
                        closeCreateModal();
                    }
                };
            }}
        >
            <div class="space-y-4">
                <div class="alert alert-info">
                    <svg
                        class="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <span>选择一个区块链网络来创建新钱包</span>
                </div>

                <div class="form-control">
                    <label class="label" for="wallet-name">
                        <span class="label-text">钱包名称</span>
                    </label>
                    <input
                        id="wallet-name"
                        name="walletName"
                        type="text"
                        placeholder="输入钱包名称"
                        class="input input-bordered"
                        bind:value={walletName}
                        required
                    />
                </div>

                <div class="form-control">
                    <label class="label" for="blockchain-select">
                        <span class="label-text">选择区块链</span>
                    </label>
                    <select
                        id="blockchain-select"
                        name="blockchain"
                        class="select select-bordered"
                        bind:value={blockchain}
                        required
                    >
                        <!-- 主网 -->
                        <optgroup label="主网">
                            <option value="ETH">Ethereum (ETH)</option>
                            <option value="MATIC">Polygon (MATIC)</option>
                            <option value="ARB">Arbitrum (ARB)</option>
                            <option value="AVAX">Avalanche (AVAX)</option>
                            <option value="SOL">Solana (SOL)</option>
                            <option value="NEAR">Near (NEAR)</option>
                            <option value="BASE">Base</option>
                            <option value="OP">Optimism (OP)</option>
                            <option value="UNI">Unichain (UNI)</option>
                            <option value="EVM">EVM</option>
                        </optgroup>
                        
                        <!-- 测试网 -->
                        <optgroup label="测试网">
                            <option value="ETH-SEPOLIA">Ethereum Sepolia</option>
                            <option value="MATIC-AMOY">Polygon Amoy</option>
                            <option value="ARB-SEPOLIA">Arbitrum Sepolia</option>
                            <option value="AVAX-FUJI">Avalanche Fuji</option>
                            <option value="SOL-DEVNET">Solana Devnet</option>
                            <option value="NEAR-TESTNET">Near Testnet</option>
                            <option value="BASE-SEPOLIA">Base Sepolia</option>
                            <option value="OP-SEPOLIA">Optimism Sepolia</option>
                            <option value="UNI-SEPOLIA">Unichain Sepolia</option>
                            <option value="EVM-TESTNET">EVM Testnet</option>
                        </optgroup>
                    </select>
                </div>
            </div>

            <div class="modal-action">
                <button
                    type="button"
                    class="btn btn-ghost"
                    onclick={closeCreateModal}
                    disabled={isCreating}
                >
                    取消
                </button>
                <button
                    type="submit"
                    class="btn btn-primary"
                    disabled={isCreating}
                >
                    {#if isCreating}
                        <span class="loading loading-spinner loading-sm"></span>
                        添加中...
                    {:else}
                        添加网络
                    {/if}
                </button>
            </div>
        </form>
    </div>
    <!-- 点击外部关闭模态框 -->
    <form method="dialog" class="modal-backdrop">
        <button>close</button>
    </form>
</dialog>
