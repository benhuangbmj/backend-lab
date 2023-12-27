const {selectAll} = require('../databases/utilities/selectAll.js');

test('The result of selectAll is defined.', async () => {
  const data = await selectAll('progress', 'progress');
  console.log(data);
  expect(data).toBeDefined();
});