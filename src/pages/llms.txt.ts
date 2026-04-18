export function GET() {
  const body = `Cursorvers Inc. author hub for medical AI governance implementation support.

Primary language: Japanese.
Author: 大田原 正幸 / Masayuki Otawara.
Role: intensive care specialist; Cursorvers Inc. Founder, Director; medical AI governance implementer.
Scope: organizational design, training, and audit support. This site does not recommend specific medical acts, drugs, devices, or products.

Links:
- https://cursorvers.jp/
- https://cursorvers.jp/about/
- https://cursorvers.jp/services/
- https://cursorvers.jp/publications/
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
