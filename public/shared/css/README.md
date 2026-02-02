# CSS Utilities Documentation

## Overview

This directory contains comprehensive CSS utility files for the Restaurant Platform. All styles use CSS variables from `variables.css` and follow a mobile-first responsive approach.

## Files

### 1. **utilities.css**
Utility classes for rapid UI development using a utility-first approach.

#### Flexbox
- **Display**: `.flex`, `.inline-flex`
- **Direction**: `.flex-row`, `.flex-col`, `.flex-row-reverse`, `.flex-col-reverse`
- **Wrap**: `.flex-wrap`, `.flex-nowrap`
- **Justify**: `.justify-start`, `.justify-end`, `.justify-center`, `.justify-between`, `.justify-around`, `.justify-evenly`
- **Align**: `.items-start`, `.items-end`, `.items-center`, `.items-baseline`, `.items-stretch`
- **Gap**: `.gap-0` through `.gap-16` (using spacing variables)

#### Grid
- **Display**: `.grid`, `.inline-grid`
- **Columns**: `.grid-cols-1` through `.grid-cols-12`
- **Rows**: `.grid-rows-1` through `.grid-rows-6`
- **Span**: `.col-span-1` through `.col-span-12`, `.col-span-full`

#### Spacing
- **Margin**: `.m-*`, `.mx-*`, `.my-*`, `.mt-*`, `.mb-*`, `.ml-*`, `.mr-*`, `.m-auto`
- **Padding**: `.p-*`, `.px-*`, `.py-*`, `.pt-*`, `.pb-*`, `.pl-*`, `.pr-*`
- Values: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16 (maps to spacing variables)

#### Typography
- **Size**: `.text-xs`, `.text-sm`, `.text-base`, `.text-lg`, `.text-xl`, `.text-2xl`, `.text-3xl`, `.text-4xl`
- **Weight**: `.font-normal`, `.font-medium`, `.font-semibold`, `.font-bold`
- **Line Height**: `.leading-none`, `.leading-tight`, `.leading-normal`, `.leading-relaxed`, `.leading-loose`
- **Align**: `.text-left`, `.text-center`, `.text-right`, `.text-justify`
- **Transform**: `.uppercase`, `.lowercase`, `.capitalize`, `.normal-case`
- **Decoration**: `.underline`, `.line-through`, `.no-underline`
- **Overflow**: `.truncate`, `.text-ellipsis`

#### Colors
- **Text**: `.text-primary`, `.text-secondary`, `.text-muted`, `.text-white`, `.text-success`, `.text-warning`, `.text-error`, `.text-info`
- **Background**: `.bg-primary`, `.bg-secondary`, `.bg-tertiary`, `.bg-dark`, `.bg-white`, `.bg-success`, `.bg-warning`, `.bg-error`, `.bg-info`, `.bg-transparent`

#### Borders
- **Width**: `.border`, `.border-0`, `.border-2`, `.border-4`, `.border-t`, `.border-r`, `.border-b`, `.border-l`
- **Radius**: `.rounded-none`, `.rounded-sm`, `.rounded`, `.rounded-md`, `.rounded-lg`, `.rounded-xl`, `.rounded-full`

#### Display & Position
- **Display**: `.block`, `.inline`, `.inline-block`, `.hidden`, `.visible`, `.invisible`
- **Position**: `.static`, `.relative`, `.absolute`, `.fixed`, `.sticky`

#### Width & Height
- **Width**: `.w-auto`, `.w-full`, `.w-screen`, `.w-1/2`, `.w-1/3`, `.w-2/3`, `.w-1/4`, `.w-3/4`
- **Height**: `.h-auto`, `.h-full`, `.h-screen`
- **Max Width**: `.max-w-sm`, `.max-w-md`, `.max-w-lg`, `.max-w-xl`, `.max-w-full`

#### Effects
- **Shadow**: `.shadow-none`, `.shadow-sm`, `.shadow`, `.shadow-md`, `.shadow-lg`, `.shadow-xl`
- **Opacity**: `.opacity-0`, `.opacity-25`, `.opacity-50`, `.opacity-75`, `.opacity-100`
- **Z-Index**: `.z-0` through `.z-50`, `.z-dropdown`, `.z-sticky`, `.z-fixed`, `.z-modal`, `.z-tooltip`

