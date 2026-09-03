import { SegmentedControl } from '../ui/SegmentedControl.js';
import { useTheme } from '../../lib/useTheme.js';

const options = [
  { value: 'light', label: 'Lt', title: 'Light' },
  { value: 'system', label: 'Sys', title: 'Follow the system setting' },
  { value: 'dark', label: 'Dk', title: 'Dark' },
] as const;

export function ThemeToggle() {
  const { choice, setTheme } = useTheme();
  return <SegmentedControl options={options} value={choice} onChange={setTheme} label="Theme" />;
}
