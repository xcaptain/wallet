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

    let isCreating = $state(false);

    // 表单字段
    let walletName = $state("我的钱包");
    let blockchain = $state("ETH-SEPOLIA");

    // 模态框引用
    let createWalletModal: HTMLDialogElement;

    // 打开模态框
    function openCreateModal() {
        createWalletModal.showModal();
    }

    // 关闭模态框
    function closeCreateModal() {
        createWalletModal.close();
    }

    async function triggerRefreshCircleWallets() {
        await fetch('/api/wallet/refresh');
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

        <button class="btn btn-primary" onclick={openCreateModal}>
            <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                />
            </svg>
            创建钱包
        </button>
    </div>

    <!-- 钱包列表 -->
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
                创建您的第一个钱包开始管理数字资产
            </p>
            <button class="btn btn-primary btn-lg" onclick={openCreateModal}>
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
                                <span class="font-semibold"
                                    >{wallet.balance} {wallet.currency}</span
                                >
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm opacity-70">地址</span>
                                <span class="text-sm font-mono"
                                    >{wallet.address.slice(
                                        0,
                                        8,
                                    )}...{wallet.address.slice(-8)}</span
                                >
                            </div>
                        </div>
                        <div class="card-actions justify-end mt-4">
                            <button class="btn btn-sm btn-outline"
                                >查看详情</button
                            >
                            <button class="btn btn-sm btn-primary">发送</button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<!-- 创建钱包模态框 -->
<dialog bind:this={createWalletModal} class="modal">
    <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">创建新钱包</h3>

        <!-- 显示错误信息 -->
        {#if form?.error}
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
                <span>{form.error}</span>
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

                            // TODO: 如果 callback 里返回了钱包信息，应该要在数据库创建钱包
                            console.log("Challenge ID executed successfully:", result);

                            triggerRefreshCircleWallets();
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
                    <span>我们将为您创建一个基于 Circle Wallet 的安全钱包</span>
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
                        创建中...
                    {:else}
                        创建钱包
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
