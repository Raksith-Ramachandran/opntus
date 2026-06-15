const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://opntusadmin:x2004&21R@opntus-cluster.yigv0hs.mongodb.net/opntus?appName=opntus-cluster').then(async () => {
  const result = await mongoose.connection.db
    .collection('listeners')
    .updateOne(
      { email: 'admin@opntus.com' },
      { $set: { role: 'admin' } }
    );
  console.log(result.modifiedCount === 1 ? 'SUCCESS' : 'FAILED');
  process.exit();
});