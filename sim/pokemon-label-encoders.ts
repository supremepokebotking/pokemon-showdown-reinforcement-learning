import { LabelEncoder } from 'machinelearn/preprocessing/label';
import {Dex, toID} from './dex';
import {Items} from '../data/items';
import {Abilities} from '../data/abilities';
import {Moves} from '../data/moves';
import {Aliases} from '../data/aliases';

//npm install --save machinelearn

export class PokemonEncoder {
	dex: ModdedDex;
	gen: number;

	constructor() {
    this.dex = Dex;
    this.items = Items;
		this.gen = this.dex.gen;

    this.populatePokemonNames();
    this.populateItems();
    this.populateAbilities();
    this.populateStatuses();
    this.populateWeather();
    this.populateTerrains();
    this.populateCategories();
    this.populateEffectiveness();
    this.populateAttackNames();
    this.populateGenders();
    this.populateGenerations();
    this.populateGameTypes();
    this.populateTiers();
    this.populateRooms();
    this.populateTypes();
    this.populateSelectableTargets();
    this.populateAttackActions();
		this.populateAliasNames();
	}

	getEncodersConfig(){
		return {
			'pokemon_names': Array.from(this.all_pokemon_names),
			'pokemon_ids': Array.from(this.all_pokemon_ids),
			'items': Array.from(this.all_item_names),
			'abilities': Array.from(this.all_ability_names),
			'statuses': Array.from(this.all_status),
			'weather': Array.from(this.all_weather),
			'terrains': Array.from(this.all_terrains),
			'categories': Array.from(this.all_categories),
			'genders': Array.from(this.all_genders),
			'attack_names': Array.from(this.all_attack_names),
			'elements': Array.from(this.allTypes),
			'rooms': Array.from(this.all_rooms),
		}
	}

	populateAliasNames(){
		this.all_alias_names = {};
		for (const id in Aliases) {
			this.all_alias_names[id] = Aliases[id];
		}
	}

  populatePokemonNames(){
    this.pokemonNamesLabelEncoder = new LabelEncoder();
		this.all_pokemon_names = new Set()
		this.all_pokemon_ids = new Set()

    const formes: string[][] = [[], [], [], [], [], []];
		for (const id in this.dex.data.Pokedex) {
			const species = Dex.species.get(id);
			this.all_pokemon_names.add(species.name);
			this.all_pokemon_ids.add(id);
		}
		this.all_pokemon_names.add('empty_pokemon')
    this.all_pokemon_names.add('hidden_pokemon')
    this.all_pokemon_names.add('unregistered_pokemon')
		this.all_pokemon_ids.add('empty_pokemon')
    this.all_pokemon_ids.add('hidden_pokemon')
    this.all_pokemon_ids.add('unregistered_pokemon')
    this.pokemonNamesLabelEncoder.fit(Array.from(this.all_pokemon_ids))

  }

  populateItems(){
    this.itemsLabelEncoder = new LabelEncoder();
    this.all_item_names = new Set()

		for (const id in Items) {
      this.all_item_names.add(id);
		}
    this.all_item_names.add('')
    this.all_item_names.add('hidden_item')
    this.all_item_names.add('unregistered_item')
    this.itemsLabelEncoder.fit(Array.from(this.all_item_names))
  }

  populateAbilities(){
    this.abilitiesLabelEncoder = new LabelEncoder();
    this.all_ability_names = new Set()

		for (const id in Abilities) {
      this.all_ability_names.add(id);
		}
    this.all_ability_names.add('none')
    this.all_ability_names.add('empty_ability')
    this.all_ability_names.add('hidden_ability')
    this.all_ability_names.add('unregistered_ability')
    this.abilitiesLabelEncoder.fit(Array.from(this.all_ability_names))
  }

  populateStatuses(){
    this.statusLabelEncoder = new LabelEncoder();
    this.all_status = new Set();
    this.all_status.add('brn')
    this.all_status.add('par')
    this.all_status.add('slp')
    this.all_status.add('frz')
    this.all_status.add('psn')
    this.all_status.add('tox')
    this.all_status.add('fnt')
    this.all_status.add('')
    this.statusLabelEncoder.fit(Array.from(this.all_status))
  }

  populateWeather(){
    this.weatherLabelEncoder = new LabelEncoder();
    this.all_weather = new Set()
    this.all_weather.add('SunnyDay')
    this.all_weather.add('RainDance')
    this.all_weather.add('DesolateLand')
    this.all_weather.add('PrimordialSea')
    this.all_weather.add('Hail')
    this.all_weather.add('Sandstorm')
    this.all_weather.add('DeltaStream')
    this.all_weather.add('none')
    this.weatherLabelEncoder.fit(Array.from(this.all_weather))
  }

