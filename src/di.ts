import { JsonRpcProvider } from "@pokt-foundation/pocketjs-provider";

/**
 * Instance of the Pocket JS JsonRpcProvider.
 * @private
 */
let poktProvider: JsonRpcProvider;

/**
 * Gets the current instance of the Pocket JS JsonRpcProvider.
 *
 * @returns {JsonRpcProvider} The current instance of the Pocket JS JsonRpcProvider.
 */
export function getPoktProvider(): JsonRpcProvider {
    return poktProvider;
}

/**
 * Sets the provided instance as the current Pocket JS JsonRpcProvider.
 *
 * @param {JsonRpcProvider} input - The JsonRpcProvider instance to set.
 */
export function setPoktProvider(input: JsonRpcProvider): void {
    poktProvider = input;
}
