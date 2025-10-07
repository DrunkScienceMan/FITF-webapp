// Character state and management

const character = {
    currentHP: 20,
    maxHP: 20,
    stats: {
        STR: 0,
        AGI: 0,
        DUR: 0,
        KNO: 0,
        POW: 0,
        CHA: 0
    },
    tempStats: {
        STR: 0,
        AGI: 0,
        DUR: 0,
        KNO: 0,
        POW: 0,
        CHA: 0
    },
    skills: {
        ART: { base: 'AGI', focus: false },
        ESP: { base: 'AGI', focus: false },
        BLU: { base: 'STR', focus: false },
        TUS: { base: 'STR', focus: false },
        EXA: { base: 'KNO', focus: false },
        GAD: { base: 'KNO', focus: false },
        MED: { base: 'KNO', focus: false },
        SCI: { base: 'KNO', focus: false },
        FRA: { base: 'CHA', focus: false },
        IND: { base: 'CHA', focus: false },
        NEG: { base: 'CHA', focus: false },
        PRE: { base: 'CHA', focus: false },
        JUD: { base: 'POW', focus: false },
        OCC: { base: 'POW', focus: false },
        PER: { base: 'POW', focus: false },
        RES: { base: 'POW', focus: false }
    },
    selectedClass: null,
    selectedSubclass: null,
    selectedWeapon: null,
    selectedArmor: null,
    selectedHelmet: null,
    level: 1
};

let weapons = [];
let armors = [];
let helmets = [];
let classes = [];
let subclasses = [];

async function loadGameData() {
    try {
        const [weaponsData, armorsData, helmetsData, classesData, subclassesData] = await Promise.all([
            fetch('data/weapons.json').then(r => r.json()),
            fetch('data/armor.json').then(r => r.json()),
            fetch('data/helmets.json').then(r => r.json()),
            fetch('data/classes.json').then(r => r.json()),
            fetch('data/subclasses.json').then(r => r.json())
        ]);

        weapons = weaponsData;
        armors = armorsData;
        helmets = helmetsData;
        classes = classesData;
        subclasses = subclassesData;

        return true;
    } catch (error) {
        console.error('Error loading game data:', error);
        return false;
    }
}

function getStat(stat) {
    // This now reads from the character object, not the input field directly
    const baseStat = character.stats[stat] || 0;
    const tempStat = character.tempStats[stat] || 0;
    return baseStat + tempStat;
}

function getSkillValue(skill) {
    const skillData = character.skills[skill];
    if (!skillData) return 0;

    let value = getStat(skillData.base);
    if (skillData.focus) value += 1;

    const subclass = getSelectedSubclass();
    if (subclass && subclass.id === 'technician' && skillData.base === 'KNO') {
        value += 1;
    }

    if (subclass && subclass.id === 'showman' && skillData.base === 'CHA') {
        value += 1;
    }

    if (subclass && subclass.id === 'explorer' && skill === 'PER') {
        value = getStat('KNO');
        if (skillData.focus) value += 1;
    }

    if (subclass && subclass.id === 'occultist' && skill === 'EXA') {
        value = getStat('POW');
        if (skillData.focus) value += 1;
    }

    if (subclass && subclass.id === 'brawler' && skill === 'IND') {
        value = getStat('STR');
        if (skillData.focus) value += 1;
    }

    if (subclass && subclass.id === 'technician' && skill === 'NEG') {
        value = getStat('KNO');
        if (skillData.focus) value += 1;
    }

    return value;
}

function getSelectedClass() {
    const id = document.getElementById('classSelect').value;
    return classes.find(c => c.id === id);
}

function getSelectedSubclass() {
    const id = document.getElementById('subclassSelect').value;
    return subclasses.find(s => s.id === id);
}

function getSelectedWeapon() {
    const id = document.getElementById('weaponSelect').value;
    return weapons.find(w => w.id === id);
}

function getSelectedArmor() {
    const id = document.getElementById('armorSelect').value;
    return armors.find(a => a.id === id);
}

function getSelectedHelmet() {
    const id = document.getElementById('helmetSelect').value;
    return helmets.find(h => h.id === id);
}

function calculateMaxHP() {
    const cls = getSelectedClass();
    const subcls = getSelectedSubclass();
    const level = parseInt(document.getElementById('level').value) || 1;

    let maxHP = 20;
    if (cls) maxHP = cls.startingHP;
    if (subcls) maxHP += subcls.HPbonus * level;
    if (level > 1) maxHP += 2 * (level - 1);

    return maxHP;
}

function calculateAC() {
    const cls = getSelectedClass();
    const armor = getSelectedArmor();
    const helmet = getSelectedHelmet();

    let ac = 10;
    if (cls) ac = cls.naturalAC || 10;
    if (armor) ac += armor.effectac || 0;
    if (helmet) ac += helmet.effectac || 0;

    return ac;
}

