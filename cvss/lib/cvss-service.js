//https://www.first.org/cvss/v3.0/specification-document
const cvss = require("cvss");

class CVSS {

  constructor(version = "3.0", type = "base") {
    this.type = type;
    this.version = version; //library only supports version 3.0
    this.cvss = cvss;
  }

  get Type () {
    return this.type;
  }

  get metric_groups() {
    return [
      {
        "code": "BM",
        "name": "Base Metric Group",
        "description": "The Base Metric group represents the intrinsic characteristics of a vulnerability that are constant over time and across user environments. Determine the vulnerable component and score Attack Vector, Attack Complexity, Privileges Required and User Interaction relative to this.",
        "metrics": [
          this.attack_vector_metric,
          this.attack_complexity_metric,
          this.privileges_required_metric,
          this.user_interaction_metric,
          this.confidentiality_impact_metric,
          this.integrity_impact_metric,
          this.availability_impact_metric,
          this.scope_metric
        ]
      },
      {
        "code": "TM",
        "name": "Temporal Metric Group",
        "description": "The Temporal metrics measure the current state of exploit techniques or code availability, the existence of any patches or workarounds, or the confidence that one has in the description of a vulnerability.",
        "metrics": [
          this.exploit_code_maturity_metric,
          this.remediation_level_metric,
          this.report_confidence_metric
        ]
      },
      {
        "code": "EM",
        "name": "Environmental Metric Group",
        "description": "These metrics enable the analyst to customize the CVSS score depending on the importance of the affected IT asset to a userâ€™s organization, measured in terms of complementary/alternative security controls in place, Confidentiality, Integrity, and Availability. The metrics are the modified equivalent of base metrics and are assigned metric values based on the component placement in organization infrastructure.",
        "metrics": [
          this.modified_attack_vector_metric,
          this.modified_attack_complexity_metric,
          this.modified_privileges_required_metric,
          this.modified_user_interaction_metric,
          this.modified_confidentiality_impact_metric,
          this.modified_integrity_impact_metric,
          this.modified_availability_impact_metric,
          this.modified_scope_metric,
          this.confidentiality_requirement_metric,
          this.integrity_requirement_metric,
          this.availability_requirement_metric
        ]
      }
    ];
  }

  get attack_vector_metric() {
    return {
      "code": "AV",
      "name": "Attack Vector",
      "description": "This metric reflects the context by which vulnerability exploitation is possible. The Base Score increases the more remote (logically, and physically) an attacker can be in order to exploit the vulnerable component.",
      "inputs": CVSS.attack_vector_input
    };
  }

  static get attack_vector_input() {
    return [
      { "code": "N",
        "name": "Network",
        "description": "A vulnerability exploitable with network access means the vulnerable component is bound to the network stack and the attacker's path is through OSI layer 3 (the network layer). Such a vulnerability is often termed \"remotely exploitable\" and can be thought of as an attack being exploitable one or more network hops away (e.g. across layer 3 boundaries from routers). An example of a network attack is an attacker causing a denial of service (DoS) by sending a specially crafted TCP packet from across the public Internet (e.g. CVE 2004 0230)." },
      { "code": "A",
        "name": "Adjacent",
        "description": "A vulnerability exploitable with adjacent network access means the vulnerable component is bound to the network stack, however the attack is limited to the same shared physical (e.g. Bluetooth, IEEE 802.11), or logical (e.g. local IP subnet) network, and cannot be performed across an OSI layer 3 boundary (e.g. a router). An example of an Adjacent attack would be an ARP (IPv4) or neighbor discovery (IPv6) flood leading to a denial of service on the local LAN segment. See also CVE 2013 6014." },
      { "code": "L",
        "name": "Local",
        "description": "A vulnerability exploitable with Local access means that the vulnerable component is not bound to the network stack, and the attacker's path is via read/write/execute capabilities. In some cases, the attacker may be logged in locally in order to exploit the vulnerability, otherwise, she may rely on User Interaction to execute a malicious file." },
      { "code": "P",
        "name": "Physical",
        "description": "A vulnerability exploitable with Physical access requires the attacker to physically touch or manipulate the vulnerable component. Physical interaction may be brief (e.g. evil maid attack [1]) or persistent. An example of such an attack is a cold boot attack which allows an attacker to access to disk encryption keys after gaining physical access to the system, or peripheral attacks such as Firewire/USB Direct Memory Access attacks." }
    ];
  }

