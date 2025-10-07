// Main application logic and UI management

async function init() {
    console.log('Loading game data...');

    const loaded = await loadGameData();
    if (!loaded) {
        alert('Error loading game data. Please check that all JSON files are in the data/ folder.');
        return;
    }

    populateDropdowns();

    document.getElementById('armorSelect').value = 'noarmorvest';
    document.getElementById('helmetSelect').value = 'nohelmet';
    document.getElementById('weaponSelect').value = 'basicstrike';

    loadCharacter();

    if (!character.tempStats) {
        character.tempStats = { STR: 0, AGI: 0, DUR: 0, KNO: 0, POW: 0, CHA: 0 };
    }

    renderSkills();
    updateAll();

    console.log('Application initialized successfully!');
}

function populateDropdowns() {
    const classSelect = document.getElementById('classSelect');
    classes.forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = c.name;
        classSelect.appendChild(option);
    });

    const subclassSelect = document.getElementById('subclassSelect');
    subclasses.forEach(s => {
        const option = document.createElement('option');
        option.value = s.id;
        option.textContent = s.name;
        subclassSelect.appendChild(option);
    });

    const weaponSelect = document.getElementById('weaponSelect');
    weapons.forEach(w => {
        const option = document.createElement('option');
        option.value = w.id;
        option.textContent = w.name;
        weaponSelect.appendChild(option);
    });

    const armorSelect = document.getElementById('armorSelect');
    armors.forEach(a => {
        const option = document.createElement('option');
        option.value = a.id;
        option.textContent = a.name;
        armorSelect.appendChild(option);
    });

    const helmetSelect = document.getElementById('helmetSelect');
    helmets.forEach(h => {
        const option = document.createElement('option');
        option.value = h.id;
        option.textContent = h.name;
        helmetSelect.appendChild(option);
    });
}

function renderSkills() {
    const grid = document.getElementById('skillsGrid');
    grid.innerHTML = '';

    Object.keys(character.skills).forEach(skill => {
        const div = document.createElement('div');
        div.className = 'skill-item';
        if (character.skills[skill].focus) {
            div.classList.add('skill-focused');
        }

        const label = document.createElement('span');
        label.textContent = skill;

        const value = document.createElement('span');
        value.className = 'skill-value';
        value.id = `skill-${skill}`;
        value.textContent = getSkillValue(skill);

        div.onclick = () => {
            character.skills[skill].focus = !character.skills[skill].focus;
            div.classList.toggle('skill-focused');
            updateAll();
            saveCharacter();
        };

        div.appendChild(label);
        div.appendChild(value);
        grid.appendChild(div);
    });
}

function updateDamageReduction() {
    const damageType = document.getElementById('damageTypeSelect').value;
    const reduction = calculateDamageReduction(damageType);
    const display = document.getElementById('damageReductionDisplay');
    
    if (reduction > 0) {
        display.innerHTML = `<strong>Current Damage Reduction (${damageType}):</strong> ${reduction}`;
    } else if (reduction < 0) {
        display.innerHTML = `<strong>Current Damage Vulnerability (${damageType}):</strong> ${Math.abs(reduction)} (extra damage)`;
    } else {
        display.innerHTML = `<strong>Current Damage Reduction (${damageType}):</strong> None`;
    }
}

function calculateDamageReduction(damageType) {
    const armor = getSelectedArmor();
    const helmet = getSelectedHelmet();
    
    let reduction = 0;
    
    const damageTypeMap = {
        'physical': 'damageRePhy',
        'heat': 'damageReHe',
        'cold': 'damageReCo',
        'electrical': 'damageReEl',
        'chemical': 'damageReCh',
        'explosive': 'damageReEx',
        'light': 'damageReLi',
        'sound': 'damageReSo',
        'memetic': 'damageReMe',
        'anomalous': 'damageReAn'
    };
    
    const reductionProp = damageTypeMap[damageType];
    
    if (armor && armor[reductionProp]) {
        reduction += armor[reductionProp];
    }
    
    if (helmet && helmet[reductionProp]) {
        reduction += helmet[reductionProp];
    }
    
    return reduction;
}

function updateSkills() {
    Object.keys(character.skills).forEach(skill => {
        const elem = document.getElementById(`skill-${skill}`);
        if (elem) {
            elem.textContent = getSkillValue(skill);
        }
    });
}

