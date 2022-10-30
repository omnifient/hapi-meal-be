const axios = require("axios");

// process.env.LOBSTER_CLIENT_ID
// process.env.LOBSTER_API_URL

export async function createUserAccount(userId): Promise<any> {
  const response = await axios.post(process.env.LOBSTER_API_URL + "/account/" + process.env.LOBSTER_CLIENT_ID, {
    userId: userId,
  });

  if (response.status == 200) {
    return response.data;
  }

  throw Error(response);
}

export function mintCollectible() {
  // TODO: TBI
  // POST /nft/collection/:clientId/:collectionId
}

export function transferCollectible() {
  // TODO: TBI
  // PUT /nft/collection/:collectionId
}

export function exportAccount() {
  // TODO: TBI
  // POST /account/export/:clientId/:userId
}
