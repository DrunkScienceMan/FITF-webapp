// Advanced dice roller with probability distributions
// Supports: XdY, XdY+Z, XdY!, XdYkh, dl (drop lowest), dh (drop highest), ri (reroll 1s), etc.

function convolve(d1, d2) {
    const result = {};
    for (const [v1, p1] of Object.entries(d1)) {
        if (v1 === '_hasExploding') continue;
        for (const [v2, p2] of Object.entries(d2)) {
            if (v2 === '_hasExploding') continue;
            const sum = +v1 + +v2;
            result[sum] = (result[sum] || 0) + p1 * p2;
        }
    }
    return result;
}

function calculateDice(count, sides) {
    const dist = {};
    function roll(n, cur = []) {
        if (n === 0) {
            const sum = cur.reduce((a, b) => a + b, 0);
            dist[sum] = (dist[sum] || 0) + 1;
            return;
        }
        for (let i = 1; i <= sides; i++) roll(n - 1, [...cur, i]);
    }
    roll(count);
    const total = Math.pow(sides, count);
    const res = {};
    for (const [v, c] of Object.entries(dist)) res[v] = c / total;
    return res;
}

function calculateExplodingDice(count, sides) {
    function single() {
        const dist = {};
        let carry = { 0: 1 };
        let depth = 0;
        while (Object.keys(carry).length) {
            const next = {};
            for (const [offsetStr, p] of Object.entries(carry)) {
                const offset = +offsetStr;
                for (let v = 1; v < sides; v++) dist[offset + v] = (dist[offset + v] || 0) + p * (1 / sides);
                const pExpl = p * (1 / sides);
                if (pExpl > 1e-12) next[offset + sides] = (next[offset + sides] || 0) + pExpl;
            }
            carry = next;
            if (++depth > 1000) break;
        }
        return dist;
    }
    let dist = single();
    for (let i = 1; i < count; i++) dist = convolve(dist, single());
    return dist;
}

function calculateKeepHighest(count, sides, keep) {
    const dist = {};
    function roll(n, cur = []) {
        if (n === 0) {
            const kept = cur.sort((a, b) => b - a).slice(0, keep);
            const sum = kept.reduce((a, b) => a + b, 0);
            dist[sum] = (dist[sum] || 0) + 1;
            return;
        }
        for (let i = 1; i <= sides; i++) roll(n - 1, [...cur, i]);
    }
    roll(count);
    const total = Math.pow(sides, count);
    const res = {};
    for (const [v, c] of Object.entries(dist)) res[v] = c / total;
    return res;
}

function calculateDropLowest(count, sides, drop) {
    return calculateKeepHighest(count, sides, count - drop);
}

function calculateRerollOnes(count, sides) {
    const dist = {};
    function roll(n, cur = []) {
        if (n === 0) {
            const sum = cur.reduce((a, b) => a + b, 0);
            dist[sum] = (dist[sum] || 0) + 1;
            return;
        }
        for (let i = 1; i <= sides; i++) {
            if (i === 1) {
                for (let j = 1; j <= sides; j++) {
                    roll(n - 1, [...cur, j]);
                }
            } else {
                roll(n - 1, [...cur, i]);
            }
        }
    }
    roll(count);
    const total = Math.pow(sides, count) * Math.pow(sides, count);
    const res = {};
    for (const [v, c] of Object.entries(dist)) res[v] = c / total;
    return res;
}

function addConstant(dist, c) {
    const res = {};
    for (const [v, p] of Object.entries(dist)) if (v !== "_hasExploding") res[+v + c] = p;
    return res;
}

function parseSingleTerm(expr) {
    const exploding = expr.match(/^(\d+)?d(\d+|%)!$/i);
    if (exploding) {
        const c = parseInt(exploding[1] || "1");
        const s = exploding[2] === "%" ? 100 : +exploding[2];
        return calculateExplodingDice(c, s);
    }

    const kh = expr.match(/^(\d+)d(\d+)kh(\d+)$/i);
    if (kh) return calculateKeepHighest(+kh[1], +kh[2], +kh[3]);

    const dl = expr.match(/^(\d+)d(\d+)dl(\d+)$/i);
    if (dl) return calculateDropLowest(+dl[1], +dl[2], +dl[3]);

    const ri = expr.match(/^(\d+)d(\d+)ri$/i);
    if (ri) return calculateRerollOnes(+ri[1], +ri[2]);

    const withMod = expr.match(/^(\d+)?d(\d+|%)([+-]\d+)?$/i);
    if (withMod) {
        const c = parseInt(withMod[1] || "1");
        const s = withMod[2] === "%" ? 100 : +withMod[2];
        const m = withMod[3] ? +withMod[3] : 0;
        const d = calculateDice(c, s);
        return m !== 0 ? addConstant(d, m) : d;
    }

    if (/^-?\d+$/.test(expr)) return { [parseInt(expr)]: 1 };

    throw new Error("Unsupported dice notation: " + expr);
}