  get modified_attack_vector_metric() {
    return {
      "code": "MAV",
      "name": "Modified Attack Vector",
      "description": "This metric reflects the context by which vulnerability exploitation is possible. The Base Score increases the more remote (logically, and physically) an attacker can be in order to exploit the vulnerable component.",
      "inputs": this.modified_attack_vector_input
    };
  }

  get modified_attack_vector_input() {
    return this.add_default_to_input(CVSS.attack_vector_input);
  }

  get attack_complexity_metric() {
    return {
      "code": "AC",
      "name": "Attack Complexity",
      "description": "This metric describes the conditions beyond the attacker's control that must exist in order to exploit the vulnerability. Such conditions may require the collection of more information about the target, the presence of certain system configuration settings, or computational exceptions.",
      "inputs": CVSS.attack_complexity_input
    };
  }

  static get attack_complexity_input() {
    return [
      { "code": "H",
        "name": "Low",
        "description": "Specialized access conditions or extenuating circumstances do not exist. An attacker can expect repeatable success against the vulnerable component." },
      { "code": "L",
        "name": "High",
        "description": "A successful attack depends on conditions beyond the attacker's control. That is, a successful attack cannot be accomplished at will, but requires the attacker to invest in some measurable amount of effort in preparation or execution against the vulnerable component before a successful attack can be expected. 2 For example, a successful attack may depend on an attacker overcoming any of the following conditions:\n- The attacker must conduct target-specific reconnaissance. For example, on target configuration settings, sequence numbers, shared secrets, etc.\n- The attacker must prepare the target environment to improve exploit reliability. For example, repeated exploitation to win a race condition, or overcoming advanced exploit mitigation techniques.\n- The attacker must inject herself into the logical network path between the target and the resource requested by the victim in order to read and/or modify network communications (e.g. man in the middle attack)." }
    ];
  }

  get modified_attack_complexity_metric() {
    return {
      "code": "MAC",
      "name": "Modified Attack Complexity",
      "description": "This metric reflects the context by which vulnerability exploitation is possible. The Base Score increases the more remote (logically, and physically) an attacker can be in order to exploit the vulnerable component.",
      "inputs": this.modified_attack_complexity_input
    };
  }

  get modified_attack_complexity_input() {
    return this.add_default_to_input(CVSS.attack_complexity_input);
  }

  get user_interaction_metric() {
    return {
      "code": "UI",
      "name": "User Interaction",
      "description": "This metric captures the requirement for a user, other than the attacker, to participate in the successful compromise the vulnerable component. This metric determines whether the vulnerability can be exploited solely at the will of the attacker, or whether a separate user (or user-initiated process) must participate in some manner. The Base Score is highest when no user interaction is required.",
      "inputs": CVSS.user_interaction_input
    };
  }

  static get user_interaction_input() {
    return [
      { "code": "N",
        "name": "None",
        "description": "The vulnerable system can be exploited without interaction from any user." },
      { "code": "R",
        "name": "Required",
        "description": "Successful exploitation of this vulnerability requires a user to take some action before the vulnerability can be exploited. For example, a successful exploit may only be possible during the installation of an application by a system administrator." }
    ];
  }

  get modified_user_interaction_metric() {
    return {
      "code": "MUI",
      "name": "Modified User Interaction",
      "description": "This metric captures the requirement for a user, other than the attacker, to participate in the successful compromise the vulnerable component. This metric determines whether the vulnerability can be exploited solely at the will of the attacker, or whether a separate user (or user-initiated process) must participate in some manner. The Base Score is highest when no user interaction is required.",
      "inputs": this.modified_user_interaction_input
    };
  }

