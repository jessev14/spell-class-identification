const moduleID = 'spell-class-identification';

const dnd5eClasses = [
    'Artificer',
    'Barbarian',
    'Bard',
    'Cleric',
    'Druid',
    'Fighter',
    'Monk',
    'Paladin',
    'Ranger',
    'Rogue',
    'Sorcerer',
    'Warlock',
    'Wizard'
];

const lg = x => console.log(x);


Hooks.once('init', () => {
    if (game.modules.get('compendium-browser')?.active) libWrapper.register(moduleID, 'CompendiumBrowser.prototype.passesFilter', newPassesFilter, 'MIXED');
});


Hooks.on('renderCompendiumBrowser', (app, [html], appData) => {
    const classFilterDiv = html.querySelector('div.filter[data-path="classes"]');
    const classFilterSelect = classFilterDiv.querySelector('select');
    classFilterSelect.innerHTML = ``;
    const option = document.createElement('option');
    option.value = 'null';
    option.innerText = '-';
    classFilterSelect.appendChild(option);
    for (const className of dnd5eClasses) {
        const option = document.createElement('option');
        option.value = className.toLowerCase();
        option.innerText = className;
        classFilterSelect.appendChild(option);
    }
});

Hooks.on('renderItemSheet5e', (app, [html], appData) => {
    const item = app.object;
    if (!['spell', 'feat'].includes(item.type)) return;

    const classesListDiv = document.createElement('div');
    classesListDiv.classList.add('spell-components', 'form-group', 'stacked');
    classesListDiv.innerHTML = `<label>Classes</label>`;
    for (const className of dnd5eClasses) {
        const label = document.createElement('label');
        label.classList.add('checkbox');
        label.innerHTML = `
            <input type="checkbox" name="flags.${moduleID}.${className}" ${item.getFlag(moduleID, className) ? 'checked' : ''} />
            ${className}
        `;
        classesListDiv.appendChild(label);
    }

    let injectElementLocator;
    if (item.type === 'spell') injectElementLocator = html.querySelector('div.spell-components.form-group.stacked');
    else injectElementLocator = html.querySelector('div.tab.details').querySelector('h3');
    injectElementLocator.before(classesListDiv);

    const descriptionTab = html.querySelector('div.tab[data-tab="description"]');
    const itemPropertiesDiv = descriptionTab.querySelector('div.item-properties');
    const propertiesOl = itemPropertiesDiv.querySelector('ol.properties-list');
    for (let i = dnd5eClasses.length - 1; i >= 0; i--) {
        const className = dnd5eClasses[i];
        const flagData = item.getFlag(moduleID, className);
        if (!flagData) continue;
        
        const li = document.createElement('li');
        li.innerText = className;
        propertiesOl.prepend(li);
    }

    app.setPosition({ height: 'auto' });
});


function newPassesFilter(wrapped, subject, filters) {
    const newFilters = { ...filters };
    const flagData = subject.flags[moduleID] || {};
    let filterClass, classInFlagData;
    for (const path of ['classes', 'classRequirement']) {
        if (!(path in newFilters)) continue;

        filterClass = newFilters[path]?.value;
        classInFlagData = flagData[`${filterClass[0].toUpperCase()}${filterClass.slice(1)}`];
        delete newFilters[path];
    }

    if (!classInFlagData) {
        let useBackup = true;
        useBackup = !Object.values(flagData).some(k => k);
        if (useBackup) return wrapped(subject, filters);
    }
    

    const res = wrapped(subject, newFilters);
    if (classInFlagData && res) return true;
    
    return false;
}