function parseAdditionExpression(expr) {
    const terms = expr.split(/(?=[+-])/).filter(t => t.length > 0);
    let result = null, hasExploding = false;
    for (let t of terms) {
        if (t.startsWith("+")) t = t.slice(1);
        let d;
        if (/^-?\d+$/.test(t)) {
            d = { [parseInt(t)]: 1 };
        } else {
            d = parseSingleTerm(t);
            if (t.includes("!")) hasExploding = true;
        }
        result = result ? convolve(result, d) : d;
    }
    result._hasExploding = hasExploding;
    return result;
}

function parseDiceExpression(expr) {
    expr = expr.trim().replace(/\s+/g, "");
    if (expr.includes("+") || expr.includes("-")) return parseAdditionExpression(expr);
    return parseSingleTerm(expr);
}

// Simple roll function that returns a single random result
function rollDice(notation) {
    if (!notation) return 0;
    notation = String(notation).trim();

    if (!isNaN(notation)) return parseInt(notation);

    if (notation.includes('!i')) {
        const match = notation.match(/^(\d+)?d(\d+)!i([+-]\d+)?$/i);
        if (match) {
            const [, numDice, sides, modifier] = match;
            const count = parseInt(numDice || "1");
            const die = parseInt(sides);
            let total = 0;
            
            for (let i = 0; i < count; i++) {
                let roll = Math.floor(Math.random() * die) + 1;
                total += roll;
                let explosions = 0;
                // Explode indefinitely (with safety limit)
                while (roll === die && explosions < 100) {
                    roll = Math.floor(Math.random() * die) + 1;
                    total += roll;
                    explosions++;
                }
            }
            
            if (modifier) total += parseInt(modifier);
            return Math.max(0, total);
        }
    }

    if (notation.includes('!')) {
        const match = notation.match(/^(\d+)?d(\d+)!([+-]\d+)?$/i);
        if (match) {
            const [, numDice, sides, modifier] = match;
            const count = parseInt(numDice || "1");
            const die = parseInt(sides);
            let total = 0;
            
            for (let i = 0; i < count; i++) {
                let roll = Math.floor(Math.random() * die) + 1;
                total += roll;
                while (roll === die) {
                    roll = Math.floor(Math.random() * die) + 1;
                    total += roll;
                }
            }
            
            if (modifier) total += parseInt(modifier);
            return Math.max(0, total);
        }
    }

    if (notation.includes('kh')) {
        const match = notation.match(/^(\d+)d(\d+)kh(\d+)$/i);
        if (match) {
            const [, numDice, sides, keep] = match;
            const rolls = [];
            for (let i = 0; i < parseInt(numDice); i++) {
                rolls.push(Math.floor(Math.random() * parseInt(sides)) + 1);
            }
            rolls.sort((a, b) => b - a);
            return rolls.slice(0, parseInt(keep)).reduce((a, b) => a + b, 0);
        }
    }

    if (notation.includes('dl')) {
        const match = notation.match(/^(\d+)d(\d+)dl(\d+)$/i);
        if (match) {
            const [, numDice, sides, drop] = match;
            const rolls = [];
            for (let i = 0; i < parseInt(numDice); i++) {
                rolls.push(Math.floor(Math.random() * parseInt(sides)) + 1);
            }
            rolls.sort((a, b) => b - a);
            return rolls.slice(0, rolls.length - parseInt(drop)).reduce((a, b) => a + b, 0);
        }
    }

    if (notation.includes('ri')) {
        const match = notation.match(/^(\d+)d(\d+)ri$/i);
        if (match) {
            const [, numDice, sides] = match;
            let total = 0;
            for (let i = 0; i < parseInt(numDice); i++) {
                let roll = Math.floor(Math.random() * parseInt(sides)) + 1;
                if (roll === 1) {
                    roll = Math.floor(Math.random() * parseInt(sides)) + 1;
                }
                total += roll;
            }
            return total;
        }
    }

    const match = notation.match(/^(\d+)?d(\d+)([+-]\d+)?$/i);
    if (!match) return 0;

    const [, numDice, sides, modifier] = match;
    let total = 0;

    for (let i = 0; i < parseInt(numDice || "1"); i++) {
        total += Math.floor(Math.random() * parseInt(sides)) + 1;
    }

    if (modifier) {
        total += parseInt(modifier);
    }

    return Math.max(0, total);
}