  get modified_user_interaction_input() {
    return this.add_default_to_input(CVSS.user_interaction_input);
  }

  get scope_metric() {
    return {
      "code": "S",
      "name": "Scope",
      "description": "Does a successful attack impact a component other than the vulnerable component? If so, the Base Score increases and the Confidentiality, Integrity and Authentication metrics should be scored relative to the impacted component.",
      "inputs": CVSS.scope_input
    };
  }

  static get scope_input() {
    return [
      { "code": "U",
        "name": "Unchanged",
        "description": "An exploited vulnerability can only affect resources managed by the same authority. In this case the vulnerable component and the impacted component are the same." },
      { "code": "C",
        "name": "Changed",
        "description": "An exploited vulnerability can affect resources beyond the authorization privileges intended by the vulnerable component. In this case the vulnerable component and the impacted component are different." }
    ];
  }

  get modified_scope_metric() {
    return {
      "code": "MS",
      "name": "Modified Scope",
      "description": "Does a successful attack impact a component other than the vulnerable component? If so, the Base Score increases and the Confidentiality, Integrity and Authentication metrics should be scored relative to the impacted component.",
      "inputs": this.modified_scope_input
    };
  }

  get modified_scope_input() {
    return this.add_default_to_input(CVSS.scope_input);
  }

  get privileges_required_metric() {
    return {
      "code": "PR",
      "name": "Privileges Required",
      "description": "This metric describes the level of privileges an attacker must possess before successfully exploiting the vulnerability. This Base Score increases as fewer privileges are required.",
      "inputs": CVSS.privileges_required_input
    };
  }

  static get base_input() {
    return [
      { "code": "H",
        "name": "Low",
        "description": "" },
      { "code": "L",
        "name": "High",
        "description": "" },
      { "code": "N",
        "name": "None",
        "description": "" }
    ];
  }

  static get privileges_required_input() {
    return CVSS.base_input;
  }

  get modified_privileges_required_metric() {
    return {
      "code": "MPR",
      "name": "Modified Privileges Required",
      "description": "This metric describes the level of privileges an attacker must possess before successfully exploiting the vulnerability. This Base Score increases as fewer privileges are required.",
      "inputs": this.modified_privileges_required_input
    };
  }

  get modified_privileges_required_input() {
    return this.add_default_to_input(CVSS.privileges_required_input);
  }

  get confidentiality_impact_metric() {
    return {
      "code": "C",
      "name": "Confidentiality Impact",
      "description": "This metric measures the impact to the confidentiality of the information resources managed by a software component due to a successfully exploited vulnerability. Confidentiality refers to limiting information access and disclosure to only authorized users, as well as preventing access by, or disclosure to, unauthorized ones.",
      "inputs": this.confidentiality_impact_input
    };
  }

  get confidentiality_impact_input() {
    let list = CVSS.base_input;

    list.forEach((item) => {
      if (item.code === "H") {
        item.description = "There is total loss of confidentiality, resulting in all resources within the impacted component being divulged to the attacker. Alternatively, access to only some restricted information is obtained, but the disclosed information presents a direct, serious impact. For example, an attacker steals the administrator's password, or private encryption keys of a web server.";
      } else if (item.code === "L") {
        item.description = "There is some loss of confidentiality. Access to some restricted information is obtained, but the attacker does not have control over what information is obtained, or the amount or kind of loss is constrained. The information disclosure does not cause a direct, serious loss to the impacted component.";
      } else {
        item.description = "There is no loss of confidentiality within the impacted component.";
      }
    });
    return list;
  }

  get modified_confidentiality_impact_metric() {
    return {
      "code": "MC",
      "name": "Modified Confidentiality Impact",
      "description": "This metric measures the impact to the confidentiality of the information resources managed by a software component due to a successfully exploited vulnerability. Confidentiality refers to limiting information access and disclosure to only authorized users, as well as preventing access by, or disclosure to, unauthorized ones.",
      "inputs": this.modified_confidentiality_impact_input
    };
  }

