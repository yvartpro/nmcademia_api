'use strict';

const segmentOptions = [
  'I am new to network marketing',
  'I am already in network marketing',
  'I am in network marketing but not satisfied and want to switch companies',
  'I am just exploring opportunities',
  'I am tired of depending on one source of income',
  'I am tired of being jobless',
  'I want this business by all means'
];

const listOptions = [
  'Tired of depending on a single income?',
  'Tired of working hard but not progressing financially?',
  'Tired of job uncertainty and rising living costs?',
  'A single mother looking for a flexible way to support your family?',
  'An employee looking for an additional source of income?',
  'Unemployed and searching for an opportunity?',
  'A student exploring future possibilities?',
  'An entrepreneur looking to expand your income streams?'
];

const nmWhyFailReasons = [
  'They stop learning after joining.',
  'They expect fast money without personal growth.',
  'They lack consistency in daily activities.',
  'They fear rejection and criticism.',
  'They quit too early before momentum is created.',
  'They refuse to follow systems and mentorship.',
  'They do not attend trainings, webinars, and events.',
  'They become emotionally affected by negative opinions.',
  'They focus more on convincing than sorting.',
  'They do not develop leadership skills.',
  'They fail to duplicate simple systems.',
  'They compare themselves with others and lose confidence.',
  'They are not patient enough to build long-term residual income.',
  'They try to build alone without guidance.',
  'They do not invest in self-development and education.'
];

const nmCoachingBenefits = [
  'Avoid common mistakes that destroy many distributors.',
  'Learn proven strategies faster.',
  'Stay focused and accountable.',
  'Build confidence during difficult moments.',
  'Improve your communication and presentation skills.',
  'Understand duplication and team building.',
  'Develop leadership and emotional intelligence.',
  'Handle rejection professionally.',
  'Stay consistent even when results are slow.',
  'Grow personally while growing your organization.'
];

module.exports = {
  segment_options: JSON.stringify(segmentOptions),
  list_options: JSON.stringify(listOptions),
  nm_why_fail_reasons: JSON.stringify(nmWhyFailReasons),
  nm_coaching_benefits: JSON.stringify(nmCoachingBenefits)
};
