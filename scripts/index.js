//@ts-check

import { CommandPermissionLevel, CustomCommandOrigin, CustomCommandStatus, Player, system, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import config from "./config.js";
import { getConfigValues, calcDistance } from "./utils.js";


world.beforeEvents.chatSend.subscribe((ev) => {
    const { sender, message } = ev;
    const { dimension, location, name } = sender;

    const { distance: configDistance, ignoreHeight: configIgnoreHeight } = getConfigValues();

    if (typeof configDistance !== "number" || typeof configIgnoreHeight !== "boolean") return;

    for (const player of dimension.getPlayers()) {
        const distance = calcDistance(player.location, location, configIgnoreHeight);

        if (player.name === name) {
            player.sendMessage(`<${name}> ${message}`);
        } else if (distance <= configDistance) {
            // 小数点第2位で四捨五入
            const rounded = Math.floor(distance * 10) / 10;
            player.sendMessage(`§6[§rFrom §e${rounded}§r blocks away§6]§r <${name}> ${message}`);
        }
    }

    ev.cancel = true;
});

system.beforeEvents.startup.subscribe((ev) => {
    /**
     * @param {string} name 
     * @param {string} description 
     * @param {import("@minecraft/server").CustomCommandParameter[]} mandatoryParameters 
     * @param {import("@minecraft/server").CustomCommandParameter[]} optionalParameters 
     * @param {(origin: CustomCommandOrigin, ...args: any[]) => { status: CustomCommandStatus, message?: string } | undefined} callback 
     */
    const registerCommand = function (name, description, mandatoryParameters, optionalParameters, callback) {
        ev.customCommandRegistry.registerCommand(
            {
                name,
                description,
                mandatoryParameters,
                optionalParameters,
                permissionLevel: CommandPermissionLevel.GameDirectors,
            },
            callback
        );
    };

    registerCommand(
        "stc:config",
        "Simple Text Chatの設定フォームを開きます",
        [],
        [],
        openForm
    );
});

world.afterEvents.worldLoad.subscribe(() => {
    if (world.getDynamicProperty("stc:distance") === undefined) {
        world.setDynamicProperty("stc:distance", config.distance);
    }

    if (world.getDynamicProperty("stc:ignoreHeight") === undefined) {
        world.setDynamicProperty("stc:ignoreHeight", config.ignoreHeight);
    }
});

/**
 * 
 * @param {CustomCommandOrigin} origin 
 * @returns { { status: CustomCommandStatus, message?: string} | undefined}
 */
const openForm = function(origin) {
    if (origin.sourceEntity instanceof Player) {
        if (config.config) return { status: CustomCommandStatus.Failure, message: "config.jsからconfigをfalseにしてください" };

        const player = origin.sourceEntity;
        const { distance: configDistance, ignoreHeight: configIgnoreHeight } = getConfigValues();

         if (typeof configDistance !== "number" || typeof configIgnoreHeight !== "boolean") return;
        const modalForm = new ModalFormData();
        modalForm.slider("distance", 0, 100, { defaultValue: configDistance, valueStep: 5 });
        modalForm.toggle("ignoreHeight", { defaultValue: configIgnoreHeight });

        system.run(() => {
            modalForm.show(player).then((response) => {
                if (response.formValues) {
                    world.setDynamicProperty("stc:distance", response.formValues[0]);
                    world.setDynamicProperty("stc:ignoreHeight", response.formValues[1]);

                    player.sendMessage(`§6[§rSimple Text Chat§6]§r 設定を保存しました。`);
                }
            });
        });

        return { status: CustomCommandStatus.Success };
    }

    return { status: CustomCommandStatus.Failure, message: "このコマンドはプレイヤーから実行する必要があります" };
}

