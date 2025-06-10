import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'VirtualizedLists should never be nested' 
]);





export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.zefinitum.nutritrack',
    projectId: '67cf3a68000603b3aa87',
    databaseId: '67cf3d35002022390a7a',
    userCollectionId: '67cf3d720015f91668fd',
    foodsCollectionId: '67cf4ed8003342e9f6ff',
    goalsCollectionId: '68362ce30030991e0609',
    dailyLogsCollectionId: '68362d98002a2be8fbb1',
    storageId: '67cf597c0007444c7134'
}

// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint) // Your Appwrite Endpoint
    .setProject(config.projectId) // Your project ID
    .setPlatform(config.platform) // Your application ID or bundle ID.

    const account = new Account(client);
    const avatars = new Avatars(client);
    const databases = new Databases(client);



export const createUser = async (email, password, username) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        )

        if(!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username)

        await signIn(email, password)

        const newUser = await databases.createDocument(
            config.databaseId,
            config.userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email,
                username,
                avatar: avatarUrl
            }
        )

        return newUser;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export const signIn = async (email, password) => {
    try {
        const session = await account.createEmailPasswordSession(email, password)

        return session;
    } catch (error) {
        throw new Error(error);
    }
}

  export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();

        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if(!currentUser) throw Error;

        return currentUser.documents[0];

    } catch (error) {
        console.log(error);
    }
  }

  export const createFood = async (food) => {
  try {
    const newFood = await databases.createDocument(
      config.databaseId,
      config.foodsCollectionId,
      ID.unique(),
      {
        ...food,
        createdBy: food.createdBy || 'anonim' 
      }
    );
    return newFood;
  } catch (error) {
    console.log('Eroare la createFood:', error);
    throw error;
  }
};


export const searchFoods = async (text) => {
  try {
    const res = await databases.listDocuments(
      config.databaseId,
      config.foodsCollectionId,
      [Query.search('name', text)]
    );
    return res.documents;
  } catch (err) {
    console.error('Eroare la searchFoods:', err);
    return [];
  }
};

export const searchFoodsByBarcode = async (barcode) => {
  try {
    const res = await databases.listDocuments(
      config.databaseId,
      config.foodsCollectionId,
      [Query.equal("barcode", barcode)]
    );
    return res.documents;
  } catch (err) {
    console.error("Eroare la cautarea cu barcode:", err);
    return [];
  }
};





  export const storage = new Storage(client);
export { account, databases, avatars, Query };
