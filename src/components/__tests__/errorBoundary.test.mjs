import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('React ErrorBoundary Component & Layout Integration', () => {
  it('ErrorBoundary.tsx exists and is defined as a React Class Component with getDerivedStateFromError', () => {
    const filePath = path.join(process.cwd(), 'src/components/ErrorBoundary.tsx');
    assert.ok(fs.existsSync(filePath), 'ErrorBoundary.tsx must exist in src/components/');

    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(content.includes('class ErrorBoundary extends Component') || content.includes('export class ErrorBoundary extends Component'), 'Must be a React Class Component');
    assert.ok(content.includes('getDerivedStateFromError'), 'Must define getDerivedStateFromError lifecycle');
    assert.ok(content.includes('componentDidCatch'), 'Must define componentDidCatch lifecycle');
    assert.ok(content.includes('Return to Home'), 'Must render Return to Home button');
  });

  it('app/_layout.tsx wraps Stack layout with ErrorBoundary', () => {
    const layoutPath = path.join(process.cwd(), 'app/_layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');

    assert.ok(layoutContent.includes('ErrorBoundary'), '_layout.tsx must import ErrorBoundary');
    assert.ok(layoutContent.includes('ErrorBoundary') || layoutContent.includes('RootErrorBoundary'), '_layout.tsx must wrap layout with ErrorBoundary');
  });

  it('ErrorBoundary palette matches Obsidian Midnight tokens (#090A0F, #13151E, #FF5A5F, #3DE0A0)', () => {
    const filePath = path.join(process.cwd(), 'src/components/ErrorBoundary.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.ok(content.includes('#090A0F'), 'Must use Obsidian dark background (#090A0F)');
    assert.ok(content.includes('#13151E'), 'Must use Obsidian card background (#13151E)');
    assert.ok(content.includes('#FF5A5F'), 'Must use Coral accent (#FF5A5F)');
    assert.ok(content.includes('#3DE0A0'), 'Must use Emerald CTA (#3DE0A0)');
  });
});
