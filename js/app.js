// Main application logic and UI management

// Initialize the application
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

        const label = document.createElement('span');
        label.textContent = skill;

        const value = document.createElement('span');
        value.className = 'skill-value';
        value.id = `skill-${skill}`;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'focus-toggle';
        checkbox.checked = character.skills[skill].focus;
        checkbox.onchange = () => {
            character.skills[skill].focus = checkbox.checked;
            updateAll();
            saveCharacter();
        };

        div.appendChild(label);
        div.appendChild(value);
        div.appendChild(checkbox);
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

function updateWeaponInfo() {
    const weapon = getSelectedWeapon();
    const info = document.getElementById('weaponInfo');

    if (!weapon) {
        info.innerHTML = '';
        return;
    }

    const properties = Array.isArray(weapon.weaponproperty) 
        ? weapon.weaponproperty.join(', ') 
        : weapon.weaponproperty || '';

    info.innerHTML = `
        <strong>${weapon.name}</strong><br>
        Damage: ${weapon.damage1 || '1'} ${weapon.damagemodifier ? '+ ' + weapon.damagemodifier : ''}<br>
        Type: ${weapon.damagetype || 'physical'}<br>
        Range: ${weapon.range || '1'}m<br>
        Hit Bonus: +${weapon.hitbonus || 0}<br>
        ${properties ? 'Properties: ' + properties : ''}
        ${weapon.statuseffectX ? '<br>Status Effect: ' + weapon.statuseffectX : ''}
    `;
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

// Single DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    init();
    
    const damageTypeSelect = document.getElementById('damageTypeSelect');
    if (damageTypeSelect) {
        damageTypeSelect.addEventListener('change', updateDamageReduction);
    }
});

function updateAll() {
    updateSkills();
    updateHP();
    updateAC();
    updateSpeed();
    updateWeaponInfo();
    updateEquipmentStats();
    updateHealthBar();
    updateDamageReduction();
    saveCharacter();
}

function updateEquipmentStats() {
    updateWeaponStats();
    updateArmorStats();
    updateHelmetStats();
}

function updateWeaponStats() {
    const weapon = getSelectedWeapon();
    const statsDiv = document.getElementById('weaponStats');
    
    if (!weapon) {
        statsDiv.innerHTML = '';
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
        statsDiv.innerHTML = '';
        return;
    }
    
    let html = `<strong>AC Bonus:</strong> +${armor.effectac || 0}`;
    if (armor.debuffspeed) html += `<br><strong>Speed Penalty:</strong> -${armor.debuffspeed}m`;
    
    const reductions = [];
    if (armor.damageRePhy) reductions.push(`Physical: ${armor.damageRePhy}`);
    if (armor.damageReHe) reductions.push(`Heat: ${armor.damageReHe}`);
    if (armor.damageReCo) reductions.push(`Cold: ${armor.damageReCo}`);
    if (armor.damageReEl) reductions.push(`Electrical: ${armor.damageReEl}`);
    if (armor.damageReCh) reductions.push(`Chemical: ${armor.damageReCh}`);
    if (armor.damageReEx) reductions.push(`Explosive: ${armor.damageReEx}`);
    if (armor.damageReLi) reductions.push(`Light: ${armor.damageReLi}`);
    if (armor.damageReSo) reductions.push(`Sound: ${armor.damageReSo}`);
    if (armor.damageReMe) reductions.push(`Memetic: ${armor.damageReMe}`);
    if (armor.damageReAn) reductions.push(`Anomalous: ${armor.damageReAn}`);
    
    if (reductions.length > 0) {
        html += `<br><strong>Damage Reduction:</strong><br>${reductions.join('<br>')}`;
    }
    
    statsDiv.innerHTML = html;
}

function updateHelmetStats() {
    const helmet = getSelectedHelmet();
    const statsDiv = document.getElementById('helmetStats');
    
    if (!helmet) {
        statsDiv.innerHTML = '';
        return;
    }
    
    let html = `<strong>AC Bonus:</strong> +${helmet.effectac || 0}`;
    if (helmet.debuffspeed) html += `<br><strong>Speed Penalty:</strong> -${helmet.debuffspeed}m`;
    
    const reductions = [];
    if (helmet.damageRePhy) reductions.push(`Physical: ${helmet.damageRePhy}`);
    if (helmet.damageReHe) reductions.push(`Heat: ${helmet.damageReHe}`);
    if (helmet.damageReCo) reductions.push(`Cold: ${helmet.damageReCo}`);
    if (helmet.damageReEl) reductions.push(`Electrical: ${helmet.damageReEl}`);
    if (helmet.damageReCh) reductions.push(`Chemical: ${helmet.damageReCh}`);
    if (helmet.damageReEx) reductions.push(`Explosive: ${helmet.damageReEx}`);
    if (helmet.damageReLi) reductions.push(`Light: ${helmet.damageReLi}`);
    if (helmet.damageReSo) reductions.push(`Sound: ${helmet.damageReSo}`);
    if (helmet.damageReMe) reductions.push(`Memetic: ${helmet.damageReMe}`);
    if (helmet.damageReAn) reductions.push(`Anomalous: ${helmet.damageReAn}`);
    
    if (reductions.length > 0) {
        html += `<br><strong>Damage Reduction:</strong><br>${reductions.join('<br>')}`;
    }
    
    statsDiv.innerHTML = html;
}