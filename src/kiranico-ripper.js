// ran from https://mhwilds.kiranico.com/data/monsters browser console

const ret = [];
const links = [...document.querySelectorAll('td > a')];
let type = "large";

// monsters that don't have crowns (yet?)
const lockedNames = [
    "Jin Dahaad",
    "Guardian Arkveld",
    "Zoh Shia"
];

for (const link of links) {
    const imgUrl = link.parentElement.parentElement
        .firstElementChild.firstElementChild.src;
    const slashName = link.href.split("/")[link.href.split("/").length - 1];
    if (slashName.includes("barrel")) { type = "small"; }
    const name = link.innerText.trim();
    const newMonster = {
        name,
        type,
        imgUrl,
    };

    if (lockedNames.includes(name)) {
        newMonster.locked = true;
    }
    ret.push(newMonster);
}
console.log(ret);
