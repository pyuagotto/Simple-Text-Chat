//@ts-check

import { world } from "@minecraft/server";
import config from "./config.js";

world.beforeEvents.chatSend.subscribe((ev)=>{
    const { sender, message } = ev;
    const { dimension, location, name } = sender;

    for(const player of dimension.getPlayers()){
        let distance;

        //y座標を含まない
        if(config.ignoreHeight){
            //2点間の距離を求める
            distance = Math.sqrt(Math.pow(player.location.x - location.x, 2) + Math.pow(player.location.z - location.z, 2));
        }
        
        //含む
        else{
            //2点間の距離を求める
            distance = Math.sqrt(Math.pow(player.location.x - location.x, 2) + Math.pow(player.location.y - location.y, 2) + Math.pow(player.location.z - location.z, 2));
        }
        
        
        //自分自身
        if(player.name === name) {
            player.sendMessage(`<${name}> ${message}`);
        }

        else if(distance <= config.distance){
            //小数点第2位で四捨五入
            distance = Math.floor(distance * 10) / 10; 
            player.sendMessage(`§6[§rFrom §e${distance}§r blocks away§6]§r <${name}> ${message}`);
        }
    }

    ev.cancel = true;
});