  get modified_confidentiality_impact_input() {
    return this.add_default_to_input(this.confidentiality_impact_input);
  }

  get integrity_impact_metric() {
    return {
      "code": "I",
      "name": "Integrity Impact",
      "description": "This metric measures the impact to integrity of a successfully exploited vulnerability. Integrity refers to the trustworthiness and veracity of information.",
      "inputs": this.integrity_impact_input
    };
  }

  get integrity_impact_input() {
    let list = CVSS.base_input;

    list.forEach((item) => {
      if (item.code === "H") {
        item.description = "There is a total loss of integrity, or a complete loss of protection. For example, the attacker is able to modify any/all files protected by the impacted component. Alternatively, only some files can be modified, but malicious modification would present a direct, serious consequence to the impacted component.";
      } else if (item.code === "L") {
        item.description = "Modification of data is possible, but the attacker does not have control over the consequence of a modification, or the amount of modification is constrained. The data modification does not have a direct, serious impact on the impacted component.";
      } else {
        item.description = "There is no loss of confidentiality within the impacted component.";
      }
    });
    return list;
  }

  get modified_integrity_impact_metric() {
    return {
      "code": "MI",
      "name": "Modified Integrity Impact",
      "description": "This metric measures the impact to integrity of a successfully exploited vulnerability. Integrity refers to the trustworthiness and veracity of information.",
      "inputs": this.modified_integrity_impact_input
    };
  }

  get modified_integrity_impact_input() {
    return this.add_default_to_input(this.integrity_impact_input);
  }

  get availability_impact_metric() {
    return {
      "code": "A",
      "name": "Availability Impact",
      "description": "This metric measures the impact to the availability of the impacted component resulting from a successfully exploited vulnerability. It refers to the loss of availability of the impacted component itself, such as a networked service (e.g., web, database, email). Since availability refers to the accessibility of information resources, attacks that consume network bandwidth, processor cycles, or disk space all impact the availability of an impacted component.",
      "inputs": this.availability_impact_input
    };
  }

  get availability_impact_input() {
    let list = CVSS.base_input;

    list.forEach((item) => {
      if (item.code === "H") {
        item.description = "There is total loss of availability, resulting in the attacker being able to fully deny access to resources in the impacted component; this loss is either sustained (while the attacker continues to deliver the attack) or persistent (the condition persists even after the attack has completed). Alternatively, the attacker has the ability to deny some availability, but the loss of availability presents a direct, serious consequence to the impacted component (e.g., the attacker cannot disrupt existing connections, but can prevent new connections; the attacker can repeatedly exploit a vulnerability that, in each instance of a successful attack, leaks a only small amount of memory, but after repeated exploitation causes a service to become completely unavailable).";
      } else if (item.code === "L") {
        item.description = "There is reduced performance or interruptions in resource availability. Even if repeated exploitation of the vulnerability is possible, the attacker does not have the ability to completely deny service to legitimate users. The resources in the impacted component are either partially available all of the time, or fully available only some of the time, but overall there is no direct, serious consequence to the impacted component.";
      } else {
        item.description = "There is no loss of confidentiality within the impacted component.";
      }
    });
    return list;
  }

  get modified_availability_impact_metric() {
    return {
      "code": "MA",
      "name": "Modified Availability Impact",
      "description": "This metric measures the impact to the availability of the impacted component resulting from a successfully exploited vulnerability. It refers to the loss of availability of the impacted component itself, such as a networked service (e.g., web, database, email). Since availability refers to the accessibility of information resources, attacks that consume network bandwidth, processor cycles, or disk space all impact the availability of an impacted component.",
      "inputs": this.modified_availability_impact_input
    };
  }

  get modified_availability_impact_input() {
    return this.add_default_to_input(this.availability_impact_input);
  }

  get exploit_code_maturity_metric() {
    return {
      "code": "E",
      "name": "Exploit Code Maturity",
      "description": "This metric measures the likelihood of the vulnerability being attacked, and is typically based on the current state of exploit techniques, exploit code availability, or active, 'in-the-wild' exploitation.",
      "inputs": CVSS.exploit_code_maturity_input
    };
  }

