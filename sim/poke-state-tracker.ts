

import {SessionMetrics} from './session-metrics';
import {METRIC_TYPES} from './session-metrics';
import {BaseEncoder} from './pokemon-label-encoders';
import {toID} from './dex';

function bool_to_int(value){
  if (value){
    return 1
  }
  return 0
}

const HAZARDS = ['Stealth Rock', 'Spikes', 'Toxic Spikes', 'Sticky Web']


const MAX_REWARD = 150.0

const pokemon_attacks_transform = ['return', 'hiddenpowerground']
const pokemon_names_transform = ['Type: Null', 'hiddenpowerground']

//  #Ablities revealed during match come in different ways. Also always use name and not id
//  #ability: Snow Warning
//  #[from] ability: Drought
const boost_regex = /\|\-boost\|.*/
const unboost_regex = /\|\-unboost\|.*/
const move_regex = /\|move\|p.*/
const fieldstart_regex = /\|\-fieldstart\|.*Terrain/
const fieldend_regex = /\|\-fieldend\|.*Terrain/
const roomstart_regex = /\|\-fieldstart\|.*Room\|/
const roomend_regex = /\|\-fieldend\|.*Room/
const faint_regex = /\|faint\|.*/
//  #used for megas and transforms. or some
const forme_details_change_regex = /(\|detailschange\|p.*\|)|(\|\-formechange\|p.*\|)/
const perish_song_regex = /\|\-start\|.*\|perish\d$/
//  #attack_missed_or_failed_regex = /(\|\-miss\|p.*\|)|(\|\-fail\|p.*)/
const smack_down_regex = /(\|\-start\|p.*\|Smack Down)/
const yawned_used_regex = /\|\-start\|.*\|move: Yawn\|\[of\]/
const yawned_succeeded_regex = /\|\-end\|.*\|move: Yawn\|/
const attack_resisted_regex = /\|\-resisted\|p.*/
const attack_super_effective_regex = /\|\-supereffective\|p.*/
const attack_immune_regex = /\|\-immune\|p.*/
const confusion_ended_regex = /\|\-end\|p.*confusion$/
const confusion_started_regex = /\|\-start\|p.*confusion$/
const taunt_started_regex = /\|\-start\|p.*Taunt$/
const taunt_ended_regex = /\|\-end\|p.*Taunt$/
const item_removed_regex = /(\|\-enditem\|p.*\|((?!\[of\]).)*$)|(\|\-enditem\|p.*\|\[of\])/
const item_used_regex = /\|\-enditem\|p.*\|((?!\[of\]).)*$/
const item_removed_by_user_regex = /\|\-enditem\|p.*\|\[of\]/
const item_swapped_regex = /\|\-item\|p.*\|\[from\] move/
//  #|-item|p1a: Weavile|Assault Vest|[from] ability: Pickpocket|[of] p2a: Lurantis
const item_frisked_regex = /(\|\-item\|p.*\|\[from\] ability: Pickpocket)|(\|\-item\|p.*\|\[from\] ability: Frisk)/
const move_did_not_succeed = /(\|\-fail\|p.*)|(\|\-miss\|p.*)|(\|cant\|p.*)|(\|\-damage\|p.*\|\[from\] confusion)/
const move_atk_regex = /\|move\|p.*\|/
//  #used for skipping second output
const damage_detected_regex = /^(\|\-damage\|p.*\|)/
const heal_detected_regex = /^(\|\-heal\|p.*\|)/
const sticky_web_activated_regex = /\|\-activate\|p.*\|move: Sticky Web/
const mummy_activated_regex = /\|\-activate\|p.*\|ability: Mummy/
const disguise_activated_regex = /\|\-activate\|p.*\|ability: Disguise/

//    |-activate|p1a: Cofagrigus|ability: Mummy|Guts|[of] p2a: Gurdurr

//  #start_regex = /\|\-start\|.*/
//  #end_regex = /\|\-end\|.*/

const spike_damage_regex = /\|\-damage\|.*\|\[from\] Spikes/
const stealthrock_damage_regex = /\|\-damage\|.*\|\[from\] Stealth Rock/
const opponent_ability_damage_regex = /\|\-damage\|.*\|\[from\] ability\:.*\[of\].*/
//  #order matters
const item_damage_from_opponent_regex = /\|\-damage\|.*\|\[from\] item\:.*\[of\].*/
//  # self inflicted? life orb
const item_damage_regex = /\|\-damage\|.*\|\[from\] item\:.*/
const field_activate_regex = /\|\-fieldactivate\|.*/
const weather_upkeep_regex = /\|\-weather\|.*\|\[[a-z]+\]$/
const weather_end_regex = /\|\-weather\|none/
const sideend_hazards_activate_regex = /\|\-sideend\|.*\|\[of\] p\d/
const sideend_non_hazards_activate_regex = /\|\-sideend\|.*\|(a-z)*((?!\[of\]).)*$/
const sidestart_regex = /\|\-sidestart\|p.*/

const destiny_bond_regex = /\|\-singlemove\|.*\|Destiny Bond$/
const heal_from_target_regex = /\|\-heal\|p.*\|\[from\] .*\|\[of\]/
//const general_heal_regex = /\|\-heal\|p.*\|\[from\](a-z)*((?!\[of\]).)*$/
const general_heal_regex = /\|\-heal\|p.*\|.*/
const pain_split_regex = /\|\-sethp\|p.*\|\[from\].*/
//  # trace copies ability, and reveals enemy ability
const trace_regex = /\|\-ability\|p.*\|\[from\] ability: Trace\|\[of\](a-z)*/

//  # castform has one ability, so no need to reveal it during use. add for future
const caseform_forecast_regex = /\|\-formechange\|p.*\|\[from\] ability: Forecast/

const clear_all_boosts_regex = /\|\-clearallboost/
const clear_neg_boosts_regex = /\|\-clearnegativeboost/
const clear_boost_regex = /\|\-clearboost\|p.*/
//  #Lazy statuses
const status_from_base = /\|\-status\|p.*\|/
const status_from_ability_regex = /\|\-status\|p.*\|\[from\] ability/
const status_from_enemy_move_regex = /\|\-status\|p.*\|\[from\] ability/
//  # Maybe do nothing with these
const sleep_from_rest_regex = /\|\-status\|p.*\|\[from\] move: Rest/
const status_from_item_regex = /\|\-status\|p.*\|\[from\] item:/
"|-status|p1a: Coalossal|tox"
const curestatus_regex = /\|\-curestatus\|p.*\|/
const activate_ability_regex = /.*\[from\] ability.*\|\[of\]/
const generic_ability_regex =/\|\-ability/
const start_substitute_regex = /\|\-start\|p.*\|Substitute/
const end_substitute_regex = /\|\-end\|p.*\|Substitute/

const start_dynamax_regex = /\|\-start\|p.*\|Dynamax/
const end_dynamax_regex = /\|\-end\|p.*\|Dynamax/

//|-activate|p1a: Galvantula|move: Protect
// |-activate|p2a: Gourgeist|move: Substitute|[damage]

const crit_regex = /\|\-crit\|p.*/
const switch_regex = /\|switch\|p.*/
const swap_regex = /\|swap\|p.*/
const drag_regex = /\|drag\|p.*/
//  #Zoroark specifics
//  #|replace|p2a: Zoroark|Zoroark, L80, F
const zoroark_replace_regex = /\|replace\|.*/
const zoroark_end_illusion_regex = /\|\-end\|.*Illusion$/
//  #Mega reveals items
//  #|-mega|p1a: Alakazam|Alakazam|Alakazite
//  #|-zpower|p1a: Charizard
const terastallize_regex = /\|\-terastallize\|p\d.*/
const mega_regex = /\|\-mega\|p\d.*/
const zpower_regex = /\|\-zpower\|p\d.*/
//  #|teamsize|p1|4
//  #|teamsize|p2|5
//  #|gametype|doubles
//  #|gen|7
//  #|tier|[Gen 7] Doubles Ubers
const p1_teamsize_regex = /\|teamsize\|p1.*/
const p2_teamsize_regex = /\|teamsize\|p2.*/
const gametype_regex = /\|gametype\|.*/
const gen_number_regex = /\|gen\|\d/
const tier_regex = /\|tier\|.*/

