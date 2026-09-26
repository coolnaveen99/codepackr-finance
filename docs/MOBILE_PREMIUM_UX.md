# Mobile Premium UX — finance

Branch: `feature/mobile-premium-ux`

Phase 1 foundation from CODEPACKR-MOBILE-PREMIUM-UX-SPEC-FINAL.md.

## Tabs (spec §08)

Home · Calculators · Saved · Plans · More

Component: `src/components/MobileBottomNav.tsx`  
Preset: `FINANCE_MOBILE_TABS`

## CSS

Shared `--cp-*` tokens and `.cp-mobile-main-pad` / safe-area utilities in `src/index.css`.

## Wire-up (next)

```tsx
import { MobileBottomNav, FINANCE_MOBILE_TABS } from './components/MobileBottomNav';
const [mobileTab, setMobileTab] = useState('home');
// before Footer:
<MobileBottomNav activeTab={mobileTab} onSelectTab={setMobileTab} tabs={FINANCE_MOBILE_TABS} />
```

Add `cp-mobile-main-pad` to main content wrapper.
