import chalk from 'chalk';

export const colors = {
  primary: chalk.hex('#6366F1'),
  secondary: chalk.hex('#8B5CF6'),
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  info: chalk.cyan,
  dim: chalk.gray,
  bold: chalk.bold,
  header: (s: string) => chalk.bold.hex('#6366F1')(s),
  label: chalk.hex('#A78BFA'),
  highlight: chalk.hex('#FCD34D'),
};
