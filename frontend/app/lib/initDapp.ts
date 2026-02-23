'use client';

/**
 * Fully dynamic sdk-dapp initialization.
 * All imports are async to avoid webpack build-time ESM chunk resolution issues.
 */
export async function initDapp(environment: string = 'devnet') {
    try {
        const { initApp } = await import(
            /* webpackIgnore: true */
            '@multiversx/sdk-dapp/out/methods/initApp/initApp'
        );
        const { EnvironmentsEnum } = await import(
            /* webpackIgnore: true */
            '@multiversx/sdk-dapp/out/types/enums.types'
        );

        const envMap: Record<string, any> = {
            devnet: EnvironmentsEnum.devnet,
            testnet: EnvironmentsEnum.testnet,
            mainnet: EnvironmentsEnum.mainnet,
        };

        await initApp({
            storage: { getStorageCallback: () => sessionStorage },
            dAppConfig: {
                nativeAuth: true,
                environment: envMap[environment] ?? EnvironmentsEnum.devnet,
            },
        });
    } catch (err) {
        console.warn('[initDapp] sdk-dapp initialization failed:', err);
    }
}