function updateHP() {
    character.maxHP = calculateMaxHP();
    if (character.currentHP > character.maxHP) {
        character.currentHP = character.maxHP;
    }
    updateHealthBar();
}

function updateAC() {
    const ac = calculateAC();
    document.getElementById('acDisplay').textContent = ac;
}

function updateSpeed() {
    const speed = calculateSpeed();
    document.getElementById('speedDisplay').textContent = speed + 'm';
    document.getElementById('initiativeDisplay').textContent = '+' + getStat('AGI');
}

function updateHealthBar() {
    const percent = (character.currentHP / character.maxHP) * 100;
    document.getElementById('healthBar').style.width = percent + '%';
    document.getElementById('healthText').textContent = `${character.currentHP} / ${character.maxHP}`;
}

function rollAttack() {
    const weapon = getSelectedWeapon();
    if (!weapon) {
        alert('Please select a weapon first!');
        return;
    }

    const hitBonusData = calculateHitBonus();
    const hitRoll = Math.floor(Math.random() * 20) + 1;
    const hitTotal = hitRoll + hitBonusData.total;

    let hitText = `${hitTotal}`;
    if (hitRoll === 20) hitText += ' (CRIT!)';
    if (hitRoll === 1) hitText += ' (FUMBLE!)';
    document.getElementById('attackRoll').textContent = `Hit: ${hitText}`;
    
    const hitNotation = `1d20(${hitRoll})` + 
        (hitBonusData.breakdown.length > 0 ? ' + ' + hitBonusData.breakdown.join(' + ') : '');
    document.getElementById('attackNotation').textContent = hitNotation;

    const damageData = calculateDamage();
    
    const finalDamage = hitRoll === 20 ? damageData.total * 2 : damageData.total;
    const damageText = hitRoll === 20 ? `${finalDamage} (CRIT x2)` : `${finalDamage}`;
    document.getElementById('damageRoll').textContent = `Dmg: ${damageText}`;
    
    document.getElementById('damageNotation').textContent = damageData.breakdown.join(' + ');
    
    console.log(`Attack Roll: 1d20(${hitRoll}) + ${hitBonusData.total} = ${hitTotal}`);
    console.log(`Hit Breakdown: ${hitNotation}`);
    console.log(`Damage: ${damageData.notation} = ${finalDamage}`);
}

function takeDamageByType() {
    const amount = parseInt(document.getElementById('damageInput').value) || 0;
    if (amount <= 0) return;

    const damageType = document.getElementById('damageTypeSelect').value;
    const reduction = calculateDamageReduction(damageType);
    const actualDamage = Math.max(0, amount - reduction);
    
    character.currentHP = Math.max(0, character.currentHP - actualDamage);
    updateHealthBar();
    saveCharacter();

    console.log(`${amount} ${damageType} damage - ${reduction} reduction = ${actualDamage} actual damage`);
    
    if (reduction !== 0 && actualDamage !== amount) {
        if (reduction > 0) {
            alert(`Armor absorbed ${reduction} damage! Taking ${actualDamage} damage.`);
        } else {
            alert(`Vulnerability! Taking ${actualDamage} damage (${Math.abs(reduction)} extra).`);
        }
    }
    
    if (character.currentHP === 0) {
        alert('Character is unconscious!');
    }
}

function heal() {
    const amount = parseInt(document.getElementById('damageInput').value) || 0;
    if (amount <= 0) return;

    character.currentHP = Math.min(character.maxHP, character.currentHP + amount);
    updateHealthBar();
    saveCharacter();
}

function resetHealth() {
    character.currentHP = character.maxHP;
    updateHealthBar();
    saveCharacter();
}

// --- UPDATED FUNCTION ---
function updateAll() {
    console.log('updateAll() called');
    updateAttributeDisplays(); // Add this line
    updateSkills();
    updateHP();
    updateAC();
    updateSpeed();
    updateEquipmentStats();
    updateHealthBar();
    updateDamageReduction();
    updateClassAndSubclassBonuses();
    updateTempStatButtons();
    saveCharacter();
}

function updateClassAndSubclassBonuses() {
    updateClassBonuses();
    updateSubclassBonuses();
}

