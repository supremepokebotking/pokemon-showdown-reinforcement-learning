
const METRICS_WITHOUT_PREFIX = ['turns', 'user_id', 'session_id', 'group_label', 'session_label', 'weather_conditions_used', 'terrain_conditions_used', 'rooms_used']

export const METRIC_TYPES = {
  INCREMENT:1,
  MIN:2,
  MAX:3,
  APPEND:4,
  SET:5,
  SET_IF_NOT_NEGATIVE:6,
  ATLEAST_ONCE:7,
}



export class SessionMetrics {
  constructor(){
    this.metrics_tracker = {
      "turns": 0,
      "metrics_source": "Training-Sim",
      "p1_teamsize": 0,
      "p2_teamsize": 0,
      "user_id":"",
      "session_id":"",
      "group_label":"",
      "session_label": "",
      "p1_session_team": -1,
      "p1_sub_session_team":  [],// team_pokemon_id
      "upload_filenames":[],
      "weather_conditions_used": [], //comma sep
      "terrain_conditions_used": [], // comma sep
      "rooms_used": [], // comma sep
      "p1_hurt_by_rocks": [],
      "p2_hurt_by_rocks": [],
      "p1_hurt_by_spikes": [],
      "p2_hurt_by_spikes": [],
      "p1_slowed_by_web": [],
      "p2_slowed_by_web": [],
      "p1_poisoned_by_spikes": [],
      "p2_poisoned_by_spikes": [],
      "p1_status_cured": [],
      "p2_status_cured": [],
      "p1_safeguard_used": 0,
      "p2_safeguard_used": 0,
      "p1_lightscreen_used": 0,
      "p2_lightscreen_used": 0,
      "p1_reflect_used": 0,
      "p2_reflect_used": 0,
      "p1_tailwind_used": 0,
      "p2_tailwind_used": 0,
      "p1_aurora_veil_used": 0,
      "p2_aurora_veil_used": 0,
      "p1_has_rocks_used_on": 0,
      "p2_has_rocks_used_on": 0,
      "p1_has_web_used_on": 0,
      "p2_has_web_used_on": 0,
      "p1_spikes_used_on": 0,
      "p2_spikes_used_on": 0,
      "p1_toxic_spikes_used_on": 0,
      "p2_toxic_spikes_used_on": 0,
      'p1_hazards_cleared':0,
      'p2_hazards_cleared':0,
      "p1_yawned_used_on": 0,
      "p2_yawned_used_on": 0,
      "p1_perished_used_on": 0,
      "p2_perished_used_on": 0,
      "p1_smacked_down": 0,
      "p2_smacked_down": 0,
      //Level 1 logic, convert each turn. from ints to enums. == 0 Neutral < 1 Resisted > 1 Super
      //Level 2 logic, decrease if player hurts ally regardless  -  ignore for now until doubles data is collected.
      "p1_super_effective": [],
      "p2_super_effective": [],
      "p1_not_very_effective": [],
      "p2_not_very_effective": [],
      "p1_does_not_effect": [],
      "p2_does_not_effect": [],
      "p1_destined_used_on": 0,
      "p2_destined_used_on": 0,
      "p1_trapped": 0,
      "p2_trapped": 0,
      "p1_protect_counter": 0,
      "p2_protect_counter": 0,
      "p1_critical_counter": 0,
      "p2_critical_counter": 0,
      "p1_substitute": 0,
      "p2_substitute": 0,
      "p1_seeded": 0,
      "p2_seeded": 0,
      "p1_confused": 0,
      "p2_confused": 0,
      "p1_taunted": 0,
      "p2_taunted": 0,
      "p1_encored": 0,
      "p2_encored": 0,
      "p1_attracted": 0,
      "p2_attracted": 0,
      "p1_must_recharge": 0,
      "p2_must_recharge": 0,
      "p1_dynamax_activated": false,
      "p2_dynamax_activated": false,
      "p1_dynamax_turns": 0,
      "p2_dynamax_turns": 0,
      "p1_stats_cleared": 0,
      "p2_stats_cleared": 0,
      "p1_neg_stats_cleared": 0,
      "p2_neg_stats_cleared": 0,
      "p1_accuracy_modifier_max_stage": 0,
      "p2_accuracy_modifier_max_stage": 0,
      "p1_accuracy_modifier_min_stage": 0,
      "p2_accuracy_modifier_min_stage": 0,
      "p1_attack_modifier_max_stage": 0,
      "p2_attack_modifier_max_stage": 0,
      "p1_attack_modifier_min_stage": 0,
      "p2_attack_modifier_min_stage": 0,
      "p1_spatk_modifier_max_stage": 0,
      "p2_spatk_modifier_max_stage": 0,
      "p1_spatk_modifier_min_stage": 0,
      "p2_spatk_modifier_min_stage": 0,
      "p1_defense_modifier_max_stage": 0,
      "p2_defense_modifier_max_stage": 0,
      "p1_defense_modifier_min_stage": 0,
      "p2_defense_modifier_min_stage": 0,
      "p1_spdef_modifier_max_stage": 0,
      "p2_spdef_modifier_max_stage": 0,
      "p1_spdef_modifier_min_stage": 0,
      "p2_spdef_modifier_min_stage": 0,
      "p1_speed_modifier_max_stage": 0,
      "p2_speed_modifier_max_stage": 0,
      "p1_speed_modifier_min_stage": 0,
      "p2_speed_modifier_min_stage": 0,
      "p1_evasion_modifier_max_stage": 0,
      "p2_evasion_modifier_max_stage": 0,
      "p1_evasion_modifier_min_stage": 0,
      "p2_evasion_modifier_min_stage": 0,
      "p1_did_sweep": false,
      "p2_did_sweep": false,
      "p1_did_shutdown": false,
      "p2_did_shutdown": false,
      "p1_seen_statuses": [],
      "p2_seen_statuses": [],
      "p1_seen_pokemon": new Set(),
      "p2_seen_pokemon": new Set(),
      "p1_seen_abilities": new Set(),
      "p2_seen_abilities": new Set(),
      "p1_seen_attacks": new Set(),
      "p2_seen_attacks": new Set(),
      "p1_turns_after_dynamax": 0,
      "p2_turns_after_dynamax": 0,
      "p1_attacks_after_dynamax": [],
      "p2_attacks_after_dynamax": [],
      "p1_attacks_counter": 0,
      "p2_attacks_counter": 0,
      "p1_switch_counter": 0,
      "p2_switch_counter": 0,
      "p1_team_pokemon_1_attacks": [],
      "p1_team_pokemon_2_attacks": [],
      "p1_team_pokemon_3_attacks": [],
      "p1_team_pokemon_4_attacks": [],
      "p1_team_pokemon_5_attacks": [],
      "p1_team_pokemon_6_attacks": [],
      "p1_at_end_of_turn": [],
      "p2_at_end_of_turn": [],
      "p1_damage_at_end_of_turn": [],
      "p2_damage_at_end_of_turn": [],
      "p1_end_of_turn_accuracy_modifier_stage": [],
      "p2_end_of_turn_accuracy_modifier_stage": [],
      "p1_end_of_turn_attack_modifier_stage": [],
      "p2_end_of_turn_attack_modifier_stage": [],
      "p1_end_of_turn_spatk_modifier_stage": [],
      "p2_end_of_turn_spatk_modifier_stage": [],
      "p1_end_of_turn_defense_modifier_stage": [],
      "p2_end_of_turn_defense_modifier_stage": [],
      "p1_end_of_turn_spdef_modifier_stage": [],
      "p2_end_of_turn_spdef_modifier_stage": [],
      "p1_end_of_turn_speed_modifier_stage": [],
      "p2_end_of_turn_speed_modifier_stage": [],
      "p1_end_of_turn_evasion_modifier_stage": [],
      "p2_end_of_turn_evasion_modifier_stage": [],
      "p1_attack_tracker": [],
      "p2_attack_tracker": [],   // Used to replay summary. if attack, assume attack, if pokemon, assume switch
      "p1_switch_tracker": [],
      "p2_switch_tracker": [],
      "p1_swap_tracker": [],
      "p2_swap_tracker": [],
      "p1_faint_tracker": [],
      "p2_faint_tracker": [],
      "p1_miss_tracker": [],
      "p2_miss_tracker": [],
      "p1_dynamax_tracker": [],   // tracks first dynamax trigger
      "p2_dynamax_tracker": [],
      "p1_item_used": [],  // tracks items used. berries
      "p2_item_used": [],
      "p1_item_removed": [],  // tracks items used. berries
      "p2_item_removed": [],
      "p1_team_pokemon_1_first_turn": -1,
      "p1_team_pokemon_2_first_turn": -1,
      "p1_team_pokemon_3_first_turn": -1,
      "p1_team_pokemon_4_first_turn": -1,
      "p1_team_pokemon_5_first_turn": -1,
      "p1_team_pokemon_6_first_turn": -1,
      "p1_team_pokemon_1_first_damaged_turn": -1,
      "p1_team_pokemon_2_first_damaged_turn": -1,
      "p1_team_pokemon_3_first_damaged_turn": -1,
      "p1_team_pokemon_4_first_damaged_turn": -1,
      "p1_team_pokemon_5_first_damaged_turn": -1,
      "p1_team_pokemon_6_first_damaged_turn": -1,
      "p1_team_pokemon_1_fainted_turn": -1,
      "p1_team_pokemon_2_fainted_turn": -1,
      "p1_team_pokemon_3_fainted_turn": -1,
      "p1_team_pokemon_4_fainted_turn": -1,
      "p1_team_pokemon_5_fainted_turn": -1,
      "p1_team_pokemon_6_fainted_turn": -1,
      "p1_team_pokemon_1_first_switched_turn": -1,
      "p1_team_pokemon_2_first_switched_turn": -1,
      "p1_team_pokemon_3_first_switched_turn": -1,
      "p1_team_pokemon_4_first_switched_turn": -1,
      "p1_team_pokemon_5_first_switched_turn": -1,
      "p1_team_pokemon_6_first_switched_turn": -1,
      "p2_team_pokemon_1_first_turn": -1,
      "p2_team_pokemon_2_first_turn": -1,
      "p2_team_pokemon_3_first_turn": -1,
      "p2_team_pokemon_4_first_turn": -1,
      "p2_team_pokemon_5_first_turn": -1,
      "p2_team_pokemon_6_first_turn": -1,
      "p2_team_pokemon_1_first_damaged_turn": -1,
      "p2_team_pokemon_2_first_damaged_turn": -1,
      "p2_team_pokemon_3_first_damaged_turn": -1,
      "p2_team_pokemon_4_first_damaged_turn": -1,
      "p2_team_pokemon_5_first_damaged_turn": -1,
      "p2_team_pokemon_6_first_damaged_turn": -1,
      "p2_team_pokemon_1_fainted_turn": -1,
      "p2_team_pokemon_2_fainted_turn": -1,
      "p2_team_pokemon_3_fainted_turn": -1,
      "p2_team_pokemon_4_fainted_turn": -1,
      "p2_team_pokemon_5_fainted_turn": -1,
      "p2_team_pokemon_6_fainted_turn": -1,
      "p2_team_pokemon_1_first_switched_turn": -1,
      "p2_team_pokemon_2_first_switched_turn": -1,
      "p2_team_pokemon_3_first_switched_turn": -1,
      "p2_team_pokemon_4_first_switched_turn": -1,
      "p2_team_pokemon_5_first_switched_turn": -1,
      "p2_team_pokemon_6_first_switched_turn": -1,
    }

  }

  bulk_update_metrics(metric_items){
    for (const [i, item] of metric_items.entries()) {
      var [prefix, metrics_key, value, metrics_type] = item
      this.update_metrics(prefix, metrics_key, value, metrics_type)
    }
  }

  update_metrics(prefix, metrics_key, value, metrics_type){
    return
  }

  getSerializedMetrics(){
//    var metrics_copy = JSON.parse(JSON.stringify(this.metrics_tracker))
    var metrics_copy = this.metrics_tracker
    for (const key in metrics_copy) {
      if(metrics_copy[key] instanceof Set){
        metrics_copy[key] = Array.from(metrics_copy[key])
      }
    }
    return metrics_copy

  }

}
