// Background character information management

const suggestions = {
    ideal: [
        "Balance",
        "Faith",
        "Honor",
        "Reputation",
        "Community",
        "Family",
        "Justice",
        "Responsibility",
        "Creativity",
        "Freedom",
        "Knowledge",
        "Respect",
        "Discipline",
        "Generosity",
        "Loyalty",
        "Security",
        "Fairness",
        "Honesty",
        "Nature",
        "Sincerity"
    ],
    goal: [
        { num: 1, text: "Ambition - Work your way up the ranks in the Foundation" },
        { num: 2, text: "Atonement - Make up for past sins or shortcomings" },
        { num: 3, text: "Discovery - Solve a mystery that haunts you or a loved one" },
        { num: 4, text: "Forgiveness - Earn the pardon of someone that you wronged" },
        { num: 5, text: "Growth - Shed character flaws and become a better person" },
        { num: 6, text: "Knowledge - Learn as much as possible about anomalies" },
        { num: 7, text: "Legacy - Become a legend within the anomalous world" },
        { num: 8, text: "Meaning - Find purpose and discover what you want in life" },
        { num: 9, text: "Mentor - Be a great teacher/guide to those around you" },
        { num: 10, text: "Reconciliation - Heal a meaningful relationship you ruined" },
        { num: 11, text: "Recovery - Find an important personal item that you lost" },
        { num: 12, text: "Relief - Pay off some debt that you or a loved one owes" },
        { num: 13, text: "Rescue - Save a loved one from poverty, imprisonment, etc." },
        { num: 14, text: "Retirement - Earn enough assets for a cozy retirement" },
        { num: 15, text: "Revenge - Punish some entity that once wronged you" },
        { num: 16, text: "Sacrifice - Make great personal sacrifices for loved ones" },
        { num: 17, text: "Service - Serve the world in every way you possibly can" },
        { num: 18, text: "Shift - Change how the Foundation/world treats anomalies" },
        { num: 19, text: "Upheaval - Effect the anomalous world in a major way" },
        { num: 20, text: "Validation - Prove yourself to those you want the approval" }
    ],
    personality: [
        "Absent-Minded", "Adaptable", "Adventurous", "Aggressive",
        "Aloof", "Antagonistic", "Apathetic", "Appreciative",
        "Argumentative", "Arrogant", "Assertive", "Authoritarian",
        "Benevolent", "Bull-headed", "Brutish", "Callous",
        "Calm", "Caring", "Careless", "Cautious",
        "Calculating", "Charming", "Charmless", "Cheerful",
        "Childish", "Clumsy", "Cold", "Competitive",
        "Conceited", "Confident", "Considerate", "Cooperative",
        "Courageous", "Cowardly", "Crass", "Crazy",
        "Curious", "Cynical", "Deceitful", "Decisive",
        "Delicate", "Dependent", "Desperate", "Destructive",
        "Detached", "Disciplined", "Dishonest", "Distractable",
        "Dogmatic", "Domineering", "Dramatic", "Easygoing",
        "Egocentric", "Enigmatic", "Envious", "Erratic",
        "Faithless", "Fanatical", "Farsighted", "Fearful",
        "Firm", "Flexible", "Focused", "Foolish",
        "Forceful", "Forgetful", "Forthright", "Friendly",
        "Generous", "Gentle", "Gullible", "Hardworking",
        "Hedonistic", "Helpful", "Heroic", "Hesitant",
        "Honest", "Humble", "Humorous", "Hypocritical",
        "Idealistic", "Impatient", "Impulsive", "Indecisive",
        "Independent", "Individualistic", "Insecure", "Insensitive",
        "Judgmental", "Kind", "Magnanimous", "Mature",
        "Messy", "Methodical", "Meticulous", "Morbid",
        "Narcissistic", "Neurotic", "Nosy", "Objective",
        "Obsessive", "Oblivious", "Optimistic", "Organized",
        "Outspoken", "Overconfident", "Overcautious", "Paranoid",
        "Partisan", "Passionate", "Patient", "Perceptive",
        "Pessimistic", "Polite", "Power-hungry", "Practical",
        "Principled", "Protective", "Proud", "Prudent",
        "Pure", "Rational", "Reactionary", "Realistic",
        "Relentless", "Respectful", "Reserved", "Rigid",
        "Sadistic", "Selfish", "Selfless", "Self-critical",
        "Sensitive", "Serious", "Shallow", "Shortsighted",
        "Skeptical", "Stoic", "Stubborn", "Stylish",
        "Submissive", "Suspicious", "Tactless", "Tasteless",
        "Thin-skinned", "Thoughtless", "Tolerant", "Tough",
        "Trusting", "Underhanded", "Understanding", "Unfair",
        "Vacuous", "Vindictive", "Vivacious", "Warm",
        "Weak-willed", "Wise", "Witty"
    ],
    fear: [
        { num: 1, text: "Accidents", details: "Structural collapse, vehicle collisions, workplace incidents" },
        { num: 12, text: "Aliens", details: "" },
        { num: 13, text: "Animals", details: "Birds, bears, bulls, cats, dogs, frogs, horses, piranhas, rats, reptiles, snakes, sharks" },
        { num: 14, text: "Blood", details: "" },
        { num: 15, text: "Bodies of water", details: "" },
        { num: 16, text: "Bright lights", details: "" },
        { num: 17, text: "Cannibalism", details: "" },
        { num: 18, text: "Chemicals", details: "Arsenic, asbestos, cadmium, lead, mercury" },
        { num: 21, text: "Choking/suffocating", details: "" },
        { num: 22, text: "Confined spaces", details: "" },
        { num: 23, text: "Corrosion/decay", details: "" },
        { num: 24, text: "Criminals", details: "Gang members, murderers, serial killers, thieves" },
        { num: 25, text: "Crowded spaces", details: "" },
        { num: 26, text: "Darkness", details: "" },
        { num: 27, text: "Death/dead things", details: "" },
        { num: 28, text: "Doctors/hospitals", details: "" },
        { num: 31, text: "Doppelgangers/mimics", details: "" },
        { num: 32, text: "Dreams/nightmares", details: "" },
        { num: 33, text: "Empty spaces", details: "" },
        { num: 34, text: "Enormous entities/objects", details: "" },
        { num: 35, text: "Extreme cold", details: "" },
        { num: 36, text: "Extreme heat", details: "" },
        { num: 37, text: "Fire", details: "" },
        { num: 38, text: "Germs/Disease", details: "" },
        { num: 41, text: "Getting lost", details: "" },
        { num: 42, text: "Ghosts/spirits", details: "" },
        { num: 43, text: "Gods/god-like beings", details: "" },
        { num: 44, text: "Guns", details: "" },
        { num: 45, text: "Hallucinations", details: "" },
        { num: 46, text: "Heavenly judgment", details: "" },
        { num: 47, text: "Heights", details: "" },
        { num: 48, text: "High speeds", details: "" },
        { num: 51, text: "Human-like figures", details: "Dolls, mannequins, puppets, robots, statues" },
        { num: 52, text: "Imprisonment", details: "" },
        { num: 53, text: "Infinity/eternity", details: "" },
        { num: 54, text: "Insanity", details: "" },
        { num: 55, text: "Insects", details: "Bees, centipedes, cockroaches, moths, spiders, wasps" },
        { num: 56, text: "Intoxication", details: "" },
        { num: 57, text: "Isolation", details: "" },
        { num: 58, text: "Loud noises", details: "" },
        { num: 61, text: "Losing bodily control", details: "" },
        { num: 62, text: "Mirrors/reflections", details: "" },
        { num: 63, text: "Monsters", details: "Cryptids, vampires, werewolves, zombies" },
        { num: 64, text: "Mutations", details: "" },
        { num: 65, text: "Natural disasters", details: "Earthquakes, floods, hurricanes, tornadoes, tsunamis, volcanic eruptions" },
        { num: 66, text: "Needles/injections", details: "" },
        { num: 67, text: "Outer space", details: "" },
        { num: 68, text: "Parasites", details: "Hookworms, leeches, lice, maggots, ticks" },
        { num: 71, text: "Plants/Fungi", details: "Mushrooms, nightshade, sunflowers, Venus flytraps" },
        { num: 72, text: "Poison", details: "" },
        { num: 73, text: "Pregnancy/childbirth", details: "" },
        { num: 74, text: "Public speaking", details: "" },
        { num: 75, text: "Punishment", details: "" },
        { num: 76, text: "Rage", details: "" },
        { num: 77, text: "Religious leaders/iconography", details: "" },
        { num: 78, text: "Schools/teachers", details: "" },
        { num: 81, text: "Severe injury", details: "" },
        { num: 82, text: "Shadows", details: "" },
        { num: 83, text: "Sharp objects", details: "" },
        { num: 84, text: "Storms", details: "" },
        { num: 85, text: "Strangers", details: "" },
        { num: 86, text: "Suffering", details: "" },
        { num: 87, text: "Tiny entities/objects", details: "" },
        { num: 88, text: "Viscera", details: "" }
    ],
    disposition: [
        { num: 1, text: "Agreeable & oblivious" },
        { num: 2, text: "Analytical & detached" },
        { num: 3, text: "Arrogant & intense" },
        { num: 4, text: "Bubbly & optimistic" },
        { num: 5, text: "Burned out & cynical" },
        { num: 6, text: "Calm & skeptical" },
        { num: 7, text: "Cold & melancholic" },
        { num: 8, text: "Crabby & pessimistic" },
        { num: 9, text: "Diplomatic & cautious" },
        { num: 10, text: "Eccentric & open" },
        { num: 11, text: "Energetic & reckless" },
        { num: 12, text: "Fearful & skittish" },
        { num: 13, text: "Friendly & outgoing" },
        { num: 14, text: "Hopeful & goodhearted" },
        { num: 15, text: "Hotheaded & vicious" },
        { num: 16, text: "Insecure & anxious" },
        { num: 17, text: "Nervous & naive" },
        { num: 18, text: "Quiet & guarded" },
        { num: 19, text: "Serious & collected" },
        { num: 20, text: "Silly & absent-minded" }
    ]
};

