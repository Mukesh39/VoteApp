const express = require("express");
const router = express.Router();
const User = require("./../Models/user");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");

router.post("/signup", async (req, res) => {
  try {
    const data = req.body; //assuming the ruquest body contains the userData
    const newUser = new User(data);
    //save the new user in Data base  bsc we are doing sugnups
    const response = await newUser.save();
    console.log("data Saved");
    const payload = {
      id: response.id,
    };

    console.log(JSON.stringify(payload));
    const token = generateToken(payload);
    console.log("Token is", token);
    res.status(200).json({ response: response, token: token });

    // you will see the response in json format with token in postman , with username and  and token there
  } catch (err) {
    //if failed it will go to catch Block
    console.log(err);
    res.status(500).json({ error: "Inetrenal servere error" });
  }
});



// This is login 

router.post("/login", async (req, res) => {
  try {
    const { aadharCardNumber, password } = req.body;
    // find the user by username
    const user = await Person.findOne({ aadharCardNumber: aadharCardNumber });
    //if user doesnot exist and password doesn't match
    if (!user || !(await user.comparePassword(password))) {
      res
        .status(401)
        .json({ error: "invalid username or adaharcardno and password" });
    }
    //generate Token
    const payload = {
      id: user.id,
    };

    const token = generateToken(payload);
    res.json({ token });
  } catch (err) {
    //if failed it will go to catch Block
    console.log(err);
    res.status(500).json({ error: "Inetrenal servere error" });
  }
});



// router.get("/", async (req, res) => {
//   try {
//     const data = await Person.find();
//     console.log("Data Fetched");
//     res.status(200).json(data);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "Inetrenal servere error" });
//   }
// });

// Get the profile access the profile for that you need  tobe authorised person 

router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    // bascically what we doing is to use the  jwt token ti get the userData and Id  req.user
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// //read the Data
// router.get("/:workType", async (req, res) => {
//   try {
//     const workType = req.params.workType; // extract the work type from  the url
//     if (workType == "chef" || workType == "manager" || workType == "waiter") {
//       const response = await Person.find({ work: workType });
//       console.log(response);
//       res.status(200).json(response);
//     } else {
//       res.status(404).json({ error: "Invalid work Type" });
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "Inetrenal servere error" });
//   }
// });

//update the data PUT is http request by body or front end 

router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    ///use token
    const userId = req.user; 
    //extract id from token
    const { currentPassword, newPassword } = req.body; //extract the curren and new password from body that is from front end 

    const user = await User.findById(userId);
    if (!(await user.comparePassword(currentPassword))) {
      res
        .status(401)
        .json({ error: "invalid username or username and password" });
    }


    //updates the users password in schema format 
    user.password = newPassword;
    await user.save();
    console.log("password updated successfully");
    return res.status(200).json({ message: "password updated successfully" });

    console.log("Data updates");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Inetrenal servere error" });
  }
});

// router.delete("/:id", async (req, res) => {
//   try {
//     const personId = req.params.id;
//     const response = await Person.findByIdAndDelete(personId);

//     if (!response) {
//       return res.status(404).json({ message: "Person not found" });
//     }

//     console.log("Data Deleted");
//     res.status(200).json({ message: "Person data delete Success" });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "Inetrenal servere error" });
//   }
// });

module.exports = router;
