class CWSS {

  constructor() {
    this._base = 0;
    this._attack = 0;
    this._env = 0;
    this._total = 0;

    this.low_score = 39;
    this.med_score = 69;
    this.high_score = 89;

  }

  get base_value () {
    return this._base;
  }

  get attack_value () {
    return this._attack;
  }

  get environmental_value () {
    return this._env;
  }

  static precision_round(number, precision) {
    let factor = Math.pow(10, precision);

    return Math.round(number * factor) / factor;
  }

  static metric_value

  static func(metric) {
    if (metric === 0) {
      return 0;
    }

    return 1;

  }

  calc_base_finding(technical_impact, acquired_privilege, acquired_privilege_layer, finding_confidence, internal_control_effectiveness) {

    let technical_impact10 = 10 * technical_impact;
    let finding_confidence5 = 5 * finding_confidence;
    let acquired_privilege_and_acquired_privilege_layer5 = 5 * (acquired_privilege + acquired_privilege_layer);

    let num = (technical_impact10 + acquired_privilege_and_acquired_privilege_layer5 + finding_confidence5) * this.f(technical_impact) * internal_control_effectiveness * 4.0;

    this._base = this.precision_round(num, 3);
  }

  calc_attack_surface(required_privilege, required_privilege_layer, access_vector, authentication_strength, level_of_interaction, deployment_scope) {

    let rp_rl_av20 = 20 * (required_privilege + required_privilege_layer + access_vector);
    let deployment_scope20 = 20 * deployment_scope;
    let level_of_interaction15 = 15 * level_of_interaction;
    let authentication_strength5 = 5 * authentication_strength;

    let num = (rp_rl_av20 + deployment_scope20 + level_of_interaction15 + authentication_strength5) / 100;

    this._attack = this.precision_round(num, 3);
  }

  calc_environmental(business_impact, likelihood_of_discovery, likelihood_of_exploit, external_control_effectiveness, prevalence) {

    let business_impact10 = 10 * business_impact;
    let likelihood_of_discovery3 = 3 * likelihood_of_discovery;
    let likelihood_of_exploit4 = 4 * likelihood_of_exploit;
    let prevalence3 = 3 * prevalence;

    let num = (business_impact10 + likelihood_of_discovery3 + likelihood_of_exploit4 + prevalence3) * this.func(business_impact) * external_control_effectiveness / 20.0;

    this._env = this.precision_round(num, 3);
  }

  calc_score_by_metrics(
    technical_impact, acquired_privilege, acquired_privilege_layer, finding_confidence, internal_control_effectiveness,
    required_privilege, required_privilege_layer, access_vector, authentication_strength, level_of_interaction, deployment_scope,
    business_impact, likelihood_of_discovery, likelihood_of_exploit, external_control_effectiveness, prevalence
  ) {

    this.calc_base_finding(technical_impact, acquired_privilege, acquired_privilege_layer, finding_confidence, internal_control_effectiveness);
    this.calc_attack_surface(required_privilege, required_privilege_layer, access_vector, authentication_strength, level_of_interaction, deployment_scope);
    this.calc_environmental(business_impact, likelihood_of_discovery, likelihood_of_exploit, external_control_effectiveness, prevalence);

    let num = this.base_value * this.attack_value * this.environmental_value;

    this._total = this.precision_round(num, 2);

    return this._total;
  }

  calc_score_by_vector(vector) {

    /*
     *FactorName:Value,Weight
     *"CWSS:1.0.1/TI:M,0.6/AP:A,1.0/AL:A,1.0/IC:N,1.0/FC:T,1.0/RP:RU,0.7/RL:A,1.0/AV:I,1.0/AS:W,0.9/IN:A,1.0/SC:NA,1.0/BI:L,0.3/DI:NA,1.0/EX:NA,1.0/EC:N,1.0/RE:NA,1.0/P:NA,1.0";
     */

    let parse_data = vector.split("/");
    let header = parse_data[0];
    let version = header.split(":")[1];
    let vector_body = parse_data.shift();

  }

  get_classification(score) {

    let classification = "";

    if (score <= this.low_score) {
      classification = "Low";
    } else if (score <= this.med_score) {
      classification = "Medium";
    } else if (score <= this.high_score) {
      classification = "High";
    } else {
      classification = "Critical";
    }
    return classification;
  }

}

module.exports = CWSS;