function toggleBackgroundSidebar() {
    const sidebar = document.getElementById('backgroundSidebar');
    const icon = document.getElementById('bgToggleIcon');
    
    sidebar.classList.toggle('open');
    
    if (sidebar.classList.contains('open')) {
        icon.textContent = '▶';
    } else {
        icon.textContent = '◀';
    }
}

function showSuggestions(type) {
    const modal = document.getElementById('suggestionModal');
    const title = document.getElementById('suggestionTitle');
    const list = document.getElementById('suggestionList');
    
    const titles = {
        ideal: 'Ideal Suggestions',
        goal: 'Goal Suggestions',
        personality: 'Personality Trait Suggestions',
        fear: 'Fear Suggestions',
        disposition: 'Disposition Suggestions'
    };
    
    title.textContent = titles[type] || 'Suggestions';
    
    list.innerHTML = '';
    
    const items = suggestions[type];
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        
        if (typeof item === 'string') {
            div.textContent = item;
            div.onclick = () => selectSuggestion(type, item);
        } else if (item.num && item.text) {
            if (item.details) {
                div.innerHTML = `<strong>${item.num}.</strong> ${item.text}<br><small style="color: #888;">${item.details}</small>`;
            } else {
                div.innerHTML = `<strong>${item.num}.</strong> ${item.text}`;
            }
            div.onclick = () => selectSuggestion(type, item.text);
        }
        
        list.appendChild(div);
    });
    
    modal.classList.add('active');
}

