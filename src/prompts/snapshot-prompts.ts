import inquirer from 'inquirer';

export interface SnapshotAnswers {
  note: string;
  thread: string;
  warnings: string[];
  createNew: boolean;
  newThreadName?: string;
}

export async function promptSnapshot(existingThreads: string[]): Promise<SnapshotAnswers> {
  const { action } = await inquirer.prompt<{ action: string }>([
    {
      type: 'list',
      name: 'action',
      message: 'Which thread does this snapshot belong to?',
      choices: [
        ...existingThreads.map(t => ({ name: t, value: t })),
        new inquirer.Separator(),
        { name: '✨ Create new thread', value: '__new__' },
      ],
    },
  ]);

  let thread = action;
  let createNew = false;
  let newThreadName: string | undefined;

  if (action === '__new__') {
    createNew = true;
    const { name } = await inquirer.prompt<{ name: string }>([
      {
        type: 'input',
        name: 'name',
        message: 'New thread name:',
        validate: (input: string) => input.trim().length > 0 || 'Name is required',
      },
    ]);
    newThreadName = name;
    thread = name;
  }

  const { note } = await inquirer.prompt<{ note: string }>([
    {
      type: 'input',
      name: 'note',
      message: 'Where did you leave it? (one-line summary):',
      validate: (input: string) => input.trim().length > 0 || 'A short note is required',
    },
  ]);

  const { warnings } = await inquirer.prompt<{ warnings: string }>([
    {
      type: 'input',
      name: 'warnings',
      message: 'Any warnings for the next person? (comma-separated, or leave blank):',
    },
  ]);

  return {
    note,
    thread,
    warnings: warnings ? warnings.split(',').map(w => w.trim()).filter(Boolean) : [],
    createNew,
    newThreadName,
  };
}
