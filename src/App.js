/* eslint-disable no-confusing-arrow */
import { useEffect, useState } from 'react';
import './App.css';
import DECORATIONS from "./decoration.json";
import MONSTERS from "./monsters.json";
import SKILLS from "./skills.json";

const App = () => {
  const [armor, setArmor] = useState([]);
  const [weapons, setWeapons] = useState([]);
  const [monsters, setMonsters] = useState([]);
  const [checklist, setChecklist] = useState({});
  const [crownChecklist, setCrownChecklist] = useState({});
  const [showDecoNames, setShowDecoNames] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [mode, setMode] = useState('decos'); // decos, crowns

  // Save map data to localStorage
  const saveToLocalStorage = (key, data) => {
    const serializedMap = JSON.stringify(data);
    localStorage.setItem(key, serializedMap);
  };

  // Load map data from localStorage
  const loadFromLocalStorage = (key = 'checklist') => {
    const storedMap = localStorage.getItem(key);
    return storedMap ? JSON.parse(storedMap) : null;
  };

  const toggleMode = () => {
    if (mode === "decos") {
      setMode("crowns");
    } else {
      setMode("decos");
    }

    setSearchText("");
  };

  const handleSearchText = event => {
    setSearchText(event.target.value);
  };

  const emptyChecklist = () => {
    const newChecklist = {};

    for (const deco of DECORATIONS) {
      newChecklist[deco.name] = 0;
    }

    return newChecklist;
  };

  const emptyMonsterChecklist = () => {
    const newChecklist = {};

    // null, silver or gold
    for (const monster of MONSTERS.filter(x => x.type === "large")) {
      newChecklist[`${monster.name}-mini`] = null;
      newChecklist[`${monster.name}-giant`] = null;
    }

    return newChecklist;
  };

  const filterDecos = () => {
    const armorDecos = DECORATIONS.filter(x => x.type === "armor").sort((a, b) => {
      return a.skills.map(x => `${x.name} Lv${x.level}`).join(", ") > b.skills.map(x => `${x.name} Lv${x.level}`).join(", ");
    }).filter(x => !searchText || showDecoNames ? x.name.toLowerCase().includes(searchText) :
      x.skills.filter(sk => sk.name.toLowerCase().includes(searchText.toLowerCase()))[0]);
    const weaponDecos = DECORATIONS.filter(x => x.type === "weapon").sort((a, b) => {
      return a.skills.map(x => `${x.name} Lv${x.level}`).join(", ") > b.skills.map(x => `${x.name} Lv${x.level}`).join(", ");
    }).filter(x => !searchText || showDecoNames ? x.name.toLowerCase().includes(searchText) :
      x.skills.filter(sk => sk.name.toLowerCase().includes(searchText.toLowerCase()))[0]);

    setArmor(armorDecos);
    setWeapons(weaponDecos);
  };

  const filterMonsters = () => {
    const largeMonsters = MONSTERS.filter(x => x.type === "large" && (!searchText || x.name.toLowerCase().includes(searchText)));
    setMonsters(largeMonsters);
  };

  useEffect(() => {
    filterDecos();
    filterMonsters();

    const ccDeco = loadFromLocalStorage() || emptyChecklist();
    const ccCrown = loadFromLocalStorage('crown-checklist') || emptyMonsterChecklist();
    setChecklist(ccDeco);
    setCrownChecklist(ccCrown);
  }, []);

  useEffect(() => {
    filterDecos();
    filterMonsters();
  }, [searchText]);

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
    saveToLocalStorage('checklist', tempMap);
  };

  const cycleCrown = crownStr => {
    const order = [null, 'silver', 'gold'];
    console.log(crownStr);
    const crown = crownChecklist[crownStr];
    const nextIndex = order.indexOf(crown) + 1;
    const next = nextIndex >= order.length ? order[0] : order[nextIndex];

    const tempCrownChecklist = { ...crownChecklist };
    tempCrownChecklist[crownStr] = next;
    saveToLocalStorage('crown-checklist', tempCrownChecklist);
    setCrownChecklist(tempCrownChecklist);
  };

  const renderDeco = deco => {
    const nameStr = showDecoNames ? deco.name : deco.skills.map(x => `${x.name} Lv${x.level}`).join(", ");
    const count = checklist[deco.name];
    const maxCount = getMaxDecoCount(deco);
    const done = count === maxCount;
    const percentColor = getColorFromPercentage(count / maxCount * 100, 0.2);
    const backgroundImage = `linear-gradient(to right, transparent, ${percentColor}, transparent)`;

    return (
      <div className="deco-button noselect" key={deco.name}
        onClick={ev => decoClick(ev, deco)} style={{ backgroundImage }}>
        <img className="deco-icon" src={`images/slot${deco.slot}.png`}></img>
        <div className={`deco-name ${done ? 'strike' : ''}`}>{nameStr}</div>
        <div className="count">
          {count} / {maxCount}
        </div>
      </div>
    );
  };

  const renderDecos = () => {
    if (mode !== "decos") { return null; }

    return <div className="deco-checklist">
      <input className="search-text" value={searchText} onChange={handleSearchText} placeholder="Search Decorations" />
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
    </div>;
  };

  const renderMonster = monster => {
    const mini = crownChecklist[`${monster.name}-mini`];
    const giant = crownChecklist[`${monster.name}-giant`];
    const crown = "👑";
    const locked = monster.locked;

    return <div className="monster" title={monster.name} key={monster.name}>
      <img src={monster.imgUrl} className="monster-img" />
      {!locked && <div className={`noselect crown giant ${giant}`} onClick={() => cycleCrown(`${monster.name}-giant`)}>
        {crown}
      </div>}
      {!locked && <div className={`noselect crown mini ${mini}`} onClick={() => cycleCrown(`${monster.name}-mini`)}>
        {crown}
      </div>}
    </div>;
  };

  const renderCrowns = () => {
    if (mode !== "crowns") { return null; }

    return <div className="crown-checklist">
      <input className="search-text" style={{ display: 'flex', marginTop: '1em', marginBottom: '1em' }}
        value={searchText} onChange={handleSearchText} placeholder="Search Monsters" />
      <div className="crowns">
        <div className="monsters">
          <div className="monster-holder">{monsters.map(x => renderMonster(x))}</div>
        </div>
      </div>
    </div>;
  };

  return (
    <div className="App">
      <div className="columns">
        {renderDecos()}
        {renderCrowns()}
      </div>

      <button className="mode-button"
        onClick={toggleMode}>{mode === "decos" ? "Swap to Crowns" : "Swap to Decos"}</button>
      <small style={{ position: "fixed", right: "6px", bottom: "2px" }} title="up-to-date with this version of wilds">
        1.000.04.00
      </small>
    </div>
  );
};

export default App;