function closeSuggestions(event) {
    const modal = document.getElementById('suggestionModal');
    modal.classList.remove('active');
}

function selectSuggestion(type, text) {
    const inputMap = {
        ideal: 'idealInput',
        goal: 'goalInput',
        personality: 'personalityInput',
        fear: 'fearInput',
        disposition: 'dispositionInput'
    };
    
    const inputId = inputMap[type];
    const input = document.getElementById(inputId);
    
    if (type === 'personality') {
        // For personality, add to existing traits
        const current = input.value.trim();
        if (current) {
            input.value = current + ', ' + text;
        } else {
            input.value = text;
        }
    } else {
        input.value = text;
    }
    
    saveBackground();
    closeSuggestions();
}

function saveBackground() {
    const background = {
        ideal: document.getElementById('idealInput').value,
        goal: document.getElementById('goalInput').value,
        personality: document.getElementById('personalityInput').value,
        fear: document.getElementById('fearInput').value,
        disposition: document.getElementById('dispositionInput').value
    };
    
    localStorage.setItem('fitf-background', JSON.stringify(background));
}

function loadBackground() {
    const saved = localStorage.getItem('fitf-background');
    if (!saved) return;
    
    try {
        const background = JSON.parse(saved);
        
        document.getElementById('idealInput').value = background.ideal || '';
        document.getElementById('goalInput').value = background.goal || '';
        document.getElementById('personalityInput').value = background.personality || '';
        document.getElementById('fearInput').value = background.fear || '';
        document.getElementById('dispositionInput').value = background.disposition || '';
    } catch (e) {
        console.error('Error loading background:', e);
    }
}

// Load background data when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadBackground();
});