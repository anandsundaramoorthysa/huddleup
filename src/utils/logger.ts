import { colors } from './colors.js';

export function log(message: string): void {
  console.log(message);
}

export function info(message: string): void {
  console.log(colors.info(`ℹ ${message}`));
}

export function success(message: string): void {
  console.log(colors.success(`✓ ${message}`));
}

export function warning(message: string): void {
  console.log(colors.warning(`⚠ ${message}`));
}

export function error(message: string): void {
  console.log(colors.error(`✗ ${message}`));
}

export function header(message: string): void {
  console.log(`\n${colors.header(message)}\n`);
}

export function divider(): void {
  console.log(colors.dim('═'.repeat(50)));
}

export function brief(lines: string[]): void {
  divider();
  for (const line of lines) {
    console.log(`  ${line}`);
  }
  divider();
}
