// Main application logic and UI management

async function init() {
    console.log('Loading game data...');

    const loaded = await loadGameData();
    if (!loaded) {
        alert('Error loading game data. Please check that all JSON files are in the data/ folder.');
        return;
    }

    populateDropdowns();
    populateConditionSelect();  // Add this line

    document.getElementById('armorSelect').value = 'noarmorvest';
    document.getElementById('helmetSelect').value = 'nohelmet';
    document.getElementById('weaponSelect').value = 'basicstrike';

    loadCharacter();

    if (!character.tempStats) {
        character.tempStats = { STR: 0, AGI: 0, DUR: 0, KNO: 0, POW: 0, CHA: 0 };
    }

    renderSkills();
    updateAll();
    renderConditions();  // Add this line

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
    
    // Roll the base d20
    const baseHitRoll = Math.floor(Math.random() * 20) + 1;
    
    // Roll bonus dice (d6) and penalty dice (d6)
    let bonusTotal = 0;
    let penaltyTotal = 0;
    
    if (hitBonusData.bonusDice > 0) {
        for (let i = 0; i < hitBonusData.bonusDice; i++) {
            bonusTotal += Math.floor(Math.random() * 6) + 1;
        }
    }
    
    if (hitBonusData.penaltyDice > 0) {
        for (let i = 0; i < hitBonusData.penaltyDice; i++) {
            penaltyTotal += Math.floor(Math.random() * 6) + 1;
        }
    }
    
    // Calculate final hit roll
    const hitTotal = baseHitRoll + hitBonusData.total + bonusTotal - penaltyTotal;
    
    // Determine if crit or fumble
    let hitText = `${hitTotal}`;
    if (baseHitRoll === 20) hitText += ' (CRIT!)';
    if (baseHitRoll === 1) hitText += ' (FUMBLE!)';
    
    document.getElementById('attackRoll').textContent = `Hit: ${hitText}`;
    
    // Build detailed notation
    let hitNotation = `1d20(${baseHitRoll})`;
    
    if (hitBonusData.breakdown.length > 0) {
        hitNotation += ' + ' + hitBonusData.breakdown.filter(item => 
            !item.includes('Bonus Dice') && !item.includes('Penalty Dice')
        ).join(' + ');
    }
    
    if (bonusTotal > 0) {
        hitNotation += ` + ${hitBonusData.bonusDice}d6(${bonusTotal})`;
    }
    
    if (penaltyTotal > 0) {
        hitNotation += ` - ${hitBonusData.penaltyDice}d6(${penaltyTotal})`;
    }
    
    document.getElementById('attackNotation').textContent = hitNotation;

    // Calculate damage (unchanged)
    const damageData = calculateDamage();
    
    const finalDamage = baseHitRoll === 20 ? damageData.total * 2 : damageData.total;
    const damageText = baseHitRoll === 20 ? `${finalDamage} (CRIT x2)` : `${finalDamage}`;
    document.getElementById('damageRoll').textContent = `Dmg: ${damageText}`;
    
    document.getElementById('damageNotation').textContent = damageData.breakdown.join(' + ');
    
    console.log(`Base Attack Roll: 1d20(${baseHitRoll})`);
    if (bonusTotal > 0) console.log(`Bonus Dice: ${hitBonusData.bonusDice}d6 = ${bonusTotal}`);
    if (penaltyTotal > 0) console.log(`Penalty Dice: ${hitBonusData.penaltyDice}d6 = ${penaltyTotal}`);
    console.log(`Modifiers: +${hitBonusData.total}`);
    console.log(`Final Hit: ${hitTotal}`);
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
    
    // Add status effect details
    if (weapon.statuseffectX) {
        html += `<br><strong>Status:</strong> ${weapon.statuseffectX}`;
        
        if (weapon.statuseffectYduration) {
            html += ` (${weapon.statuseffectYduration} round${weapon.statuseffectYduration > 1 ? 's' : ''})`;
        }
        
        if (weapon.statuseffectZsaferollCL || weapon.statuseffectZsaferolltype) {
            html += `<br><strong>Save:</strong> `;
            if (weapon.statuseffectZsaferolltype) {
                html += `${weapon.statuseffectZsaferolltype}`;
            }
            if (weapon.statuseffectZsaferollCL) {
                html += ` CL ${weapon.statuseffectZsaferollCL}`;
            }
        }
    }
    
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




function populateConditionSelect() {
    const select = document.getElementById('conditionSelect');
    select.innerHTML = '<option value="">— Add condition —</option>';
    
    if (conditionsMaster && conditionsMaster.length > 0) {
        conditionsMaster.forEach(condition => {
            const option = document.createElement('option');
            option.value = condition.id;
            option.textContent = condition.name;
            select.appendChild(option);
        });
    }
}

function addCondition() {
    const select = document.getElementById('conditionSelect');
    const conditionId = select.value;
    
    if (!conditionId) return;
    
    const condition = conditionsMaster.find(c => c.id === conditionId);
    if (!condition) return;
    
    // Add condition to character
    if (!character.conditions) {
        character.conditions = [];
    }
    
    character.conditions.push({
        id: condition.id,
        name: condition.name,
        stackable: condition.stackable,
        penalty: condition.penalty,
        bonus: condition.bonus,
        note: condition.note,
        stacks: 1
    });
    
    renderConditions();
    saveCharacter();
}

function removeCondition(index) {
    if (character.conditions && character.conditions[index]) {
        character.conditions.splice(index, 1);
        renderConditions();
        saveCharacter();
    }
}

function renderConditions() {
    const list = document.getElementById('conditionList');
    const summary = document.getElementById('conditionSummary');
    
    if (!list) return;
    
    list.innerHTML = '';
    
    if (!character.conditions || character.conditions.length === 0) {
        summary.innerHTML = '<em>No active conditions</em>';
        return;
    }
    
    let totalPenalty = 0;
    let totalBonus = 0;
    
    character.conditions.forEach((condition, index) => {
        const li = document.createElement('li');
        li.className = 'condition-item';
        
        let displayText = condition.name;
        if (condition.stackable && condition.stacks > 1) {
            displayText += ` (${condition.stacks})`;
        }
        
        li.innerHTML = `
            <span>${displayText}</span>
            <small>${condition.note}</small>
            <button onclick="removeCondition(${index})">Remove</button>
        `;
        
        list.appendChild(li);
        
        // Calculate totals
        if (condition.stackable) {
            totalPenalty += condition.penalty * condition.stacks;
            totalBonus += condition.bonus * condition.stacks;
        } else {
            totalPenalty += condition.penalty;
            totalBonus += condition.bonus;
        }
    });
    
    // Calculate attack modifiers
    const attackModifiers = calculateConditionAttackModifiers();
    
    // Update summary
    summary.innerHTML = `
        <strong>Condition Summary:</strong><br>
        Total Penalty: ${totalPenalty} die${totalPenalty !== 1 ? 's' : ''} (-${attackModifiers.penaltyDice}d6 to attacks)<br>
        Total Bonus: ${totalBonus} die${totalBonus !== 1 ? 's' : ''} (+${attackModifiers.bonusDice}d6 to attacks)
    `;
}

function calculateConditionAttackModifiers() {
    if (!character.conditions || character.conditions.length === 0) {
        return { bonusDice: 0, penaltyDice: 0 };
    }

    let bonusDice = 0;
    let penaltyDice = 0;

    character.conditions.forEach(condition => {
        const stacks = condition.stackable ? condition.stacks : 1;
        bonusDice += condition.bonus * stacks;
        penaltyDice += condition.penalty * stacks;
    });

    return { bonusDice, penaltyDice };
}

// Character Import/Export Functions
function downloadCharacter() {
    const characterData = {
        stats: character.stats,
        tempStats: character.tempStats,
        skills: character.skills,
        currentHP: character.currentHP,
        maxHP: character.maxHP,
        level: parseInt(document.getElementById('level').value),
        selectedClass: document.getElementById('classSelect').value,
        selectedSubclass: document.getElementById('subclassSelect').value,
        selectedWeapon: document.getElementById('weaponSelect').value,
        selectedArmor: document.getElementById('armorSelect').value,
        selectedHelmet: document.getElementById('helmetSelect').value,
        conditions: character.conditions || [],
        background: {
            ideal: document.getElementById('idealInput').value,
            goal: document.getElementById('goalInput').value,
            personality: document.getElementById('personalityInput').value,
            fear: document.getElementById('fearInput').value
        },
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    // Create a blob with the JSON data
    const jsonString = JSON.stringify(characterData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const className = document.getElementById('classSelect').selectedOptions[0]?.textContent || 'Character';
    link.download = `FITF_${className}_${timestamp}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Character downloaded successfully!');
}

function uploadCharacter(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const characterData = JSON.parse(e.target.result);
            
            // Validate the data has required fields
            if (!characterData.stats || !characterData.skills) {
                throw new Error('Invalid character file format');
            }
            
            // Load the character data
            character.stats = characterData.stats || { STR: 0, AGI: 0, DUR: 0, KNO: 0, POW: 0, CHA: 0 };
            character.tempStats = characterData.tempStats || { STR: 0, AGI: 0, DUR: 0, KNO: 0, POW: 0, CHA: 0 };
            character.skills = characterData.skills || {};
            character.currentHP = characterData.currentHP || 20;
            character.conditions = characterData.conditions || [];
            
            // Update form fields
            document.getElementById('level').value = characterData.level || 1;
            document.getElementById('classSelect').value = characterData.selectedClass || '';
            document.getElementById('subclassSelect').value = characterData.selectedSubclass || '';
            document.getElementById('weaponSelect').value = characterData.selectedWeapon || '';
            document.getElementById('armorSelect').value = characterData.selectedArmor || '';
            document.getElementById('helmetSelect').value = characterData.selectedHelmet || '';
            
            // Load background data if present
            if (characterData.background) {
                document.getElementById('idealInput').value = characterData.background.ideal || '';
                document.getElementById('goalInput').value = characterData.background.goal || '';
                document.getElementById('personalityInput').value = characterData.background.personality || '';
                document.getElementById('fearInput').value = characterData.background.fear || '';
                
                // Save background to localStorage
                localStorage.setItem('fitf-background', JSON.stringify(characterData.background));
            }
            
            // Re-render everything
            renderSkills();
            renderConditions();
            updateAll();
            
            // Save to localStorage
            saveCharacter();
            
            alert('Character loaded successfully!');
            console.log('Character uploaded and loaded:', characterData);
            
        } catch (error) {
            alert('Error loading character file: ' + error.message);
            console.error('Error parsing character file:', error);
        }
    };
    
    reader.readAsText(file);
    
    // Reset the file input so the same file can be uploaded again if needed
    event.target.value = '';
}
