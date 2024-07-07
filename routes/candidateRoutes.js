const express = require("express");
const router = express.Router();
const User = require("./../Models/user");
//const Candidate = require("../models/candidate");
const Candidate = require("../models/candidate");

// const Candidate = require("./../models/candidate");
const { jwtAuthMiddleware, generateToken } = require("../jwt");

// Before creating the candidates we need to check that it is admin  or not
//here user must jhave Id that is of Admin

const checkAdminRole = async (userID) => {
  try {
    console.log(userID);
    const user = await User.findById(userID);
    if (user.role === "admin") {
      return true;
    }
  } catch (error) {
    return false;
  }
};

//Post route to add candidates - as admin your are going to create new candidates or says elctors who is fighting elections

// in this request younhave to guve the data and the bearer token , bcs jwtaithmiddleware will verify the prsense of token.

router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    //user as an admin must have Id to access the system
    // jwtMiddleware is for presence of token with headers as well while sending request

    if (!(await checkAdminRole(req.user.id)))
      return res
        .status(403)
        .json({ message: `user had not admin Role ${req.user.id}` });

    // this is data is filled in the front end by you as admin  you get by req.body  or get by posteman filled request

    const data = req.body; //assuming the ruquest body contains the CandidatesData and you are seding this data by using postman now

    const newCandidate = new Candidate(data);
    //save the new user in Data base  bsc we are doing sugnups
    const response = await newCandidate.save(); // saved in Database
    console.log("data Saved");
    res.status(200).json({ response: response });
    // you will see the response in json format with token in postman , with username and  and token there
  } catch (err) {
    //if failed it will go to catch Block
    //handeling error if any occurs

    console.log(err);
    res.status(500).json({ error: "Inetrenal servere error" });
  }
});

//update the  the Data of Electors  and It is candidate who is fighting elections that is possible with its Id.

router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    // to change the you need to be admin , check with function
    if (!(await checkAdminRole(req.user.id)))
      return res.status(404).json({ message: "user had not admin Role" });

    const candidateID = req.params.candidateID;
    console.log("candidateID = ", candidateID);
    //extract the person id from url parameter
    const updatecandidateData = req.body; // this data is send by you by Postman or by front end or as user with role as Admin bcs you have only responsibility to  change the data of candidates who is fighting the elections

    console.log(updatecandidateData);
    const response = await Candidate.findByIdAndUpdate(
      candidateID,
      updatecandidateData,
      {
        new: true, //update the document
        runValidators: true, //Run the mongoose validation (like required:true)
      }
    );

    console.log(response);

    if (!response) {
      return res.status(404).json({ error: "candidate not found" });
    }

    console.log("candidate Data updates");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Inetrenal servere error" });
  }
});

//Delete the electors using the ID , as an Admin

router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id))
      return res.status(403).json({ message: "user had not admin Role" });

    const candidateID = req.params.id; // that is from frontend  that
    const response = await User.findByIdAndDelete(candidateID);

    if (!response) {
      return res.status(404).json({ message: "Person not found" });
    }

    console.log("Data Deleted");
    res.status(200).json({ message: "Person data delete Success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Inetrenal servere error" });
  }
});

// How to vote for specific persons

router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
  //user cannot be admin
  //user can vote

  const candidateID = req.params.candidateID;
  const userId = req.user.id; // get this from decoded data.

  try {
    const candidate = await Candidate.findById(candidateID);

    if (!candidate) {
      return res.status(404).json({ message: "Candidates Not Found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user Not Found" });
    }

    if (user.isVoted) {
      return res.status(404).json({ message: "You have already Voted" });
    }

    if (user.role === "admin") {
      return res.status(404).json({ message: "Admin not allowed to vote" });
    }

    //update the candidate document to record the vote
    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();

    // update the user docs

    user.isVoted = true;
    await user.save();
    res.status(200).json({ message: "Vote recorded succesfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Inetrenal servere error" });
  }
});

// votes count of the candidtes

router.get("/vote/count", async (req, res) => {
  try {
    //find the vote count of all the candidates and sort it as well
    //Here you will all the Data at one place

    const candidate = await Candidate.find().sort({ voteCount: "desc" });

    // Map all the candidates only to return their name and count

    const voteRecord = candidate.map((data) => ({
      name: data.party,
      Count: data.voteCount,
    }));
    // Return the sorted list of candidates with their name and vote count
    return res.status(200).json(voteRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// How to count all the electors

router.get("/", async (req, res) => {
  try {
    // Find all candidates and select only the name and party fields, excluding _id
    console.log("GET /candidates route hit");
    const candidates = await Candidate.find({}, "name party -_id");
    console.log(candidates);

    // Return the list of candidates
    res.status(200).json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
