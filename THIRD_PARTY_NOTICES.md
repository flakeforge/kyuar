# Third-party notices

kyuar is licensed under AGPL-3.0-only. It includes code from the projects
below, which keep their own licenses.

## paulmillr/qr

- Source: https://github.com/paulmillr/qr, commit
  `e90a06b49e0838fe1921824d0089db7db3a11037`
- Used in: `packages/qr-encoder/src/encoder.ts` (vendored and modified)
- License: MIT OR Apache-2.0. Both texts are in `packages/qr-encoder/`
  (`LICENSE-MIT` and `LICENSE`). kyuar uses it under the MIT license.
- Also used as a development dependency (`qr/decode.js`) to check that every
  style still scans.

````
The MIT License (MIT)

Copyright (c) 2023 Paul Miller (https://paulmillr.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.```

## liquid-js/qr-code-styling

- Source: https://github.com/liquid-js/qr-code-styling, commit
  `9a70a7021ad698b330c8a76720e22c937c07416d`
- Used in: `packages/qr/src/figures/` (dot, finder ring and finder eye shapes,
  ported from DOM elements to SVG path strings)
- License: MIT

````

MIT License

Copyright (c) 2019 Denys Kozak

Copyright (c) 2023 Liquid-JS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```

## Halftone QR codes

`packages/qr/src/halftone/` implements the method described in:

Hung-Kuo Chu, Chia-Sheng Chang, Ruen-Rone Lee, Niloy J. Mitra. "Halftone QR
Codes". ACM Transactions on Graphics 32(6), SIGGRAPH Asia 2013.

The implementation was written from the paper. No code was copied.
```