function getExpectedValue(notation) {
    try {
        const dist = parseDiceExpression(notation);
        let sum = 0;
        for (const [val, p] of Object.entries(dist)) {
            if (val === "_hasExploding") continue;
            sum += (+val) * p;
        }
        return sum;
    } catch (e) {
        return 0;
    }
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

// ===== DICE SIDEBAR FUNCTIONS =====
let rollHistory = [];

function toggleDiceSidebar() {
    const sidebar = document.getElementById('diceSidebar');
    const icon = document.getElementById('diceToggleIcon');
    
    sidebar.classList.toggle('open');
    
    if (sidebar.classList.contains('open')) {
        icon.textContent = '◀';
        loadRollHistory();
    } else {
        icon.textContent = '▶';
    }
}

function rollSingleDice(sides) {
    const result = Math.floor(Math.random() * sides) + 1;
    const resultElement = document.getElementById(`result-d${sides}`);
    
    // Animate the result
    resultElement.style.transform = 'scale(1.3)';
    resultElement.style.color = '#6effef';
    resultElement.textContent = result;
    
    setTimeout(() => {
        resultElement.style.transform = 'scale(1)';
        resultElement.style.color = '#fff';
    }, 300);
    
    // Add to history
    addToRollHistory(`d${sides}`, result);
    
    console.log(`Rolled d${sides}: ${result}`);
}

function rollCustomDice() {
    const input = document.getElementById('customDiceInput');
    const notation = input.value.trim();
    
    if (!notation) {
        alert('Please enter a dice notation (e.g., 2d6+3)');
        return;
    }
    
    try {
        const result = rollDice(notation);
        const resultElement = document.getElementById('customRollResult');
        
        // Animate the result
        resultElement.style.transform = 'scale(1.2)';
        resultElement.style.color = '#6effef';
        resultElement.textContent = `${notation} = ${result}`;
        
        setTimeout(() => {
            resultElement.style.transform = 'scale(1)';
            resultElement.style.color = '#4ecdc4';
        }, 300);
        
        // Add to history
        addToRollHistory(notation, result);
        
        console.log(`Rolled ${notation}: ${result}`);
    } catch (error) {
        alert('Invalid dice notation. Examples: 1d20, 2d6+3, 3d8-2');
        console.error('Dice roll error:', error);
    }
}

function addToRollHistory(formula, result) {
    const timestamp = new Date().toLocaleTimeString();
    rollHistory.unshift({ formula, result, timestamp });
    
    // Keep only last 20 rolls
    if (rollHistory.length > 20) {
        rollHistory = rollHistory.slice(0, 20);
    }
    
    saveRollHistory();
    renderRollHistory();
}

function renderRollHistory() {
    const listElement = document.getElementById('rollHistoryList');
    
    if (rollHistory.length === 0) {
        listElement.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">No rolls yet</div>';
        return;
    }
    
    listElement.innerHTML = rollHistory.map(roll => `
        <div class="roll-history-item">
            <div>
                <div class="roll-formula">${roll.formula}</div>
                <div style="font-size: 0.8em; color: #666;">${roll.timestamp}</div>
            </div>
            <div class="roll-result">${roll.result}</div>
        </div>
    `).join('');
}

function clearRollHistory() {
    if (rollHistory.length === 0) return;
    
    if (confirm('Clear all roll history?')) {
        rollHistory = [];
        saveRollHistory();
        renderRollHistory();
    }
}

function saveRollHistory() {
    localStorage.setItem('fitf-roll-history', JSON.stringify(rollHistory));
}

function loadRollHistory() {
    const saved = localStorage.getItem('fitf-roll-history');
    if (saved) {
        try {
            rollHistory = JSON.parse(saved);
            renderRollHistory();
        } catch (e) {
            console.error('Error loading roll history:', e);
            rollHistory = [];
        }
    }
}

// Allow Enter key to roll custom dice
document.addEventListener('DOMContentLoaded', function() {
    const customInput = document.getElementById('customDiceInput');
    if (customInput) {
        customInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                rollCustomDice();
            }
        });
    }
});
