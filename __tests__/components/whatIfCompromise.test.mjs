import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { WhatIfCompromiseSlider } from '../../src/components/consensus/WhatIfCompromiseSlider.js';

test('WhatIfCompromiseSlider - Default score renders correctly', () => {
  const html = renderToStaticMarkup(
    React.createElement(WhatIfCompromiseSlider, { currentScore: 58 })
  );

  assert.ok(html.includes('What-If Compromise Simulator'), 'Header title should render');
  assert.ok(html.includes('58%'), 'Default score 58% should be displayed');
  assert.ok(html.includes('Deadlocked'), 'Scores below 70% should display Deadlocked status');
});

test('WhatIfCompromiseSlider - Score >= 70% displays supermajority unlocked status', () => {
  const html = renderToStaticMarkup(
    React.createElement(WhatIfCompromiseSlider, { currentScore: 75 })
  );

  assert.ok(html.includes('75%'), 'Current score 75% should be displayed');
  assert.ok(html.includes('Supermajority Unlocked!'), 'Scores >= 70% should display Supermajority Unlocked');
});

test('WhatIfCompromiseSlider - Renders zero-knowledge security badge', () => {
  const html = renderToStaticMarkup(
    React.createElement(WhatIfCompromiseSlider, { currentScore: 60 })
  );

  assert.ok(
    html.includes('Zero-Knowledge Differential Analysis'),
    'Zero-Knowledge security badge text should be present'
  );
});
