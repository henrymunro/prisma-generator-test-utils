import * as child_process from 'child_process';

beforeAll(() => {
  child_process.execSync(`npx prisma generate`);
});

[
  {
    reativeFilePath: '__testing__/prisma-generated/seed.ts',
  },
  {
    reativeFilePath: '__testing__/prisma-generated/index.ts',
  },
  {
    reativeFilePath: '__testing__/prisma-generated/mockClient.ts',
  },
].forEach(({ reativeFilePath }) => {
  test(`It generates ${reativeFilePath} matching the snapshot`, async () => {
    const listFile = child_process.execSync(`ls -la ./test-output/${reativeFilePath}`);
    // did it generate a file
    expect(listFile.toString()).toContain(reativeFilePath);

    // did it generate a file with the correct content
    const fileContent = child_process.execSync(`cat ./test-output/${reativeFilePath}`).toString();
    expect(fileContent).toMatchSnapshot();
  });
});