function calculateSpeed() {
    const cls = getSelectedClass();
    const armor = getSelectedArmor();
    const helmet = getSelectedHelmet();

    let speed = 8;
    if (cls) speed = cls.speed || 8;
    if (armor && armor.debuffspeed) speed -= armor.debuffspeed;
    if (helmet && helmet.debuffspeed) speed -= helmet.debuffspeed;

    return speed;
}

function calculateDamage() {
    const weapon = getSelectedWeapon();
    if (!weapon) return { notation: '1', total: 1, breakdown: ['1'] };

    let damageNotation = weapon.damage1 || '1';
    let bonuses = [];
    let breakdown = [weapon.damage1 || '1'];

    if (weapon.damagemodifier) {
        const mod = getStat(weapon.damagemodifier);
        if (mod !== 0) {
            const modStr = mod > 0 ? `+${mod}` : `${mod}`;
            bonuses.push(modStr);
            breakdown.push(`${weapon.damagemodifier}(${modStr})`);
        }
    }

    const subcls = getSelectedSubclass();
    if (subcls) {
        if (subcls.id === 'brawler' && weapon.hitcheckskill === 'BLU') {
            bonuses.push('+1d8');
            breakdown.push('Brawler(+1d8)');
        }
        if (subcls.id === 'marksman' && weapon.hitcheckskill === 'ART') {
            bonuses.push('+1d4');
            breakdown.push('Marksman(+1d4)');
        }
        if (subcls.id === 'occultist') {
            bonuses.push('+1d6');
            breakdown.push('Occultist(+1d6)');
        }
    }

    const fullNotation = damageNotation + bonuses.join('');
    const total = rollDice(fullNotation);

    return { notation: fullNotation, total, breakdown };
}

function calculateHitBonus() {
    const weapon = getSelectedWeapon();
    if (!weapon) return { total: 0, breakdown: [] };

    let bonus = parseInt(weapon.hitbonus) || 0;
    let breakdown = [];

    if (weapon.hitbonus) {
        breakdown.push(`Weapon(${weapon.hitbonus > 0 ? '+' : ''}${weapon.hitbonus})`);
    }

    if (weapon.hitcheckskill) {
        const skillValue = parseInt(getSkillValue(weapon.hitcheckskill));
        bonus += skillValue;
        if (skillValue !== 0) {
            breakdown.push(`${weapon.hitcheckskill}(${skillValue > 0 ? '+' : ''}${skillValue})`);
        }
    }

    if (weapon.weaponproperty) {
        const props = Array.isArray(weapon.weaponproperty) ? weapon.weaponproperty : [weapon.weaponproperty];
        
        if (props.some(p => p.toLowerCase().includes('heavy'))) {
            const reqSTR = parseInt(weapon.WConditionX) || 3;
            const bonusAmount = parseInt(weapon.WConditionY) || 2;
            if (getStat('STR') >= reqSTR) {
                bonus += bonusAmount;
                breakdown.push(`Heavy(+${bonusAmount})`);
            }
        }

        if (props.some(p => p.toLowerCase().includes('flexible'))) {
            const reqAGI = parseInt(weapon.WConditionX) || 3;
            const bonusAmount = parseInt(weapon.WConditionY) || 2;
            if (getStat('AGI') >= reqAGI) {
                bonus += bonusAmount;
                breakdown.push(`Flexible(+${bonusAmount})`);
            }
        }
    }

    return { total: parseInt(bonus), breakdown };
}

function saveCharacter() {
    // The data saved is always the base stat from our character object
    const data = {
        stats: character.stats,
        tempStats: character.tempStats,
        skills: character.skills,
        currentHP: character.currentHP,
        level: parseInt(document.getElementById('level').value),
        selectedClass: document.getElementById('classSelect').value,
        selectedSubclass: document.getElementById('subclassSelect').value,
        selectedWeapon: document.getElementById('weaponSelect').value,
        selectedArmor: document.getElementById('armorSelect').value,
        selectedHelmet: document.getElementById('helmetSelect').value
    };
    
    localStorage.setItem('fitf-character', JSON.stringify(data));
}

// --- UPDATED FUNCTION ---
function loadCharacter() {
    const saved = localStorage.getItem('fitf-character');
    if (!saved) return false;

    try {
        const data = JSON.parse(saved);
        
        // Load the base stats into the character object
        character.stats = data.stats;
        character.tempStats = data.tempStats || { STR: 0, AGI: 0, DUR: 0, KNO: 0, POW: 0, CHA: 0 };
        
        // Update the visual display to show the combined total
        updateAttributeDisplays();

        character.skills = data.skills;
        character.currentHP = data.currentHP;

        document.getElementById('level').value = data.level;
        document.getElementById('classSelect').value = data.selectedClass || '';
        document.getElementById('subclassSelect').value = data.selectedSubclass || '';
        document.getElementById('weaponSelect').value = data.selectedWeapon || '';
        document.getElementById('armorSelect').value = data.selectedArmor || '';
        document.getElementById('helmetSelect').value = data.selectedHelmet || '';

        return true;
    } catch (e) {
        console.error('Error loading character:', e);
        return false;
    }
}