#### Responsive
Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px)
- Example: `.md:flex`, `.lg:grid-cols-4`, `.sm:text-xl`

---

### 2. **components.css**
Reusable component styles following BEM naming convention.

#### Buttons
- **Base**: `.btn`
- **Variants**: `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-ghost`, `.btn-danger`
- **Sizes**: `.btn-sm`, `.btn-lg`, `.btn-block`, `.btn-icon`
- States: hover, active, disabled, focus

#### Cards
- **Structure**: `.card`, `.card__header`, `.card__title`, `.card__body`, `.card__footer`
- **Modifiers**: `.card--bordered`, `.card--compact`

#### Forms
- **Elements**: `.form-group`, `.form-label`, `.form-input`, `.form-textarea`, `.form-select`
- **States**: `.form-input--error`, `.form-label--required`
- **Helpers**: `.form-help`, `.form-error`
- **Checkbox/Radio**: `.form-checkbox`, `.form-radio`
- **Input Groups**: `.input-group`, `.input-group__addon`

#### Badges
- **Base**: `.badge`
- **Variants**: `.badge-success`, `.badge-error`, `.badge-warning`, `.badge-info`, `.badge-secondary`, `.badge-outline`

#### Alerts
- **Base**: `.alert`, `.alert__title`, `.alert__message`, `.alert__close`
- **Variants**: `.alert-success`, `.alert-error`, `.alert-warning`, `.alert-info`

#### Modals
- **Structure**: `.modal`, `.modal__backdrop`, `.modal__dialog`, `.modal__header`, `.modal__title`, `.modal__close`, `.modal__body`, `.modal__footer`
- **Sizes**: `.modal__dialog--sm`, `.modal__dialog--lg`, `.modal__dialog--xl`
- **State**: `.modal--active`

#### Tooltips
- **Structure**: `.tooltip`, `.tooltip__content`
- **Positions**: `.tooltip__content--top`, `.tooltip__content--bottom`, `.tooltip__content--left`, `.tooltip__content--right`

#### Loading
- **Spinners**: `.spinner`, `.spinner--sm`, `.spinner--lg`, `.spinner--white`
- **Dots**: `.loading-dots`, `.loading-dots__dot`

#### Empty States
- **Structure**: `.empty-state`, `.empty-state__icon`, `.empty-state__title`, `.empty-state__message`

#### Navigation
- **Nav**: `.nav`, `.nav__item`, `.nav__link`, `.nav__link--active`
- **Variants**: `.nav--pills`, `.nav--tabs`
- **Breadcrumb**: `.breadcrumb`, `.breadcrumb__item`, `.breadcrumb__link`, `.breadcrumb__separator`
- **Pagination**: `.pagination`, `.pagination__item`, `.pagination__link`, `.pagination__link--active`, `.pagination__link--disabled`

#### Other Components
- **Divider**: `.divider`, `.divider--vertical`
- **Avatar**: `.avatar`, `.avatar--sm`, `.avatar--lg`, `.avatar__img`
- **Dropdown**: `.dropdown`, `.dropdown__menu`, `.dropdown__item`, `.dropdown__divider`, `.dropdown--active`

---

### 3. **animations.css**
Animation utilities and keyframes for smooth interactions.

#### Fade Animations
- **Classes**: `.animate-fade-in`, `.animate-fade-out`, `.animate-fade-in-up`, `.animate-fade-in-down`, `.animate-fade-in-left`, `.animate-fade-in-right`

#### Slide Animations
- **In**: `.animate-slide-in-up`, `.animate-slide-in-down`, `.animate-slide-in-left`, `.animate-slide-in-right`
- **Out**: `.animate-slide-out-up`, `.animate-slide-out-down`, `.animate-slide-out-left`, `.animate-slide-out-right`

#### Scale Animations
- **Classes**: `.animate-scale-in`, `.animate-scale-out`, `.animate-scale-up`, `.animate-scale-down`

#### Bounce Animations
- **Classes**: `.animate-bounce`, `.animate-bounce-in`, `.animate-bounce-out`

#### Pulse Animations
- **Classes**: `.animate-pulse`, `.animate-pulse-scale`, `.animate-pulse-ring`

#### Spin Animations
- **Classes**: `.animate-spin`, `.animate-spin-slow`, `.animate-spin-fast`, `.animate-spin-reverse`