function updateClassBonuses() {
    const classElem = getSelectedClass();
    const bonusDisplay = document.getElementById('classBonuses');
    
    if (!classElem) {
        bonusDisplay.innerHTML = '<em>No class selected</em>';
        return;
    }
    
    let html = `<strong>${classElem.name} Bonuses:</strong>`;
    html += `<ul>`;
    
    if (classElem.startingHP) {
        html += `<li><strong>Starting HP:</strong> ${classElem.startingHP}</li>`;
    }
    
    if (classElem.naturalAC) {
        html += `<li><strong>Natural AC:</strong> ${classElem.naturalAC}</li>`;
    }
    
    if (classElem.speed) {
        html += `<li><strong>Speed:</strong> ${classElem.speed}m</li>`;
    }
    
    if (classElem.startingSkills && classElem.startingSkills.length > 0) {
        html += `<li><strong>Starting Skills:</strong> ${classElem.startingSkills.join(', ')}</li>`;
    }
    
    if (classElem.abilities && classElem.abilities.length > 0) {
        html += `<li><strong>Abilities:</strong> ${classElem.abilities.join(', ')}</li>`;
    }
    
    /* ----- NEW: show classbonus1 ----- */
    if (Array.isArray(classElem.classbonus1) && classElem.classbonus1.length) {
        html += `<li><strong>Class Bonus 1:</strong> ${classElem.classbonus1.join('; ')}</li>`;
    }

    /* ----- NEW: show classbonus2 ----- */
    if (Array.isArray(classElem.classbonus2) && classElem.classbonus2.length) {
        html += `<li><strong>Class Bonus 2:</strong> ${classElem.classbonus2.join('; ')}</li>`;
    }

    html += `</ul>`;
    bonusDisplay.innerHTML = html;
}

function updateSubclassBonuses() {
    const sub = getSelectedSubclass();
    const box = document.getElementById('subclassBonuses');

    if (!sub) {
        box.innerHTML = '<em>No subclass selected</em>';
        return;
    }

    let html = `<strong>${sub.name} Bonuses:</strong><ul>`;

    // 1.  well-known numeric bonus
    if (Number.isFinite(sub.HPbonus))
        html += `<li><strong>HP Bonus per Level:</strong> +${sub.HPbonus}</li>`;

    // 2.  well-known abilities
    ['abilityX', 'abilityY', 'abilityZ'].forEach((k, i) => {
        if (sub[k])
            html += `<li><strong>Ability ${i + 1}:</strong> ${sub[k]}</li>`;
    });

    // 3.  everything else EXCEPT the internal keys
    const ignore = ['id', 'title', 'tags', 'name', 'HPbonus',
                    'abilityX', 'abilityY', 'abilityZ'];

    Object.keys(sub)
          .filter(k => !ignore.includes(k) && sub[k] != null)
          .forEach(k => {
              const nice = k.replace(/([A-Z])/g, ' $1')
                           .replace(/^./, s => s.toUpperCase());
              html += `<li><strong>${nice}:</strong> ${sub[k]}</li>`;
          });

    html += '</ul>';
    box.innerHTML = html;
}


function updateEquipmentStats() {
    console.log('Updating equipment stats...');
    updateWeaponStats();
    updateArmorStats();
    updateHelmetStats();
}

function updateWeaponStats() {
    const weapon = getSelectedWeapon();
    const statsDiv = document.getElementById('weaponStats');
    
    if (!weapon) {
        statsDiv.innerHTML = '<em>No weapon selected</em>';
        return;
    }
    
    const properties = Array.isArray(weapon.weaponproperty) 
        ? weapon.weaponproperty.join(', ') 
        : weapon.weaponproperty || '';
    
    let html = `<strong>Damage:</strong> ${weapon.damage1 || '1'}`;
    if (weapon.damagemodifier) html += ` + ${weapon.damagemodifier}`;
    html += `<br><strong>Type:</strong> ${weapon.damagetype || 'physical'}`;
    html += `<br><strong>Range:</strong> ${weapon.range || '1'}m`;
    html += `<br><strong>Hit Bonus:</strong> +${weapon.hitbonus || 0}`;
    if (weapon.hitcheckskill) html += `<br><strong>Skill:</strong> ${weapon.hitcheckskill}`;
    if (properties) html += `<br><strong>Properties:</strong> ${properties}`;
    if (weapon.statuseffectX) html += `<br><strong>Status:</strong> ${weapon.statuseffectX}`;
    
    statsDiv.innerHTML = html;
}

