const jwt = require("jsonwebtoken");

const jwtAuthMiddleware = (req, res, next) => {
  //first check request headers has authorisation or not
  const authorization = req.headers.authorization;
  if (!authorization)
    return res
      .status(401)
      .json({ error: "Token not found means authorisatin failed " });

  // jwt has three things  headers , payloads, secret

  //extract jwt tokens from  reqeust headers
  //here we are trying to split the bearer and token key with split as well and extract from it
  // const token = req.headers.authorisation.split(" ")[1];
  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorised" });
  //if token found
  try {
    //verify the jwt token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //req.userPayload = decoded
    // req.EncodedData is also the same
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "invalid token" });
  }
};
// funcion to generate token
const generateToken = (userdata) => {
  //   console.log("JWT_SECRET:", process.env.JWT_SECRET);
  //   return jwt.sign(userdata, process.env.JWT_SECRET, { expiresIn: '1m' });
  console.log("Generating token with userdata:", userdata);
  console.log("JWT_SECRET:", process.env.JWT_SECRET);

  // Ensure userdata is a plain object
  if (typeof userdata !== "object" || userdata === null) {
    throw new Error("Payload must be a plain object");
  }

  return jwt.sign( userdata , process.env.JWT_SECRET, { expiresIn: 300000 });
};

module.exports = { jwtAuthMiddleware, generateToken };