  static get exploit_code_maturity_input() {
    return [
      { "code": "X",
        "name": "Not Defined",
        "description": "Assigning this value to the metric will not influence the score. It is a signal to a scoring equation to skip this metric." },
      { "code": "U",
        "name": "Unproven",
        "description": "No exploit code is available, or an exploit is theoretical." },
      { "code": "P",
        "name": "Proof-of-Concept",
        "description": "Proof-of-concept exploit code is available, or an attack demonstration is not practical for most systems. The code or technique is not functional in all situations and may require substantial modification by a skilled attacker." },
      { "code": "F",
        "name": "Functional",
        "description": "Functional exploit code is available. The code works in most situations where the vulnerability exists." },
      { "code": "H",
        "name": "High",
        "description": "Functional autonomous code exists, or no exploit is required (manual trigger) and details are widely available. Exploit code works in every situation, or is actively being delivered via an autonomous agent (such as a worm or virus). Network-connected systems are likely to encounter scanning or exploitation attempts. Exploit development has reached the level of reliable, widely-available, easy-to-use automated tools." }
    ];
  }

  get remediation_level_metric() {
    return {
      "code": "RL",
      "name": "Remediation Level",
      "description": "The Remediation Level of a vulnerability is an important factor for prioritization. The typical vulnerability is unpatched when initially published. Workarounds or hotfixes may offer interim remediation until an official patch or upgrade is issued. Each of these respective stages adjusts the temporal score downwards, reflecting the decreasing urgency as remediation becomes final.",
      "inputs": CVSS.remediation_level_input
    };
  }

  static get remediation_level_input() {
    return [
      { "code": "X",
        "name": "Not Defined",
        "description": "Assigning this value to the metric will not influence the score. It is a signal to a scoring equation to skip this metric." },
      { "code": "O",
        "name": "Official Fix",
        "description": "A complete vendor solution is available. Either the vendor has issued an official patch, or an upgrade is available." },
      { "code": "T",
        "name": "Temporary Fix",
        "description": "There is an official but temporary fix available. This includes instances where the vendor issues a temporary hotfix, tool, or workaround." },
      { "code": "W",
        "name": "Workaround",
        "description": "There is an unofficial, non-vendor solution available. In some cases, users of the affected technology will create a patch of their own or provide steps to work around or otherwise mitigate the vulnerability." },
      { "code": "U",
        "name": "Unavailable",
        "description": "There is either no solution available or it is impossible to apply." }
    ];
  }

  get report_confidence_metric() {
    return {
      "code": "RC",
      "name": "Report Confidence",
      "description": "This metric measures the degree of confidence in the existence of the vulnerability and the credibility of the known technical details. Sometimes only the existence of vulnerabilities are publicized, but without specific details. For example, an impact may be recognized as undesirable, but the root cause may not be known. The vulnerability may later be corroborated by research which suggests where the vulnerability may lie, though the research may not be certain. Finally, a vulnerability may be confirmed through acknowledgement by the author or vendor of the affected technology. The urgency of a vulnerability is higher when a vulnerability is known to exist with certainty. This metric also suggests the level of technical knowledge available to would-be attackers.",
      "inputs": CVSS.report_confidence_input
    };
  }

