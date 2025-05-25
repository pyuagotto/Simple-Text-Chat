//@ts-check
import { world } from "@minecraft/server";
import config from "./config.js";
/**
 * 設定値を取得する
 */

export const getConfigValues = function() {
    if (config.config) {
        return {
            distance: config.distance,
            ignoreHeight: config.ignoreHeight
        };
    }
    return {
        distance: world.getDynamicProperty("stc:distance"),
        ignoreHeight: world.getDynamicProperty("stc:ignoreHeight")
    };
}

/**
 * 2点間の距離を計算する
 * @param {import("@minecraft/server").Vector3} a 
 * @param {import("@minecraft/server").Vector3} b 
 * @param {boolean} ignoreY 
 */
export const calcDistance = function(a, b, ignoreY) {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    if (ignoreY) {
        return Math.sqrt(dx * dx + dz * dz);
    }
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}