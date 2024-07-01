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
    else if (item.type === 'feat') injectElementLocator = html.querySelector('select[data-tidy-field="system.type.value"]').closest('div.form-group');
    else injectElementLocator = html.querySelector('div.tab.details').querySelector('h3');
    injectElementLocator.before(classesListDiv);

    const descriptionTab = html.querySelector('div.tab[data-tab="description"]') || html.querySelector('div.tidy-tab[data-tab-contents-for="description"]');
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