const force_switch_regex = /\|request\|{\/forceSwitch\/:\[/
//  #if wait for p1, return. if wait for p2, enter a loop until valid p2 move
//  # dont not want to give p1 a chance to keep selecting attacks during wait for p2
const wait_regex = /\|request\|{\/wait\/:true/

const level_regex = /L\d*/
const male_gender_regex = /, M/
const female_gender_regex = /, F/
const update_complete_regex = /\|turn\|\d*/

//  #turn 1 solar beam
const prepare_regex = /\|-prepare\|p.*/
const anim_regex = /\|-anim\|p.*/

//  # This will not trigger a random move, but an update of state and a retry.
//  # For p1, returns previous observation?? Maybe not. state might change in triples
//  #reward at time should be zeroish
//  #TODO: logic might need update for doubles
const trapped_regex_1 = /\|error\|\[Unavailable choice\] Can\'t switch: The active Pokémon is trapped/
const trapped_regex_2 = /\|error\|\[Invalid choice\] Can\'t switch: The active Pokémon is trapped/
const isnt_your_turn_regex = /\|error\|\[.*\] Can\'t do anything: It\'s not your turn/
const need_switch_response_regex = /\|error\|\[.*\] Can\'t move: You need a switch response/
const cant_switch_to_fainted_regex = /\|error\|\[.*\] Can\'t switch: You can\'t switch to a fainted Pokémon/
const cant_switch_to_active_regex = /\|error\|\[.*\] Can\'t switch: You can\'t switch to an active Pokémon/
const disabled_move_regex = /\|error\|\[.*\] Can\'t move: .* is disabled/

const STATUSES_REGEX = /(psn|par|slp|frz|brn|tox)/
const TERRAINS_REGEX = /(Electric Terrain|Grassy Terrain|Misty Terrain|Psychic Terrain)/

const p1_pokemon_revealed_moves = {}


const start_leech_seed_activated_regex = /\|\-start\|p.*\|move: Leech Seed$/
const curse_started_regex = /\|\-start\|p.*\|Curse/
const end_leech_seed_activated_regex = /\|\-end\|p.*\|Leech Seed\|.*/
const start_encore_activated_regex = /\|\-start\|p.*\|Encore$/
const end_encore_activated_regex = /\|\-end\|p.*\|Encore$/
const attract_activated_regex = /\|\-start\|p.*\|Attract$/
const protect_activated_regex = /\|\-singleturn\|p.*\|(Baneful Bunker|Crafty Shield|Detect|King\'s Shield|Mat Block|Max Guard|Obstruct|Protect|Quick Guard|Spiky Shield|Wide Guard)$/
const must_recharge_activated_regex = /\|\-mustrecharge\|p.*/
const protection_moves_regex = /(Baneful Bunker|Crafty Shield|Detect|King\'s Shield|Mat Block|Max Guard|Obstruct|Protect|Quick Guard|Spiky Shield|Wide Guard)/


const METRICS_WITHOUT_PREFIX = ['turns', 'user_id', 'session_id', 'group_label', 'session_label', 'weather_conditions_used', 'terrain_conditions_used', 'rooms_used']

//TODOs
//"|-fieldstart|move: Psychic Terrain"
//"|-end|p1a: Weezing|ability: Neutralizing Gas"


const DEFAULT_REWARD_CONFIG = {
    'allow_other_player_to_affect_reward':false,
    'reduce_negative_penalty_from_opponents_moves':false,
    'taking_too_long_penalty_100_turns':500,
    'win_reward': 100,
    'quick_match_under_30_turns': 20,
    'attack_reward':   0,
    'switch_penalty':  26,
    'pokemon_damaged':  23,
    'yawn_success':  5,
    'attack_resisted':  20,
    'attack_supereffective':  25,
    'attack_immune':  40,
    'confused_begin':  20,
    'confused_end':  10,
    'taunt_begin':  10,
    'taunt_end':  5,
    'item_knockedoffed':  2,
    'attack_missed':  10,
    'stat_modified':  20,
    'damage_by_hazards_opponent_ability_or_items':  5,
    'damage_by_own_item':  2,
    'hazards_removed':  10,
    'reflect_tailwind_etc_end':  3,
    'hazards_and_safeguard_etc_start':  10,
    'destiny_bond_start':  2,
    'pokemon_heal':  2,
    'terrain_weather_trigger': 25,
    'pain_split':  2,
    'status_start':  15,
    'curestatus':  10,
    'critical':  35,
    'fainted':  135,
    'protection_bonus': 10,
    'used_ability': 10,
    'illusion_broken':  15,
    'minor_switch':  5,
    'health_change_base':  1,
    'other_health_change_base':  1,
    'health_change_base_raw':  0,
    'other_health_change_base_raw':  0,
    "current_health":  0,
    "other_current_health":  0,
    "current_health_raw":  0,
    "other_current_health_raw":  0,
}

const BASE_REWARD_TRACKER = {
  'allow_other_player_to_affect_reward':[],
  'reduce_negative_penalty_from_opponents_moves':[],
  'taking_too_long_penalty_100_turns':[],
  'win_reward': [],
  'quick_match_under_30_turns': [],
  'attack_reward':   [],
  'switch_penalty':  [],
  'pokemon_damaged':  [],
  'yawn_success':  [],
  'attack_resisted':  [],
  'attack_supereffective':  [],
  'attack_immune':  [],
  'confused_begin':  [],
  'confused_end':  [],
  'taunt_begin':  [],
  'taunt_end':  [],
  'item_knockedoffed':  [],
  'attack_missed':  [],
  'stat_modified':  [],
  'damage_by_hazards_opponent_ability_or_items':  [],
  'damage_by_own_item':  [],
  'hazards_removed':  [],
  'reflect_tailwind_etc_end':  [],
  'hazards_and_safeguard_etc_start':  [],
  'destiny_bond_start':  [],
  'pokemon_heal':  [],
  'terrain_weather_trigger':  [],
  'pain_split':  [],
  'status_start':  [],
  'curestatus':  [],
  'critical':  [],
  'fainted':  [],
  'protection_bonus': [],
  'used_ability': [],
  'illusion_broken':  [],
  'minor_switch':  [],
  'health_change_base': [],
  'other_health_change_base': [],
  'health_change_base_raw': [],
  'other_health_change_base_raw': [],
  "current_health":  [],
  "other_current_health":  [],
  "current_health_raw":  [],
  "other_current_health_raw":  [],
}

const BASELINE_REWARD_MODIFIER_CONFIG = {
  'win_reward': {
    'value': 100,
  },
  'quick_match_under_30_turns': {
    'value': 20,
  },
  'attack_reward':  {
    'value': 20,
    'max_count': -1,
  },
  'switch_penalty':  {
    'value': 20,
    'max_count': -1,
  },
  'pokemon_damaged':  {
    'value': 20,
    'max_count': 1,
  },
  'yawn_success':  {
    'value': 20,
  },
  'attack_resisted':  {
    'value': 20,
  },
  'attack_supereffective':  {
    'value': 20,
  },
  'attack_immune':  {
    'value': 20,
  },
  'confused_begin':  {
    'value': 20,
  },
  'confused_end':  {
    'value': 20,
  },
  'taunt_begin':  {
    'value': 20,
  },
  'taunt_end':  {
    'value': 20,
  },
  'item_knockedoffed':  {
    'value': 20,
  },
  'attack_missed':  {
    'value': 20,
  },
  'stat_modified':  {
    'value': 20,
  },
  'damage_by_hazards_opponent_ability_or_items':  {
    'value': 20,
  },
  'damage_by_own_item':  {
    'value': 20,
  },
  'hazards_removed':  {
    'value': 20,
  },
  'reflect_tailwind_etc_end':  {
    'value': 20,
  },
  'hazards_and_safeguard_etc_start':  {
    'value': 20,
  },
  'destiny_bond_start':  {
    'value': 20,
  },
  'pokemon_heal':  {
    'value': 20,
  },
  'terrain_weather_trigger':  {
    'value': 20,
  },
  'pain_split':  {
    'value': 20,
  },
  'status_start':  {
    'value': 20,
  },
  'curestatus':  {
    'value': 20,
  },
  'critical':  {
    'value': 20,
  },
  'fainted':  {
    'value': 20,
  },
  'protection_bonus': {
    'value': 20,
  },
  'used_ability': {
    'value': 20,
  },
  'illusion_broken':  {
    'value': 20,
  },
  'minor_switch':  {
    'value': 20,
  },
  'health_change_base': {
    'value': 20,
  },
}

const DEFAULT_BONUS_REWARD_CONFIG = {
  "critical_faint_super": {
    "keys": {
        "attack_supereffective": {
            "condition": "positive",
            "multiplier": 1.8,
        },
        "critical": {
            "condition": "positive",
            "multiplier": 1.2,
        },
        "fainted": {
            "condition": "positive",
            "multiplier": 1.4,
        },
    },
    "baseline_multiplier": 2,
},
"critical_faint_snotvery1": {
    "keys": {
        "attack_resisted": {
            "condition": "positive",
            "other": true,
        },
        "critical": {
            "condition": "positive",
            "multiplier": 1.2,
        },
        "fainted": {
            "condition": "positive",
            "multiplier": 1.4,
        },
    },
    "baseline_multiplier": 2,
},
"critical_faint_snotvery2": {
    "keys": {
        "attack_resisted": { //# negates punishment
            "condition": "negative",
            "multiplier": 0,
        },
        "critical": {
            "condition": "positive",
            "multiplier": 1.2,
        },
        "fainted": {
            "condition": "positive",
            "multiplier": 1.4,
        },
    },
    "baseline_multiplier": 1.2,
},
"critical_not_very_effective": {
    "keys": {
        "critical": {
            "condition": "negative",
            "multiplier": 0.2,
        },
        "attack_resisted": {
            "condition": "positive",
            "multiplier": 1.4,
        },
    },
},
"critical_multiple": {
    "keys": {
        "critical": {
            "condition": "negative",
            "multiplier": 0.2,
            "count": "at least 2",
        },
    },
},
"faint_valuation": {
    "keys": {
        "fainted": {
            "condition": "exists"
        },
    },
    "baseline_multiplier": 1.3,
},
"win_valuation": {
    "keys": {
        "win_reward": {
            "condition": "exists"
        },
    },
    "baseline_value": 500,
},
}





const METRIC_TURNS_KEY = 'turns'
const METRIC_UPLOAD_FILENAMES_KEY = 'upload_filenames'
const METRIC_TEAMSIZE_KEY = 'teamsize'
const METRIC_USER_ID_KEY = 'user_id'
const METRIC_SESSION_ID_KEY = 'session_id'
const METRIC_GROUP_LABEL_KEY = 'group_label'
const METRIC_SESSION_LABEL_KEY = 'session_label'
const METRIC_SESSION_TEAM_KEY = 'session_team'
const METRIC_SUB_SESSION_TEAM_KEY = 'sub_session_team'
const METRIC_WEATHER_CONDITIONS_KEY = 'weather_conditions_used'
const METRIC_TERRAIN_CONDITIONS_KEY = 'terrain_conditions_used'
const METRIC_ROOMS_KEY = 'rooms_used'
const METRIC_HURT_BY_ROCKS_KEY = 'hurt_by_rocks'
const METRIC_HURT_BY_SPIKES_KEY = 'hurt_by_spikes'
const METRIC_SLOWED_BY_WEB_KEY = 'slowed_by_web'
const METRIC_POISONED_BY_SPIKES_KEY = 'poisoned_by_spikes'
const METRIC_SAFEGUARD_KEY = 'safeguard_used'
const METRIC_LIGHTSCREEN_KEY = 'lightscreen_used'
const METRIC_REFLECT_KEY = 'reflect_used'
const METRIC_TAILWIND_KEY = 'tailwind_used'
const METRIC_AURORA_VEIL_KEY = 'aurora_veil_used'
const METRIC_ROCKS_KEY = 'has_rocks_used_on'
const METRIC_WEB_KEY = 'has_web_used_on'
const METRIC_SPIKES_KEY = 'spikes_used_on'
const METRIC_TOXIC_SPIKES_KEY = 'toxic_spikes_used_on'
const METRIC_YAWNED_KEY = 'yawned_used_on'
const METRIC_PERISHED_KEY = 'perished_used_on'
const METRIC_DESTINED_KEY = 'destined_used_on'
const METRIC_ATTACK_FAILED_KEY = 'attack_failed_counter'
const METRIC_SMACKED_DOWN_KEY = 'smacked_down'
const METRIC_SUPER_EFFECTIVE_KEY = 'super_effective'
const METRIC_NOT_VERY_EFFECTIVE_KEY = 'not_very_effective'
const METRIC_DOES_NOT_EFFECT_KEY = 'does_not_effect'
const METRIC_TRAPPED_KEY = 'trapped'
const METRIC_PROTECT_COUNTER_KEY = 'protect_counter'
const METRIC_CRITICAL_COUNTER_KEY = 'critical_counter'
const METRIC_SUBSTITUTE_KEY = 'substitute'
const METRIC_SEEDED_KEY = 'seeded'
const METRIC_CONFUSED_KEY = 'confused'
const METRIC_TAUNTED_KEY = 'taunted'
const METRIC_ENCORED_KEY = 'encored'
const METRIC_ATTRACTED_KEY = 'attracted'
const METRIC_RECHARGE_KEY = 'must_recharge'
const METRIC_DYNAMAX_ACTIVATED_KEY = 'dynamax_activated'
const METRIC_DYNAMAX_TURNS_KEY = 'dynamax_turns'
const METRIC_STATS_CLEARED_KEY = 'stats_cleared'
const METRIC_NEG_STATS_CLEARED_KEY = 'neg_stats_cleared'
const METRIC_ACCURACY_MAX_KEY = 'accuracy_modifier_max_stage'
const METRIC_ACCURACY_MIN_KEY = 'accuracy_modifier_min_stage'
const METRIC_ATTACK_MAX_KEY = 'attack_modifier_max_stage'
const METRIC_ATTACK_MIN_KEY = 'attack_modifier_min_stage'
const METRIC_SPECIAL_ATTACK_MAX_KEY = 'spatk_modifier_max_stage'
const METRIC_SPECIAL_ATTACK_MIN_KEY = 'spatk_modifier_min_stage'
const METRIC_DEFENSE_MAX_KEY = 'defense_modifier_max_stage'
const METRIC_DEFENSE_MIN_KEY = 'defense_modifier_min_stage'
const METRIC_SPECIAL_DEFENSE_MAX_KEY = 'spdef_modifier_max_stage'
const METRIC_SPECIAL_DEFENSE_MIN_KEY = 'spdef_modifier_min_stage'
const METRIC_SPEED_MAX_KEY = 'speed_modifier_max_stage'
const METRIC_SPEED_MIN_KEY = 'speed_modifier_min_stage'
const METRIC_EVASION_MAX_KEY = 'evasion_modifier_max_stage'
const METRIC_EVASION_MIN_KEY = 'evasion_modifier_min_stage'
const METRIC_SWEEP_KEY = 'did_sweep'
const METRIC_SHUTDOWN_KEY = 'did_shutdown'
const METRIC_SEEN_STATUSES_KEY = 'seen_statuses'
const METRIC_CURED_STATUS = 'status_cured'
const METRIC_SEEN_POKEMON_KEY = 'seen_pokemon'
const METRIC_SEEN_ABILITIES_KEY = 'seen_abilities'
const METRIC_SEEN_ATTACKS_KEY = 'seen_attacks'
const METRIC_HAZARDS_CLEARED_KEY = 'hazards_cleared'
const METRIC_TURNS_AFTER_DYNAMAX_KEY = 'turns_after_dynamax'
const METRIC_ATTACKS_AFTER_DYNAMAX_KEY = 'attacks_after_dynamax'
const METRIC_ITEM_USED_KEY = 'item_used'
const METRIC_REMOVED_KEY = 'item_removed'
const METRIC_ATTACKS_COUNTER_KEY = 'attacks_counter'
const METRIC_SWITCH_COUNTER_KEY = 'switch_counter'
const METRIC_TEAM_POKEMON_1_ATTACKS_KEY = 'team_pokemon_1_attacks'
const METRIC_TEAM_POKEMON_2_ATTACKS_KEY = 'team_pokemon_2_attacks'
const METRIC_TEAM_POKEMON_3_ATTACKS_KEY = 'team_pokemon_3_attacks'
const METRIC_TEAM_POKEMON_4_ATTACKS_KEY = 'team_pokemon_4_attacks'
const METRIC_TEAM_POKEMON_5_ATTACKS_KEY = 'team_pokemon_5_attacks'
const METRIC_TEAM_POKEMON_6_ATTACKS_KEY = 'team_pokemon_6_attacks'
const METRIC_AT_END_OF_TURN_KEY = 'at_end_of_turn'
const METRIC_DAMAGE_AT_END_OF_TURN_KEY = 'damage_at_end_of_turn'
const METRIC_ATTACK_TRACKER_KEY = 'attack_tracker'
const METRIC_SWITCH_TRACKER_KEY = 'switch_tracker'
const METRIC_SWAP_TRACKER_KEY = 'swap_tracker'
const METRIC_FAINT_TRACKER_KEY = 'faint_tracker'
const METRIC_MISS_TRACKER_KEY = 'miss_tracker'
const METRIC_DYNAMAX_TRACKER_KEY = 'dynamax_tracker'
const METRIC_TEAM_POKEMON_1_FIRST_TURN_KEY = 'team_pokemon_1_first_turn'
const METRIC_TEAM_POKEMON_2_FIRST_TURN_KEY = 'team_pokemon_2_first_turn'
const METRIC_TEAM_POKEMON_3_FIRST_TURN_KEY = 'team_pokemon_3_first_turn'
const METRIC_TEAM_POKEMON_4_FIRST_TURN_KEY = 'team_pokemon_4_first_turn'
const METRIC_TEAM_POKEMON_5_FIRST_TURN_KEY = 'team_pokemon_5_first_turn'
const METRIC_TEAM_POKEMON_6_FIRST_TURN_KEY = 'team_pokemon_6_first_turn'
const METRIC_TEAM_POKEMON_1_FIRST_DAMAGED_TURN_KEY = 'team_pokemon_1_first_damaged_turn'
const METRIC_TEAM_POKEMON_2_FIRST_DAMAGED_TURN_KEY = 'team_pokemon_2_first_damaged_turn'
const METRIC_TEAM_POKEMON_3_FIRST_DAMAGED_TURN_KEY = 'team_pokemon_3_first_damaged_turn'
const METRIC_TEAM_POKEMON_4_FIRST_DAMAGED_TURN_KEY = 'team_pokemon_4_first_damaged_turn'
const METRIC_TEAM_POKEMON_5_FIRST_DAMAGED_TURN_KEY = 'team_pokemon_5_first_damaged_turn'
const METRIC_TEAM_POKEMON_6_FIRST_DAMAGED_TURN_KEY = 'team_pokemon_6_first_damaged_turn'
const METRIC_TEAM_POKEMON_1_FAINTED_KEY = 'team_pokemon_1_fainted_turn'
const METRIC_TEAM_POKEMON_2_FAINTED_KEY = 'team_pokemon_2_fainted_turn'
const METRIC_TEAM_POKEMON_3_FAINTED_KEY = 'team_pokemon_3_fainted_turn'
const METRIC_TEAM_POKEMON_4_FAINTED_KEY = 'team_pokemon_4_fainted_turn'
const METRIC_TEAM_POKEMON_5_FAINTED_KEY = 'team_pokemon_5_fainted_turn'
const METRIC_TEAM_POKEMON_6_FAINTED_KEY = 'team_pokemon_6_fainted_turn'
const METRIC_TEAM_POKEMON_1_FIRST_SWITCH_TURN_KEY = 'team_pokemon_1_first_switched_turn'
const METRIC_TEAM_POKEMON_2_FIRST_SWITCH_TURN_KEY = 'team_pokemon_2_first_switched_turn'
const METRIC_TEAM_POKEMON_3_FIRST_SWITCH_TURN_KEY = 'team_pokemon_3_first_switched_turn'
const METRIC_TEAM_POKEMON_4_FIRST_SWITCH_TURN_KEY = 'team_pokemon_4_first_switched_turn'
const METRIC_TEAM_POKEMON_5_FIRST_SWITCH_TURN_KEY = 'team_pokemon_5_first_switched_turn'
const METRIC_TEAM_POKEMON_6_FIRST_SWITCH_TURN_KEY = 'team_pokemon_6_first_switched_turn'
const METRIC_END_OF_TURN_ACCURACY_STAGE_KEY = 'end_of_turn_accuracy_modifier_stage'
const METRIC_END_OF_TURN_ATTACK_STAGE_KEY = 'end_of_turn_attack_modifier_stage'
const METRIC_END_OF_TURN_SP_ATK_STAGE_KEY = 'end_of_turn_spatk_modifier_stage'
const METRIC_END_OF_TURN_DEFENSE_STAGE_KEY = 'end_of_turn_defense_modifier_stage'
const METRIC_END_OF_TURN_SP_DEF_STAGE_KEY = 'end_of_turn_spdef_modifier_stage'
const METRIC_END_OF_TURN_SPEED_STAGE_KEY = 'end_of_turn_speed_modifier_stage'
const METRIC_END_OF_TURN_EVASION_STAGE_KEY = 'end_of_turn_evasion_modifier_stage'


const terrain_key = `${fieldstart_regex}_Terrain`
const safeguard_key = `${sidestart_regex}_Safeguard`
const light_screen_key = `${sidestart_regex}_Light Screen`
const reflect_key = `${sidestart_regex}_Reflect`
const tailwind_key = `${sidestart_regex}_Tailwind`
const aurora_veil_key = `${sidestart_regex}_Aurora Veil`
const stealth_rock_key = `${sidestart_regex}_Stealth Rock`
const sticky_web_key = `${sidestart_regex}_Sticky Web`
const spikes_key = `${sidestart_regex}_Spikes`
const toxic_spikes_key = `${sidestart_regex}_Toxic Spikes`
const REGEX_TO_METRICS_KEY_MAPPING = {

    'hurt_by_rocks':METRIC_HURT_BY_ROCKS_KEY,
    'hurt_by_spikes':METRIC_HURT_BY_SPIKES_KEY,
    'slowed_by_web':METRIC_SLOWED_BY_WEB_KEY,
    'poisoned_by_spikes':METRIC_POISONED_BY_SPIKES_KEY,
    'at_end_of_turn':METRIC_AT_END_OF_TURN_KEY,
    'damage_at_end_of_turn':METRIC_DAMAGE_AT_END_OF_TURN_KEY,
    'trapped':METRIC_TRAPPED_KEY,
    'dynamax_turns':METRIC_DYNAMAX_TURNS_KEY,
    'accuracy_modifier_max':METRIC_ACCURACY_MAX_KEY,
    'accuracy_modifier_min':METRIC_ACCURACY_MIN_KEY,
    'attack_modifier_max':METRIC_ATTACK_MAX_KEY,
    'attack_modifier_min':METRIC_ATTACK_MIN_KEY,
    'spatk_modifier_max':METRIC_SPECIAL_ATTACK_MAX_KEY,
    'spatk_modifier_min':METRIC_SPECIAL_ATTACK_MIN_KEY,
    'defense_modifier_max':METRIC_DEFENSE_MAX_KEY,
    'defense_modifier_min':METRIC_DEFENSE_MIN_KEY,
    'spdef_modifier_max':METRIC_SPECIAL_DEFENSE_MAX_KEY,
    'spdef_modifier_min':METRIC_SPECIAL_DEFENSE_MIN_KEY,
    'speed_modifier_max':METRIC_SPEED_MAX_KEY,
    'speed_modifier_min':METRIC_SPEED_MIN_KEY,
    'evasion_modifier_max':METRIC_EVASION_MAX_KEY,
    'evasion_modifier_min':METRIC_EVASION_MIN_KEY,
    'end_of_turn_accuracy_modifier_stage':METRIC_END_OF_TURN_ACCURACY_STAGE_KEY,
    'end_of_turn_attack_modifier_stage':METRIC_END_OF_TURN_ATTACK_STAGE_KEY,
    'end_of_turn_spatk_modifier_stage':METRIC_END_OF_TURN_SP_ATK_STAGE_KEY,
    'end_of_turn_defense_modifier_stage':METRIC_END_OF_TURN_DEFENSE_STAGE_KEY,
    'end_of_turn_spdef_modifier_stage':METRIC_END_OF_TURN_SP_DEF_STAGE_KEY,
    'end_of_turn_speed_modifier_stage':METRIC_END_OF_TURN_SPEED_STAGE_KEY,
    'end_of_turn_evasion_modifier_stage':METRIC_END_OF_TURN_EVASION_STAGE_KEY,
    'seen_pokemon':METRIC_SEEN_POKEMON_KEY,
    'seen_abilities':METRIC_SEEN_ABILITIES_KEY,
    'seen_attacks':METRIC_SEEN_ATTACKS_KEY,
    'attacks_after_dynamax':METRIC_ATTACKS_AFTER_DYNAMAX_KEY,
    'dynamax_tracker':METRIC_DYNAMAX_TRACKER_KEY,
    'attacks_counter':METRIC_ATTACKS_COUNTER_KEY,
    'switch_counter':METRIC_SWITCH_COUNTER_KEY,
    'team_pokemon_1_attacks':METRIC_TEAM_POKEMON_1_ATTACKS_KEY,
    'team_pokemon_2_attacks':METRIC_TEAM_POKEMON_2_ATTACKS_KEY,
    'team_pokemon_3_attacks':METRIC_TEAM_POKEMON_3_ATTACKS_KEY,
    'team_pokemon_4_attacks':METRIC_TEAM_POKEMON_4_ATTACKS_KEY,
    'team_pokemon_5_attacks':METRIC_TEAM_POKEMON_5_ATTACKS_KEY,
    'team_pokemon_6_attacks':METRIC_TEAM_POKEMON_6_ATTACKS_KEY,
    'team_pokemon_1_first_turn':METRIC_TEAM_POKEMON_1_FIRST_TURN_KEY,
    'team_pokemon_2_first_turn':METRIC_TEAM_POKEMON_2_FIRST_TURN_KEY,
    'team_pokemon_3_first_turn':METRIC_TEAM_POKEMON_3_FIRST_TURN_KEY,
    'team_pokemon_4_first_turn':METRIC_TEAM_POKEMON_4_FIRST_TURN_KEY,
    'team_pokemon_5_first_turn':METRIC_TEAM_POKEMON_5_FIRST_TURN_KEY,
    'team_pokemon_6_first_turn':METRIC_TEAM_POKEMON_6_FIRST_TURN_KEY,
    'team_pokemon_1_first_damaged_turn':METRIC_TEAM_POKEMON_1_FIRST_DAMAGED_TURN_KEY,
    'team_pokemon_2_first_damaged_turn':METRIC_TEAM_POKEMON_2_FIRST_DAMAGED_TURN_KEY,
    'team_pokemon_3_first_damaged_turn':METRIC_TEAM_POKEMON_3_FIRST_DAMAGED_TURN_KEY,
    'team_pokemon_4_first_damaged_turn':METRIC_TEAM_POKEMON_4_FIRST_DAMAGED_TURN_KEY,
    'team_pokemon_5_first_damaged_turn':METRIC_TEAM_POKEMON_5_FIRST_DAMAGED_TURN_KEY,
    'team_pokemon_6_first_damaged_turn':METRIC_TEAM_POKEMON_6_FIRST_DAMAGED_TURN_KEY,
    'team_pokemon_1_fainted_turn':METRIC_TEAM_POKEMON_1_FAINTED_KEY,
    'team_pokemon_2_fainted_turn':METRIC_TEAM_POKEMON_2_FAINTED_KEY,
    'team_pokemon_3_fainted_turn':METRIC_TEAM_POKEMON_3_FAINTED_KEY,
    'team_pokemon_4_fainted_turn':METRIC_TEAM_POKEMON_4_FAINTED_KEY,
    'team_pokemon_5_fainted_turn':METRIC_TEAM_POKEMON_5_FAINTED_KEY,
    'team_pokemon_6_fainted_turn':METRIC_TEAM_POKEMON_6_FAINTED_KEY,
    'team_pokemon_1_first_switched_turn':METRIC_TEAM_POKEMON_1_FIRST_SWITCH_TURN_KEY,
    'team_pokemon_2_first_switched_turn':METRIC_TEAM_POKEMON_2_FIRST_SWITCH_TURN_KEY,
    'team_pokemon_3_first_switched_turn':METRIC_TEAM_POKEMON_3_FIRST_SWITCH_TURN_KEY,
    'team_pokemon_4_first_switched_turn':METRIC_TEAM_POKEMON_4_FIRST_SWITCH_TURN_KEY,
    'team_pokemon_5_first_switched_turn':METRIC_TEAM_POKEMON_5_FIRST_SWITCH_TURN_KEY,
    'team_pokemon_6_first_switched_turn':METRIC_TEAM_POKEMON_6_FIRST_SWITCH_TURN_KEY,
}

REGEX_TO_METRICS_KEY_MAPPING[weather_upkeep_regex] = METRIC_WEATHER_CONDITIONS_KEY;
REGEX_TO_METRICS_KEY_MAPPING[roomstart_regex] = METRIC_ROOMS_KEY;
REGEX_TO_METRICS_KEY_MAPPING[protect_activated_regex] = METRIC_PROTECT_COUNTER_KEY;
REGEX_TO_METRICS_KEY_MAPPING[start_leech_seed_activated_regex] = METRIC_SEEDED_KEY;
REGEX_TO_METRICS_KEY_MAPPING[start_encore_activated_regex] = METRIC_ENCORED_KEY;
REGEX_TO_METRICS_KEY_MAPPING[attract_activated_regex] = METRIC_ATTRACTED_KEY;
REGEX_TO_METRICS_KEY_MAPPING[must_recharge_activated_regex] = METRIC_RECHARGE_KEY;
REGEX_TO_METRICS_KEY_MAPPING[terrain_key] = METRIC_TERRAIN_CONDITIONS_KEY;
REGEX_TO_METRICS_KEY_MAPPING[safeguard_key] = METRIC_SAFEGUARD_KEY;
REGEX_TO_METRICS_KEY_MAPPING[light_screen_key] = METRIC_LIGHTSCREEN_KEY;
REGEX_TO_METRICS_KEY_MAPPING[reflect_key] = METRIC_REFLECT_KEY;
REGEX_TO_METRICS_KEY_MAPPING[tailwind_key] = METRIC_TAILWIND_KEY;
REGEX_TO_METRICS_KEY_MAPPING[aurora_veil_key] = METRIC_AURORA_VEIL_KEY;
REGEX_TO_METRICS_KEY_MAPPING[stealth_rock_key] = METRIC_ROCKS_KEY;
REGEX_TO_METRICS_KEY_MAPPING[sticky_web_key] = METRIC_WEB_KEY;
REGEX_TO_METRICS_KEY_MAPPING[spikes_key] = METRIC_SPIKES_KEY;
REGEX_TO_METRICS_KEY_MAPPING[toxic_spikes_key] = METRIC_TOXIC_SPIKES_KEY;
REGEX_TO_METRICS_KEY_MAPPING[yawned_succeeded_regex] = METRIC_YAWNED_KEY;
REGEX_TO_METRICS_KEY_MAPPING[perish_song_regex] = METRIC_PERISHED_KEY;
REGEX_TO_METRICS_KEY_MAPPING[destiny_bond_regex] = METRIC_DESTINED_KEY;
REGEX_TO_METRICS_KEY_MAPPING[smack_down_regex] = METRIC_SMACKED_DOWN_KEY;
REGEX_TO_METRICS_KEY_MAPPING[attack_super_effective_regex] = METRIC_SUPER_EFFECTIVE_KEY;
REGEX_TO_METRICS_KEY_MAPPING[attack_resisted_regex] = METRIC_NOT_VERY_EFFECTIVE_KEY;
REGEX_TO_METRICS_KEY_MAPPING[attack_immune_regex] = METRIC_DOES_NOT_EFFECT_KEY;
REGEX_TO_METRICS_KEY_MAPPING[crit_regex] = METRIC_CRITICAL_COUNTER_KEY;
REGEX_TO_METRICS_KEY_MAPPING[start_substitute_regex] = METRIC_SUBSTITUTE_KEY;
REGEX_TO_METRICS_KEY_MAPPING[confusion_started_regex] = METRIC_CONFUSED_KEY;
REGEX_TO_METRICS_KEY_MAPPING[taunt_started_regex] = METRIC_TAUNTED_KEY;
REGEX_TO_METRICS_KEY_MAPPING[start_dynamax_regex] = METRIC_DYNAMAX_ACTIVATED_KEY;
REGEX_TO_METRICS_KEY_MAPPING[clear_all_boosts_regex] = METRIC_STATS_CLEARED_KEY;
REGEX_TO_METRICS_KEY_MAPPING[clear_neg_boosts_regex] = METRIC_NEG_STATS_CLEARED_KEY;
REGEX_TO_METRICS_KEY_MAPPING[curestatus_regex] = METRIC_CURED_STATUS;
REGEX_TO_METRICS_KEY_MAPPING[status_from_ability_regex] = METRIC_SEEN_STATUSES_KEY;
REGEX_TO_METRICS_KEY_MAPPING[move_regex] = METRIC_ATTACK_TRACKER_KEY;
REGEX_TO_METRICS_KEY_MAPPING[switch_regex] = METRIC_SWITCH_TRACKER_KEY;
REGEX_TO_METRICS_KEY_MAPPING[swap_regex] = METRIC_SWAP_TRACKER_KEY;
REGEX_TO_METRICS_KEY_MAPPING[faint_regex] = METRIC_FAINT_TRACKER_KEY;
REGEX_TO_METRICS_KEY_MAPPING[move_did_not_succeed] = METRIC_MISS_TRACKER_KEY;
REGEX_TO_METRICS_KEY_MAPPING[item_used_regex] = METRIC_ITEM_USED_KEY;
REGEX_TO_METRICS_KEY_MAPPING[item_removed_by_user_regex] = METRIC_REMOVED_KEY;

//# Instead of assigning value upon event,
//# to better support doubles in the future,
//# make values stackable
function convert_effectiveness_to_encoded(value){
  // ELEMENT_MODIFIER.NUETRAL
  var effectiveness = 0;
  if (value <= -2){
    //ELEMENT_MODIFIER.IMMUNE
    effectiveness = 1
  }
  if (value == -1){
    // ELEMENT_MODIFIER.RESISTED
    effectiveness = 2
  }
  if (value > 0){
    //ELEMENT_MODIFIER.SUPER_EFFECTIVE
    effectiveness = 3
  }
  return BaseEncoder.effectivenessLabelEncoder.transform([effectiveness])
}

export class ActiveStats {
  constructor(){
    this.seeded = false
    this.smacked_down = false
    this.cursed = false
    this.confused = false
    this.taunted = false
    this.encored = false
    this.substitute = false
    this.attracted = false
    this.must_recharge = false
    this.yawned = false
    this.destined = false
    this.dynamax_activated = false
    this.dynamax_turns = 0
    this.perished = 0
    this.accuracy_modifier = 0
    this.attack_modifier = 0
    this.spatk_modifier = 0
    this.defense_modifier = 0
    this.spdef_modifier = 0
    this.speed_modifier = 0
    this.evasion_modifier = 0
    this.protect_counter = 0
  }

  getState(){
    return {
      'seeded': this.seeded,
      'smacked_down': this.smacked_down,
      'cursed': this.cursed,
      'confused': this.confused,
      'taunted': this.taunted,
      'encored': this.encored,
      'substitute': this.substitute,
      'attracted': this.attracted,
      'must_recharge': this.must_recharge,
      'yawned': this.yawned,
      'destined': this.destined,
      'dynamax_activated': this.dynamax_activated,
      'dynamax_turns': this.dynamax_turns,
      'perished': this.perished,
      'accuracy_modifier': this.accuracy_modifier,
      'attack_modifier': this.attack_modifier,
      'spatk_modifier': this.spatk_modifier,
      'defense_modifier': this.defense_modifier,
      'spdef_modifier': this.spdef_modifier,
      'evasion_modifier': this.evasion_modifier,
      'protect_counter': this.protect_counter,
    }
  }

  updateStateFromConfig(config){
    Object.assign(this, config);
  }

  boost_stat(stat, amt, is_boost){
    var modified = parseInt(amt)
    if(is_boost == false){
      modified = parseInt(amt) * -1
    }
    if(stat == 'evasion'){
      this.evasion_modifier += modified
    }
    if(stat == 'accuracy'){
      this.accuracy_modifier += modified
    }
    if(stat == 'atk'){
      this.attack_modifier += modified
    }
    if(stat == 'spa'){
      this.spatk_modifier += modified
    }
    if(stat == 'def'){
      this.defense_modifier += modified
    }
    if(stat == 'spd'){
      this.spdef_modifier += modified
    }
    if(stat == 'spe'){
      this.speed_modifier += modified
    }
  }

  clear_all_boosts(){
    this.accuracy_modifier = 0
    this.attack_modifier = 0
    this.spatk_modifier = 0
    this.defense_modifier = 0
    this.spdef_modifier = 0
    this.speed_modifier = 0
    this.evasion_modifier = 0

  }

  clear_neg_boosts(){
    this.accuracy_modifier = Math.max(0, this.accuracy_modifier)
    this.attack_modifier = Math.max(0, this.attack_modifier)
    this.spatk_modifier = Math.max(0, this.spatk_modifier)
    this.defense_modifier = Math.max(0, this.defense_modifier)
    this.spdef_modifier = Math.max(0, this.spdef_modifier)
    this.speed_modifier = Math.max(0, this.speed_modifier)
    this.evasion_modifier = Math.max(0, this.evasion_modifier)

  }

  get_encode(){
    var raw_encode = [
      bool_to_int(this.seeded),
        bool_to_int(this.smacked_down),
        bool_to_int(this.cursed),
        bool_to_int(this.confused),
        bool_to_int(this.taunted),
        bool_to_int(this.encored),
        bool_to_int(this.substitute),
        bool_to_int(this.attracted),
        bool_to_int(this.must_recharge),
        bool_to_int(this.yawned),
        bool_to_int(this.destined),
        bool_to_int(this.dynamax_activated),
        this.dynamax_turns / 3.0,
        this.perished / 3.0,
        this.protect_counter / 4.0,
        this.accuracy_modifier / 6.0,
        this.attack_modifier / 6.0,
        this.spatk_modifier / 6.0,
        this.defense_modifier / 6.0,
        this.spdef_modifier / 6.0,
        this.speed_modifier / 6.0,
        this.evasion_modifier / 6.0,
    ]
    return raw_encode

  }

  get_raw_verify(){
    var raw_encode = [
      this.seeded,
        this.smacked_down,
        this.cursed,
        this.confused,
        this.taunted,
        this.encored,
        this.substitute,
        this.attracted,
        this.must_recharge,
        this.yawned,
        this.destined,
        this.dynamax_activated,
        this.dynamax_turns,
        this.perished,
        this.protect_counter,
        this.accuracy_modifier,
        this.attack_modifier,
        this.spatk_modifier,
        this.defense_modifier,
        this.spdef_modifier,
        this.speed_modifier,
        this.evasion_modifier,
    ]
    return raw_encode

  }

  get_raw_verify_labels(is_p1_perspective, position){
    var player_prefix = 'p2'
    if (is_p1_perspective){
      player_prefix = 'p1'
    }
    var raw_encode_labels = []
    raw_encode_labels.push(`${player_prefix}_active_state_${position}_seeded`)
    raw_encode_labels.push(`${player_prefix}_active_state_${position}_smacked_down`)
    raw_encode_labels.push(`${player_prefix}_active_state_${position}_cursed`)
    raw_encode_labels.push(`${player_prefix}_active_state_${position}_confused`)
    raw_encode_labels.push(`${player_prefix}_active_state_${position}_taunted`)
    raw_encode_labels.push(`${player_prefix}_active_state_${position}_encored`)
    raw_encode_labels.push(`${player_prefix}_active_state_${position}_substitute`)
    raw_encode_labels.push(`${player_prefix}_active_state_${position}_attracted`)
    raw_encode_labels.push(`${player_prefix}_active_state_${position}_must_recharge`)
    raw_encode_labels.push(`${player_prefix}_active_state_${position}_yawned`)
    raw_encode_labels.push(`${player_prefix}_active_state_${position}_destined`)
    raw_encode_labels.push(`${player_prefix}_active_state_${position}_dynamax_activated`)
    raw_encode_labels.push(`${player_prefix}_active_state_${position}_dynamax_turns`)
    raw_encode_labels.push(`${player_prefix}_active_state_${position}_perished`)
    raw_encode_labels.push(`${player_prefix}_active_state_${position}_protect_counter`)
    raw_encode_labels.push(`${player_prefix}_active_state_${position}_accuracy_modifier`)
    raw_encode_labels.push(`${player_prefix}_active_state_${position}_attack_modifier`)
    raw_encode_labels.push(`${player_prefix}_active_state_${position}_spatk_modifier`)
    raw_encode_labels.push(`${player_prefix}_active_state_${position}_defense_modifier`)
    raw_encode_labels.push(`${player_prefix}_active_state_${position}_spdef_modifier`)
    raw_encode_labels.push(`${player_prefix}_active_state_${position}_speed_modifier`)
    raw_encode_labels.push(`${player_prefix}_active_state_${position}_evasion_modifier`)

    return raw_encode_labels

  }
}


export class PokeStateTracker {


  constructor(){
    this.processed_output = [];
    this.p1_transcript = '';
    this.p2_transcript = '';
    this.p1_kifu_transcript = ''
    this.p2_kifu_transcript = ''

    this.gen = 8;
    this.gametype = 'singles';
    this.tier = 'Ubers';
    this.weather_condition = 'none';
    this.terrain_condition = 'none';
    this.current_room = 'none';
    this.weather_turns = 8;
    this.terrain_turns = 8;
    this.room_turns = 8;
    this.p1_effective = {'a':0, 'b':0, 'c': 0};
    this.p2_effective = {'a':0, 'b':0, 'c': 0};
    this.p1_trapped = {'a':false, 'b':false, 'c': false};
    this.p2_trapped = {'a':false, 'b':false, 'c': false};
    this.p1_move_succeeded = {'a':false, 'b':false, 'c': false};
    this.p2_move_succeeded = {'a':false, 'b':false, 'c': false};
    this.p1_seen_attacks = {'a':'noattack', 'b':'noattack', 'c':'noattack'}
    this.p2_seen_attacks = {'a':'noattack', 'b':'noattack', 'c':'noattack'}

    this.p1_used_dynamax = false;
    this.p2_used_dynamax = false;
    this.p1_safeguard = false;
    this.p2_safeguard = false;
    this.p1_lightscreen = false;
    this.p2_lightscreen = false;
    this.p1_reflect = false;
    this.p2_reflect = false;
    this.p1_tailwind = false;
    this.p2_tailwind = false;
    this.p1_aurora_veil = false;
    this.p2_aurora_veil = false;
    this.p1_has_rocks = false;
    this.p2_has_rocks = false;
    this.p1_has_web = false;
    this.p2_has_web = false;
    this.p1_spikes = 0;
    this.p2_spikes = 0;
    this.p1_toxic_spikes = 0;
    this.p2_toxic_spikes = 0;
    this.p1_teamsize = 0;
    this.p2_teamsize = 0;

    // gen 9 stuff
    this.p1_used_tera = false;
    this.p2_used_tera = false;
    // gen 7 stuff
    this.p1_used_mega = false;
    this.p2_used_mega = false;
    this.p1_used_zmove = false;
    this.p2_used_zmove = false;

    this.p1_reward = 0
    this.p2_reward = 0

    // Not for encodings!
    this.p1_active_pokemon_stats = {'a':new ActiveStats(),'b':new ActiveStats(),'c':new ActiveStats()}
    this.p2_active_pokemon_stats = {'a':new ActiveStats(),'b':new ActiveStats(),'c':new ActiveStats()}

    this.p1_seen_details = {}
    this.p2_seen_details = {}

    this.sessionMetrics = new SessionMetrics()

    this.p1_rewards_tracker = JSON.parse(JSON.stringify(BASE_REWARD_TRACKER))
    this.p2_rewards_tracker = JSON.parse(JSON.stringify(BASE_REWARD_TRACKER))
    this.reward_config = DEFAULT_REWARD_CONFIG
    this.reward_bonus_config = DEFAULT_BONUS_REWARD_CONFIG
    //# Used to know which pokemon is currently selected. not directly sent to neural network
    this.p1_selected = {'a':null, 'b':null, 'c':null}
    this.p2_selected = {'a':null, 'b':null, 'c':null}
    this.logs = []
    this.unprocessed_events = []

  }
  
  shuffleState(){
    this.gen = 8;
    this.gametype = 'singles';
    this.tier = 'Ubers';
    this.weather_condition = BaseEncoder.all_weather[Math.floor(Math.random() * BaseEncoder.all_weather.length)];
    this.terrain_condition = BaseEncoder.all_terrains[Math.floor(Math.random() * BaseEncoder.all_terrains.length)];
    this.current_room = BaseEncoder.all_rooms[Math.floor(Math.random() * BaseEncoder.all_rooms.length)];
    this.weather_turns = 8;
    this.terrain_turns = 8;
    this.room_turns = 8;
    this.p1_effective = {'a':0, 'b':0, 'c': 0};
    this.p2_effective = {'a':0, 'b':0, 'c': 0};
    this.p1_trapped = {'a':false, 'b':false, 'c': false};
    this.p2_trapped = {'a':false, 'b':false, 'c': false};
    this.p1_move_succeeded = {'a':false, 'b':false, 'c': false};
    this.p2_move_succeeded = {'a':false, 'b':false, 'c': false};
    this.p1_seen_attacks = {'a':'noattack', 'b':'noattack', 'c':'noattack'}
    this.p2_seen_attacks = {'a':'noattack', 'b':'noattack', 'c':'noattack'}

    this.p1_used_dynamax = false;
    this.p2_used_dynamax = false;
    this.p1_safeguard = false;
    this.p2_safeguard = false;
    this.p1_lightscreen = false;
    this.p2_lightscreen = false;
    this.p1_reflect = false;
    this.p2_reflect = false;
    this.p1_tailwind = false;
    this.p2_tailwind = false;
    this.p1_aurora_veil = false;
    this.p2_aurora_veil = false;
    this.p1_has_rocks = false;
    this.p2_has_rocks = false;
    this.p1_has_web = false;
    this.p2_has_web = false;
    this.p1_spikes = 0;
    this.p2_spikes = 0;
    this.p1_toxic_spikes = 0;
    this.p2_toxic_spikes = 0;
    this.p1_teamsize = 0;
    this.p2_teamsize = 0;

    // gen 7 stuff
    this.p1_used_mega = false;
    this.p2_used_mega = false;
    this.p1_used_zmove = false;
    this.p2_used_zmove = false;

    this.p1_reward = 0
    this.p2_reward = 0

    // Not for encodings!
    this.p1_active_pokemon_stats = {'a':new ActiveStats(),'b':new ActiveStats(),'c':new ActiveStats()}
    this.p2_active_pokemon_stats = {'a':new ActiveStats(),'b':new ActiveStats(),'c':new ActiveStats()}

    this.p1_seen_details = {}
    this.p2_seen_details = {}

    this.sessionMetrics = new SessionMetrics()

    this.p1_rewards_tracker = JSON.parse(JSON.stringify(BASE_REWARD_TRACKER))
    this.p2_rewards_tracker = JSON.parse(JSON.stringify(BASE_REWARD_TRACKER))
    this.reward_config = DEFAULT_REWARD_CONFIG
    this.reward_bonus_config = DEFAULT_BONUS_REWARD_CONFIG
    //# Used to know which pokemon is currently selected. not directly sent to neural network
    this.p1_selected = {'a':null, 'b':null, 'c':null}
    this.p2_selected = {'a':null, 'b':null, 'c':null}
    this.logs = []
    this.punish_multiplier = 1;
  }

  getState(){

    return {
      'p1_transcript': this.p1_transcript,
      'p2_transcript': this.p2_transcript,
      'gen': this.gen,
      'gametype': this.gametype,
      'tier': this.tier,
      'weather_condition': this.weather_condition,
      'terrain_condition': this.terrain_condition,
      'current_room': this.current_room,
      'weather_turns': this.weather_turns,
      'terrain_turns': this.terrain_turns,
      'room_turns': this.room_turns,
      'p1_effective': this.p1_effective,
      'p2_effective': this.p2_effective,
      'p1_trapped': this.p1_trapped,
      'p2_trapped': this.p2_trapped,
      'p1_move_succeeded': this.p1_move_succeeded,
      'p2_move_succeeded': this.p2_move_succeeded,
      'p1_seen_attacks': this.p1_seen_attacks,
      'p2_seen_attacks': this.p2_seen_attacks,
      'p1_used_dynamax': this.p1_used_dynamax,
      'p2_used_dynamax': this.p2_used_dynamax,
      'p1_safeguard': this.p1_safeguard,
      'p2_safeguard': this.p2_safeguard,
      'p1_lightscreen': this.p1_lightscreen,
      'p2_lightscreen': this.p2_lightscreen,
      'p1_reflect': this.p1_reflect,
      'p2_reflect': this.p2_reflect,
      'p1_tailwind': this.p1_tailwind,
      'p2_tailwind': this.p2_tailwind,
      'p1_aurora_veil': this.p1_aurora_veil,
      'p2_aurora_veil': this.p2_aurora_veil,
      'p1_has_rocks': this.p1_has_rocks,
      'p2_has_rocks': this.p2_has_rocks,
      'p1_has_web': this.p1_has_web,
      'p2_has_web': this.p2_has_web,
      'p1_spikes': this.p1_spikes,
      'p2_spikes': this.p2_spikes,
      'p1_toxic_spikes': this.p1_toxic_spikes,
      'p2_toxic_spikes': this.p2_toxic_spikes,
      'p1_teamsize': this.p1_teamsize,
      'p2_teamsize': this.p2_teamsize,
      'p1_used_mega': this.p1_used_mega,
      'p2_used_mega': this.p2_used_mega,
      'p1_used_zmove': this.p1_used_zmove,
      'p2_used_zmove': this.p2_used_zmove,
      'p1_reward': this.p1_reward,
      'p2_reward': this.p2_reward,
      'p1_active_pokemon_stats':  {'a':this.p1_active_pokemon_stats['a'].getState(),'b':this.p1_active_pokemon_stats['b'].getState(),'c':this.p1_active_pokemon_stats['c'].getState()},
      'p2_active_pokemon_stats':  {'a':this.p2_active_pokemon_stats['a'].getState(),'b':this.p2_active_pokemon_stats['b'].getState(),'c':this.p2_active_pokemon_stats['c'].getState()},
    }
  }

  updateStateFromConfig(config){
    Object.assign(this, config);

    const p1_active_pokemon_stats = config['p1_active_pokemon_stats']
    const p2_active_pokemon_stats = config['p2_active_pokemon_stats']

    this.p1_active_pokemon_stats = {'a':new ActiveStats(),'b':new ActiveStats(),'c':new ActiveStats()}
    this.p1_active_pokemon_stats['a'].updateStateFromConfig(p1_active_pokemon_stats['a'])
    this.p1_active_pokemon_stats['b'].updateStateFromConfig(p1_active_pokemon_stats['b'])
    this.p1_active_pokemon_stats['c'].updateStateFromConfig(p1_active_pokemon_stats['c'])

    this.p2_active_pokemon_stats = {'a':new ActiveStats(),'b':new ActiveStats(),'c':new ActiveStats()}
    this.p2_active_pokemon_stats['a'].updateStateFromConfig(p2_active_pokemon_stats['a'])
    this.p2_active_pokemon_stats['b'].updateStateFromConfig(p2_active_pokemon_stats['b'])
    this.p2_active_pokemon_stats['c'].updateStateFromConfig(p2_active_pokemon_stats['c'])

  }

  setRewardConfig(reward_config){
    this.reward_config = reward_config
    this.punish_multiplier = 0;
    if(this.reward_config["allow_other_player_to_affect_reward"]){
      this.punish_multiplier = 1;
      if(this.reward_config["reduce_negative_penalty_from_opponents_moves"]){
        this.punish_multiplier = 0.35;
      }
    }
  }

  setBonusRewardConfig(reward_bonus_config){
    this.reward_bonus_config = reward_bonus_config
  }

  encode(gametype: 'singles' | 'doubles' | 'triples', is_p1_perspective:Boolean){

    var category_encode = [
        BaseEncoder.generationsLabelEncoder.transform([this.gen]),
        BaseEncoder.gametypesLabelEncoder.transform([gametype]),
        BaseEncoder.tiersLabelEncoder.transform([this.tier]),
        BaseEncoder.weatherLabelEncoder.transform([this.weather_condition]),
        BaseEncoder.terrainLabelEncoder.transform([this.terrain_condition]),
        BaseEncoder.roomsLabelEncoder.transform([this.current_room]),
    ]
    if(gametype === 'doubles'){
      category_encode = category_encode.concat([
        BaseEncoder.attackActionsLabelEncoder.transform(['attack1']), // placeholder action a
        BaseEncoder.selectableTargetsLabelEncoder.transform(['ALLY_SLOT_1']),  // placeholder selectable target a
        BaseEncoder.attackActionsLabelEncoder.transform(['attack1']), // placeholder action b
        BaseEncoder.selectableTargetsLabelEncoder.transform(['ALLY_SLOT_1']),  // placeholder selectable target b
        BaseEncoder.selectableTargetsLabelEncoder.transform(['ALLY_SLOT_1']),  // placeholder awaiting request for
      ])
    }
    if(gametype === 'triples'){
      category_encode = category_encode.concat([
          BaseEncoder.attackActionsLabelEncoder.transform(['attack1']), // placeholder action a
          BaseEncoder.selectableTargetsLabelEncoder.transform(['ALLY_SLOT_1']),  // placeholder selectable target a
          BaseEncoder.attackActionsLabelEncoder.transform(['attack1']), // placeholder action b
          BaseEncoder.selectableTargetsLabelEncoder.transform(['ALLY_SLOT_1']),  // placeholder selectable target b
          BaseEncoder.attackActionsLabelEncoder.transform(['attack1']), // placeholder action c
          BaseEncoder.selectableTargetsLabelEncoder.transform(['ALLY_SLOT_1']),  // placeholder selectable target c
          BaseEncoder.selectableTargetsLabelEncoder.transform(['ALLY_SLOT_1']),  // placeholder awaiting request for
      ])
    }

    var field_raw_encodes = [
        this.weather_turns /  8,
        this.terrain_turns / 5,
        this.room_turns / 3,
    ]

    var p1_category_encodes = [
        convert_effectiveness_to_encoded(this.p1_effective['a']),
    ]

    var p1_raw_encodes = [
        this.p1_teamsize / 6.0,
        bool_to_int(this.p1_safeguard),
        bool_to_int(this.p1_lightscreen),
        bool_to_int(this.p1_reflect),
        bool_to_int(this.p1_tailwind),
        bool_to_int(this.p1_aurora_veil),
        bool_to_int(this.p1_has_rocks),
        bool_to_int(this.p1_has_web),
        this.p1_spikes / 3.0,
        this.p1_toxic_spikes / 2.0,
        bool_to_int(this.p1_move_succeeded['a']),
        bool_to_int(this.p1_trapped['a']),
    ]
    p1_raw_encodes = p1_raw_encodes.concat([
      bool_to_int(this.p1_used_mega),
      bool_to_int(this.p1_used_zmove),
      bool_to_int(this.p1_used_dynamax),
    ])

    var p1_seen_attacks_category_encodes = [
        BaseEncoder.attackNamesLabelEncoder.transform([toID(this.p1_seen_attacks['a'])]),//     # category
    ]
    p1_raw_encodes = p1_raw_encodes.concat(this.p1_active_pokemon_stats['a'].get_encode())

    if(gametype == 'doubles'){
      p1_raw_encodes.push(bool_to_int(this.p1_move_succeeded['b']))
      p1_raw_encodes.push(bool_to_int(this.p1_trapped['b']))
      p1_raw_encodes = p1_raw_encodes.concat(this.p1_active_pokemon_stats['b'].get_encode())

      p1_category_encodes.push(convert_effectiveness_to_encoded(this.p1_effective['b']))

      p1_seen_attacks_category_encodes.push(BaseEncoder.attackNamesLabelEncoder.transform([toID(this.p1_seen_attacks['b'])]))
    }
    if(gametype == 'triples'){
      p1_raw_encodes.push(bool_to_int(this.p1_move_succeeded['b']))
      p1_raw_encodes.push(bool_to_int(this.p1_move_succeeded['c']))
      p1_raw_encodes.push(bool_to_int(this.p1_trapped['b']))
      p1_raw_encodes.push(bool_to_int(this.p1_trapped['c']))
      p1_raw_encodes = p1_raw_encodes.concat(this.p1_active_pokemon_stats['b'].get_encode())
      p1_raw_encodes = p1_raw_encodes.concat(this.p1_active_pokemon_stats['c'].get_encode())

      p1_category_encodes.push(convert_effectiveness_to_encoded(this.p1_effective['b']))
      p1_category_encodes.push(convert_effectiveness_to_encoded(this.p1_effective['c']))

      p1_seen_attacks_category_encodes.push(BaseEncoder.attackNamesLabelEncoder.transform([toID(this.p1_seen_attacks['b'])]))
      p1_seen_attacks_category_encodes.push(BaseEncoder.attackNamesLabelEncoder.transform([toID(this.p1_seen_attacks['c'])]))
    }


    var p2_category_encodes = [
        convert_effectiveness_to_encoded(this.p2_effective['a']),
    ]


    var p2_raw_encodes = [
        this.p2_teamsize / 6.0,
        bool_to_int(this.p2_safeguard),
        bool_to_int(this.p2_lightscreen),
        bool_to_int(this.p2_reflect),
        bool_to_int(this.p2_tailwind),
        bool_to_int(this.p2_aurora_veil),
        bool_to_int(this.p2_has_rocks),
        bool_to_int(this.p2_has_web),
        this.p2_spikes / 3.0,
        this.p2_toxic_spikes / 2.0,
        bool_to_int(this.p2_move_succeeded['a']),
        bool_to_int(this.p2_trapped['a']),
    ]

    p2_raw_encodes = p2_raw_encodes.concat([
      bool_to_int(this.p2_used_mega),
      bool_to_int(this.p2_used_zmove),
      bool_to_int(this.p2_used_dynamax),
    ])


    p2_raw_encodes = p2_raw_encodes.concat(this.p2_active_pokemon_stats['a'].get_encode())

    var p2_seen_attacks_category_encodes = [
        BaseEncoder.attackNamesLabelEncoder.transform([toID(this.p2_seen_attacks['a'])]),//     # category
    ]

    if(gametype == 'doubles'){
      p2_raw_encodes.push(bool_to_int(this.p2_move_succeeded['b']))
      p2_raw_encodes.push(bool_to_int(this.p2_trapped['b']))
      p2_raw_encodes = p2_raw_encodes.concat(this.p2_active_pokemon_stats['b'].get_encode())

      p2_category_encodes.push(convert_effectiveness_to_encoded(this.p2_effective['b']))

      p2_seen_attacks_category_encodes.push(BaseEncoder.attackNamesLabelEncoder.transform([toID(this.p2_seen_attacks['b'])]))
    }
    if(gametype == 'triples'){
      p2_raw_encodes.push(bool_to_int(this.p2_move_succeeded['b']))
      p2_raw_encodes.push(bool_to_int(this.p2_move_succeeded['c']))
      p2_raw_encodes.push(bool_to_int(this.p2_trapped['b']))
      p2_raw_encodes.push(bool_to_int(this.p2_trapped['c']))
      p2_raw_encodes = p2_raw_encodes.concat(this.p2_active_pokemon_stats['b'].get_encode())
      p2_raw_encodes = p2_raw_encodes.concat(this.p2_active_pokemon_stats['c'].get_encode())

      p2_category_encodes.push(convert_effectiveness_to_encoded(this.p2_effective['b']))
      p2_category_encodes.push(convert_effectiveness_to_encoded(this.p2_effective['c']))

      p2_seen_attacks_category_encodes.push(BaseEncoder.attackNamesLabelEncoder.transform([toID(this.p2_seen_attacks['b'])]))
      p2_seen_attacks_category_encodes.push(BaseEncoder.attackNamesLabelEncoder.transform([toID(this.p2_seen_attacks['c'])]))
    }

    var full_category_encodes = []
    var full_raw_encodes = []

    if(is_p1_perspective){
      full_category_encodes = full_category_encodes.concat(category_encode)
      full_category_encodes = full_category_encodes.concat(p1_category_encodes)
      full_category_encodes = full_category_encodes.concat(p2_category_encodes)
      full_category_encodes = full_category_encodes.concat(p1_seen_attacks_category_encodes)
      full_category_encodes = full_category_encodes.concat(p2_seen_attacks_category_encodes)

      full_raw_encodes = full_raw_encodes.concat(field_raw_encodes)
      full_raw_encodes = full_raw_encodes.concat(p1_raw_encodes)
      full_raw_encodes = full_raw_encodes.concat(p2_raw_encodes)
    }else{
      full_category_encodes = full_category_encodes.concat(category_encode)
      full_category_encodes = full_category_encodes.concat(p2_category_encodes)
      full_category_encodes = full_category_encodes.concat(p1_category_encodes)
      full_category_encodes = full_category_encodes.concat(p2_seen_attacks_category_encodes)
      full_category_encodes = full_category_encodes.concat(p1_seen_attacks_category_encodes)

      full_raw_encodes = full_raw_encodes.concat(field_raw_encodes)
      full_raw_encodes = full_raw_encodes.concat(p2_raw_encodes)
      full_raw_encodes = full_raw_encodes.concat(p1_raw_encodes)

    }
    full_category_encodes = full_category_encodes.flat(1)
    full_raw_encodes = full_raw_encodes.flat(1)

    return [full_category_encodes, full_raw_encodes]

  }

  rawObservationEncode(gametype: 'singles' | 'doubles' | 'triples', is_p1_perspective:Boolean){

    var category_encode = [
        [this.gen],
        [gametype],
        [this.tier],
        [this.weather_condition],
        [this.terrain_condition],
        [this.current_room],
    ]
    if(gametype === 'doubles'){
      category_encode = category_encode.concat([
        ['attack1'], // placeholder action a
        ['ALLY_SLOT_1'],  // placeholder selectable target a
        ['attack1'], // placeholder action b
        ['ALLY_SLOT_1'],  // placeholder selectable target b
        ['ALLY_SLOT_1'],  // placeholder awaiting request for
      ])
    }
    if(gametype === 'triples'){
      category_encode = category_encode.concat([
          ['attack1'], // placeholder action a
          ['ALLY_SLOT_1'],  // placeholder selectable target a
          ['attack1'], // placeholder action b
          ['ALLY_SLOT_1'],  // placeholder selectable target b
          ['attack1'], // placeholder action c
          ['ALLY_SLOT_1'],  // placeholder selectable target c
          ['ALLY_SLOT_1'],  // placeholder awaiting request for
      ])
    }

    var field_raw_encodes = [
        this.weather_turns,
        this.terrain_turns,
        this.room_turns,
    ]

    var p1_category_encodes = [
        this.p1_effective['a'],
    ]

    var p1_raw_encodes = [
        this.p1_teamsize,
        (this.p1_safeguard),
        (this.p1_lightscreen),
        (this.p1_reflect),
        (this.p1_tailwind),
        (this.p1_aurora_veil),
        (this.p1_has_rocks),
        (this.p1_has_web),
        this.p1_spikes,
        this.p1_toxic_spikes,
        (this.p1_move_succeeded['a']),
        (this.p1_trapped['a']),
    ]
    p1_raw_encodes = p1_raw_encodes.concat([
      (this.p1_used_mega),
      (this.p1_used_zmove),
      (this.p1_used_dynamax),
    ])

    var p1_seen_attacks_category_encodes = [
        ([toID(this.p1_seen_attacks['a'])]),//     # category
    ]
    p1_raw_encodes = p1_raw_encodes.concat(this.p1_active_pokemon_stats['a'].get_raw_verify())

    if(gametype == 'doubles'){
      p1_raw_encodes.push(this.p1_move_succeeded['b'])
      p1_raw_encodes.push(this.p1_trapped['b'])
      p1_raw_encodes = p1_raw_encodes.concat(this.p1_active_pokemon_stats['b'].get_raw_verify())

      p1_category_encodes.push(this.p1_effective['b'])

      p1_seen_attacks_category_encodes.push([toID(this.p1_seen_attacks['b'])])
    }
    if(gametype == 'triples'){
      p1_raw_encodes.push(this.p1_move_succeeded['b'])
      p1_raw_encodes.push(this.p1_move_succeeded['c'])
      p1_raw_encodes.push(this.p1_trapped['b'])
      p1_raw_encodes.push(this.p1_trapped['c'])
      p1_raw_encodes = p1_raw_encodes.concat(this.p1_active_pokemon_stats['b'].get_raw_verify())
      p1_raw_encodes = p1_raw_encodes.concat(this.p1_active_pokemon_stats['c'].get_raw_verify())

      p1_category_encodes.push(this.p1_effective['b'])
      p1_category_encodes.push(this.p1_effective['c'])

      p1_seen_attacks_category_encodes.push([toID(this.p1_seen_attacks['b'])])
      p1_seen_attacks_category_encodes.push([toID(this.p1_seen_attacks['c'])])
    }


    var p2_category_encodes = [
        this.p2_effective['a'],
    ]


    var p2_raw_encodes = [
        this.p2_teamsize,
        (this.p2_safeguard),
        (this.p2_lightscreen),
        (this.p2_reflect),
        (this.p2_tailwind),
        (this.p2_aurora_veil),
        (this.p2_has_rocks),
        (this.p2_has_web),
        this.p2_spikes,
        this.p2_toxic_spikes,
        (this.p2_move_succeeded['a']),
        (this.p2_trapped['a']),
    ]

    p2_raw_encodes = p2_raw_encodes.concat([
      (this.p2_used_mega),
      (this.p2_used_zmove),
      (this.p2_used_dynamax),
    ])


    p2_raw_encodes = p2_raw_encodes.concat(this.p2_active_pokemon_stats['a'].get_raw_verify())

    var p2_seen_attacks_category_encodes = [
        [toID(this.p2_seen_attacks['a'])],//     # category
    ]

    if(gametype == 'doubles'){
      p2_raw_encodes.push(this.p2_move_succeeded['b'])
      p2_raw_encodes.push(this.p2_trapped['b'])
      p2_raw_encodes = p2_raw_encodes.concat(this.p2_active_pokemon_stats['b'].get_raw_verify())

      p2_category_encodes.push(this.p2_effective['b'])

      p2_seen_attacks_category_encodes.push([toID(this.p2_seen_attacks['b'])])
    }
    if(gametype == 'triples'){
      p2_raw_encodes.push(this.p2_move_succeeded['b'])
      p2_raw_encodes.push(this.p2_move_succeeded['c'])
      p2_raw_encodes.push(this.p2_trapped['b'])
      p2_raw_encodes.push(this.p2_trapped['c'])
      p2_raw_encodes = p2_raw_encodes.concat(this.p2_active_pokemon_stats['b'].get_raw_verify())
      p2_raw_encodes = p2_raw_encodes.concat(this.p2_active_pokemon_stats['c'].get_raw_verify())

      p2_category_encodes.push(this.p2_effective['b'])
      p2_category_encodes.push(this.p2_effective['c'])

      p2_seen_attacks_category_encodes.push([toID(this.p2_seen_attacks['b'])])
      p2_seen_attacks_category_encodes.push([toID(this.p2_seen_attacks['c'])])
    }

    var full_category_encodes = []
    var full_raw_encodes = []

    if(is_p1_perspective){
      full_category_encodes = full_category_encodes.concat(category_encode)
      full_category_encodes = full_category_encodes.concat(p1_category_encodes)
      full_category_encodes = full_category_encodes.concat(p2_category_encodes)
      full_category_encodes = full_category_encodes.concat(p1_seen_attacks_category_encodes)
      full_category_encodes = full_category_encodes.concat(p2_seen_attacks_category_encodes)

      full_raw_encodes = full_raw_encodes.concat(field_raw_encodes)
      full_raw_encodes = full_raw_encodes.concat(p1_raw_encodes)
      full_raw_encodes = full_raw_encodes.concat(p2_raw_encodes)
    }else{
      full_category_encodes = full_category_encodes.concat(category_encode)
      full_category_encodes = full_category_encodes.concat(p2_category_encodes)
      full_category_encodes = full_category_encodes.concat(p1_category_encodes)
      full_category_encodes = full_category_encodes.concat(p2_seen_attacks_category_encodes)
      full_category_encodes = full_category_encodes.concat(p1_seen_attacks_category_encodes)

      full_raw_encodes = full_raw_encodes.concat(field_raw_encodes)
      full_raw_encodes = full_raw_encodes.concat(p2_raw_encodes)
      full_raw_encodes = full_raw_encodes.concat(p1_raw_encodes)

    }
    full_category_encodes = full_category_encodes.flat(1)
    full_raw_encodes = full_raw_encodes.flat(1)

    return [full_category_encodes, full_raw_encodes]

  }


  rawObservationLabel(gametype: 'singles' | 'doubles' | 'triples'){

    var category_encode = [
      'gen',
      'gametype',
      'tier',
      'weather_condition',
      'terrain_condition',
      'current_room',
    ]
    if(gametype === 'doubles'){
      category_encode = category_encode.concat([
        ['active_pokemon_actions_a'], // placeholder action a
        ['active_pokemon_targets_a'],  // placeholder selectable target a
        ['active_pokemon_actions_b'], // placeholder action b
        ['active_pokemon_targets_b'],  // placeholder selectable target b
        ['action_for_position'],  // placeholder awaiting request for
      ])
    }
    if(gametype === 'triples'){
      category_encode = category_encode.concat([
        ['active_pokemon_actions_a'], // placeholder action a
        ['active_pokemon_targets_a'],  // placeholder selectable target a
        ['active_pokemon_actions_b'], // placeholder action b
        ['active_pokemon_targets_b'],  // placeholder selectable target b
        ['active_pokemon_actions_c'], // placeholder action b
        ['active_pokemon_targets_c'],  // placeholder selectable target b
        ['action_for_position'],  // placeholder awaiting request for
      ])
    }

    var field_raw_encodes = [
        'weather_turns',
        'terrain_turns',
        'room_turns',
    ]

    var p1_category_encodes = [
        'p1_effective_a',
    ]

    var p1_raw_encodes = [
      'p1_teamsize',
      'p1_safeguard',
      'p1_lightscreen',
      'p1_reflect',
      'p1_tailwind',
      'p1_aurora_veil',
      'p1_has_rocks',
      'p1_has_web',
      'p1_spikes',
      'p1_toxic_spikes',
      'p1_move_succeeded_a',
      'p1_trapped_a',
    ]

    p1_raw_encodes = p1_raw_encodes.concat([
      'p1_used_mega',
      'p1_used_zmove',
      'p1_used_dynamax',
    ])

    var p1_seen_attacks_category_encodes = [
        'p1_seen_attacks_a',//     # category
    ]
    p1_raw_encodes = p1_raw_encodes.concat(this.p1_active_pokemon_stats['a'].get_raw_verify_labels(true, 'a'))

    if(gametype == 'doubles'){
      p1_raw_encodes.push('p1_move_succeeded_b')
      p1_raw_encodes.push('p1_trapped_b')
      p1_raw_encodes = p1_raw_encodes.concat(this.p1_active_pokemon_stats['b'].get_raw_verify_labels(true, 'b'))

      p1_category_encodes.push('p1_effective_b')

      p1_seen_attacks_category_encodes.push('p1_seen_attacks_b')
    }
    if(gametype == 'triples'){
      p1_raw_encodes.push('p1_move_succeeded_b')
      p1_raw_encodes.push('p1_move_succeeded_c')
      p1_raw_encodes.push('p1_trapped_b')
      p1_raw_encodes.push('p1_trapped_c')
      p1_raw_encodes = p1_raw_encodes.concat(this.p1_active_pokemon_stats['b'].get_raw_verify_labels(true, 'b'))
      p1_raw_encodes = p1_raw_encodes.concat(this.p1_active_pokemon_stats['c'].get_raw_verify_labels(true, 'c'))

      p1_category_encodes.push('p1_effective_b')
      p1_category_encodes.push('p1_effective_c')

      p1_seen_attacks_category_encodes.push('p1_seen_attacks_b')
      p1_seen_attacks_category_encodes.push('p1_seen_attacks_c')
    }


    var p2_category_encodes = [
      'p2_effective_a',
    ]


    var p2_raw_encodes = [
      'p2_teamsize',
      'p2_safeguard',
      'p2_lightscreen',
      'p2_reflect',
      'p2_tailwind',
      'p2_aurora_veil',
      'p2_has_rocks',
      'p2_has_web',
      'p2_spikes',
      'p2_toxic_spikes',
      'p2_move_succeeded_a',
      'p2_trapped_a',
    ]

    p2_raw_encodes = p2_raw_encodes.concat([
      'p2_used_mega',
      'p2_used_zmove',
      'p2_used_dynamax',
    ])

    p2_raw_encodes = p2_raw_encodes.concat(this.p2_active_pokemon_stats['a'].get_raw_verify_labels(false, 'a'))

    var p2_seen_attacks_category_encodes = [
      'p2_seen_attacks_a',//     # category
    ]

    if(gametype == 'doubles'){
      p2_raw_encodes.push('p2_move_succeeded_b')
      p2_raw_encodes.push('p2_trapped_b')
      p2_raw_encodes = p2_raw_encodes.concat(this.p2_active_pokemon_stats['b'].get_raw_verify_labels(true, 'b'))

      p2_category_encodes.push('p2_effective_b')

      p2_seen_attacks_category_encodes.push('p2_seen_attacks_b')
    }
    if(gametype == 'triples'){
      p2_raw_encodes.push('p2_move_succeeded_b')
      p2_raw_encodes.push('p2_move_succeeded_c')
      p2_raw_encodes.push('p2_trapped_b')
      p2_raw_encodes.push('p2_trapped_c')
      p2_raw_encodes = p2_raw_encodes.concat(this.p2_active_pokemon_stats['b'].get_raw_verify_labels(true, 'b'))
      p2_raw_encodes = p2_raw_encodes.concat(this.p2_active_pokemon_stats['c'].get_raw_verify_labels(true, 'c'))

      p2_category_encodes.push('p2_effective_b')
      p2_category_encodes.push('p2_effective_c')

      p2_seen_attacks_category_encodes.push('p2_seen_attacks_b')
      p2_seen_attacks_category_encodes.push('p2_seen_attacks_c')
    }

    var full_category_encodes = []
    var full_raw_encodes = []

    full_category_encodes = full_category_encodes.concat(category_encode)
    full_category_encodes = full_category_encodes.concat(p1_category_encodes)
    full_category_encodes = full_category_encodes.concat(p2_category_encodes)
    full_category_encodes = full_category_encodes.concat(p1_seen_attacks_category_encodes)
    full_category_encodes = full_category_encodes.concat(p2_seen_attacks_category_encodes)

    full_raw_encodes = full_raw_encodes.concat(field_raw_encodes)
    full_raw_encodes = full_raw_encodes.concat(p1_raw_encodes)
    full_raw_encodes = full_raw_encodes.concat(p2_raw_encodes)

    full_category_encodes = full_category_encodes.flat(1)
    full_raw_encodes = full_raw_encodes.flat(1)

    return [full_category_encodes, full_raw_encodes]

  }

/*

[
172,   7,  11,  17,  -1, 101,   2, 845,  11,   1, 703,  11,
  1, 653,   4,   2, 802,  12,   1, 750,   7,   8,  15,  -1,
192,  -1, 576,  11,   1, 425,   8,   1, 329,  15,   2, 727,
 14,   1, 870,   6,  -1,  17,  -1,  55,  -1, 384,  11,  -1,
585,  13,  -1, 655,   7,  -1, 350,  11,  -1, 561,   6,   2,
  9,  -1,  54,  -1, 184,   9,   2, 534,   2,   2, 738,  14,
  2, 164,   2,   2, 289,   7,   0,  15,  -1,  53,  -1, 817,
  0,   2,  85,  15,   2, 414,   1,   2, 756,   4,   2, 587,
  6,  -1,   6,  -1,
]
*/

/*
[
'chansey',     '',            'Normal',      'Typeless',    'naturalcure',
'eviolite',    'F',           'wish',        'Normal',      'Status',
'softboiled',  'Normal',      'Status',      'seismictoss', 'Fighting',
'Physical',    'toxic',       'Poison',      'Status',      'ferrothorn',
'',            'Grass',       'Steel',       'ironbarbs',   'leftovers',
'',            'protect',     'Normal',      'Status',      'leechseed',
'Grass',       'Status',      'gyroball',    'Steel',       'Physical',
'stealthrock', 'Rock',        'Status',      'sylveon',     'fnt',
'Fairy',       'Typeless',    'pixilate',    'choicespecs', '',
'hypervoice',  'Normal',      'Special',     'psyshock',    'Psychic',
'Special',     'shadowball',  'Ghost',       'Special',     'hiddenpower',
'Normal',      'Special',     'garchomp',    'fnt',         'Dragon',
'Ground',      'roughskin',   'choicescarf', '',            'earthquake',
'Ground',      'Physical',    'outrage',     'Dragon',      'Physical',
'stoneedge',   'Rock',        'Physical',    'dragonclaw',  'Dragon',
'Physical',    'scizor',      '',            'Bug',         'Steel',
'technician',  'choiceband',  '',            'uturn',       'Bug',
'Physical',    'bulletpunch', 'Steel',       'Physical',    'knockoff',
'Dark',        'Physical',    'superpower',  'Fighting',    'Physical',
'togekiss',    'fnt',         'Fairy',       'Flying',      'serenegrace',

]


gen: 1,
gameType: '1',

*/

  register_for_team_metrics(pokemon_set, is_player_1){
    var metrics = {}
    for(const [idx, pokemon] of pokemon_set.entries()){
      metrics[pokemon.species.baseSpecies] = {
          'team_index': idx,
          'team_position': idx+1,
          'showdown_id': pokemon.species.id,
          'is_first_damaged': true,
          'is_first_turn': true,
          'is_first_switch':true,
      }
    }

    if(is_player_1){
      this.p1_team_pokemon_metrics = metrics
    }else{
      this.p2_team_pokemon_metrics = metrics
    }
  }

  convert_p1_pokemon_to_team_position(original_pokemon_name, is_player_1){
    var pokemon_name = original_pokemon_name.replace('-Gmax', '')


    try {
      if(is_player_1){
        return this.p1_team_pokemon_metrics[pokemon_name]['team_position']
      }else{
        return this.p2_team_pokemon_metrics[pokemon_name]['team_position']
      }
    } catch(err) {
      return 0
      console.log('err.message', err.message)
      console.log('output', output)
      console.log('pokemon_name', pokemon_name)
      console.log('is_player_1', is_player_1)
      console.log('this.p1_team_pokemon_metrics', this.p1_team_pokemon_metrics)
      console.log('this.p2_team_pokemon_metrics', this.p2_team_pokemon_metrics)
    }

  }

  team_pokemon_is_first_turn(original_pokemon_name, is_player_1, output){
    var pokemon_name = original_pokemon_name.replace('-Gmax', '')
//    console.log('pokemon_name', pokemon_name)
//    console.log('this.p1_team_pokemon_metrics', this.p1_team_pokemon_metrics)
//    console.log('this.p2_team_pokemon_metrics', this.p2_team_pokemon_metrics)

    var is_first_turn = false
    try {
      if(is_player_1){
        is_first_turn = this.p1_team_pokemon_metrics[pokemon_name]['is_first_turn']
        this.p1_team_pokemon_metrics[pokemon_name]['is_first_turn'] = false
      }else{
        is_first_turn = this.p2_team_pokemon_metrics[pokemon_name]['is_first_turn']
        this.p2_team_pokemon_metrics[pokemon_name]['is_first_turn'] = false
      }
    } catch(err) {
      return is_first_turn
      console.log('err.message', err.message)
      console.log('output', output)
      console.log('pokemon_name', pokemon_name)
      console.log('is_player_1', is_player_1)
      console.log('this.p1_team_pokemon_metrics', this.p1_team_pokemon_metrics)
      console.log('this.p2_team_pokemon_metrics', this.p2_team_pokemon_metrics)
    }

    return is_first_turn
  }

  team_pokemon_is_first_damaged_turn(original_pokemon_name, is_player_1){
    var pokemon_name = original_pokemon_name.replace('-Gmax', '')

    var is_first_damaged = false
    try {
      if(is_player_1){
        is_first_damaged = this.p1_team_pokemon_metrics[pokemon_name]['is_first_damaged']
        this.p1_team_pokemon_metrics[pokemon_name]['is_first_damaged'] = false
      }else{
        is_first_damaged = this.p2_team_pokemon_metrics[pokemon_name]['is_first_damaged']
        this.p2_team_pokemon_metrics[pokemon_name]['is_first_damaged'] = false
      }
    } catch(err) {
      return is_first_damaged
      console.log('err.message', err.message)
      console.log('output', output)
      console.log('pokemon_name', pokemon_name)
      console.log('is_player_1', is_player_1)
      console.log('this.p1_team_pokemon_metrics', this.p1_team_pokemon_metrics)
      console.log('this.p2_team_pokemon_metrics', this.p2_team_pokemon_metrics)
    }

    return is_first_damaged
  }

  team_pokemon_is_first_switch_turn(original_pokemon_name, is_player_1){
    var pokemon_name = original_pokemon_name.replace('-Gmax', '')

    var is_first_switch = false
    try {
      if(is_player_1){
        is_first_switch = this.p1_team_pokemon_metrics[pokemon_name]['is_first_switch']
        this.p1_team_pokemon_metrics[pokemon_name]['is_first_switch'] = false
      }else{
        is_first_switch = this.p2_team_pokemon_metrics[pokemon_name]['is_first_switch']
        this.p2_team_pokemon_metrics[pokemon_name]['is_first_switch'] = false
      }
    } catch(err) {
      return is_first_switch
      console.log('err.message', err.message)
      console.log('output', output)
      console.log('pokemon_name', pokemon_name)
      console.log('is_player_1', is_player_1)
      console.log('this.p1_team_pokemon_metrics', this.p1_team_pokemon_metrics)
      console.log('this.p2_team_pokemon_metrics', this.p2_team_pokemon_metrics)
    }

    return is_first_switch
  }




  apply_boost_metrics(is_player_1, active_stats){
    var metrics_prefix = 'p1'
    if(is_player_1 == false){
      metrics_prefix = 'p2'
    }

    var metric_items = []
    var stage_boosts = [active_stats.evasion_modifier, active_stats.accuracy_modifier, active_stats.attack_modifier, active_stats.spatk_modifier, active_stats.defense_modifier, active_stats.spdef_modifier, active_stats.speed_modifier]
    var stage_mins = ['evasion_modifier_min', 'attack_modifier_min', 'attack_modifier_min', 'spatk_modifier_min', 'defense_modifier_min', 'spdef_modifier_min', 'speed_modifier_min']
    var stage_maxs = ['evasion_modifier_max', 'accuracy_modifier_max', 'attack_modifier_max', 'spatk_modifier_max', 'defense_modifier_max', 'spdef_modifier_max', 'speed_modifier_max']

    for(const [i, stage_boost] of stage_boosts.entries()){
      var stage_min_key = stage_mins[i]
      var stage_max_key = stage_maxs[i]
      if (stage_boost < 0){
        metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[stage_min_key], stage_boost, METRIC_TYPES.MIN])
      }else{
        metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[stage_max_key], stage_boost, METRIC_TYPES.MAX])
      }
    }

    this.sessionMetrics.bulk_update_metrics(metric_items)

  }


//  # Update and delete
  update_perish_song(output){
    //#'|-start|p2a: Hydreigon|perish3'
    var perish_turn_count = parseInt(output.slice(-1)[0] )
    var perish_split = output.split('|')
    var player_pkmn = perish_split[2]
    player_pkmn = player_pkmn.split(': ', 1)
    var player = player_pkmn[0]
    var pkmn = player_pkmn[1]
    var pkmn_position = player.slice(-1)[0]
    var metrics_prefix = 'p1'

    if( 'p1' === player.slice(0,2)){
      this.p1_active_pokemon_stats[pkmn_position].perished = perish_turn_count
    }else{
      this.p2_active_pokemon_stats[pkmn_position].perished = perish_turn_count
      metrics_prefix = 'p2'
    }
    this.sessionMetrics.update_metrics(metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[perish_song_regex], null, METRIC_TYPES.INCREMENT)
  }

  process_boost_unboost(output, is_boost){
/*
#|-boost|p1a: Flygon|atk|1
#|-boost|p2a: Malamar|atk|1|[zeffect]
#|-boost|p2a: Malamar|def|1|[zeffect]
#|-boost|p2a: Malamar|spa|1|[zeffect]
#|-boost|p2a: Malamar|spd|1|[zeffect]
#|-unboost|p1a: Hitmontop|def|1
#|-unboost|p1a: Hitmontop|spd|1
#|-unboost|p2a: Lunala|evasion|1
*/
    var boost_pieces = output.split('|')
    var player_pkmn = boost_pieces[2], stat = boost_pieces[3], amt = boost_pieces[4]
    var player = player_pkmn.split(': ')[0]
    var pkmn_position = player[2]
    var modifier = 1
    if(!is_boost){
      modifier = -1
    }
    if(player.includes('p1')){
      this.p1_reward += (this.reward_config['stat_modified'] * modifier * amt)
      this.p1_rewards_tracker['stat_modified'].push((this.reward_config['stat_modified'] * modifier * amt))
      this.p1_active_pokemon_stats[pkmn_position].boost_stat(stat, amt, is_boost)
      this.apply_boost_metrics(true, this.p1_active_pokemon_stats[pkmn_position])
    }
    if(player.includes('p2')){
      this.p2_reward += (this.reward_config['stat_modified'] * modifier * amt)
      this.p2_rewards_tracker['stat_modified'].push((this.reward_config['stat_modified'] * modifier * amt))
      this.p2_active_pokemon_stats[pkmn_position].boost_stat(stat, amt, is_boost)
      this.apply_boost_metrics(false, this.p2_active_pokemon_stats[pkmn_position])
    }
  }

/*
def process_boost_unboost(self, output, is_boost=True):
    boost_pieces = output.split('|')
    _, _, player_pkmn, stat, amt, *rest = boost_pieces
    player = player_pkmn.split(': ', 1)[0]
    pkmn_position =player[-1]
    if 'p1' == player[:-1]:
        this.p1_active_pokemon_stats[pkmn_position].boost_stat(stat, amt, is_boost)
        this.apply_boost_metrics(True, this.p1_active_pokemon_stats[pkmn_position])
    if 'p2' == player[:-1]:
        this.p2_active_pokemon_stats[pkmn_position].boost_stat(stat, amt, is_boost)
        this.apply_boost_metrics(False, this.p2_active_pokemon_stats[pkmn_position])

*/

  process_form_update(output){
  //'|-formechange|p2a: Minior|Minior-Meteor||[from] ability: Shields Down'
    var details_split = output.split('|')
    var player_pkmn = details_split[2]
    player_pkmn = player_pkmn.split(': ')
    var player = player_pkmn[0]
    var pkmn = player_pkmn[1]
    var pkmn_new_form = details_split[3].split(', ')[0]
//    this.update_form(pkmn, pkmn_new_form, 'p1' == player.slice(0,2))

  }

  get_player_pkmn_position(output){
    var output_split = output.split('|')
    var player_pkmn = output_split[2]
    player_pkmn = player_pkmn.split(': ')
    var player = player_pkmn[0]
    var pkmn = player_pkmn[1]
    var pkmn_position = player.slice(-1)[0]
    return [('p1' == player.slice(0,2)), pkmn, pkmn_position]
  }

  update_seen_moves(is_player_1, pkmn_name, atk_name){
    var seen_attacks = this.p1_seen_details
    if (!is_player_1){
      seen_attacks = this.p2_seen_details
    }
    var pkmn_attacks = {}
    var atk_count = 0
    if (pkmn_name in seen_attacks){
      pkmn_attacks = seen_attacks[pkmn_name]['attacks']
    }

    if (atk_name in pkmn_attacks){
      atk_count = pkmn_attacks[atk_name]
    }

    atk_count += 1
    pkmn_attacks[atk_name] = atk_count
    seen_attacks[pkmn_name]['attacks'] = pkmn_attacks

  }

  update_seen_tera(is_player_1, pkmn_name, tera_type){
    var seen_attacks = this.p1_seen_details
    if (!is_player_1){
      seen_attacks = this.p2_seen_details
    }
    seen_attacks[pkmn_name]['tera'] = tera_type

  }

  update_seen_pokemon(is_player_1, pkmn_name){
    var seen_attacks = this.p1_seen_details
    if (!is_player_1){
      seen_attacks = this.p2_seen_details
    }
//    console.log('seen_attacks', seen_attacks)
    if (!(pkmn_name in seen_attacks)){
      seen_attacks[pkmn_name] = {}
      seen_attacks[pkmn_name]['attacks'] = {}
      seen_attacks[pkmn_name]['form'] = pkmn_name
      seen_attacks[pkmn_name]['item'] = 'hidden_item'
      seen_attacks[pkmn_name]['ability'] = 'hidden_ability'

      seen_attacks[pkmn_name]['tera'] = ''
      seen_attacks[pkmn_name]['status'] = ''
      seen_attacks[pkmn_name]['health'] = 1
      seen_attacks[pkmn_name]['last_health'] = 1

    }
  }

  update_seen_ability(is_player_1, pkmn_name, ability){
    var seen_attacks = this.p1_seen_details
    if (!is_player_1){
      seen_attacks = this.p2_seen_details
    }
//    |-ability|p1a: Gardevoir|Water Absorb|[from] ability: Trace|[of] p2a: Quagsire
//    console.log('seen_attacks', seen_attacks)
//    console.log('pkmn_name', pkmn_name)
    seen_attacks[pkmn_name]['ability'] = ability
  }

  update_item(pkmn, new_item, is_player_1){
    var seen_attacks = this.p1_seen_details
    if (!is_player_1){
      seen_attacks = this.p2_seen_details
    }
    seen_attacks[pkmn]['item'] = new_item
  }

  update_status(pkmn, new_status, is_player_1){
    var seen_attacks = this.p1_seen_details
    if (!is_player_1){
      seen_attacks = this.p2_seen_details
    }
    seen_attacks[pkmn]['status'] = new_status
  }

  handle_swap(is_player_1){
    var selected_slots = this.p1_selected
    var active_pokemon_stats = this.p1_active_pokemon_stats
    if (!is_player_1){
      selected_slots = this.p2_selected
      active_pokemon_stats = this.p2_active_pokemon_stats
    }

    var holder = selected_slots['a']
    selected_slots['a'] = selected_slots['b']
    selected_slots['b'] = holder

    var holder_stats = active_pokemon_stats['a']
    active_pokemon_stats['a'] = active_pokemon_stats['b']
    active_pokemon_stats['b'] = holder_stats

  }

  handle_switch(is_player_1, pkmn_name, position){
    if (is_player_1){
      this.p1_active_pokemon_stats[position] = new ActiveStats()
      this.p1_selected[position] = pkmn_name
      this.p1_reward -= this.reward_config['minor_switch']
      this.p1_rewards_tracker['minor_switch'].push(-this.reward_config['minor_switch'])
    }else{
      this.p2_active_pokemon_stats[position] = new ActiveStats()
      this.p2_selected[position] = pkmn_name
      this.p2_reward -= this.reward_config['minor_switch']
      this.p2_rewards_tracker['minor_switch'].push(-this.reward_config['minor_switch'])
    }

    this.update_seen_pokemon(is_player_1, pkmn_name)

  }

  update_curr_health(is_player, pkmn_name, health_status){
    var health_ratio = 0
    var max_health = 0
    if (!(health_status.includes('fnt'))){
      health_status = health_status.split('/')
      var curr_health = health_status[0]
      health_status = health_status[1]
      health_status = health_status.split(' ')
      max_health = parseInt(health_status[0])
      health_ratio = parseInt(curr_health)/parseFloat(max_health)
    }else{
      curr_health = 0
      max_health = 0
    }

    var seen_attacks = this.p1_seen_details
    if (!is_player){
      seen_attacks = this.p2_seen_details
    }
//    console.log('seen_attacks', seen_attacks)
    seen_attacks[pkmn_name]['health'] = health_ratio
    var delta_change = seen_attacks[pkmn_name]['health'] - seen_attacks[pkmn_name]['last_health']
    seen_attacks[pkmn_name]['last_health'] = health_ratio

    //# adjust score based on change in health. If negative, enemy gets reward and player loses.
    //# if positive, player gains, enemy nothing.

    var health_reward = delta_change * this.reward_config['health_change_base']
    if (is_player){
      this.p1_rewards_tracker['health_change_base_raw'].push(delta_change)
      this.p2_rewards_tracker['other_health_change_base_raw'].push(delta_change)
      this.p1_rewards_tracker['current_health_raw'].push(health_ratio)
      this.p2_rewards_tracker['other_current_health_raw'].push(health_ratio)
    }else{
      this.p1_rewards_tracker['other_health_change_base_raw'].push(delta_change)
      this.p2_rewards_tracker['health_change_base_raw'].push(delta_change)
      this.p1_rewards_tracker['other_current_health_raw'].push(health_ratio)
      this.p2_rewards_tracker['current_health_raw'].push(health_ratio)
    }

  // # lost life
    if (delta_change < 0){
      if (is_player){
        this.p1_reward -= health_reward
        this.p2_reward += health_reward * this.punish_multiplier
      this.p1_rewards_tracker['health_change_base'].push(-health_reward)
      this.p2_rewards_tracker['other_health_change_base'].push(health_reward)
      }else{
        this.p1_reward += health_reward  * this.punish_multiplier
        this.p2_reward -= health_reward
      this.p1_rewards_tracker['other_health_change_base'].push(health_reward)
      this.p2_rewards_tracker['health_change_base'].push(-health_reward)
      }
    }else if (delta_change > 0){
      //# gaining health worth less than taking health
      health_reward *= 0.75
      if (is_player){
        this.p1_reward += health_reward
        this.p1_rewards_tracker['health_change_base'].push(health_reward)
        this.p2_rewards_tracker['other_health_change_base'].push(health_reward)
      }else{
        this.p2_reward += health_reward
        this.p1_rewards_tracker['other_health_change_base'].push(health_reward)
        this.p2_rewards_tracker['health_change_base'].push(health_reward)
      }
    }
  }

  //# Call upon switchin/every turn when getting active moves
  get_form_for_pokemon(is_player_1, pkmn_name){
    var seen_attacks = this.p1_seen_details
    if (!is_player_1){
      seen_attacks = this.p2_seen_details
    }
    return seen_attacks[pkmn_name]['form']

  }

  get_active_pokemon_health(p1_current_pokemon, p2_current_pokemon){
    var p1_health_ratio = 1
    if (p1_current_pokemon !== null){
      p1_health_ratio = this.p1_seen_details[p1_current_pokemon]['health']
    }

    var p2_health_ratio = 1
    if (p2_current_pokemon !== null){
      p2_health_ratio = this.p2_seen_details[p2_current_pokemon]['health']
    }

    return [p1_health_ratio, p2_health_ratio]

  }

  apply_dynamax_counter(){

  }

  apply_recharge_logic(){

  }

  log_end_of_turn_metrics(){
    var current_p1_pokemon = this.p1_selected['a']
    var current_p2_pokemon = this.p2_selected['a']

    var p1_pkmn_form = this.get_form_for_pokemon(true, current_p1_pokemon)
    var p2_pkmn_form = this.get_form_for_pokemon(false, current_p2_pokemon)

    this.sessionMetrics.update_metrics('p1', REGEX_TO_METRICS_KEY_MAPPING['at_end_of_turn'], p1_pkmn_form, METRIC_TYPES.APPEND)
    this.sessionMetrics.update_metrics('p2', REGEX_TO_METRICS_KEY_MAPPING['at_end_of_turn'], p2_pkmn_form, METRIC_TYPES.APPEND)

    var [p1_health_ratio, p2_health_ratio] = this.get_active_pokemon_health(current_p1_pokemon, current_p2_pokemon)
    this.sessionMetrics.update_metrics('p1', REGEX_TO_METRICS_KEY_MAPPING['damage_at_end_of_turn'], p1_health_ratio, METRIC_TYPES.APPEND)
    this.sessionMetrics.update_metrics('p2', REGEX_TO_METRICS_KEY_MAPPING['damage_at_end_of_turn'], p2_health_ratio, METRIC_TYPES.APPEND)


    var ACCURACY_STAGE = 'end_of_turn_accuracy_modifier_stage'
    var ATTACK_STAGE = 'end_of_turn_attack_modifier_stage'
    var SP_ATK_STAGE = 'end_of_turn_spatk_modifier_stage'
    var DEFENSE_STAGE = 'end_of_turn_defense_modifier_stage'
    var SP_DEF_STAGE = 'end_of_turn_spdef_modifier_stage'
    var SPEED_STAGE = 'end_of_turn_speed_modifier_stage'
    var EVASION_STAGE = 'end_of_turn_evasion_modifier_stage'

    var p1_active_stats = this.p1_active_pokemon_stats['a']
    var p2_active_stats = this.p2_active_pokemon_stats['a']

    var metric_items = []
    //# Denotes start of turn
    var metrics_prefix = 'p1'
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[switch_regex], null, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[move_regex], null, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[faint_regex], null, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[attack_super_effective_regex], null, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[attack_resisted_regex], null, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[attack_immune_regex], null, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[move_did_not_succeed], null, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[item_used_regex], null, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[item_removed_by_user_regex], null, METRIC_TYPES.APPEND])

    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[ACCURACY_STAGE], p1_active_stats.accuracy_modifier, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[ATTACK_STAGE], p1_active_stats.attack_modifier, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[SP_ATK_STAGE], p1_active_stats.spatk_modifier, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[DEFENSE_STAGE], p1_active_stats.defense_modifier, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[SP_DEF_STAGE], p1_active_stats.spdef_modifier, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[SPEED_STAGE], p1_active_stats.speed_modifier, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[EVASION_STAGE], p1_active_stats.evasion_modifier, METRIC_TYPES.APPEND])
    metrics_prefix = 'p2'
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[switch_regex], null, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[move_regex], null, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[faint_regex], null, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[attack_super_effective_regex], null, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[attack_resisted_regex], null, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[attack_immune_regex], null, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[move_did_not_succeed], null, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[item_used_regex], null, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[item_removed_by_user_regex], null, METRIC_TYPES.APPEND])

    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[ACCURACY_STAGE], p2_active_stats.accuracy_modifier, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[ATTACK_STAGE], p2_active_stats.attack_modifier, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[SP_ATK_STAGE], p2_active_stats.spatk_modifier, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[DEFENSE_STAGE], p2_active_stats.defense_modifier, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[SP_DEF_STAGE], p2_active_stats.spdef_modifier, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[SPEED_STAGE], p2_active_stats.speed_modifier, METRIC_TYPES.APPEND])
    metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[EVASION_STAGE], p2_active_stats.evasion_modifier, METRIC_TYPES.APPEND])

    this.sessionMetrics.bulk_update_metrics(metric_items)

  }

  update_with_request_info(player, request){
    // can be used to update trapped
  }

  // used every move made
  // in case of upkeep switch and uturn
  clearReward(player_side){
    //console.log('clearing', player_side)
    this.logs.push(`clearing: ${player_side}`)
    if (player_side.includes('p1')){
      //console.log(`reward was: ${this.p1_reward}`)
      //console.log(`reward tracker was: ${JSON.stringify(this.p2_rewards_tracker)}`)
      this.logs.push(`transcript was: ${this.p1_transcript}`)
      this.p1_reward = 0
      this.p1_rewards_tracker = JSON.parse(JSON.stringify(BASE_REWARD_TRACKER))
      this.p1_transcript = ''
    }
    if (player_side.includes('p2')){
      //console.log(`reward was: ${this.p2_reward}`)
      //console.log(`reward tracker was: ${JSON.stringify(this.p2_rewards_tracker)}`)
      this.logs.push(`transcript was: ${this.p2_transcript}`)
      this.p2_reward = 0
      this.p2_rewards_tracker = JSON.parse(JSON.stringify(BASE_REWARD_TRACKER))
      this.p2_transcript = ''
    }

  }

  applySwitchPenalty(player_side){
    var switch_penalty = this.reward_config['switch_penalty']
    var metrics_prefix = 'p1'
    this.logs.push(`switch penalty: ${switch_penalty}, ${player_side}`)
    if (player_side.includes('p1')){
      this.p1_reward -= switch_penalty
      this.p1_rewards_tracker['switch_penalty'].push(-switch_penalty)
    }
    if (player_side.includes('p2')){
      metrics_prefix = 'p2'
      this.p2_reward -= switch_penalty
      this.p2_rewards_tracker['switch_penalty'].push(-switch_penalty)
    }
    this.sessionMetrics.update_metrics(metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING['attacks_counter'], null, METRIC_TYPES.INCREMENT)
  }

  applyAttackReward(player_side){
    var attack_reward = this.reward_config['attack_reward']
    this.logs.push(`attack_reward: ${attack_reward}, ${player_side}`)
    var metrics_prefix = 'p1'
    if (player_side.includes('p1')){
      this.p1_reward += attack_reward
      this.p1_rewards_tracker['attack_reward'].push(attack_reward)
    }
    if (player_side.includes('p2')){
      metrics_prefix = 'p2'
      this.p2_reward += attack_reward
      this.p2_rewards_tracker['attack_reward'].push(attack_reward)
    }
    this.sessionMetrics.update_metrics(metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING['switch_counter'], null, METRIC_TYPES.INCREMENT)
  }

  applyWinReward(player_side){
    var win_reward = this.reward_config['win_reward']
    if (player_side.includes('p1')){
      this.p1_reward += win_reward
      this.p2_reward -= win_reward
      this.p1_rewards_tracker['win_reward'].push(win_reward)
      this.p2_rewards_tracker['win_reward'].push(-win_reward)
    }
    if (player_side.includes('p2')){
      this.p2_reward += win_reward
      this.p1_reward -= win_reward
      this.p1_rewards_tracker['win_reward'].push(-win_reward)
      this.p2_rewards_tracker['win_reward'].push(win_reward)
    }
  }

  //# clamp reward and normalize
  getRewards(player_side){
    var reward = this.p1_reward
    if (player_side.includes('p2')){
      reward = this.p2_reward
    }
    reward = Math.min(Math.max(-MAX_REWARD, reward), MAX_REWARD)

    max_reward_out_of_100 = 10

    return reward / MAX_REWARD
  }

  getArrayLength(arr) {
    if (Array.isArray(arr) && arr.length > 0) {
      return arr.length;
    } else {
      return 0; // Or handle the case where the array is not defined or empty
    }
  }
  
  calculateMaxEarnableRewardOutOf100AndBonusMultiplier(configuration, tracker){

    max_reward_out_of_100 = 10
    max_bonus_multiplier = 1.0
    if (this.getArrayLength(reward_tracker["winner"]) > 0){
      max_reward_out_of_100 = Math.max(max_reward_out_of_100, 100)
    }
    if (this.getArrayLength(reward_tracker["attack_reward"]) > 0){
      max_reward_out_of_100 = Math.max(max_reward_out_of_100, 12)
    }
    if (this.getArrayLength(reward_tracker["winner"]) > 0){
      max_reward_out_of_100 = Math.max(max_reward_out_of_100, 100)
    }

  }
  calculateMaxEarnableRewardOutOf100AndBonusMultiplier(configuration, tracker) {
    var reward_tracker = this.p1_reward_tracker
    if (player_side.includes('p2')){
      reward = this.p2_reward
      reward_tracker = this.p2_reward_tracker
    }

    let max_reward_out_of_100 = 10;
    let max_bonus_multiplier = 1.0;
  
    // Loop through each condition in the configuration
    for (let conditionName in configuration) {
      const condition = configuration[conditionName];
      const combinations = condition.combinations || [];
      // Default to false if not provided
      const requireAll = condition.require_all || false;
      const conditionAmount = condition.amount || 0;
      const conditionBonus = condition.bonus_multiplier || 1.0;
      const minCount = condition.min_count || 0;
      const maxCount = condition.max_count; // could be undefined
      const valueRestrictions = condition.value_restrictions || {};
  
      let conditionMet = false;
  
      if (requireAll) {
        // Every key must satisfy the count requirement.
        conditionMet = true;
        for (let key of combinations) {
          let count = 0;
          if (tracker[key] && Array.isArray(tracker[key])) {
            const restrictions = valueRestrictions[key];
            if (restrictions) {
              // Count only values that satisfy min_value and/or max_value
              for (let value of tracker[key]) {
                if ((restrictions.min_value === undefined || value >= restrictions.min_value) &&
                    (restrictions.max_value === undefined || value <= restrictions.max_value)) {
                  count++;
                }
              }
            } else {
              count = tracker[key].length;
            }
          }
          if (count < minCount || (maxCount !== undefined && count > maxCount)) {
            conditionMet = false;
            break;
          }
        }
      } else {
        // At least one key must satisfy the count requirement.
        conditionMet = false;
        for (let key of combinations) {
          let count = 0;
          if (tracker[key] && Array.isArray(tracker[key])) {
            const restrictions = valueRestrictions[key];
            if (restrictions) {
              for (let value of tracker[key]) {
                if ((restrictions.min_value === undefined || value >= restrictions.min_value) &&
                    (restrictions.max_value === undefined || value <= restrictions.max_value)) {
                  count++;
                }
              }
            } else {
              count = tracker[key].length;
            }
          }
          if (count >= minCount && (maxCount === undefined || count <= maxCount)) {
            conditionMet = true;
            break;
          }
        }
      }
  
      if (conditionMet) {
        max_reward_out_of_100 = Math.max(max_reward_out_of_100, conditionAmount);
        max_bonus_multiplier = Math.max(max_bonus_multiplier, conditionBonus);
      }
    }
  
    return { max_reward_out_of_100, max_bonus_multiplier };
  }
  
    //# clamp reward and normalize
  newGetRewards(player_side){
      if (this.p1_rewards_tracker === undefined || this.p2_rewards_tracker === undefined){
        return 0
      }
      var result = this.calculateRewards(this.reward_bonus_config, this.p1_rewards_tracker, this.p2_rewards_tracker, MAX_REWARD)
      const p1Normalized = result[0]
      const p2Normalized = result[1]
      const p1Transformations = result[2]
      const p2Transformations = result[3]
        if (player_side.includes('p2')){
        return p2Normalized
      }
      return p1Normalized
    }
  
  getBonusReward(reward_bonus_config){
    this.reward_bonus_config = reward_bonus_config
  }

  getRewardTracker(player_side){
    var reward_tracker = this.p1_rewards_tracker
    if (player_side.includes('p2')){
      reward_tracker = this.p2_rewards_tracker
    }
    return reward_tracker
  }

	calculateRewardsSlimmed(conditions, _p1Rewards, _p2Rewards, baseline) {
    var p1Rewards = {};
    var p2Rewards = {};

    for (var key in _p1Rewards) {
      if (_p1Rewards[key].length > 0) {
        p1Rewards[key] = _p1Rewards[key];
      }
      if (_p2Rewards[key].length > 0) {
        p2Rewards[key] = _p2Rewards[key];
      }
    }

    const p1Multipliers = Object.fromEntries(Object.keys(p1Rewards).map(key => [key, 1]));
    const p2Multipliers = Object.fromEntries(Object.keys(p2Rewards).map(key => [key, 1]));
    const p1FixedValues = Object.fromEntries(Object.keys(p1Rewards).map(key => [key, 0]));
    const p2FixedValues = Object.fromEntries(Object.keys(p2Rewards).map(key => [key, 0]));
    const p1Transformations = [];
    const p2Transformations = [];
    let baselineMultiplier = 1;
    let baselineValue = baseline;
  
    function conditionMet(playerRewards, key, condition, countCondition = null) {
      if (!(key in playerRewards)) {
        return false;
      }
      if (condition === "exists") {
        return true;
      }
      if (countCondition) {
        const [countType, countValue] = countCondition.split(' ');
        const count = playerRewards[key].filter(value => 
          ((value > 0 && condition === "positive") ||
           (value < 0 && condition === "negative") ||
           (value === 0 && condition === "is_zero"))).length;
        return countType === "at least" ? count >= parseInt(countValue) :
             countType === "exactly" ? count === parseInt(countValue) :
             countType === "less than" ? count < parseInt(countValue) : false;
      } else {
        return playerRewards[key].some(value => 
          (value > 0 && condition === "positive") ||
          (value < 0 && condition === "negative") ||
          (value === 0 && condition === "is_zero"));
      }
    }
  
    for (const [configName, config] of Object.entries(conditions)) {
      if (Object.entries(config.keys).every(([key, info]) =>
        conditionMet(info.other ? p2Rewards : p1Rewards, key, info.condition, info.count))) {
        p1Transformations.push(configName);
        for (const [key, info] of Object.entries(config.keys)) {
          p1Multipliers[key] = Math.max(p1Multipliers[key], info.multiplier || 1);
          p1FixedValues[key] = Math.max(p1FixedValues[key], info.fixed_value || 0);
        }
        baselineMultiplier = Math.max(baselineMultiplier, config.baseline_multiplier || 1);
        baselineValue = Math.max(baselineValue, config.baseline_value || baseline);
      }
      if (Object.entries(config.keys).every(([key, info]) =>
        conditionMet(info.other ? p1Rewards : p2Rewards, key, info.condition, info.count))) {
        p2Transformations.push(configName);
        for (const [key, info] of Object.entries(config.keys)) {
          p2Multipliers[key] = Math.max(p2Multipliers[key], info.multiplier || 1);
          p2FixedValues[key] = Math.max(p2FixedValues[key], info.fixed_value || 0);
        }
        baselineMultiplier = Math.max(baselineMultiplier, config.baseline_multiplier || 1);
        baselineValue = Math.max(baselineValue, config.baseline_value || baseline);
      }
    }
  
    const finalBaseline = Math.max(baseline * baselineMultiplier, baselineValue);
  
    var p1Sum = Object.entries(p1Rewards).reduce((sum, [key, valueList]) =>
      sum + valueList.reduce((innerSum, value) =>
        innerSum + Math.max(value * p1Multipliers[key], p1FixedValues[key]), 0), 0);
    var p2Sum = Object.entries(p2Rewards).reduce((sum, [key, valueList]) =>
      sum + valueList.reduce((innerSum, value) =>
        innerSum + Math.max(value * p2Multipliers[key], p2FixedValues[key]), 0), 0);
  
    p1Sum = Math.min(Math.max(-finalBaseline, p1Sum), finalBaseline)
    p2Sum = Math.min(Math.max(-finalBaseline, p2Sum), finalBaseline)
    const p1Normalized = p1Sum / finalBaseline;
    const p2Normalized = p2Sum / finalBaseline;

    return [p1Normalized, p2Normalized, p1Transformations, p2Transformations];
  }
  


	calculateRewards(conditions, _p1Rewards, _p2Rewards, baseline) {
    var p1Rewards = {};
    var p2Rewards = {};

    for (var key in _p1Rewards) {
      if (_p1Rewards[key].length > 0) {
        p1Rewards[key] = _p1Rewards[key];
      }
      if (_p2Rewards[key].length > 0) {
        p2Rewards[key] = _p2Rewards[key];
      }
    }

    const p1Multipliers = Object.fromEntries(Object.keys(p1Rewards).map(key => [key, 1]));
    const p2Multipliers = Object.fromEntries(Object.keys(p2Rewards).map(key => [key, 1]));
    const p1FixedValues = Object.fromEntries(Object.keys(p1Rewards).map(key => [key, 0]));
    const p2FixedValues = Object.fromEntries(Object.keys(p2Rewards).map(key => [key, 0]));
    const p1Transformations = [];
    const p2Transformations = [];
    let baselineMultiplier = 1;
    let baselineValue = baseline;
  
    function conditionMet(playerRewards, key, condition, countCondition = null) {
      if (!(key in playerRewards)) {
        return false;
      }
      if (condition === "exists") {
        return true;
      }
      if (countCondition) {
        const [countType, countValue] = countCondition.split(' ');
        const count = playerRewards[key].filter(value => 
          ((value > 0 && condition === "positive") ||
           (value < 0 && condition === "negative") ||
           (value === 0 && condition === "is_zero"))).length;
        return countType === "at least" ? count >= parseInt(countValue) :
             countType === "exactly" ? count === parseInt(countValue) :
             countType === "less than" ? count < parseInt(countValue) : false;
      } else {
        return playerRewards[key].some(value => 
          (value > 0 && condition === "positive") ||
          (value < 0 && condition === "negative") ||
          (value === 0 && condition === "is_zero"));
      }
    }
  
    for (const [configName, config] of Object.entries(conditions)) {
      if (Object.entries(config.keys).every(([key, info]) =>
        conditionMet(info.other ? p2Rewards : p1Rewards, key, info.condition, info.count))) {
        p1Transformations.push(configName);
        for (const [key, info] of Object.entries(config.keys)) {
          p1Multipliers[key] = Math.max(p1Multipliers[key], info.multiplier || 1);
          p1FixedValues[key] = Math.max(p1FixedValues[key], info.fixed_value || 0);
        }
        baselineMultiplier = Math.max(baselineMultiplier, config.baseline_multiplier || 1);
        baselineValue = Math.max(baselineValue, config.baseline_value || baseline);
      }
      if (Object.entries(config.keys).every(([key, info]) =>
        conditionMet(info.other ? p1Rewards : p2Rewards, key, info.condition, info.count))) {
        p2Transformations.push(configName);
        for (const [key, info] of Object.entries(config.keys)) {
          p2Multipliers[key] = Math.max(p2Multipliers[key], info.multiplier || 1);
          p2FixedValues[key] = Math.max(p2FixedValues[key], info.fixed_value || 0);
        }
        baselineMultiplier = Math.max(baselineMultiplier, config.baseline_multiplier || 1);
        baselineValue = Math.max(baselineValue, config.baseline_value || baseline);
      }
    }
  
    const finalBaseline = Math.max(baseline * baselineMultiplier, baselineValue);
  
    var p1Sum = Object.entries(p1Rewards).reduce((sum, [key, valueList]) =>
      sum + valueList.reduce((innerSum, value) =>
        innerSum + Math.max(value * p1Multipliers[key], p1FixedValues[key]), 0), 0);
    var p2Sum = Object.entries(p2Rewards).reduce((sum, [key, valueList]) =>
      sum + valueList.reduce((innerSum, value) =>
        innerSum + Math.max(value * p2Multipliers[key], p2FixedValues[key]), 0), 0);
  
    p1Sum = Math.min(Math.max(-finalBaseline, p1Sum), finalBaseline)
    p2Sum = Math.min(Math.max(-finalBaseline, p2Sum), finalBaseline)
    const p1Normalized = p1Sum / finalBaseline;
    const p2Normalized = p2Sum / finalBaseline;

    return [p1Normalized, p2Normalized, p1Transformations, p2Transformations];
  }
  


  getTranscript(player_side){
    var transcript = this.p1_transcript
    if (player_side.includes('p2')){
      transcript = this.p2_transcript
    }
    return transcript
  }

  reset_for_turn(){
    this.reset_state_transcript()

    this.p1_active_pokemon_stats['a'].yawned = false
    this.p1_active_pokemon_stats['b'].yawned = false
    this.p1_active_pokemon_stats['c'].yawned = false
    this.p2_active_pokemon_stats['a'].yawned = false
    this.p2_active_pokemon_stats['b'].yawned = false
    this.p2_active_pokemon_stats['c'].yawned = false
    this.p1_active_pokemon_stats['a'].destined = false
    this.p1_active_pokemon_stats['b'].destined = false
    this.p1_active_pokemon_stats['c'].destined = false
    this.p2_active_pokemon_stats['a'].destined = false
    this.p2_active_pokemon_stats['b'].destined = false
    this.p2_active_pokemon_stats['c'].destined = false
    this.p1_active_pokemon_stats['a'].perished = 0
    this.p1_active_pokemon_stats['b'].perished = 0
    this.p1_active_pokemon_stats['c'].perished = 0
    this.p2_active_pokemon_stats['a'].perished = 0
    this.p2_active_pokemon_stats['b'].perished = 0
    this.p2_active_pokemon_stats['c'].perished = 0
    this.p1_effective = {'a':0, 'b':0, 'c': 0};
    this.p2_effective = {'a':0, 'b':0, 'c': 0};
    this.p1_trapped = {'a':false, 'b':false, 'c': false};
    this.p2_trapped = {'a':false, 'b':false, 'c': false};
    this.p1_move_succeeded = {'a':false, 'b':false, 'c': false};
    this.p2_move_succeeded = {'a':false, 'b':false, 'c': false};
    this.p1_seen_attacks = {'a':'noattack', 'b':'noattack', 'c':'noattack'}
    this.p2_seen_attacks = {'a':'noattack', 'b':'noattack', 'c':'noattack'}

  }

  reset_state_transcript(){
    return;
    //# update kifu transcripto
    this.p1_kifu_transcript = this.p1_transcript
    this.p2_kifu_transcript = this.p2_transcript

    this.p1_transcript = ''
    this.p2_transcript = ''
  }

  // just reset on p1
  reset_processed_output(){
    this.processed_output = []
  }

  append_processed_output(output){
      this.processed_output.push(output)
  }

  append_to_transcript(message){
    message = message.trim()
    if (message === ''){
      return
    }

    var player_regex = '_p1_'  // for player replace with nothing, for agent replace with opposing
    var agent_regex = '_p2_'  // for player replace with opposing, for agent replace with nothing
    this.p1_transcript = `${this.p1_transcript}\n${message}`
    this.p1_transcript = this.p1_transcript.replace('_p1_', '')
    this.p1_transcript = this.p1_transcript.replace('_p2_', 'Opposing ')

    //# apply reverse logic.
    this.p2_transcript =  `${this.p2_transcript}\n${message}`
    this.p2_transcript = this.p2_transcript.replace('_p2_', '')
    this.p2_transcript = this.p2_transcript.replace('_p1_', 'Opposing ')

  }


  process_message(output, turn){
//    console.log('processing ', output)
    this.logs.push(`processing: ${output}`)

    var message  = ''
    var metrics_prefix = 'p1'
    var metric_items = []
    var message_was_processed = false;

    if (output.search(gametype_regex) !== -1) {
      message_was_processed = true
      //#|gametype|doubles
      this.gametype = output.split('|')[2]
//      this.gametype = 'singles'
    }
    if (output.search(gen_number_regex) !== -1) {
      //#|gen|7
      message_was_processed = true
      this.gen = parseInt(output.split('|')[2])
    }
    if (output.search(tier_regex) !== -1) {
      //#|tier|[Gen 7] Random Doubles Battle
      // |tier|gen8battlefactory
//      this.tier = output.split('|')[2].split(']')[1].trim()
    message_was_processed = true
    this.tier = 'gen8battlefactory'
    }

    // make sure 100 is in health or not there
    if (output.search(damage_detected_regex) !== -1 && output.includes('100')) {
      //|-damage|p2a: Whiscash|0 fnt|[from] item: Life Orb
      //|-damage|p2a: Whiscash|2/100 psn|[from] item: Rocky Helmet|[of] p1a: Ferrothorn
      // |-damage|p2a: Girafarig|189/252|[from] Spikes
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      var health_status = output.split('|')[3]
      if (is_player_1){
        // want more weight assigned to damage dealt than received if multiplier set
        this.p1_reward -= this.reward_config['pokemon_damaged'] * this.punish_multiplier
        this.p1_rewards_tracker['pokemon_damaged'].push(-this.reward_config['pokemon_damaged'] * this.punish_multiplier)
        this.p2_reward += this.reward_config['pokemon_damaged']
        this.p2_rewards_tracker['pokemon_damaged'].push(this.reward_config['pokemon_damaged'])
        message = `_p1_${pkmn} hurt by attack`

      }else{
        metrics_prefix = 'p2'
        this.p2_reward -= this.reward_config['pokemon_damaged'] * this.punish_multiplier
        this.p2_rewards_tracker['pokemon_damaged'].push(-this.reward_config['pokemon_damaged'] * this.punish_multiplier)
        this.p1_reward += this.reward_config['pokemon_damaged']
        this.p1_rewards_tracker['pokemon_damaged'].push(this.reward_config['pokemon_damaged'])
        message = `_p2_${pkmn} hurt by attack`

      }
      this.update_curr_health(is_player_1, pkmn, health_status)
      if (this.team_pokemon_is_first_damaged_turn(pkmn, is_player_1)){
        var team_position = this.convert_p1_pokemon_to_team_position(pkmn, is_player_1)
        var metrics_attack_key = `team_pokemon_${team_position}_first_damaged_turn`
        metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[metrics_attack_key], turn, METRIC_TYPES.SET])

      }

    }

    if (output.search(boost_regex) !== -1) {
      message_was_processed = true
        this.process_boost_unboost(output, true)
    }
    if (output.search(unboost_regex) !== -1) {
      message_was_processed = true
        this.process_boost_unboost(output, false)
    }
    if (output.search(forme_details_change_regex) !== -1) {
      message_was_processed = true
        this.process_form_update(output)
    }
    if (output.search(perish_song_regex) !== -1) {
      message_was_processed = true
        this.update_perish_song(output)
    }

    if (output.search(curse_started_regex) !== -1) {
      message_was_processed = true
      //#|-start|p2a: Sableye|Curse|[of] p1a: Gengar
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_active_pokemon_stats[position].cursed = true
        message = `_p1_${pkmn} is cursed`
      }else{
        metrics_prefix = 'p2'
        this.p2_active_pokemon_stats[position].cursed = true
        message = `_p2_${pkmn} is cursed`
//                metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[curse_started_regex], null, METRIC_TYPES.INCREMENT])
      }

    }

    if (output.search(start_leech_seed_activated_regex) !== -1) {
      message_was_processed = true
      //#|-start|p2a: Obstagoon|move: Leech Seed
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_active_pokemon_stats[position].seeded = true
        message = `_p1_${pkmn} is seeded`
      }else{
        metrics_prefix = 'p2'
        this.p2_active_pokemon_stats[position].seeded = true
        message = `_p2_${pkmn} is seeded`
      }
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[start_leech_seed_activated_regex], null, METRIC_TYPES.INCREMENT])
    }

    if (output.search(end_leech_seed_activated_regex) !== -1) {
      message_was_processed = true
      //#|-end|p2a: Blastoise|Leech Seed|[from] move: Rapid Spin|[of] p2a: Blastoise
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_active_pokemon_stats[position].seeded = false
        message = `_p1_${pkmn}\'s seeded ended`
      }else{
        this.p2_active_pokemon_stats[position].seeded = false
        message = `_p2_${pkmn}\'s seeded ended`
      }
    }

    if (output.search(start_encore_activated_regex) !== -1) {
      message_was_processed = true
      //#|-start|p1a: Appletun|Encore
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_active_pokemon_stats[position].encored = true
        message = `_p1_${pkmn} is encored`
      }else{
        metrics_prefix = 'p2'
        this.p2_active_pokemon_stats[position].encored = true
        message = `_p2_${pkmn} is encored`
      }
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[start_encore_activated_regex], null, METRIC_TYPES.INCREMENT])

    }


    if (output.search(end_encore_activated_regex) !== -1) {
      message_was_processed = true
      //#|-end|p1a: Appletun|Encore
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_active_pokemon_stats[position].encored = false
        message = `_p1_${pkmn}\'s encore ended`
      }else{
        this.p2_active_pokemon_stats[position].encored = false
        message = `_p2_${pkmn}\'s encore ended`
      }
    }

    if (output.search(attract_activated_regex) !== -1) {
      message_was_processed = true
      //#|-start|p2a: Obstagoon|Attract
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_active_pokemon_stats[position].attracted = true
        message = `_p1_${pkmn} is attracted`
      }else{
        metrics_prefix = 'p2'
        this.p2_active_pokemon_stats[position].attracted = true
        message = `_p2_${pkmn} is attracted`
      }
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[attract_activated_regex], null, METRIC_TYPES.INCREMENT])

    }

    if (output.search(protect_activated_regex) !== -1) {
      message_was_processed = true
      //#|-singleturn|p1a: Obstagoon|Max Guard
      //#|-singleturn|p2a: Obstagoon|Protect
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_active_pokemon_stats[position].protect_counter += 1
        message = `_p1_${pkmn} protected itself`
        this.p1_reward += this.reward_config['protection_bonus']
        this.p1_rewards_tracker['protection_bonus'].push(this.reward_config['protection_bonus'])
      }else{
        metrics_prefix = 'p2'
        this.p2_active_pokemon_stats[position].protect_counter += 1
        message = `_p2_${pkmn} protected itself`
        this.p2_reward += this.reward_config['protection_bonus']
        this.p2_rewards_tracker['protection_bonus'].push(this.reward_config['protection_bonus'])

      }
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[protect_activated_regex], null, METRIC_TYPES.INCREMENT])
    }

    if (output.search(must_recharge_activated_regex) !== -1) {
      message_was_processed = true
      //#|cant|p1a: Obstagoon|recharge
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p2_active_pokemon_stats[position].must_recharge = true
        message = `_p1_${pkmn} must recharge`
      }else{
        metrics_prefix = 'p2'
        this.p2_active_pokemon_stats[position].must_recharge = true
        message = `_p2_${pkmn} must recharge`
      }
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[must_recharge_activated_regex], null, METRIC_TYPES.INCREMENT])
    }

    if (output.search(smack_down_regex) !== -1) {
      message_was_processed = true
      //#`|-start|p1a: Gliscor|Smack Down`
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_active_pokemon_stats[position].smacked_down = true
        message = `_p1_${pkmn} is smacked_down`
      }else{
        metrics_prefix = 'p2'
        this.p2_active_pokemon_stats[position].smacked_down = true
        message = `_p2_${pkmn} is smacked_down`
      }
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[smack_down_regex], null, METRIC_TYPES.INCREMENT])
    }

    if (output.search(yawned_used_regex) !== -1) {
      message_was_processed = true
      //#|-start|p2a: Emboar|move: Yawn|[of] p1a: Uxie
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_active_pokemon_stats[position].yawned = true
        message = `_p1_${pkmn} is yawned`
      }else{
        this.p2_active_pokemon_stats[position].yawned = true
        message = `_p2_${pkmn} is yawned`
      }

    }

    if (output.search(yawned_succeeded_regex) !== -1) {
      message_was_processed = true
      //# Yawn succeeded. doc target player
      //#|-end|p2a: Emboar|move: Yawn|[silent]
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_reward -= this.reward_config['yawn_success']
        this.p1_rewards_tracker['yawn_success'].push(-this.reward_config['yawn_success'])
        message = `_p1_${pkmn} is asleep by yawn`
      }else{
        metrics_prefix = 'p2'
        this.p2_reward -= this.reward_config['yawn_success']
        this.p2_rewards_tracker['yawn_success'].push(-this.reward_config['yawn_success'])
        message = `_p2_${pkmn} is asleep by yawn`
      }
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[yawned_succeeded_regex], null, METRIC_TYPES.INCREMENT])
    }
