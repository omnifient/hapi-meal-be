const jwt = require("jsonwebtoken");

// jwt auth middleware
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) return res.sendStatus(403);

    req.user = user;

    next();
  });
}

// generate collectible json
export function createCollectiblePayload(item) {
  return {
    collectibleId: item.collectible_id,
    collectibleName: item.name,
    collectibleDescription: item.description,
    collectibleUri: item.image_uri,
    collectionId: item.collection_id,
    tokenId: item.token_id,
  };
}
