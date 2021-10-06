import { getAttr } from "./_helpers"; 
import { fields as card} from "../model/card";
import { fields as charFields} from "../model/character";

export function handleReload(character, weaponId){
    const getAttrName = function(id, num){
        return `weapon_${id}_${num}`;
    }    

    if (!Number.isInteger(weaponId) ||  weaponId < 1 || weaponId > charFields.slots.weaponslots.max){
        return  {msg: `Error! Invalid weapon slot!`, type: "error"};
    }

    const weaponSlots = getAttr(character, charFields.slots.weaponslots, charFields.slots.weaponslots.default);

    if (weaponId > weaponSlots.get('current')){
        return  {msg: `Error! You do not have that weapon slot available!`, type: "error"};
    }


    const itemType = getAttr(character, getAttrName(card.type.id, weaponId), card.type.options[1]),
        weaponType = getAttr(character, getAttrName(card.weapontype.id, weaponId), card.weapontype.options[0]),
        ammoType = getAttr(character, getAttrName(card.ammotype.id, weaponId), card.ammotype.options[0]),
        ammo = getAttr(character, getAttrName(card.uses.id, weaponId), 0, true),
        active = getAttr(character, charFields.slots.weaponslots.prefix + '_' + weaponId, 0),
        ammoMax = ammo.get("max"),
        ammoStore = getAttr(character, ammoType.get('current'), 0), //ammoType dropdown values are the attribute for the appropriate ammo store.
        isActive = active.get('current');

    if (!isActive){
        return  {msg: `Error! Weapon Slot ${weaponId} is not active!`, type: "error"};
    } else if (itemType.get('current') !== 'weapon'){
        return {msg: "Error! Item is not a weapon!", type: "error"};
    } else if (weaponType.get('current') !== 'ranged'){
        return {msg: "Error! Item is not a ranged weapon!", type: "error"};
    }
    
    const current = parseInt(ammo.get('current'), 10) || 0,
        max = parseInt(ammoMax, 10) || 0,
        store = parseInt(ammoStore.get('current'), 10) || 0,
        reload = max - current,
        ammoText = ammoType.get('current').replace('ammo_', '');

    if (current >= max){
        return  {msg: "Weapon is already at max ammo!", type: "info"};
    }

    if (store <= 0){
        //No Ammo
        return {msg: `${character.get('name')} has no ${ammoText} ammo to reload with.`, type:"warning"}
    } else if (reload >= store){
        //Successful Reload - Partial Reload
        ammo.setWithWorker({current: store + current});
        ammoStore.setWithWorker({current: 0});
        return {msg: `${character.get('name')} reloads with the last of their ${ammoText} ammo.`, type:"warning"}
    } else {
        //Successful Reload - Full Reload
        ammo.setWithWorker({current: max});
        ammoStore.setWithWorker({current: store - reload});
        return {msg: `${character.get('name')} reloads. They have ${store - reload} ${ammoText} ammo remaining.`, type:"success"}
    }
}



