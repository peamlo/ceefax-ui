# Pico CSS and 98.css

Prior art for the classless spike (#26): what we take from each, and what we deliberately
don't. Decisions live in [`adr/`](../adr/); terms live in [`CONTEXT.md`](../../CONTEXT.md).
This file is only the reading list behind them.

## 98.css

<https://jdan.github.io/98.css/> — a Windows 98 look built from plain HTML.

**Take**

- Native elements styled with no class: a bare `<button>` is already a button.
- State through native attributes (`disabled`, `checked`, `aria-selected`), never a class.
- No JavaScript.

**Don't take**

- State classes toggled by script (`highlighted`, `inactive`). Our contract puts state on
  native/ARIA attributes only.
- Unscoped global element selectors. Loading the stylesheet restyles every `button` on the
  page, including content that isn't meant to look like 98.css.

## Pico CSS

<https://picocss.com/> — a classless-by-default CSS framework.

**Take**

- Classless by default: semantic HTML is styled with no class.
- Structure from semantics: `nav > ul > li > a` is a navigation bar because of where it
  sits, not because of a class.
- Few classes, kept for variants.

**Don't take**

- Unscoped global element styling in the default build. Same problem as 98.css: adopting
  the library restyles content it doesn't own.

## Where this went

The classless spike (#26) tries the "take" column and fixes both "don't take" leaks with
native cascade tools rather than conventions: `@scope (.cf-root)` styles a bare `button`,
`a[href]` or `nav` list only inside an opt-in root, and `@layer` keeps the whole spike below
any unlayered CSS, so the consumer's own styles win without `!important`. It is
experimental; see `src/components/classless.css` and the `Components/Classless
(experimental)` stories.