#### Other Animations
- **Wiggle/Shake**: `.animate-wiggle`, `.animate-shake`
- **Zoom**: `.animate-zoom-in`, `.animate-zoom-out`
- **Flip**: `.animate-flip-in`, `.animate-flip-out`

#### Skeleton Loading
- **Base**: `.skeleton`
- **Variants**: `.skeleton--text`, `.skeleton--title`, `.skeleton--circle`, `.skeleton--rect`
- **Sizes**: `.skeleton--sm`, `.skeleton--md`, `.skeleton--lg`

#### Transitions
- **Properties**: `.transition-all`, `.transition-colors`, `.transition-opacity`, `.transition-transform`, `.transition-shadow`
- **Duration**: `.duration-fast`, `.duration-base`, `.duration-slow`
- **Timing**: `.ease-linear`, `.ease-in`, `.ease-out`, `.ease-in-out`

#### Hover Effects
- **Classes**: `.hover-lift`, `.hover-grow`, `.hover-shrink`, `.hover-rotate`, `.hover-shadow`

#### Animation Delays
- **Classes**: `.delay-75`, `.delay-100`, `.delay-150`, `.delay-200`, `.delay-300`, `.delay-500`, `.delay-700`, `.delay-1000`

#### Stagger Animations
- **Class**: `.stagger-fade-in` (applies to parent, animates children with delays)

#### Other Effects
- **Ripple**: `.ripple` (click effect)
- **Progress**: `.animate-progress` (indeterminate progress bar)

---

## Usage Examples

### Example 1: Button with Icon
```html
<button class="btn btn-primary flex items-center gap-2">
  <span>🔥</span>
  <span>Order Now</span>
</button>
```

### Example 2: Card with Animation
```html
<div class="card max-w-md animate-fade-in-up">
  <div class="card__header">
    <h3 class="card__title">Menu Item</h3>
  </div>
  <div class="card__body">
    <p class="text-secondary">Description goes here</p>
  </div>
  <div class="card__footer flex justify-between items-center">
    <span class="text-lg font-bold">$12.99</span>
    <button class="btn btn-sm btn-primary">Add to Cart</button>
  </div>
</div>
```

### Example 3: Responsive Grid
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Grid items -->
</div>
```

### Example 4: Form with Validation
```html
<div class="form-group">
  <label class="form-label form-label--required">Email</label>
  <input type="email" class="form-input form-input--error">
  <span class="form-error">Please enter a valid email</span>
</div>
```

### Example 5: Modal
```html
<div class="modal modal--active">
  <div class="modal__backdrop"></div>
  <div class="modal__dialog">
    <div class="modal__header">
      <h3 class="modal__title">Confirm Order</h3>
      <button class="modal__close">×</button>
    </div>
    <div class="modal__body">
      <p>Are you sure you want to place this order?</p>
    </div>
    <div class="modal__footer">
      <button class="btn btn-ghost">Cancel</button>
      <button class="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

### Example 6: Loading State
```html
<button class="btn btn-primary" disabled>
  <span class="spinner spinner--sm spinner--white mr-2"></span>
  Loading...
</button>
```

---

## Best Practices

1. **Mobile-First**: All utilities are mobile-first. Use responsive prefixes for larger screens.
2. **CSS Variables**: All colors, spacing, and theme values use CSS variables for consistency.
3. **BEM for Components**: Component classes use BEM naming for clarity and maintainability.
4. **Utilities for Layout**: Use utility classes for layout and spacing.
5. **Components for Reusable UI**: Use component classes for consistent UI elements.
6. **Reduced Motion**: All animations respect `prefers-reduced-motion` preference.
7. **Semantic HTML**: Always use appropriate HTML elements with CSS classes.

---

## File Order

Always include CSS files in this order:

```html
<link rel="stylesheet" href="/shared/css/reset.css">
<link rel="stylesheet" href="/shared/css/variables.css">
<link rel="stylesheet" href="/shared/css/utilities.css">
<link rel="stylesheet" href="/shared/css/components.css">
<link rel="stylesheet" href="/shared/css/animations.css">
```

---

## Browser Support

These styles support all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Contributing

When adding new utilities or components:
1. Use existing CSS variables
2. Follow BEM naming for components
3. Keep utilities atomic and single-purpose
4. Test responsive behavior
5. Ensure accessibility
6. Document new classes in this README