  static get report_confidence_input() {
    return [
      { "code": "X",
        "name": "Not Defined",
        "description": "Assigning this value to the metric will not influence the score. It is a signal to a scoring equation to skip this metric." },
      { "code": "U",
        "name": "Confirmed",
        "description": "Detailed reports exist, or functional reproduction is possible (functional exploits may provide this). Source code is available to independently verify the assertions of the research, or the author or vendor of the affected code has confirmed the presence of the vulnerability." },
      { "code": "R",
        "name": "Reasonable",
        "description": "Significant details are published, but researchers either do not have full confidence in the root cause, or do not have access to source code to fully confirm all of the interactions that may lead to the result. Reasonable confidence exists, however, that the bug is reproducible and at least one impact is able to be verified (proof-of-concept exploits may provide this). An example is a detailed write-up of research into a vulnerability with an explanation (possibly obfuscated or \"left as an exercise to the reader\") that gives assurances on how to reproduce the results." },
      { "code": "C",
        "name": "Unknown",
        "description": "There are reports of impacts that indicate a vulnerability is present. The reports indicate that the cause of the vulnerability is unknown, or reports may differ on the cause or impacts of the vulnerability. Reporters are uncertain of the true nature of the vulnerability, and there is little confidence in the validity of the reports or whether a static Base score can be applied given the differences described. An example is a bug report which notes that an intermittent but non-reproducible crash occurs, with evidence of memory corruption suggesting that denial of service, or possible more serious impacts, may result." }
    ];
  }

  get confidentiality_requirement_metric() {
    return {
      "code": "CR",
      "name": "Confidentiality Requirement",
      "description": "These metrics enable the analyst to customize the CVSS score depending on the importance of the Confidentiality of the affected IT asset to a user's organization, relative to other impacts. This metric modifies the environmental score by reweighting the Modified Confidentiality impact metric versus the other modified impacts.",
      "inputs": CVSS.xlmh_input
    };
  }

  get integrity_requirement_metric() {
    return {
      "code": "IR",
      "name": "Integrity Requirement",
      "description": "These metrics enable the analyst to customize the CVSS score depending on the importance of the Integrity of the affected IT asset to a user's organization, relative to other impacts. This metric modifies the environmental score by reweighting the Modified Integrity impact metric versus the other modified impacts.",
      "inputs": CVSS.xlmh_input
    };
  }

  get availability_requirement_metric() {
    return {
      "code": "AR",
      "name": "Availability Requirement",
      "description": "These metrics enable the analyst to customize the CVSS score depending on the importance of the Availability of the affected IT asset to a userâ€™s organization, relative to other impacts. This metric modifies the environmental score by reweighting the Modified Availability impact metric versus the other modified impacts.",
      "inputs": CVSS.xlmh_input
    };
  }

  static get xlmh_input() {
    return [
      { "code": "X",
        "name": "Not Defined",
        "description": "Assigning this value to the metric will not influence the score. It is a signal to the equation to skip this metric." },
      { "code": "L",
        "name": "High",
        "description": "Loss of [Confidentiality / Integrity / Availability] is likely to have a catastrophic adverse effect on the organization or individuals associated with the organization (e.g., employees, customers)." },
      { "code": "M",
        "name": "Medium",
        "description": "Loss of [Confidentiality / Integrity / Availability] is likely to have a serious adverse effect on the organization or individuals associated with the organization (e.g., employees, customers)." },
      { "code": "H",
        "name": "Low",
        "description": "Loss of [Confidentiality / Integrity / Availability] is likely to have only a limited adverse effect on the organization or individuals associated with the organization (e.g., employees, customers)." }
    ];
  }

  get_scores_by_vector(vector_string, options) {

    return new Promise((resolve, reject) => {

      let scores = {

        "base_score": this.cvss.getBaseScore(vector_string),
        "temporal_score": this.cvss.getTemporalScore(vector_string),
        "environmental_score": this.cvss.getEnvironmentalScore(vector_string)

      };

      resolve(scores);

    });
  }

  get_ratings_by_vector(vector_string, options) {

    return new Promise((resolve, reject) => {

      let base_score = this.cvss.getBaseScore(vector_string);
      let base_rating = this.cvss.getRating(base_score);
      let environmental_score = this.cvss.getEnvironmentalScore(vector_string);
      let environmental_rating = this.cvss.getRating(environmental_score);
      let temporal_score = this.cvss.getTemporalScore(vector_string);
      let temporal_rating = this.cvss.getRating(temporal_score);
      let ratings = {
        base_rating,
        environmental_rating,
        temporal_rating
      };

      resolve(ratings);

    });
  }

