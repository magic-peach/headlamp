/*
 * Copyright 2025 The Kubernetes Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { renderHook } from '@testing-library/react';
import { useTerminalStream } from './useTerminalStream';

vi.mock('@xterm/xterm', () => ({
  Terminal: vi.fn().mockImplementation(() => ({
    open: vi.fn(),
    focus: vi.fn(),
    onData: vi.fn(),
    onResize: vi.fn(),
    attachCustomKeyEventHandler: vi.fn(),
    writeln: vi.fn(),
    dispose: vi.fn(),
    loadAddon: vi.fn(),
    options: {},
  })),
}));

vi.mock('@xterm/addon-fit', () => ({
  FitAddon: vi.fn().mockImplementation(() => ({
    fit: vi.fn(),
    dispose: vi.fn(),
  })),
}));

describe('useTerminalStream', () => {
  it('cancels a stream that connects after the component has unmounted', async () => {
    let resolveConnect: (value: { stream: { cancel: () => void } }) => void;
    const connectStream = vi.fn(
      () =>
        new Promise<{ stream: { cancel: () => void } }>(resolve => {
          resolveConnect = resolve;
        })
    );

    const { unmount } = renderHook(() =>
      useTerminalStream({ connectStream, containerRef: document.createElement('div') })
    );

    unmount();

    const stream = { cancel: vi.fn() };
    resolveConnect!({ stream });
    await Promise.resolve();
    await Promise.resolve();

    expect(stream.cancel).toHaveBeenCalled();
  });
});