  populateTerrains(){
    this.terrainLabelEncoder = new LabelEncoder();
    this.all_terrains = new Set()
    this.all_terrains.add('none')
    this.all_terrains.add('Electric Terrain')
    this.all_terrains.add('Grassy Terrain')
    this.all_terrains.add('Misty Terrain')
    this.all_terrains.add('Psychic Terrain')
    this.terrainLabelEncoder.fit(Array.from(this.all_terrains))
  }

  populateCategories(){
    this.categoriesLabelEncoder = new LabelEncoder();
    this.all_categories = new Set()
    this.all_categories.add('Empty')
    this.all_categories.add('Special')
    this.all_categories.add('Physical')
    this.all_categories.add('Status')
    this.categoriesLabelEncoder.fit(Array.from(this.all_categories))
  }

  populateEffectiveness(){
    this.effectivenessLabelEncoder = new LabelEncoder();
    let all_effectiveness = new Set()
    all_effectiveness.add(0)
    all_effectiveness.add(1)
    all_effectiveness.add(2)
    all_effectiveness.add(3)
    this.effectivenessLabelEncoder.fit(Array.from(all_effectiveness))
  }

  populateAttackNames(){
    this.attackNamesLabelEncoder = new LabelEncoder();
    this.all_attack_names = new Set()

		for (const id in Moves) {
      this.all_attack_names.add(id);
		}
		this.all_attack_names.add('no attack')
		this.all_attack_names.add('noattack')
    this.all_attack_names.add('empty')
    this.all_attack_names.add('hidden')
    this.all_attack_names.add('unregistered')
    this.attackNamesLabelEncoder.fit(Array.from(this.all_attack_names))
  }

  populateGenders(){
    this.gendersLabelEncoder = new LabelEncoder();
    this.all_genders = new Set()
    this.all_genders.add('') // Rotom fan?
    this.all_genders.add('N')
    this.all_genders.add('M')
    this.all_genders.add('F')
    this.gendersLabelEncoder.fit(Array.from(this.all_genders))
  }

  populateGenerations(){
    this.generationsLabelEncoder = new LabelEncoder();
    let all_generations = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.generationsLabelEncoder.fit(Array.from(all_generations))
  }

  populateGameTypes(){
    this.gametypesLabelEncoder = new LabelEncoder();
    let all_gametypes = ['singles', 'doubles', 'triples', 'rotation', 'multi', 'free-for-all']
    this.gametypesLabelEncoder.fit(Array.from(all_gametypes))
  }

  populateTiers(){
    this.tiersLabelEncoder = new LabelEncoder();
    const availableTiers = ['Uber', 'OU', 'UU', 'RU', 'NU', 'PU', 'LC', 'Mono', 'Random Doubles Battle', 'Random Battle', 'gen8battlefactory'];
    this.tiersLabelEncoder.fit(Array.from(availableTiers))
  }

  populateTypes(){
    this.typesLabelEncoder = new LabelEncoder();
    this.allTypes = ['Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting', 'Fire', 'Flying', 'Ghost',
                'Grass', 'Ground', 'Ice', 'Normal', 'Poison', 'Psychic', 'Rock', 'Steel', 'Water', 'Typeless', 'Bird',
			'Stellar'];
    this.typesLabelEncoder.fit(Array.from(this.allTypes))
  }

  populateRooms(){
    this.roomsLabelEncoder = new LabelEncoder();
    this.all_rooms = new Set()
    this.all_rooms.add('none')
    this.all_rooms.add('Trick Room')
    this.all_rooms.add('Magic Room')
    this.all_rooms.add('Wonder Room')
    this.roomsLabelEncoder.fit(Array.from(this.all_rooms))
  }


  populateSelectableTargets(){
    this.selectableTargetsLabelEncoder = new LabelEncoder();
    let all_selectable_targets = new Set()
    all_selectable_targets.add(SelectableTarget.DO_NOT_SPECIFY.name)
    all_selectable_targets.add(SelectableTarget.SELF.name)
    all_selectable_targets.add(SelectableTarget.FOE_SLOT_1.name)
    all_selectable_targets.add(SelectableTarget.FOE_SLOT_2.name)
    all_selectable_targets.add(SelectableTarget.FOE_SLOT_3.name)
    all_selectable_targets.add(SelectableTarget.ALLY_SLOT_1.name)
    all_selectable_targets.add(SelectableTarget.ALLY_SLOT_2.name)
    all_selectable_targets.add(SelectableTarget.ALLY_SLOT_3.name)
    this.selectableTargetsLabelEncoder.fit(Array.from(all_selectable_targets))
  }