  get_rating_by_vector(vector, type) {
    return new Promise((resolve, reject) => {

      const options = this.get_option(type);
      let score = this.cvss.getScore(vector, options);

      resolve({
        "rating": this.cvss.getRating(score)
      });

    });
  }

  get_score_by_vector(vector, type) {
    return new Promise((resolve, reject) => {

      const options = this.get_option(type);
      let score = this.cvss.getScore(vector, options);

      resolve({
        score
      });

    });
  }

  get_option(type) {

    let options = {};

    if (type === "base") {
      options.baseOnly = true;
    } else if (type === "temporal") {
      options.temporal = true;
    } else if (type === "environmental") {
      options.env = true;
    }
    return options;
  }

  add_default_to_input(list) {
    let temp = list;

    temp.unshift({ "code": "X",
      "name": "Not Defined",
      "description": "The same values as the corresponding Base Metric (see Base Metrics above), as well as Not Defined (the default)" });
    return temp;
  }

  get_all_by_vector(vector_string, options) {

    return new Promise((resolve, reject) => {

      resolve(this.cvss.getAll(vector_string, options));

    });
  }

  get_ratings_by_metrics(
    attack_vector, attack_complexity, privileges_required,
    user_interaction, scope, confidentiality, integrity, availability,
    exploit_code_maturity, remediation_level, report_confidence,
    confidentiality_requirement, integrity_requirement,
    availability_requirement, modified_attack_vector,
    modified_attack_complexity, modified_privileges_required,
    modified_user_interaction, modified_scope,
    modified_confidentiality, modified_integrity,
    modified_availability
  ) {

    const vector = this.convert_metric_to_vector(
      attack_vector, attack_complexity, privileges_required,
      user_interaction, scope, confidentiality, integrity, availability,
      exploit_code_maturity, remediation_level, report_confidence,
      confidentiality_requirement, integrity_requirement,
      availability_requirement, modified_attack_vector,
      modified_attack_complexity, modified_privileges_required,
      modified_user_interaction, modified_scope,
      modified_confidentiality, modified_integrity,
      modified_availability
    );

    return this.get_ratings_by_vector(vector);
  }

  get_scores_by_metrics(
    attack_vector, attack_complexity, privileges_required,
    user_interaction, scope, confidentiality, integrity, availability,
    exploit_code_maturity, remediation_level, report_confidence,
    confidentiality_requirement, integrity_requirement,
    availability_requirement, modified_attack_vector,
    modified_attack_complexity, modified_privileges_required,
    modified_user_interaction, modified_scope,
    modified_confidentiality, modified_integrity,
    modified_availability
  ) {
    const vector = this.convert_metric_to_vector(
      attack_vector, attack_complexity, privileges_required,
      user_interaction, scope, confidentiality, integrity, availability,
      exploit_code_maturity, remediation_level, report_confidence,
      confidentiality_requirement, integrity_requirement,
      availability_requirement, modified_attack_vector,
      modified_attack_complexity, modified_privileges_required,
      modified_user_interaction, modified_scope,
      modified_confidentiality, modified_integrity,
      modified_availability
    );

    return this.get_scores_by_vector(vector);
  }

  convert_metric_to_vector(
    attack_vector, attack_complexity, privileges_required,
    user_interaction, scope, confidentiality, integrity, availability,
    exploit_code_maturity, remediation_level, report_confidence,
    confidentiality_requirement, integrity_requirement,
    availability_requirement, modified_attack_vector,
    modified_attack_complexity, modified_privileges_required,
    modified_user_interaction, modified_scope,
    modified_confidentiality, modified_integrity,
    modified_availability
  ) {

    let vector = `CVSS:${this.version}`;

    vector = this.setup_base(
      vector,
      attack_vector, attack_complexity, privileges_required,
      user_interaction, scope, confidentiality, integrity, availability
    );

    vector = this.setup_temporal(vector, exploit_code_maturity, remediation_level, report_confidence);

    vector = this.setup_environmental(
      vector, confidentiality_requirement,
      integrity_requirement,
      availability_requirement, modified_attack_vector,
      modified_attack_complexity, modified_privileges_required,
      modified_user_interaction, modified_scope,
      modified_confidentiality, modified_integrity,
      modified_availability
    );

    return vector;
  }

