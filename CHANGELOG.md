# Changelog

## [0.5.0](https://github.com/peamlo/ceefax-ui/compare/v0.4.0...v0.5.0) (2026-10-31)


### ⚠ BREAKING CHANGES

* **layout:** put the Screen frame on a 40-, 60- or 80-cell grid ([#110](https://github.com/peamlo/ceefax-ui/issues/110))
* **components:** fastext keys are coloured text by default; put a key on a band (`data-band`) for the filled look
* **tokens:** --cf-font-body is removed. Use --cf-font-mono instead.
* **tokens:** public type tokens and --cf-content-max change value; --cf-text-caption is deprecated and now aliases --cf-text-small.

### Features

* **components:** add background bands with data-band ([#99](https://github.com/peamlo/ceefax-ui/issues/99)) ([e1de3d1](https://github.com/peamlo/ceefax-ui/commit/e1de3d12d097d57104ae3e54a5befd0bb1d818ed))
* **components:** add cf-header-row teletext header ([#93](https://github.com/peamlo/ceefax-ui/issues/93)) ([6e30e99](https://github.com/peamlo/ceefax-ui/commit/6e30e994eb0eb16f8f1a0ce68e07e2c1aed65a2b)), closes [#72](https://github.com/peamlo/ceefax-ui/issues/72)
* **components:** add cf-table data table ([#111](https://github.com/peamlo/ceefax-ui/issues/111)) ([ed2e690](https://github.com/peamlo/ceefax-ui/commit/ed2e690dc49f34ecc6865bed90aad29f724fdc1f))
* **components:** fastext keys as coloured text by default, banded opt-in ([#123](https://github.com/peamlo/ceefax-ui/issues/123)) ([ae330d2](https://github.com/peamlo/ceefax-ui/commit/ae330d2537ba3a54d58948bf68cb2f7c21446d67))
* **layout:** add opt-in CRT look to the Screen frame ([#124](https://github.com/peamlo/ceefax-ui/issues/124)) ([2dff1e4](https://github.com/peamlo/ceefax-ui/commit/2dff1e4f3b88b77bc7abbf3762c90e83ab049134))
* **layout:** put the Screen frame on a 40-, 60- or 80-cell grid ([#110](https://github.com/peamlo/ceefax-ui/issues/110)) ([fc7d35c](https://github.com/peamlo/ceefax-ui/commit/fc7d35cc590da12a83b9917e576d8a92eb69a683))
* **layout:** style page-shell scrollbars with data-scrollbar variants ([#109](https://github.com/peamlo/ceefax-ui/issues/109)) ([2427352](https://github.com/peamlo/ceefax-ui/commit/24273528a2bb2c71a806fc169a86803e27755375))
* **tokens:** put the type scale on an 8px grid and widen the reading measure ([#90](https://github.com/peamlo/ceefax-ui/issues/90)) ([0ddd7ee](https://github.com/peamlo/ceefax-ui/commit/0ddd7ee1d132188993c17e492aa54b134a555aec))


### Bug Fixes

* **ci:** serve favicon and real 404s on Cloudflare previews ([#122](https://github.com/peamlo/ceefax-ui/issues/122)) ([b669d98](https://github.com/peamlo/ceefax-ui/commit/b669d984a9c9cf83a6fa9992bd41d52fab3232da)), closes [#121](https://github.com/peamlo/ceefax-ui/issues/121)
* **elements:** make cf-loader read colour and font tokens ([#92](https://github.com/peamlo/ceefax-ui/issues/92)) ([1908724](https://github.com/peamlo/ceefax-ui/commit/1908724131cea7398838b80b733db82d752d8fcc))


### Code Refactoring

* **tokens:** remove --cf-font-body ([#114](https://github.com/peamlo/ceefax-ui/issues/114)) ([f9468aa](https://github.com/peamlo/ceefax-ui/commit/f9468aa892b176a3aa1337c23d1a3c346ac4dc17))

## [0.4.0](https://github.com/peamlo/ceefax-ui/compare/v0.3.1...v0.4.0) (2026-10-27)


### Features

* **components:** add cf-notice flashing alert ([#80](https://github.com/peamlo/ceefax-ui/issues/80)) ([4dc0b51](https://github.com/peamlo/ceefax-ui/commit/4dc0b5152b077bafe6006e94c115779b66dca43d))
* **fonts:** replace VT323 with Bedstead for display type ([#86](https://github.com/peamlo/ceefax-ui/issues/86)) ([439ebb0](https://github.com/peamlo/ceefax-ui/commit/439ebb0c6325f1c42a68c792305fcea8edd86362))

## [0.3.1](https://github.com/peamlo/ceefax-ui/compare/v0.3.0...v0.3.1) (2026-10-27)


### Bug Fixes

* **package:** add repository field so npm accepts the provenance ([#83](https://github.com/peamlo/ceefax-ui/issues/83)) ([75b6a56](https://github.com/peamlo/ceefax-ui/commit/75b6a5605aea4e5139fce04c44d56f5ff85b8137))

## [0.3.0](https://github.com/peamlo/ceefax-ui/compare/v0.2.0...v0.3.0) (2026-10-27)


### Features

* **demo:** make CEEFAX-UI the wordmark and add a C favicon ([#79](https://github.com/peamlo/ceefax-ui/issues/79)) ([7ca1196](https://github.com/peamlo/ceefax-ui/commit/7ca11966434b60385811dd93f64af11847fc7c5e))
