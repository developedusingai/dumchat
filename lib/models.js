import clientPromise from './mongodb';

// Build USERS object from environment variables
function getUsersFromEnv() {
  const users = {};
  
  // User 1
  const user1Username = process.env.USER1_USERNAME;
  const user1Password = process.env.USER1_PASSWORD;
  if (user1Username && user1Password) {
    users[user1Username] = { username: user1Username, password: user1Password };
  }
  
  // User 2
  const user2Username = process.env.USER2_USERNAME;
  const user2Password = process.env.USER2_PASSWORD;
  if (user2Username && user2Password) {
    users[user2Username] = { username: user2Username, password: user2Password };
  }
  
  return users;
}

export const USERS = getUsersFromEnv();

// Get the recipient username (the other user)
export function getRecipientUsername(senderUsername) {
  const usernames = Object.keys(USERS);
  return usernames.find(username => username !== senderUsername) || null;
}

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