  setup_base(
    vector,
    attack_vector, attack_complexity, privileges_required,
    user_interaction, scope, confidentiality, integrity, availability
  ) {

    let temp_vector = vector;

    if (CVSS.check_metric(attack_vector, CVSS.attack_vector_input) &&
      CVSS.check_metric(attack_complexity, CVSS.attack_complexity_input) &&
      CVSS.check_metric(privileges_required, CVSS.privileges_required_input) &&
      CVSS.check_metric(user_interaction, CVSS.user_interaction_input) &&
      CVSS.check_metric(scope, CVSS.scope_input) &&
      CVSS.check_metric(confidentiality, this.confidentiality_impact_input) &&
      CVSS.check_metric(integrity, this.integrity_impact_input) &&
      CVSS.check_metric(availability, this.availability_impact_input)) {
      this.type = "base";
      temp_vector = `${vector}/AV:${attack_vector}/AC:${attack_complexity}/PR:${privileges_required}/UI:${user_interaction}/S:${scope}/C:${confidentiality}/I:${integrity}/A:${availability}`;

    } else {
      throw new Error("The metric requirements for a base CVSS");
    }
    return temp_vector;
  }

  setup_temporal(vector, exploit_code_maturity, remediation_level, report_confidence) {

    let temp_vector = vector;

    if (CVSS.check_metric(exploit_code_maturity, CVSS.exploit_code_maturity_input) &&
      CVSS.check_metric(remediation_level, CVSS.remediation_level_input) &&
      CVSS.check_metric(report_confidence, CVSS.report_confidence_input)
    ) {
      this.type = "temporal";
      temp_vector = `${vector}/E:${exploit_code_maturity}/RL:${remediation_level}/RC:${report_confidence}`;

    }
    return temp_vector;
  }

  setup_environmental(
    vector, confidentiality_requirement, integrity_requirement,
    availability_requirement, modified_attack_vector,
    modified_attack_complexity, modified_privileges_required,
    modified_user_interaction, modified_scope,
    modified_confidentiality, modified_integrity,
    modified_availability
  ) {

    let temp_vector = vector;

    if (CVSS.check_metric(confidentiality_requirement, CVSS.xlmh_input) &&
      CVSS.check_metric(integrity_requirement, CVSS.xlmh_input) &&
      CVSS.check_metric(availability_requirement, CVSS.xlmh_input) &&
      CVSS.check_metric(modified_attack_vector, this.modified_attack_vector_input) &&
      CVSS.check_metric(modified_attack_complexity, this.modified_attack_complexity_input) &&
      CVSS.check_metric(modified_privileges_required, this.modified_privileges_required_input) &&
      CVSS.check_metric(modified_user_interaction, this.modified_user_interaction_input) &&
      CVSS.check_metric(modified_scope, this.modified_scope_input) &&
      CVSS.check_metric(modified_confidentiality, this.modified_confidentiality_impact_input) &&
      CVSS.check_metric(modified_integrity, this.modified_integrity_impact_input) &&
      CVSS.check_metric(modified_availability, this.modified_availability_impact_input)) {
      CVSS.type = "environmental";
      temp_vector = `${vector}/CR:${confidentiality_requirement}/IR:${integrity_requirement}/AR:${availability_requirement}/MAV:${modified_attack_vector}/MAC:${modified_attack_complexity}/MPR:${modified_privileges_required}/MUI:${modified_user_interaction}/MS:${modified_scope}/MC${modified_confidentiality}/MI:${modified_integrity}/MA:${modified_availability}`;
    }
    return temp_vector;
  }

  static check_metric(metric, list) {
    let check = false;

    list.some((item) => {
      if (item.code === metric) {
        return check = true;
      }
    });
    return check;
  }

}

module.exports = CVSS;