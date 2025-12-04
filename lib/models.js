import clientPromise from './mongodb';

export const USERS = {
  daddy: { username: 'daddy', password: 'Lisban@2002' },
  Dum: { username: 'Dum', password: 'Jenisa@2003' }
};

export async function getMessagesCollection() {
  const client = await clientPromise;
  const db = client.db('secret-chat');
  return db.collection('messages');
}

export async function getSubscriptionsCollection() {
  const client = await clientPromise;
  const db = client.db('secret-chat');
  return db.collection('subscriptions');
}

export async function saveMessage(from, content, type = 'text', imageUrl = null) {
  const collection = await getMessagesCollection();
  const message = {
    from,
    content,
    type,
    imageUrl,
    timestamp: new Date(),
    read: false
  };
  const result = await collection.insertOne(message);
  return { ...message, _id: result.insertedId };
}

export async function getMessages(limit = 100) {
  const collection = await getMessagesCollection();
  const messages = await collection
    .find({})
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
  return messages.reverse();
}

export async function saveSubscription(username, subscription) {
  const collection = await getSubscriptionsCollection();
  await collection.updateOne(
    { username },
    { $set: { username, subscription, updatedAt: new Date() } },
    { upsert: true }
  );
}

export async function getSubscription(username) {
  const collection = await getSubscriptionsCollection();
  return await collection.findOne({ username });
}
