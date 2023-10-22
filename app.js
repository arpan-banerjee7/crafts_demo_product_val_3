const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON in the request body
app.use(bodyParser.json());

app.post("/user/validate", (req, res) => {
  // Get the user data from the request body
  const userData = req.body;

  // Ensure 'id' is included in the response
  if (!userData.id) {
    return res
      .status(400)
      .json({ error: "User ID is missing in the request." });
  }

  // Define validation rules for fields
  const validationRules = {
    "businessProfile.companyName": {
      validate: (value) => value && value.trim() !== "",
      errorMessage: "Company name should not be empty.",
    },
    "businessProfile.legalName": {
      validate: (value) => value && value.trim() !== "",
      errorMessage: "Legal name should not be empty.",
    },
    "businessProfile.taxIdentifiers.pan": {
      validate: (pan) => {
        return pan && /^[A-Za-z0-9]{10}$/.test(pan); // Check if 'pan' is 10 alphanumeric characters
      },
      errorMessage: "PAN numnber not valid.",
    },
    "businessProfile.taxIdentifiers.ein": {
      validate: (ein) => {
        return ein && /^\d{8}$/.test(ein); // Check if 'ein' is 8 digits
      },
      errorMessage: "EIN should be 8 digits.",
    },
    "businessProfile.email": {
      validate: (email) => {
        return email && isValidEmail(email);
      },
      errorMessage: "Email is invalid.",
    },
  };

  const validationErrors = [];

  // Check each field based on the validation rules
  for (const fieldPath in validationRules) {
    if (getFieldByPath(userData, fieldPath)) {
      const fieldValidation = validationRules[fieldPath];
      const field = getFieldByPath(userData, fieldPath);

      if (!fieldValidation.validate(field)) {
        validationErrors.push(fieldValidation.errorMessage);
      }
    }
  }

  if (validationErrors.length > 0) {
    return res
      .status(400)
      .json({ errors: validationErrors, userId: userData.id });
  }

  res.json({ message: "User data is valid.", userId: userData.id });
});

// Helper function to get a nested field by path
function getFieldByPath(obj, path) {
  const parts = path.split(".");
  let value = obj;
  for (const part of parts) {
    if (value && value.hasOwnProperty(part)) {
      value = value[part];
    } else {
      return undefined; // Property does not exist
    }
  }
  return value;
}

function isValidEmail(email) {
  // Regular expression for a simple email validation
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