  populateAttackActions(){
    this.attackActionsLabelEncoder = new LabelEncoder();
    let all_attack_actions = new Set()
    all_attack_actions.add('attack1')
    all_attack_actions.add('attack2')
    all_attack_actions.add('attack3')
    all_attack_actions.add('attack4')
    all_attack_actions.add('dyna1')
    all_attack_actions.add('dyna2')
    all_attack_actions.add('dyna3')
    all_attack_actions.add('dyna4')
    all_attack_actions.add('tera1')
    all_attack_actions.add('tera2')
    all_attack_actions.add('tera3')
    all_attack_actions.add('tera4')
    this.attackActionsLabelEncoder.fit(Array.from(all_attack_actions))
  }

}

export const SelectableTarget: {[target: string]: int} = {
  DO_NOT_SPECIFY: {
    name: "DO_NOT_SPECIFY",
    index: 0,
  },
  SELF: {
    name: "SELF",
    index: 1,
  },
  FOE_SLOT_1: {
    name: "FOE_SLOT_1",
    index: 2,
  },
  ALLY_SLOT_1: {
    name: "ALLY_SLOT_1",
    index: 3,
  },
  FOE_SLOT_2: {
    name: "FOE_SLOT_2",
    index: 4,
  },
  ALLY_SLOT_2: {
    name: "ALLY_SLOT_2",
    index: 5,
  },
  FOE_SLOT_3: {
    name: "FOE_SLOT_3",
    index: 6,
  },
  ALLY_SLOT_3: {
    name: "ALLY_SLOT_3",
    index: 7,
  },
}



export const AttackActions: {[target: string]: int} = {
  ATTACK_1: {
    name: "move 1",
    index: 0,
  },
  ATTACK_2: {
    name: "move 2",
    index: 1,
  },
  ATTACK_3: {
    name: "move 3",
    index: 2,
  },
  ATTACK_4: {
    name: "move 4",
    index: 3,
  },
  SWITCH_1: {
    name: "switch 1",
    index: 8,
  },
  SWITCH_2: {
    name: "switch 2",
    index: 9,
  },
  SWITCH_3: {
    name: "switch 3",
    index: 10,
  },
  SWITCH_4: {
    name: "switch 4",
    index: 11,
  },
  SWITCH_5: {
    name: "switch 5",
    index: 12,
  },
  SWITCH_6: {
    name: "switch 6",
    index: 13,
  },
  ZMOVE_1: {
    name: "zmove 1",
    index: 4,
  },
  ZMOVE_2: {
    name: "zmove 2",
    index: 5,
  },
  ZMOVE_3: {
    name: "zmove 3",
    index: 6,
  },
  ZMOVE_4: {
    name: "zmove 4",
    index: 7,
  },
  MEGA_1: {
    name: "mega 1",
    index: 4,
  },
  MEGA_2: {
    name: "mega 2",
    index: 5,
  },
  MEGA_3: {
    name: "mega 3",
    index: 6,
  },
  MEGA_4: {
    name: "mega 4",
    index: 7,
  },
  ULTRA_1: {
    name: "ultra 1",
    index: 4,
  },
  ULTRA_2: {
    name: "ultra 2",
    index: 5,
  },
  ULTRA_3: {
    name: "ultra 3",
    index: 6,
  },
  ULTRA_4: {
    name: "ultra 4",
    index: 7,
  },
  DYNA_1: {
    name: "dyna 1",
    index: 4,
  },
  DYNA_2: {
    name: "dyna 2",
    index: 5,
  },
  DYNA_3: {
    name: "dyna 3",
    index: 6,
  },
  DYNA_4: {
    name: "dyna 4",
    index: 7,
  },
  TERA_1: {
    name: "tera 1",
    index: 4,
  },
  TERA_2: {
    name: "tera 2",
    index: 5,
  },
  TERA_3: {
    name: "tera 3",
    index: 6,
  },
  TERA_4: {
    name: "tera 4",
    index: 7,
  },
  SHIFT_LEFT: {
    name: "shift l",
    index: 1,
  },
  SHIFT_RIGHT: {
    name: "shift r",
    index: 2,
  },
  NOT_DECIDED: {
    name: "not decided",
    index: 15,
  },
}


/*
export const AttackActions: {[target: string]: int} = {
  "attack1": 0,
  "attack2": 1,
  "attack3": 2,
  "attack4": 3,
  "dyna1": 4,
  "dyna2": 5,
  "dyna3": 6,
  "dyna4": 7,
  "dyna1": 4,
  "dyna2": 5,
  "dyna3": 6,
  "dyna4": 7,
}
*/

export const BaseEncoder = new PokemonEncoder();