function updateArmorStats() {
    const armor = getSelectedArmor();
    const statsDiv = document.getElementById('armorStats');
    
    if (!armor) {
        statsDiv.innerHTML = '<em>No armor selected</em>';
        return;
    }
    
    let html = `<strong>AC Bonus:</strong> +${armor.effectac || 0}`;
    if (armor.debuffspeed) html += `<br><strong>Speed Penalty:</strong> -${armor.debuffspeed}m`;
    
    const reductions = [];
    if (armor.damageRePhy) reductions.push(`Physical: ${armor.damageRePhy}`);
    if (armor.damageReHe) reductions.push(`Heat: ${armor.damageReHe}`);
    // ... (rest of the reductions)
    
    if (reductions.length > 0) {
        html += `<br><strong>Damage Reduction:</strong><br>${reductions.join('<br>')}`;
    }
    
    statsDiv.innerHTML = html;
}

function updateHelmetStats() {
    const helmet = getSelectedHelmet();
    const statsDiv = document.getElementById('helmetStats');
    
    if (!helmet) {
        statsDiv.innerHTML = '<em>No helmet selected</em>';
        return;
    }
    
    let html = `<strong>AC Bonus:</strong> +${helmet.effectac || 0}`;
    if (helmet.debuffspeed) html += `<br><strong>Speed Penalty:</strong> -${helmet.debuffspeed}m`;
    
    const reductions = [];
    if (helmet.damageRePhy) reductions.push(`Physical: ${helmet.damageRePhy}`);
    // ... (rest of the reductions)
    
    if (reductions.length > 0) {
        html += `<br><strong>Damage Reduction:</strong><br>${reductions.join('<br>')}`;
    }
    
    statsDiv.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function() {
    init();
    
    const damageTypeSelect = document.getElementById('damageTypeSelect');
    if (damageTypeSelect) {
        damageTypeSelect.addEventListener('change', updateDamageReduction);
    }
});

// --- UPDATED FUNCTION ---
function adjustStat(statId, amount) {
    const input = document.getElementById(statId);
    const min = parseInt(input.min, 10);
    const max = parseInt(input.max, 10);

    // Adjust the base stat in the character object
    let baseValue = character.stats[statId] || 0;
    baseValue += amount;

    // Clamp the base value
    if (!isNaN(min) && baseValue < min) baseValue = min;
    if (!isNaN(max) && baseValue > max) baseValue = max;

    character.stats[statId] = baseValue;
    
    updateAll();
}

// --- NEW FUNCTION ---
/**
 * Updates the value displayed in the attribute input boxes.
 * It shows the total of base stat + temporary stat.
 */
function updateAttributeDisplays() {
    Object.keys(character.stats).forEach(statId => {
        const input = document.getElementById(statId);
        if (input) {
            input.value = getStat(statId); // getStat() returns the combined total
        }
    });
}

function adjustTempStat(statId, amount) {
    if (!character.tempStats) {
        character.tempStats = { STR: 0, AGI: 0, DUR: 0, KNO: 0, POW: 0, CHA: 0 };
    }
    
    character.tempStats[statId] = (character.tempStats[statId] || 0) + amount;
    
    updateAll();
}

function updateTempStatButtons() {
    if (!character.tempStats) return;

    Object.keys(character.tempStats).forEach(statId => {
        const tempValue = character.tempStats[statId];
        const plusButton = document.getElementById(`temp-${statId}-plus`);
        const minusButton = document.getElementById(`temp-${statId}-minus`);

        if (!plusButton || !minusButton) return;

        plusButton.classList.remove('glow-green');
        minusButton.classList.remove('glow-red');

        if (tempValue > 0) {
            plusButton.classList.add('glow-green');
        } else if (tempValue < 0) {
            minusButton.classList.add('glow-red');
        }
    });
}

function adjustDamage(amount) {
    const input = document.getElementById('damageInput');
    let value = parseInt(input.value) || 0;
    value += amount;
    
    if (value < 0) value = 0;
    
    input.value = value;
}
