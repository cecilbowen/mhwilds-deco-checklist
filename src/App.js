import { useEffect, useState } from 'react';
import './App.css';
import DECORATIONS from "./decoration.json";
import SKILLS from "./skills.json";

const App = () => {
  const [armor, setArmor] = useState([]);
  const [weapons, setWeapons] = useState([]);
  const [checklist, setChecklist] = useState({});
  const [showDecoNames, setShowDecoNames] = useState(false);

  // Save map data to localStorage
  const saveToLocalStorage = (data, key = 'checklist') => {
    const serializedMap = JSON.stringify(data);
    localStorage.setItem(key, serializedMap);
  };

  // Load map data from localStorage
  const loadFromLocalStorage = (key = 'checklist') => {
    const storedMap = localStorage.getItem(key);
    return storedMap ? JSON.parse(storedMap) : null;
  };

  const emptyChecklist = decos => {
    const newChecklist = {};

    for (const deco of decos) {
      newChecklist[deco.name] = 0;
    }

    return newChecklist;
  };

  useEffect(() => {
    const armorDecos = DECORATIONS.filter(x => x.type === "armor").sort((a, b) => {
      return a.skills.map(x => `${x.name} Lv${x.level}`).join(", ") > b.skills.map(x => `${x.name} Lv${x.level}`).join(", ");
    });
    const weaponDecos = DECORATIONS.filter(x => x.type === "weapon").sort((a, b) => {
      return a.skills.map(x => `${x.name} Lv${x.level}`).join(", ") > b.skills.map(x => `${x.name} Lv${x.level}`).join(", ");
    });

    const ccList = loadFromLocalStorage() || emptyChecklist(DECORATIONS);

    setArmor(armorDecos);
    setWeapons(weaponDecos);
    setChecklist(ccList);
  }, []);

  const getColorFromPercentage = (percent, alpha = 1) => {
      percent = Math.max(1, Math.min(100, percent)); // Clamp between 1 and 100
      const red = Math.max(0, 255 - percent * 2.55);
      const green = Math.min(255, percent * 2.55);
      return `rgba(${Math.round(red)}, ${Math.round(green)}, 0, ${alpha})`;
  };

  const getCompletionStr = type => {
    let sum = 0;
    let maxSum = 0;
    for (const deco of DECORATIONS) {
      if (deco.type !== type) { continue; }
      sum += checklist[deco.name];
      maxSum += getMaxDecoCount(deco);
    }

    return `${sum} / ${maxSum}`;
  };

  const getMaxDecoCount = deco => {
    const maxWeaponSlots = deco.type === "weapon" ? 3 : 999;
    const skill1 = deco.skills[0];
    const skill2 = deco.skills[1];

    const s1 = SKILLS.filter(x => x.name.toLowerCase() === skill1.name.toLowerCase())[0];

    if (!s1) {
      console.log(skill1.name);
    }

    const max1 = Math.ceil(s1.levels.length / skill1.level);
    let max2 = 3;

    if (skill2) {
      const s2 = SKILLS.filter(x => x.name.toLowerCase() === skill2.name.toLowerCase())[0];
      max2 = Math.ceil(s2.levels.length / skill2.level);
    }

    return Math.min(max1, maxWeaponSlots);
  };

  const decoClick = (ev, deco) => {
    let newCount = checklist[deco.name] + 1;
    const maxCount = getMaxDecoCount(deco);
    const tempMap = { ...checklist };

    if (newCount > maxCount) {
      newCount = 0;
    }

    tempMap[deco.name] = newCount;
    setChecklist(tempMap);
    saveToLocalStorage(tempMap);
  };

  const renderDeco = deco => {
    const nameStr = showDecoNames ? deco.name : deco.skills.map(x => `${x.name} Lv${x.level}`).join(", ");
    const count = checklist[deco.name];
    const maxCount = getMaxDecoCount(deco);
    const done = count === maxCount;
    const percentColor = getColorFromPercentage(count / maxCount * 100, 0.2);
    const backgroundImage = `linear-gradient(to right, transparent, ${percentColor}, transparent)`;

    return (
      <div className="deco-button noselect" onClick={ev => decoClick(ev, deco)} style={{ backgroundImage }}>
        <img className="deco-icon" src={`images/slot${deco.slot}.png`}></img>
        <div className={`deco-name ${done ? 'strike' : ''}`}>{nameStr}</div>
        <div className="count">
            {count} / {maxCount}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <div className="decos">
        <div className="armor">
          <p style={{ fontWeight: "bold" }}>Armor Decorations: ({getCompletionStr("armor")})</p>
          <div className="deco-holder">{armor.map(x => renderDeco(x))}</div>
        </div>
        <div className="weapons">
          <p style={{ fontWeight: "bold" }}>Weapon Decorations: ({getCompletionStr("weapon")})</p>
          <div className="deco-holder">{weapons.map(x => renderDeco(x))}</div>
        </div>
      </div>
      <small style={{ position: "fixed", right: "6px" }} title="up-to-date with this version of wilds">1.000.04.00</small>
    </div>
  );
};

export default App;
