import { beforeEach } from 'vitest';
import { commands, page, userEvent } from 'vitest/browser';

// Real browser input for play(): Vitest browser mode drives a real pointer, keyboard, viewport
// and emulated media through Playwright. Stories reach it through stories/_real-input.js, never
// by importing vitest, so the same play() still loads in the Storybook UI.
globalThis.cfRealInput = { commands, page, userEvent };
// Every story starts with nothing hovered, even after a failed play() left the pointer parked.
beforeEach(() => commands.movePointerAway());

// Storybook paints the `backgrounds` global (the black `ceefax` canvas) on `.sb-show-main`, the
// class its preview iframe gives <body>. Vitest's iframe has no such class, so transparent
// components (links, the ghost button) would be audited on white. Give it the same canvas.
document.body.classList.add('sb-show-main');