/*
<< >battle-gen9randombattle-1839869836
|
|t:|1681018419
|move|p2a: Florges|Moonblast|p1a: Decidueye
|-supereffective|p1a: Decidueye
|-damage|p1a: Decidueye|82/298
|move|p1a: Decidueye|Triple Arrows|p2a: Florges
|-resisted|p2a: Florges
|-damage|p2a: Florges|76/100
|-unboost|p2a: Florges|def|1
*/

//    #Level 1 logic, convert each turn. from ints to enums. == 0 Neutral < 1 Resisted > 1 Super
//    #Level 2 logic, decrease if player hurts ally regardless  -  ignore for now until doubles data is collected.
//    #        this.p1_effective = {'a':0, 'b':0}
//    #        this.p2_effective = {'a':0, 'b':0}
    if (output.search(attack_resisted_regex) !== -1) {
//      # resist -1, super +1, immune -2
//      # hurt ally logic should be in damage -2
//  #|-resisted|p1a: Kyurem
//      #opposite
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_effective[position] += -1
        this.p1_reward += this.reward_config['attack_resisted']
        this.p2_reward -= this.reward_config['attack_resisted'] * this.punish_multiplier
        this.p1_rewards_tracker['attack_resisted'].push(this.reward_config['attack_resisted'])
        this.p2_rewards_tracker['attack_resisted'].push(-this.reward_config['attack_resisted'] * this.punish_multiplier)
        message = `_p1_${pkmn} resisted`
      }else{
        metrics_prefix = 'p2'
        this.p2_effective[position] += -1
        this.p2_reward += this.reward_config['attack_resisted']
        this.p1_reward -= this.reward_config['attack_resisted'] * this.punish_multiplier
        this.p1_rewards_tracker['attack_resisted'].push(-this.reward_config['attack_resisted'] * this.punish_multiplier)
        this.p2_rewards_tracker['attack_resisted'].push(this.reward_config['attack_resisted'])
        message = `_p2_${pkmn} resisted`
      }
      var pkmn_form = this.get_form_for_pokemon(is_player_1, pkmn)
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[attack_resisted_regex], pkmn_form, METRIC_TYPES.APPEND])
    }

    if (output.search(attack_super_effective_regex) !== -1) {
//      # resist -1, super +1, immune -2
//      # hurt ally logic should be in damage -2
//  #|-supereffective|p2a: Tangrowth
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_effective[position] += 1
        this.p1_reward -= this.reward_config['attack_supereffective']
        this.p2_reward += this.reward_config['attack_supereffective'] * this.punish_multiplier
        this.p1_rewards_tracker['attack_supereffective'].push(-this.reward_config['attack_supereffective'])
        this.p2_rewards_tracker['attack_supereffective'].push(this.reward_config['attack_supereffective'] * this.punish_multiplier)
      }else{
        metrics_prefix = 'p2'
        this.p2_effective[position] += 1
        this.p2_reward -= this.reward_config['attack_supereffective']
        this.p1_reward += this.reward_config['attack_supereffective'] * this.punish_multiplier
        this.p1_rewards_tracker['attack_supereffective'].push(this.reward_config['attack_supereffective'] * this.punish_multiplier)
        this.p2_rewards_tracker['attack_supereffective'].push(-this.reward_config['attack_supereffective'])
      }
      message = 'attack was super effective'
      var pkmn_form = this.get_form_for_pokemon(is_player_1, pkmn)
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[attack_super_effective_regex], pkmn_form, METRIC_TYPES.APPEND])
    }

    if (output.search(attack_immune_regex) !== -1) {
//      # resist -1, super +1, immune -2
//      # hurt ally logic should be in damage -2
//  #|-immune|p2a: Landorus
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_effective[position] += -2
        this.p1_reward += this.reward_config['attack_immune']
        this.p2_reward -= this.reward_config['attack_immune'] * this.punish_multiplier
        this.p1_rewards_tracker['attack_immune'].push(this.reward_config['attack_immune'])
        this.p2_rewards_tracker['attack_immune'].push(-this.reward_config['attack_immune'] * this.punish_multiplier)
        message = `doesnt affect _p1_${pkmn}`
        this.p2_move_succeeded[position] = false
      }else{
        this.p1_move_succeeded[position] = false
        metrics_prefix = 'p2'
        this.p2_effective[position] += -2
        this.p2_reward += this.reward_config['attack_immune']
        this.p1_reward -= this.reward_config['attack_immune'] * this.punish_multiplier
        this.p1_rewards_tracker['attack_immune'].push(-this.reward_config['attack_immune'] * this.punish_multiplier)
        this.p2_rewards_tracker['attack_immune'].push(this.reward_config['attack_immune'])
        message = `doesnt affect _p2_${pkmn}`
      }
      var pkmn_form = this.get_form_for_pokemon(is_player_1, pkmn)
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[attack_immune_regex], pkmn_form, METRIC_TYPES.APPEND])
    }

    if (output.search(confusion_started_regex) !== -1) {
      //#|-start|p1a: Dragonite|confusion|[fatigue]
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_active_pokemon_stats[position].confused = true
        this.p1_reward -= this.reward_config['confused_begin']
        this.p1_rewards_tracker['confused_begin'].push(-this.reward_config['confused_begin'])
        message = `_p1_${pkmn} is confused`
      }else{
        metrics_prefix = 'p2'
        this.p2_active_pokemon_stats[position].confused = true
        this.p2_reward -= this.reward_config['confused_begin']
        this.p2_rewards_tracker['confused_begin'].push(-this.reward_config['confused_begin'])
        message = `_p2_${pkmn} is confused`
      }
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[confusion_started_regex], null, METRIC_TYPES.INCREMENT])
    }

    if (output.search(confusion_ended_regex) !== -1) {
      //#|-end|p1a: Dragonite|confusion|
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_active_pokemon_stats[position].confused = false
        this.p1_reward += this.reward_config['confused_end']
        this.p1_rewards_tracker['confused_end'].push(this.reward_config['confused_end'])
        message = `_p1_${pkmn} confusion ended`
      }else{
        this.p2_active_pokemon_stats[position].confused = false
        this.p2_reward += this.reward_config['confused_end']
        this.p2_rewards_tracker['confused_end'].push(this.reward_config['confused_end'])
        message = `_p2_${pkmn} confusion ended`
      }

    }

    if (output.search(taunt_started_regex) !== -1) {
      //#|-start|p2a: Stunfisk|move: Taunt
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_active_pokemon_stats[position].taunted = true
        this.p1_reward -= this.reward_config['taunt_begin']
        this.p1_rewards_tracker['taunt_begin'].push(-this.reward_config['taunt_begin'])
        message = `_p1_${pkmn} is taunted`
      }else{
        metrics_prefix = 'p2'
        this.p2_active_pokemon_stats[position].taunted = true
        this.p2_reward -= this.reward_config['taunt_begin']
        this.p2_rewards_tracker['taunt_begin'].push(-this.reward_config['taunt_begin'])
        message = `_p2_${pkmn} is taunted`
      }
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[taunt_started_regex], null, METRIC_TYPES.INCREMENT])

    }

    if (output.search(taunt_ended_regex) !== -1) {
      //#|-end|p2a: Stunfisk|move: Taunt
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_active_pokemon_stats[position].taunted = false
        this.p1_reward += this.reward_config['taunt_end']
        this.p1_rewards_tracker['taunt_end'].push(this.reward_config['taunt_end'])
        message = `_p1_${pkmn} taunt ended`
      }else{
        this.p2_active_pokemon_stats[position].taunted = false
        this.p2_reward += this.reward_config['taunt_end']
        this.p2_rewards_tracker['taunt_end'].push(this.reward_config['taunt_end'])
        message = `_p2_${pkmn} taunt ended`
      }

    }

    if (output.search(item_removed_by_user_regex) !== -1) {
      //|-enditem|p1a: Darmanitan|Life Orb|[from] move: Knock Off|[of] p2a: Meloetta
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      var remove_item = output.split('|')[3]
      if (is_player_1){
        this.p1_reward -= this.reward_config['item_knockedoffed'] * this.punish_multiplier
        this.p2_reward += this.reward_config['item_knockedoffed']
        this.p1_rewards_tracker['item_knockedoffed'].push(-this.reward_config['item_knockedoffed'] * this.punish_multiplier)
        this.p2_rewards_tracker['item_knockedoffed'].push(this.reward_config['item_knockedoffed'])
        message = `_p1_${pkmn} item knocked off`
      }else{
        metrics_prefix = 'p2'
        this.p2_reward -= this.reward_config['item_knockedoffed'] * this.punish_multiplier
        this.p1_reward += this.reward_config['item_knockedoffed']
        this.p1_rewards_tracker['item_knockedoffed'].push(this.reward_config['item_knockedoffed'])
        this.p2_rewards_tracker['item_knockedoffed'].push(-this.reward_config['item_knockedoffed'] * this.punish_multiplier)
        message = `_p2_${pkmn} item knocked off`
      }
      var no_item = ''
      this.update_item(pkmn, no_item, is_player_1)
      var value = remove_item
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[item_removed_by_user_regex], value, METRIC_TYPES.APPEND])
    }

    if (output.search(item_used_regex) !== -1) {
      //|-enditem|p1a: Magcargo|White Herb
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      var no_item = ''
      var used_item = output.split('|').slice(-1)[0]
      message = `_p1_${pkmn} used item`
      if (!is_player_1){
        metrics_prefix = 'p2'
        message = `_p2_${pkmn} used item`
      }
      this.update_item(pkmn, no_item, is_player_1)
      var value = used_item
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[item_used_regex], value, METRIC_TYPES.APPEND])
    }

    if (output.search(item_swapped_regex) !== -1) {
      //#|-item|p2a: Solgaleo|Choice Band|[from] move: Switcheroo
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      var new_item = output.split('|')[3]
      message = `_p1_${pkmn} has item ${new_item}`
      if (!is_player_1){
        message = `_p2_${pkmn} has item ${new_item}`
      }
      this.update_item(pkmn, new_item, is_player_1)

    }

    if (output.search(item_frisked_regex) !== -1) {
      //#|-item|p1a: Swalot|Black Sludge|[from] ability: Frisk|[of] p2a: Exeggutor|[identify]
      //#|-item|p1a: Sableye|Sablenite|[from] ability: Frisk|[of] p2a: Exeggutor|[identify]
      //#|-item|p1a: Weavile|Assault Vest|[from] ability: Pickpocket|[of] p2a: Lurantis
      message_was_processed = true
      var frisk_split = output.replace('|[identify]', '')
      frisk_split = frisk_split.split('|')

      var item = frisk_split[3], item_player_pokemon = frisk_split[2]
      item_player_pokemon = item_player_pokemon.split(': ', 2)
      var it_play = item_player_pokemon[0]
      var it_pkmn = item_player_pokemon[1]

      var ability_player_pokemon = frisk_split.slice(-1)[0] .split('[of] ')[1]
      ability_player_pokemon = ability_player_pokemon.split(': ', 2)
      var ab_play = ability_player_pokemon[0]
      var ab_pkmn = ability_player_pokemon[1]

      var new_item = output.split('|')[3]
      message = `_p1_${ab_pkmn} identified ${it_pkmn} ${item}`
      if (!(ab_play.includes('p1'))){
        message = `_p2_${ab_pkmn} identified ${it_pkmn} ${item}`
      }
      this.update_item(it_pkmn, item, 'p1' == it_play.slice(0,2))
      this.update_seen_ability(ab_play.includes('p1'), ab_pkmn, 'Frisk')
    }

    if (output.search(move_did_not_succeed) !== -1) {
      //#|-fail|p1a: Zapdos
      //#|cant|p1a: Lanturn|flinch
      //#|-miss|p1a: Victreebel|p2a: Malamar
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_move_succeeded[position] = false
        this.p1_reward -= this.reward_config['attack_missed']
        this.p1_rewards_tracker['attack_missed'].push(-this.reward_config['attack_missed'])
      }else{
        metrics_prefix = 'p2'
        this.p2_move_succeeded[position] = false
        this.p2_reward -= this.reward_config['attack_missed']
        this.p2_rewards_tracker['attack_missed'].push(-this.reward_config['attack_missed'])
      }
      message = 'Move failed'
      var pkmn_form = this.get_form_for_pokemon(is_player_1, pkmn)
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[move_did_not_succeed], pkmn_form, METRIC_TYPES.APPEND])
    }

    if (output.search(sticky_web_activated_regex) !== -1) {
      //#|-activate|p2a: Venomoth|move: Sticky Web
      //#|-unboost|p2a: Venomoth|spe|1
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_reward -= this.reward_config['stat_modified'] * this.punish_multiplier
        this.p2_reward += this.reward_config['stat_modified']
        this.p1_rewards_tracker['stat_modified'].push(-this.reward_config['stat_modified'] * this.punish_multiplier)
        this.p2_rewards_tracker['stat_modified'].push(this.reward_config['stat_modified'])
        message = `_p1_${pkmn} slowed down`
      }else{
        this.p1_reward += this.reward_config['stat_modified']
        this.p2_reward -= this.reward_config['stat_modified'] * this.punish_multiplier
        this.p1_rewards_tracker['stat_modified'].push(this.reward_config['stat_modified'])
        this.p2_rewards_tracker['stat_modified'].push(-this.reward_config['stat_modified'] * this.punish_multiplier)
        message = `_p2_${pkmn} slowed down`
        metrics_prefix = 'p2'
      }
      var pkmn_form = this.get_form_for_pokemon(is_player_1, pkmn)
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING['slowed_by_web'], pkmn_form, METRIC_TYPES.APPEND])
    }

    if( (output.search(spike_damage_regex)  !== -1|| output.search(stealthrock_damage_regex) !== -1 || output.search(opponent_ability_damage_regex) !== -1 || output.search(item_damage_from_opponent_regex) !== -1) && output.includes('100')) {
      //# Damage dealt by opponent hazards/items/abilities
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_reward -= this.reward_config['damage_by_hazards_opponent_ability_or_items']
        this.p2_reward += this.reward_config['damage_by_hazards_opponent_ability_or_items'] * this.punish_multiplier
        this.p1_rewards_tracker['damage_by_hazards_opponent_ability_or_items'].push(-this.reward_config['damage_by_hazards_opponent_ability_or_items'])
        this.p2_rewards_tracker['damage_by_hazards_opponent_ability_or_items'].push(this.reward_config['damage_by_hazards_opponent_ability_or_items'] * this.punish_multiplier)
        message = `_p1_${pkmn} hurt by spikes`
        if(output.search(stealthrock_damage_regex)){
          message = `_p1_${pkmn} hurt by rocks`
        }
        if(output.search(opponent_ability_damage_regex)){
          message = `_p1_${pkmn} hurt by ability`
        }
        if(output.search(item_damage_from_opponent_regex)){
          message = `_p1_${pkmn} hurt by item damage`
        }
      }else{
        this.p1_reward += this.reward_config['damage_by_hazards_opponent_ability_or_items'] * this.punish_multiplier
        this.p2_reward -= this.reward_config['damage_by_hazards_opponent_ability_or_items']
        this.p1_rewards_tracker['damage_by_hazards_opponent_ability_or_items'].push(this.reward_config['damage_by_hazards_opponent_ability_or_items'] * this.punish_multiplier)
        this.p2_rewards_tracker['damage_by_hazards_opponent_ability_or_items'].push(-this.reward_config['damage_by_hazards_opponent_ability_or_items'])
        message = `_p2_${pkmn} hurt by spikes`
        if(output.search(stealthrock_damage_regex)){
          message = `_p2_${pkmn} hurt by rocks`
        }
        if(output.search(opponent_ability_damage_regex)){
          message = `_p2_${pkmn} hurt by ability`
        }
        if(output.search(item_damage_from_opponent_regex)){
          message = `_p2_${pkmn} hurt by item damage`
        }
        metrics_prefix = 'p2'
      }
      var pkmn_form = this.get_form_for_pokemon(is_player_1, pkmn)
      if(output.search(spike_damage_regex) !== -1){
        metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING['hurt_by_spikes'], pkmn_form, METRIC_TYPES.APPEND])
      }
      if(output.search(stealthrock_damage_regex) !== -1){
        metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING['hurt_by_rocks'], pkmn_form, METRIC_TYPES.APPEND])
      }
    }

    if (output.search(item_damage_regex) !== -1) {
      //|-damage|p2a: Whiscash|0 fnt|[from] item: Life Orb
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_reward -= this.reward_config['damage_by_own_item']
        this.p1_rewards_tracker['damage_by_own_item'].push(-this.reward_config['damage_by_own_item'])
        message = `_p1_${pkmn} hurt by item`
      }else{
        this.p2_reward -= this.reward_config['damage_by_own_item']
        this.p2_rewards_tracker['damage_by_own_item'].push(-this.reward_config['damage_by_own_item'])
        message = `_p2_${pkmn} hurt by item`
      }

    }

    if (output.search(field_activate_regex) !== -1) {
      //#perison song, ion deluge, normalize? dont care for now.
      message_was_processed = true
    }

    if (output.search(weather_upkeep_regex) !== -1) {
      //#weather upkeep
      message_was_processed = true
      var new_weather = output.split('|')[2]
      if (this.weather_condition === new_weather){
        this.weather_turns += 1
      }else{
        this.weather_turns = 1
      }
      this.weather_condition = new_weather
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[weather_upkeep_regex], new_weather, METRIC_TYPES.APPEND])
      message = `weather is ${new_weather}`

      if(output.includes('|[of] p1')){
        this.p1_reward += this.reward_config['terrain_weather_trigger']
        this.p1_rewards_tracker['terrain_weather_trigger'].push(this.reward_config['terrain_weather_trigger'])
      }
      if(output.includes('|[of] p2')){
        this.p2_reward += this.reward_config['terrain_weather_trigger']
        this.p2_rewards_tracker['terrain_weather_trigger'].push(this.reward_config['terrain_weather_trigger'])
      }
    }

    if (output.search(weather_end_regex) !== -1) {
      //#|-weather|RainDance|[upkeep]
      message_was_processed = true
      this.weather_turns = 0
      this.weather_condition = 'none'
      message = 'weather ended'
    }

    if (output.search(fieldstart_regex) !== -1) {
      //#terrain upkeep
      message_was_processed = true
      var new_terrain = output.split('|')[2]
      var value = null
      var metrics_key = `${fieldstart_regex}_Terrain`
      if (new_terrain.includes('Grassy Terrain')){
        this.terrain_condition = 'Grassy Terrain'
        value = 'Grassy Terrain'
      }
      if (new_terrain.includes('Misty Terrain')){
        this.terrain_condition = 'Misty Terrain'
        value = 'Misty Terrain'
      }
      if (new_terrain.includes('Electric Terrain')){
        this.terrain_condition = 'Electric Terrain'
        value = 'Electric Terrain'
      }
      if (new_terrain.includes('Psychic Terrain')){
        this.terrain_condition = 'Psychic Terrain'
        value = 'Psychic Terrain'
      }
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[metrics_key], value, METRIC_TYPES.APPEND])
      message = `terrain is ${new_terrain}`


      if(output.includes('|[of] p1')){
        this.p1_reward += this.reward_config['terrain_weather_trigger']
        this.p1_rewards_tracker['terrain_weather_trigger'].push(this.reward_config['terrain_weather_trigger'])
      }
      if(output.includes('|[of] p2')){
        this.p2_reward += this.reward_config['terrain_weather_trigger']
        this.p2_rewards_tracker['terrain_weather_trigger'].push(this.reward_config['terrain_weather_trigger'])
      }

    }

    if (output.search(fieldend_regex) !== -1) {
      //#|-fieldstart|move: Grassy Terrain|
      message_was_processed = true
      this.terrain_condition = 'none'
      message = 'terrain ended'
    }

    if (output.search(roomstart_regex) !== -1) {
      //#trick room/magic room
      message_was_processed = true
      var new_room = output.split('|')[2]
      var value = null
      if (new_room.includes('Trick Room')){
        this.current_room = 'Trick Room'
        value = 'Trick Room'
      }
      if (new_room.includes('Magic Room')){
        this.current_room = 'Magic Room'
        value = 'Magic Room'
      }
      message = `Room is ${new_room}`
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[roomstart_regex], value, METRIC_TYPES.APPEND])
    }

    if (output.search(roomend_regex) !== -1) {
      //#|-fieldstart|move: Grassy Terrain|
      message_was_processed = true
      this.current_room = 'none'
      message = 'room ended'
    }

    if (output.search(sideend_hazards_activate_regex) !== -1) {
      //#sideend hazards
      //#p1/p2
      message_was_processed = true
      var player = output.split('|')[2].slice(0,2)
      var hazard = output.split('|')[3]
      if (is_player_1){
        this.p1_reward += this.reward_config['hazards_removed']
        this.p1_rewards_tracker['hazards_removed'].push(this.reward_config['hazards_removed'])
        message = `_p1_player lost ${hazard}`
      }else{
        this.p2_reward += this.reward_config['hazards_removed']
        this.p2_rewards_tracker['hazards_removed'].push(this.reward_config['hazards_removed'])
        message = `_p2_player lost ${hazard}`
      }
      if (hazard.includes('Sticky Web')){
        if(player == 'p1'){
          this.p1_has_web = false
        }else{
          this.p2_has_web = false
        }
      }
      if (hazard == 'Spikes'){
        if(player == 'p1'){
          this.p1_spikes = 0
        }else{
          this.p2_spikes = 0
        }
      }
      //# Toxic spikes formatted differently
      if (hazard.includes('Toxic Spikes')){
        if(player == 'p1'){
          this.p1_toxic_spikes = 0
        }else{
          this.p2_toxic_spikes = 0
        }
      }
    }

    if (output.search(sideend_non_hazards_activate_regex) !== -1) {
      //#sideend non hazards
      //#p1/p2

      message_was_processed = true
      var player = output.split('|')[2].slice(0,2)
      var non_hazard = output.split('|')[3]
      if (player == 'p1'){
        this.p1_reward += -this.reward_config['reflect_tailwind_etc_end']
        this.p1_rewards_tracker['reflect_tailwind_etc_end'].push(-this.reward_config['reflect_tailwind_etc_end'])
        message = `_p1_player lost ${non_hazard}`
      }else{
        this.p2_reward += -this.reward_config['reflect_tailwind_etc_end']
        this.p2_rewards_tracker['reflect_tailwind_etc_end'].push(-this.reward_config['reflect_tailwind_etc_end'])
        message = `_p2_player lost ${non_hazard}`
      }
      if (non_hazard.includes('Safeguard')){
        if(player == 'p1'){
          this.p1_safeguard = false
        }else{
          this.p2_safeguard = false
        }
      }
      if (non_hazard.includes('Light Screen')){
        if(player == 'p1'){
          this.p1_lightscreen = false
        }else{
          this.p2_lightscreen = false
        }
      }
      if (non_hazard.includes('Reflect')){
        if(player == 'p1'){
          this.p1_reflect = false
        }else{
          this.p2_reflect = false
        }
      }
      if (non_hazard.includes('Tailwind')){
        if(player == 'p1'){
          this.p1_tailwind = false
        }else{
          this.p2_tailwind = false
        }
      }
      if (non_hazard.includes('Aurora Veil')){
        if(player == 'p1'){
          this.p1_aurora_veil = false
        }else{
          this.p2_aurora_veil = false
        }
      }

    }

    if (output.search(sidestart_regex) !== -1) {
      //#sidestart  hazards and blizards
      message_was_processed = true
      var side_split = output.split('|')
      var player = side_split[2].slice(0,2), move = side_split.slice(-1)[0]
      //#p1/p2
      //# make negative if hazard
      var hzard_shield_reward = this.reward_config['hazards_and_safeguard_etc_start']
      var metrics_key = sidestart_regex
      if (move.includes('Safeguard')){
        metrics_key = `${sidestart_regex}_Safeguard`
        if(player == 'p1'){
          this.p1_safeguard = true
        }else{
          this.p2_safeguard = true
        }
      }
      if (move.includes('Light Screen')){
        metrics_key = `${sidestart_regex}_Light Screen`
        if(player == 'p1'){
          this.p1_lightscreen = true
        }else{
          this.p2_lightscreen = true
        }
      }
      if (move.includes('Reflect')){
        metrics_key = `${sidestart_regex}_Reflect`
        if(player == 'p1'){
          this.p1_reflect = true
        }else{
          this.p2_reflect = true
        }
      }
      if (move.includes('Tailwind')){
        metrics_key = `${sidestart_regex}_Tailwind`
        if(player == 'p1'){
          this.p1_tailwind = true
        }else{
          this.p2_tailwind = true
        }
      }
      if (move.includes('Aurora Veil')){
        metrics_key = `${sidestart_regex}_Aurora Veil`
        if(player == 'p1'){
          this.p1_aurora_veil = true
        }else{
          this.p2_aurora_veil = true
        }
      }
      if (move.includes('Sticky Web')){
        metrics_key = `${sidestart_regex}_Sticky Web`
        var hzard_shield_reward = -this.reward_config['hazards_and_safeguard_etc_start']
        if(player == 'p1'){
          this.p1_has_web = true
        }else{
          this.p2_has_web = true
        }
      }
      if (move.includes('Stealth Rock')){
        metrics_key = `${sidestart_regex}_Stealth Rock`
        hzard_shield_reward = -this.reward_config['hazards_and_safeguard_etc_start']
        if(player == 'p1'){
          this.p1_has_rocks = true
        }else{
          this.p2_has_rocks = true
        }
      }
      if (move.includes('Spikes') && !move.includes('Toxic Spikes')){
        metrics_key = `${sidestart_regex}_Spikes`
        hzard_shield_reward = -this.reward_config['hazards_and_safeguard_etc_start']
        if(player == 'p1'){
          this.p1_spikes += 1
        }else{
          this.p2_spikes += 1
        }
      }
      if (move.includes('Toxic Spikes')){
        metrics_key = `${sidestart_regex}_Toxic Spikes`
        hzard_shield_reward = -this.reward_config['hazards_and_safeguard_etc_start']
        if(player == 'p1'){
          this.p1_toxic_spikes += 1
        }else{
          this.p2_toxic_spikes += 1
        }
      }
      if(player == 'p1'){
        metrics_prefix = 'p1'
        this.p1_reward += hzard_shield_reward
        this.p1_rewards_tracker['hazards_and_safeguard_etc_start'].push(hzard_shield_reward)
        message = `_p1_player has ${move}`
      }else{
        metrics_prefix = 'p2'
        this.p2_reward += hzard_shield_reward
        this.p2_rewards_tracker['hazards_and_safeguard_etc_start'].push(hzard_shield_reward)
        message = `_p2_player has ${move}`
      }

      // if a hazard, the other player needs a bonus as well
      // flip player logic
      if (move in HAZARDS){
        hzard_shield_reward = Math.abs(hzard_shield_reward)
        if(player == 'p1'){
          metrics_prefix = 'p2'
          this.p2_reward += hzard_shield_reward
          this.p2_rewards_tracker['hazards_and_safeguard_etc_start'].push(hzard_shield_reward)
        }else{
          metrics_prefix = 'p1'
          this.p1_reward += hzard_shield_reward
          this.p1_rewards_tracker['hazards_and_safeguard_etc_start'].push(hzard_shield_reward)
        }

      }


      if (metrics_key in REGEX_TO_METRICS_KEY_MAPPING){
        metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[metrics_key], null, METRIC_TYPES.INCREMENT])
      }else{
//        metrics_key not found for [silent]
//        while processing line |-sidestart|p2: Bot 2|Toxic Spikes|[silent]
//        metrics_key not found for [silent]
//        while processing line |-sidestart|p1: Bot 1|Toxic Spikes|[silent]
//        console.log('metrics_key not found for', move)
//        console.log('while processing line', output)
      }

    }

    if (output.search(destiny_bond_regex) !== -1) {
      //#|-singlemove|p1a: Sharpedo|Destiny Bond
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_active_pokemon_stats[position].destined = true
        this.p1_reward += this.reward_config['destiny_bond_start']
        this.p1_rewards_tracker['destiny_bond_start'].push(this.reward_config['destiny_bond_start'])
        message = `_p1_${pkmn} trying to take down with it`
      }else{
        metrics_prefix = 'p2'
        this.p2_active_pokemon_stats[position].destined = true
        this.p2_reward += this.reward_config['destiny_bond_start']
        this.p2_rewards_tracker['destiny_bond_start'].push(this.reward_config['destiny_bond_start'])
        message = `_p2_${pkmn} trying to take down with it`
      }
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[destiny_bond_regex], null, METRIC_TYPES.INCREMENT])

    }

    if ((output.search(heal_from_target_regex) !== -1 || output.search(general_heal_regex) !== -1) && output.includes('100') ) {
      //#|-heal|p2a: Venusaur|31/100|[from] drain|[of] p1a: Flygon
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_reward += this.reward_config['pokemon_heal']
        this.p1_rewards_tracker['pokemon_heal'].push(this.reward_config['pokemon_heal'])
        message = `_p1_${pkmn} healed a little`
      }else{
        this.p2_reward += this.reward_config['pokemon_heal']
        this.p2_rewards_tracker['pokemon_heal'].push(this.reward_config['pokemon_heal'])
        message = `_p2_${pkmn} healed a little`
      }
      var health_status = output.split('|')[3]
      this.update_curr_health(is_player_1, pkmn, health_status)
    }

    if (output.search(pain_split_regex) !== -1) {
      //# Currently painsplit?
      //#|-sethp|p2a: Mismagius|77/100|[from] move: Pain Split
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_reward += this.reward_config['pain_split']
        this.p1_rewards_tracker['pain_split'].push(this.reward_config['pain_split'])
        message = `_p1_${pkmn} shared the pain`
      }else{
        this.p2_reward += this.reward_config['pain_split']
        this.p2_rewards_tracker['pain_split'].push(this.reward_config['pain_split'])
        message = `_p2_${pkmn} shared the pain`
      }
    }

    if (output.search(trace_regex) !== -1) {
      //#|-ability|p2a: Gardevoir|Water Absorb|[from] ability: Trace|[of] p1a: Jellicent
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      var ability = output.split('|')[3]
      var target_pkmn = output.split('|').slice(-1)[0] .split(': ')[1]
      var target_player = output.split('|').slice(-1)[0] .split(': ')[0]
      this.update_seen_ability(is_player_1, pkmn, ability)
      this.update_seen_ability(target_player.includes('p1'), target_pkmn, ability)
      if (is_player_1){
        message = `_p1_${pkmn} traced ${ability}`
      }else{
        metrics_prefix = 'p2'
        message = `_p2_${pkmn} traced ${ability}`
      }
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING['seen_abilities'], ability, METRIC_TYPES.APPEND])
    }

    if (output.search(clear_all_boosts_regex) !== -1) {
      //#|-clearallboost
      message_was_processed = true
      this.p1_active_pokemon_stats['a'].clear_all_boosts()
      this.p1_active_pokemon_stats['b'].clear_all_boosts()
      this.p1_active_pokemon_stats['c'].clear_all_boosts()
      this.p2_active_pokemon_stats['a'].clear_all_boosts()
      this.p2_active_pokemon_stats['b'].clear_all_boosts()
      this.p2_active_pokemon_stats['c'].clear_all_boosts()
      message = 'All stats cleared'
      metric_items.push(['p1', REGEX_TO_METRICS_KEY_MAPPING[clear_all_boosts_regex], null, METRIC_TYPES.INCREMENT])
      metric_items.push(['p2', REGEX_TO_METRICS_KEY_MAPPING[clear_all_boosts_regex], null, METRIC_TYPES.INCREMENT])

    }

    if (output.search(clear_neg_boosts_regex) !== -1) {
      //# Damage dealt by own item like life orb
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_active_pokemon_stats[position].clear_neg_boosts()
        message = `_p1_${pkmn} negative stats cleared`
      }else{
        metrics_prefix = 'p2'
        this.p2_active_pokemon_stats[position].clear_neg_boosts()
        message = `_p2_${pkmn} negative stats cleared`
      }
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[clear_neg_boosts_regex], null, METRIC_TYPES.INCREMENT])
    }

    if (output.search(clear_boost_regex) !== -1) {
      //#|-clearboost|p2a: Zeraora
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        message = `_p1_${pkmn} boosts cleared`
        this.p1_active_pokemon_stats[position].clear_all_boosts()
      }else{
        metrics_prefix = 'p2'
        this.p2_active_pokemon_stats[position].clear_all_boosts()
        message = `_p2_${pkmn} boosts cleared`
      }
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[clear_all_boosts_regex], null, METRIC_TYPES.INCREMENT])
    }

    //# Punish all statuses equally. even if self inflicted like poison heal with toxic orb.
    if (output.search(status_from_base) !== -1 || output.search(status_from_ability_regex) !== -1 || output.search(status_from_enemy_move_regex) !== -1 || output.search(sleep_from_rest_regex) !== -1 || output.search(status_from_item_regex) !== -1) {
      //#|-status|p1a: Carracosta|psn
      //#|-status|p1a: Coalossal|tox
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      var status_for_metrics = output.match(STATUSES_REGEX)[0]
      if (is_player_1){
        this.p1_reward -= this.reward_config['status_start']
        this.p1_rewards_tracker['status_start'].push(this.reward_config['status_start'])
        message = `_p1_${pkmn} is ${status_for_metrics}`
      }else{
        this.p2_reward -= this.reward_config['status_start']
        this.p2_rewards_tracker['status_start'].push(this.reward_config['status_start'])
        message = `_p2_${pkmn} is ${status_for_metrics}`

        metrics_prefix = 'p2'
      }
      this.update_status(pkmn, status_for_metrics, is_player_1)
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[status_from_ability_regex], status_for_metrics, METRIC_TYPES.APPEND])
    }

    if (output.search(curestatus_regex) !== -1) {
      //#|-curestatus|p2a: Spiritomb|slp|[msg]
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      var status_for_metrics = output.match(STATUSES_REGEX)[0]
      if (is_player_1){
        this.p1_reward += this.reward_config['curestatus']
        this.p1_rewards_tracker['curestatus'].push(this.reward_config['curestatus'])
        message = `_p1_${pkmn} is cured of ${status_for_metrics}`
      }else{
        this.p2_reward += this.reward_config['curestatus']
        this.p2_rewards_tracker['curestatus'].push(this.reward_config['curestatus'])
        message = `_p2_${pkmn} is cured of ${status_for_metrics}`
        metrics_prefix = 'p2'
      }
      this.update_status(pkmn, '', is_player_1)
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[curestatus_regex], status_for_metrics, METRIC_TYPES.APPEND])
    }

    //# lazy regex, make sure Frisk doesnt exist
    if (output.search(activate_ability_regex) !== -1 && !output.includes('Frisk') && !output.includes('Pickpocket')) {
      //#|-fieldstart|move: Grassy Terrain|[from] ability: Grassy Surge|[of] p1a: Tapu Bulu
      message_was_processed = true
      var output_1 = output.split('[from] ability: ')

      var ability_player_pkmn = output_1[1].split('|[of] ')
      var ability = ability_player_pkmn[0]
      var player_pkmn = ability_player_pkmn[1]

      player_pkmn = player_pkmn.split(': ')
      var player = player_pkmn[0]
      var pkmn = player_pkmn[1]
      var is_player_1 = player.includes('p1')
      this.update_seen_ability(is_player_1, pkmn, ability)
      if (is_player_1){
        this.p1_reward += this.reward_config['used_ability']
        this.p1_rewards_tracker['used_ability'].push(this.reward_config['used_ability'])
        message = `_p1_${pkmn} used ability ${ability}`
      }else{
        this.p2_reward += this.reward_config['used_ability']
        this.p2_rewards_tracker['used_ability'].push(this.reward_config['used_ability'])
        message = `_p2_${pkmn} used ability ${ability}`
        metrics_prefix = 'p2'
      }
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING['seen_abilities'], ability, METRIC_TYPES.APPEND])
    }

    if (output.search(generic_ability_regex) !== -1) {
      //|-ability|p2a: Manectric|Lightning Rod|boost'
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      var ability = output.split('|')[3]
      this.update_seen_ability(is_player_1, pkmn, ability)
      if (is_player_1){
        this.p1_reward += this.reward_config['used_ability']
        this.p1_rewards_tracker['used_ability'].push(this.reward_config['used_ability'])
        message = `_p1_${pkmn} used ability ${ability}`
      }else{
        this.p2_reward += this.reward_config['used_ability']
        this.p2_rewards_tracker['used_ability'].push(this.reward_config['used_ability'])
        message = `_p2_${pkmn} used ability ${ability}`
        metrics_prefix = 'p2'
      }
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING['seen_abilities'], ability, METRIC_TYPES.APPEND])
    }

    if (output.search(start_dynamax_regex) !== -1) {
      //#|-start|p2a: Lapras|Dynamax
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_used_dynamax = true
        this.p1_active_pokemon_stats[position].dynamax_activated = true
        this.p1_active_pokemon_stats[position].dynamax_turns = 0
        message = `_p1_${pkmn} used dynamax`
      }else{
        this.p2_used_dynamax = true
        this.p2_active_pokemon_stats[position].dynamax_activated = true
        this.p2_active_pokemon_stats[position].dynamax_turns = 0
        message = `_p2_${pkmn} used dynamax`
        metrics_prefix = 'p2'
      }
      var pkmn_form = this.get_form_for_pokemon(is_player_1, pkmn)
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING['dynamax_tracker'], pkmn_form, METRIC_TYPES.APPEND])
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[start_dynamax_regex], null, METRIC_TYPES.INCREMENT])
    }

    if (output.search(end_dynamax_regex) !== -1) {
      //#|-end|p2a: Farfetch'd|Dynamax
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_active_pokemon_stats[position].dynamax_activated = false
        this.p1_active_pokemon_stats[position].dynamax_turns = 0
        message = `_p1_${pkmn} dynamax ended`
      }else{
        this.p2_active_pokemon_stats[position].dynamax_activated = false
        this.p2_active_pokemon_stats[position].dynamax_turns = 0
        message = `_p2_${pkmn} dynamax ended`
      }

    }

    if (output.search(start_substitute_regex) !== -1) {
      //##|-start|p2a: Cresselia|Substitute
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_active_pokemon_stats[position].substitute = true
        message = `_p1_${pkmn} used substitute`
      }else{
        this.p2_active_pokemon_stats[position].substitute = true
        message = `_p2_${pkmn} used substitute`

        metrics_prefix = 'p2'
      }
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[start_substitute_regex], null, METRIC_TYPES.INCREMENT])
    }

    if (output.search(end_substitute_regex) !== -1) {
      //#|-end|p2a: Serperior|Substitute
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_active_pokemon_stats[position].substitute = false
        message = `_p1_${pkmn} substitute broken`
      }else{
        this.p2_active_pokemon_stats[position].substitute = false
        message = `_p2_${pkmn} substitute broken`
      }

    }

    if (output.search(crit_regex) !== -1) {
      //#|-crit|p2a: Ambipom
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_reward -= this.reward_config['critical'] * this.punish_multiplier
        this.p1_rewards_tracker['critical'].push(-this.reward_config['critical'] * this.punish_multiplier)
        this.p2_reward += this.reward_config['critical']
        this.p2_rewards_tracker['critical'].push(this.reward_config['critical'])
      }else{
        metrics_prefix = 'p2'
        this.p1_reward += this.reward_config['critical']
        this.p1_rewards_tracker['critical'].push(this.reward_config['critical'])
        this.p2_reward -= this.reward_config['critical'] * this.punish_multiplier
        this.p2_rewards_tracker['critical'].push(-this.reward_config['critical'] * this.punish_multiplier)
      }
      message = 'Critical hit!'

      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[crit_regex], null, METRIC_TYPES.INCREMENT])
    }

    if (output.search(swap_regex) !== -1) {
      //##|swap|p1a: Jirachi|1|[from] move: Ally Switch
      //# for metrics to get previous pokemon before update
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      this.handle_swap(is_player_1)
      if (is_player_1){
        message = `_p1_${pkmn} swapped`
      }else{
        metrics_prefix = 'p2'
        message = `_p2_${pkmn} swapped`
      }
      var pkmn_form = this.get_form_for_pokemon(is_player_1, pkmn)
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[swap_regex], pkmn_form, METRIC_TYPES.APPEND])
    }

    if ((output.search(switch_regex) !== -1 || output.search(drag_regex) !== -1) && output.includes('100')) {
      //#|switch|p2a: Zygarde|Zygarde, L78|75/100|[from]move: U-turn
      //    # for metrics to get previous pokemon before update
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      var last_pokemon = this.p1_selected[position]

      this.handle_switch(is_player_1, pkmn, position)
      this.process_form_update(output)
      if (is_player_1){
        message = `_p1_${pkmn} entered`
      }else{
        metrics_prefix = 'p2'
        message = `_p2_${pkmn} entered`
      }
      health_status = output.split('|')[4]
      this.update_curr_health(is_player_1, pkmn, health_status)

      var pkmn_form = this.get_form_for_pokemon(is_player_1, pkmn)
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING['seen_pokemon'], pkmn_form, METRIC_TYPES.APPEND])
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[switch_regex], pkmn_form, METRIC_TYPES.APPEND])

      if (this.team_pokemon_is_first_turn(pkmn, is_player_1, output)){
        var team_position = this.convert_p1_pokemon_to_team_position(pkmn, is_player_1)
        var metrics_attack_key = `team_pokemon_${team_position}_first_turn`
        metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[metrics_attack_key], turn, METRIC_TYPES.SET])
      }
      if (last_pokemon !== null && this.team_pokemon_is_first_switch_turn(pkmn, is_player_1)){
        var team_position = this.convert_p1_pokemon_to_team_position(pkmn, is_player_1)
        var metrics_attack_key = `team_pokemon_${team_position}_first_switched_turn`
        metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[metrics_attack_key], turn, METRIC_TYPES.SET])
      }
    }
    /*

    if last_pokemon is not None and is_player_1 and this.team_pokemon_is_first_switch_turn(last_pokemon):
        team_position = this.convert_p1_pokemon_to_team_position(last_pokemon)
        metrics_attack_key = 'team_pokemon_%d_first_switched_turn' % (team_position)
        metric_items.push(['p1', REGEX_TO_METRICS_KEY_MAPPING[metrics_attack_key], this.turns, METRIC_TYPES.SET])

    */

    if (output.search(move_regex) !== -1) {
      //#|move|p2a: Garchomp|Outrage|p1a: Ninetales|[from]lockedmove
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      var atk_name = output.split('|')[3]
      this.update_seen_moves(is_player_1, pkmn, atk_name)
      if (is_player_1){
        //# need to reset, ditto is a good candidate for triggering multiple solar beams and phantom forces
        message = `_p1_${pkmn} used ${atk_name}`
        this.p1_seen_attacks[position] = atk_name
        var team_position = this.convert_p1_pokemon_to_team_position(pkmn, is_player_1)
        var metrics_attack_key = `team_pokemon_${team_position}_attacks`
        metric_items.push(['p1', REGEX_TO_METRICS_KEY_MAPPING[metrics_attack_key], atk_name, METRIC_TYPES.APPEND])

        if(this.p1_used_dynamax){
          metric_items.push(['p1', REGEX_TO_METRICS_KEY_MAPPING['attacks_after_dynamax'], atk_name, METRIC_TYPES.APPEND])
        }
        this.p1_move_succeeded[position] = true

        if(!atk_name.search(protection_moves_regex)){
          this.p1_active_pokemon_stats[position].protect_counter = 0
        }

      }else{
        message = `_p2_${pkmn} used ${atk_name}`
        this.p2_seen_attacks[position] = atk_name
        var team_position = this.convert_p1_pokemon_to_team_position(pkmn, is_player_1)
        var metrics_attack_key = `team_pokemon_${team_position}_attacks`
        metric_items.push(['p2', REGEX_TO_METRICS_KEY_MAPPING[metrics_attack_key], atk_name, METRIC_TYPES.APPEND])
        metrics_prefix = 'p2'

        if(this.p2_used_dynamax){
          metric_items.push(['p2', REGEX_TO_METRICS_KEY_MAPPING['attacks_after_dynamax'], atk_name, METRIC_TYPES.APPEND])
        }
        this.p2_move_succeeded[position] = true

        if(!atk_name.search(protection_moves_regex)){
          this.p2_active_pokemon_stats[position].protect_counter = 0
        }
      }
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING['seen_attacks'], atk_name, METRIC_TYPES.APPEND])
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[move_regex], atk_name, METRIC_TYPES.APPEND])
    }

    if (output.search(faint_regex) !== -1) {
      //#|faint|p1a: Hawlucha
      message_was_processed = true
      var fainted_reward = this.reward_config['fainted']
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_reward -= fainted_reward * this.punish_multiplier
        this.p2_reward += fainted_reward
        this.p1_rewards_tracker['fainted'].push(-this.reward_config['critical'] * this.punish_multiplier)
        this.p2_rewards_tracker['fainted'].push(this.reward_config['critical'])

        message = `_p1_${pkmn} fainted`
      }else{
        metrics_prefix = 'p2'
        this.p2_reward -= fainted_reward * this.punish_multiplier
        this.p1_reward += fainted_reward
        this.p1_rewards_tracker['fainted'].push(this.reward_config['critical'])
        this.p2_rewards_tracker['fainted'].push(-this.reward_config['critical'] * this.punish_multiplier)
        message = `_p2_${pkmn} fainted`

      }
      var team_position = this.convert_p1_pokemon_to_team_position(pkmn, is_player_1)
      var metrics_faint_key = `team_pokemon_${team_position}_fainted_turn`
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[metrics_faint_key], turn, METRIC_TYPES.SET])

      this.update_status(pkmn, 'fnt', is_player_1)
      var pkmn_form = this.get_form_for_pokemon(is_player_1, pkmn)
      metric_items.push([metrics_prefix, REGEX_TO_METRICS_KEY_MAPPING[faint_regex], pkmn_form, METRIC_TYPES.APPEND])
    }

    if (output.search(zoroark_end_illusion_regex) !== -1) {
      //#|-end|p2a: Zoroark|Illusion
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p2_reward += this.reward_config['illusion_broken']
        this.p2_rewards_tracker['illusion_broken'].push(this.reward_config['illusion_broken'])
        message = `_p1_${pkmn} illusion ended`
      }else{
        this.p1_reward += this.reward_config['illusion_broken']
        this.p1_rewards_tracker['illusion_broken'].push(this.reward_config['illusion_broken'])
        message = `_p2_${pkmn} illusion ended`
      }
      this.update_seen_pokemon(is_player_1, pkmn)
    }

    if (output.search(zoroark_replace_regex) !== -1) {
      //#|replace|p2a: Zoroark|Zoroark, L80, F
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      //#reward goes to oppposite player
      this.update_seen_pokemon(is_player_1, pkmn)
    }

    if (output.search(zpower_regex) !== -1) {
      //#|-zpower|p1a: Charizard
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_used_zmove = true
        message = `_p1_${pkmn} used zmove`
      }else{
        this.p2_used_zmove = true
        message = `_p2_${pkmn} used zmove`
      }
    }

    if (output.search(mega_regex) !== -1) {
      //#|-mega|p1a: Alakazam|Alakazam|Alakazite
      message_was_processed = true
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_used_mega = true
        message = `_p1_${pkmn} used mega`
      }else{
        this.p2_used_mega = true
        message = `_p2_${pkmn} used mega`
      }
    }

    if (output.search(terastallize_regex) !== -1) {
      //#|-terastallize|p2a: Delibird|Ghost
      message_was_processed = true
      var tera_type = output.split('|')[3]
      var [is_player_1, pkmn, position] = this.get_player_pkmn_position(output)
      if (is_player_1){
        this.p1_used_tera = true
        message = `_p1_${pkmn} used terastallize ${tera_type}`
      }else{
        this.p2_used_tera = true
        message = `_p2_${pkmn} used terastallize ${tera_type}`
      }
      this.update_seen_tera(is_player_1, pkmn, tera_type)
    }

    if(message){
      this.append_to_transcript(message);
    }
    if(message_was_processed && output){
      this.append_processed_output(output)
    }
    if(!message_was_processed && output){
      this.unprocessed_events.push(output)
    }
//    console.log(metric_items)
//    console.log(message)

  }
}
