const axios = require("axios");

export async function createUserAccount(userId): Promise<any> {
  const response = await axios.post(process.env.LOBSTER_API_URL + "/account/" + process.env.LOBSTER_CLIENT_ID, {
    userId: userId,
  });

  if (response.status == 201) {
    return response.data;
  }

  throw Error(response);
}

export async function mintCollectible(userId, collectionId) {
  const response = await axios.post(
    process.env.LOBSTER_API_URL +
      "/nft/collection/" +
      process.env.LOBSTER_CLIENT_ID +
      "/" +
      process.env.LOBSTER_COLLECTION_ID,
    {
      userId: userId,
      ipfsURIKey: collectionId,
    }
  );

  if (response.status == 201) {
    // {
    //   "txId":"0x2bcae7d3a2ce4a731bbb4bd3c532f21f9fad6d9145e977e3dc99d87b29aab8f0",
    //   "to":"0x45e0c441678e50f82037e68133a9B7071F8025a8",
    //   "tokenId":23
    // }
    return response.data;
  }

  throw Error(response);
}

export async function transferCollectible() {
  // TODO: TBI
  // PUT /nft/collection/:collectionId
}

export async function exportAccount() {
  // TODO: TBI
  // POST /account/export/:clientId/:userId
}
